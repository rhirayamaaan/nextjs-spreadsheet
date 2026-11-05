import { atom } from "jotai";
import { atomFamily } from "jotai-family";
import { sheetRecordsQuery } from "../services/sheetRecords/sheetRecords.query";
import { baseCellValuesAtom } from "./base";
import { activeColumnConfigsAtom, getLookupValue } from "./binding";
import { cellEditsAtom } from "./edit";
import { visibleRowOrderAtom } from "./filter";
import { parseCellValueToNumber } from "./summary";
import { sheetTemplatesAtom } from "./templates";
import {
  type ColumnId,
  createSubtotalRowId,
  parseRowIndex,
  type RowId,
  type SheetMode,
} from "./types";
import { activeSheetIdAtom } from "./ui";

// sheetId -> SheetMode ("edit" | "inquiry")
export const sheetModeAtom = atom<Record<string, SheetMode>>({});

// アクティブシートの表示モード（未設定時は常に "edit" がデフォルト）
export const activeSheetModeAtom = atom(
  (get) => {
    const activeSheetId = get(activeSheetIdAtom);
    if (!activeSheetId) return "edit" as SheetMode;
    const modes = get(sheetModeAtom);
    return modes[activeSheetId] ?? ("edit" as SheetMode);
  },
  (get, set, mode: SheetMode) => {
    const activeSheetId = get(activeSheetIdAtom);
    if (!activeSheetId) return;
    const modes = get(sheetModeAtom);
    set(sheetModeAtom, {
      ...modes,
      [activeSheetId]: mode,
    });
  },
);

// 照会モードにおける小計行計算および表示行アトム
export const inquiryCalculationAtom = atom((get) => {
  const mode = get(activeSheetModeAtom);
  const visibleRowOrder = get(visibleRowOrderAtom);
  const activeSheetId = get(activeSheetIdAtom);

  if (!activeSheetId) {
    return {
      displayRowOrder: visibleRowOrder,
      subtotalRowMap: {} as Record<RowId, Record<ColumnId, string>>,
    };
  }

  const templates = get(sheetTemplatesAtom);
  const template = templates[activeSheetId];
  const subtotalConfig = template?.subtotalConfig;

  // 編集モード時、または小計設定が無効の場合はそのまま通常表示行を返す
  if (mode !== "inquiry" || !subtotalConfig || !subtotalConfig.enabled) {
    return {
      displayRowOrder: visibleRowOrder,
      subtotalRowMap: {} as Record<RowId, Record<ColumnId, string>>,
    };
  }

  const {
    groupByKeys,
    labelField,
    labelPattern = "（計）",
    aggregations,
  } = subtotalConfig;
  const configs = get(activeColumnConfigsAtom);
  const baseCellValues = get(baseCellValuesAtom);
  const cellEdits = get(cellEditsAtom);
  const records = get(sheetRecordsQuery.sync(activeSheetId));

  // セル値取得ヘルパー関数
  const getCellValue = (rowId: RowId, colField: string): string => {
    const colId = colField as ColumnId;
    const colConfig = configs[colId];
    if (colConfig && colConfig.type === "lookup") {
      return getLookupValue(
        get,
        { rowId, colId },
        colConfig.lookup,
        baseCellValues,
      );
    }
    const key = `${rowId}-${colId}`;
    if (key in cellEdits) return cellEdits[key];
    const rowIndex = parseRowIndex(rowId, activeSheetId);
    if (rowIndex !== null) {
      return records[rowIndex]?.[colId] ?? "";
    }
    return baseCellValues[key] ?? "";
  };

  const displayRowOrder: RowId[] = [];
  const subtotalRowMap: Record<RowId, Record<ColumnId, string>> = {};

  let currentGroupKey: string | null = null;
  let currentGroupRows: RowId[] = [];
  let groupCounter = 0;

  const finalizeGroup = () => {
    if (currentGroupRows.length === 0) return;

    const subtotalValues: Record<ColumnId, string> = {} as Record<
      ColumnId,
      string
    >;

    for (const col of template.columns) {
      const colId = col.field as ColumnId;
      if (col.field === labelField) {
        subtotalValues[colId] = labelPattern;
      } else if (aggregations[col.field] === "sum") {
        let sum = 0;
        let hasNumber = false;
        for (const rowId of currentGroupRows) {
          const rawVal = getCellValue(rowId, col.field);
          const num = parseCellValueToNumber(rawVal);
          if (num !== null) {
            sum += num;
            hasNumber = true;
          }
        }
        if (hasNumber) {
          // 浮動小数点誤差を丸めた生の数値文字列（書式設定は column 側の将来設計に委ねるためカンマ・0埋めなし）
          const roundedSum = Math.round(sum * 1e8) / 1e8;
          subtotalValues[colId] = String(roundedSum);
        } else {
          subtotalValues[colId] = "";
        }
      } else {
        subtotalValues[colId] = "";
      }
    }

    const subtotalRowId = createSubtotalRowId(`${groupCounter++}`);
    subtotalRowMap[subtotalRowId] = subtotalValues;
    displayRowOrder.push(subtotalRowId);
    currentGroupRows = [];
  };

  for (const rowId of visibleRowOrder) {
    const groupKey = groupByKeys
      .map((key) => getCellValue(rowId, key))
      .join("||");

    if (currentGroupKey !== null && groupKey !== currentGroupKey) {
      finalizeGroup();
    }

    currentGroupKey = groupKey;
    currentGroupRows.push(rowId);
    displayRowOrder.push(rowId);
  }

  finalizeGroup();

  return {
    displayRowOrder,
    subtotalRowMap,
  };
});

// 仮想スクロールに渡す最終表示行一覧（通常行 + 小計行）
export const displayRowOrderAtom = atom(
  (get) => get(inquiryCalculationAtom).displayRowOrder,
);

// 小計行マップアトム
export const subtotalRowMapAtom = atom(
  (get) => get(inquiryCalculationAtom).subtotalRowMap,
);

// 小計行セル値 selector family
export const subtotalCellValueFamily = atomFamily(
  ({ rowId, colId }: { rowId: RowId; colId: ColumnId }) =>
    atom((get) => {
      const map = get(subtotalRowMapAtom);
      return map[rowId]?.[colId] ?? "";
    }),
  (a, b) => a.rowId === b.rowId && a.colId === b.colId,
);
