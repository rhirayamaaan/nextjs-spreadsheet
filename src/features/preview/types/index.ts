export interface ParsedCellBorder {
  style: string;
  color: string;
}

export interface ParsedCellStyles {
  backgroundColor?: string;
  color?: string;
  fontWeight?: "bold" | "normal";
  fontStyle?: "italic" | "normal";
  textAlign?: "left" | "center" | "right" | "justify";
  verticalAlign?: "top" | "middle" | "bottom";
  borderTop?: ParsedCellBorder;
  borderBottom?: ParsedCellBorder;
  borderLeft?: ParsedCellBorder;
  borderRight?: ParsedCellBorder;
}

export interface ParsedCellMerge {
  isTopLeft: boolean;
  rowSpan: number;
  colSpan: number;
}

export interface ParsedCell {
  value: string;
  address: string;
  row: number; // 1-indexed
  col: number; // 1-indexed
  style: ParsedCellStyles;
  merge?: ParsedCellMerge;
}

export interface ParsedSheet {
  name: string;
  rowsData: ParsedCell[][];
  merges: string[];
  columnWidths: number[];
  rowCount: number;
  columnCount: number;
}

export interface ParsedWorkbook {
  name: string;
  sheets: ParsedSheet[];
}
