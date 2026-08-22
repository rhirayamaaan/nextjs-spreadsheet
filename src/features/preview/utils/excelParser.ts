import type ExcelJS from "exceljs";
import type {
  ParsedCell,
  ParsedCellBorder,
  ParsedCellStyles,
  ParsedSheet,
} from "../types";
import { evaluateFormula } from "./formulaEvaluator";

export interface MergeCellInfo {
  isTopLeft: boolean;
  rowSpan: number;
  colSpan: number;
  masterAddress: string;
}

// Convert ARGB color (AARRGGBB) to Hex (#RRGGBB)
export function argbToCssColor(argb?: string): string | undefined {
  if (!argb) return undefined;
  if (argb.length === 8) {
    return `#${argb.substring(2)}`;
  }
  if (argb.length === 6) {
    return `#${argb}`;
  }
  return undefined;
}

// Type guard for ExcelJS.CellFormulaValue
export function isFormulaValue(
  value: ExcelJS.CellValue,
): value is ExcelJS.CellFormulaValue {
  return typeof value === "object" && value !== null && "formula" in value;
}

// Type guard for ExcelJS.CellSharedFormulaValue
export function isSharedFormulaValue(
  value: ExcelJS.CellValue,
): value is ExcelJS.CellSharedFormulaValue {
  return (
    typeof value === "object" && value !== null && "sharedFormula" in value
  );
}

// Type guard for ExcelJS.CellHyperlinkValue
export function isHyperlinkValue(
  value: ExcelJS.CellValue,
): value is ExcelJS.CellHyperlinkValue {
  return (
    typeof value === "object" &&
    value !== null &&
    "hyperlink" in value &&
    "text" in value
  );
}

// Type guard for Rich Text
export function isRichTextValue(
  value: ExcelJS.CellValue,
): value is { richText: Array<{ text: string }> } {
  return (
    typeof value === "object" &&
    value !== null &&
    "richText" in value &&
    Array.isArray((value as { richText: unknown }).richText)
  );
}

// Convert ExcelJS.CellValue to string type-safely, with formula evaluation support
export function getCellValueAsString(
  value: ExcelJS.CellValue,
  getValueByAddress?: (address: string) => string | number | null | undefined,
): string {
  if (value === null || value === undefined) {
    return "";
  }
  if (typeof value === "string") {
    return value;
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  if (value instanceof Date) {
    return value.toLocaleDateString();
  }
  if (isFormulaValue(value)) {
    if (value.result !== undefined && value.result !== null) {
      return getCellValueAsString(value.result, getValueByAddress);
    }
    if (getValueByAddress && value.formula) {
      const evaluated = evaluateFormula(`=${value.formula}`, getValueByAddress);
      return String(evaluated);
    }
    return `=${value.formula}`;
  }
  if (isSharedFormulaValue(value)) {
    if (value.result !== undefined && value.result !== null) {
      return getCellValueAsString(value.result, getValueByAddress);
    }
    if (getValueByAddress && value.formula) {
      const evaluated = evaluateFormula(`=${value.formula}`, getValueByAddress);
      return String(evaluated);
    }
    return value.formula ? `=${value.formula}` : "";
  }
  if (isHyperlinkValue(value)) {
    return String(value.text || value.hyperlink);
  }
  if (isRichTextValue(value)) {
    return value.richText.map((rt) => rt.text).join("");
  }
  return "";
}

// Type guard for ExcelJS.FillPattern
export function isFillPattern(fill: ExcelJS.Fill): fill is ExcelJS.FillPattern {
  return fill.type === "pattern";
}

// Map ExcelJS Border style to CSS border style
export function mapExcelBorderStyleToCss(style: string): string {
  switch (style) {
    case "thin":
      return "1px solid";
    case "medium":
      return "2px solid";
    case "thick":
      return "3px solid";
    case "double":
      return "3px double";
    case "dashed":
      return "1px dashed";
    case "dotted":
      return "1px dotted";
    case "hair":
      return "1px dotted";
    default:
      return "1px solid";
  }
}

// Extract border info type-safely
export function getBorderInfo(
  border: Partial<ExcelJS.Border> | undefined,
): ParsedCellBorder | undefined {
  if (!border) return undefined;
  const borderStyle = border.style;
  const borderColor = argbToCssColor(border.color?.argb);
  if (!borderStyle) return undefined;

  return {
    style: mapExcelBorderStyleToCss(borderStyle),
    color: borderColor || "#ccc",
  };
}

// Build merged cells map for O(1) cell lookup
export function buildMergeMap(
  worksheet: ExcelJS.Worksheet,
): Map<string, MergeCellInfo> {
  const mergeMap = new Map<string, MergeCellInfo>();
  const merges = worksheet.model.merges;

  if (merges) {
    for (const mergeRange of merges) {
      const parts = mergeRange.split(":");
      if (parts.length === 2) {
        const topLeftAddress = parts[0];
        const bottomRightAddress = parts[1];

        const tlCell = worksheet.getCell(topLeftAddress);
        const brCell = worksheet.getCell(bottomRightAddress);

        const startRow = tlCell.fullAddress.row;
        const startCol = tlCell.fullAddress.col;
        const endRow = brCell.fullAddress.row;
        const endCol = brCell.fullAddress.col;

        const rowSpan = endRow - startRow + 1;
        const colSpan = endCol - startCol + 1;

        for (let r = startRow; r <= endRow; r++) {
          for (let c = startCol; c <= endCol; c++) {
            const cell = worksheet.getCell(r, c);
            const isTopLeft = r === startRow && c === startCol;
            mergeMap.set(cell.address, {
              isTopLeft,
              rowSpan: isTopLeft ? rowSpan : 1,
              colSpan: isTopLeft ? colSpan : 1,
              masterAddress: topLeftAddress,
            });
          }
        }
      }
    }
  }

  return mergeMap;
}

// Parse ExcelJS.Worksheet into our custom type-safe ParsedSheet interface
export function parseWorksheet(worksheet: ExcelJS.Worksheet): ParsedSheet {
  const rowCount = worksheet.rowCount;
  const columnCount = worksheet.columnCount;
  const mergeMap = buildMergeMap(worksheet);

  // Map to store cell values for formula evaluation lookup
  const cellValueMap = new Map<string, string | number>();

  const getValueByAddress = (address: string) => {
    return cellValueMap.get(address);
  };

  // First pass: collect primitive raw values
  for (let r = 1; r <= rowCount; r++) {
    const row = worksheet.getRow(r);
    for (let c = 1; c <= columnCount; c++) {
      const cell = row.getCell(c);
      const val = cell.value;

      if (val !== null && val !== undefined) {
        if (typeof val === "number" || typeof val === "string") {
          cellValueMap.set(cell.address, val);
        } else if (
          isFormulaValue(val) &&
          val.result !== undefined &&
          val.result !== null
        ) {
          if (
            typeof val.result === "number" ||
            typeof val.result === "string"
          ) {
            cellValueMap.set(cell.address, val.result);
          }
        } else if (
          isSharedFormulaValue(val) &&
          val.result !== undefined &&
          val.result !== null
        ) {
          if (
            typeof val.result === "number" ||
            typeof val.result === "string"
          ) {
            cellValueMap.set(cell.address, val.result);
          }
        }
      }
    }
  }

  const rowsData: ParsedCell[][] = [];

  // Second pass: parse styles, merges, and evaluate formulas
  for (let r = 1; r <= rowCount; r++) {
    const rowCells: ParsedCell[] = [];
    const row = worksheet.getRow(r);

    for (let c = 1; c <= columnCount; c++) {
      const cell = row.getCell(c);

      const parsedStyle: ParsedCellStyles = {};

      if (cell.fill && isFillPattern(cell.fill)) {
        const bg = argbToCssColor(cell.fill.fgColor?.argb);
        if (bg) parsedStyle.backgroundColor = bg;
      }

      if (cell.font) {
        const color = argbToCssColor(cell.font.color?.argb);
        if (color) parsedStyle.color = color;
        if (cell.font.bold) parsedStyle.fontWeight = "bold";
        if (cell.font.italic) parsedStyle.fontStyle = "italic";
      }

      if (cell.alignment) {
        const h = cell.alignment.horizontal;
        if (
          h === "left" ||
          h === "center" ||
          h === "right" ||
          h === "justify"
        ) {
          parsedStyle.textAlign = h;
        }
        const v = cell.alignment.vertical;
        if (v === "top" || v === "middle" || v === "bottom") {
          parsedStyle.verticalAlign = v;
        }
      }

      if (cell.border) {
        const top = getBorderInfo(cell.border.top);
        if (top) parsedStyle.borderTop = top;

        const bottom = getBorderInfo(cell.border.bottom);
        if (bottom) parsedStyle.borderBottom = bottom;

        const left = getBorderInfo(cell.border.left);
        if (left) parsedStyle.borderLeft = left;

        const right = getBorderInfo(cell.border.right);
        if (right) parsedStyle.borderRight = right;
      }

      const mergeInfo = mergeMap.get(cell.address);
      const displayValue = getCellValueAsString(cell.value, getValueByAddress);

      rowCells.push({
        value: displayValue,
        address: cell.address,
        row: r,
        col: c,
        style: parsedStyle,
        merge: mergeInfo
          ? {
              isTopLeft: mergeInfo.isTopLeft,
              rowSpan: mergeInfo.rowSpan,
              colSpan: mergeInfo.colSpan,
            }
          : undefined,
      });
    }

    rowsData.push(rowCells);
  }

  const columnWidths: number[] = [];
  for (let c = 1; c <= columnCount; c++) {
    const col = worksheet.getColumn(c);
    const widthChar = col.width !== undefined ? col.width : 10;
    columnWidths.push(Math.round(widthChar * 8 + 20));
  }

  return {
    name: worksheet.name,
    rowsData,
    merges: worksheet.model.merges || [],
    columnWidths,
    rowCount,
    columnCount,
  };
}
