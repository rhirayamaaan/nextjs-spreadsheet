import { atom } from "jotai";
import { atomFamily } from "jotai-family";
import { baseCellValuesAtom } from "./base";
import { activeColumnConfigsAtom, getLookupValue } from "./binding";
import { cellEditsAtom } from "./edit";
import { visibleRowOrderAtom } from "./filter";
import type { ColumnId } from "./types";
import { activeSheetIdAtom } from "./ui";

// sheetId -> Record<ColumnId, boolean> (合計行出力が有効かどうか)
export const columnTotalsAtom = atom<Record<string, Record<ColumnId, boolean>>>(
  {},
);

// アクティブシートの列ごとの合計設定
export const activeColumnTotalsAtom = atom(
  (get) => {
    const activeSheetId = get(activeSheetIdAtom);
    if (!activeSheetId) return {} as Record<ColumnId, boolean>;
    const totals = get(columnTotalsAtom);
    return totals[activeSheetId] ?? ({} as Record<ColumnId, boolean>);
  },
  (
    get,
    set,
    newTotals:
      | Record<ColumnId, boolean>
      | ((prev: Record<ColumnId, boolean>) => Record<ColumnId, boolean>),
  ) => {
    const activeSheetId = get(activeSheetIdAtom);
    if (!activeSheetId) return;

    const currentTotals = get(activeColumnTotalsAtom);
    const nextTotals =
      typeof newTotals === "function" ? newTotals(currentTotals) : newTotals;

    const allTotals = get(columnTotalsAtom);
    set(columnTotalsAtom, {
      ...allTotals,
      [activeSheetId]: nextTotals,
    });
  },
);

// アクティブシートでいずれかの列に合計が設定されているか
export const hasActiveColumnTotalsAtom = atom((get) => {
  const totals = get(activeColumnTotalsAtom);
  return Object.values(totals).some(Boolean);
});

// 列ごとの合計有効フラグ selector family
export const activeColumnTotalFamily = atomFamily(
  (colId: ColumnId) =>
    atom((get) => {
      const totals = get(activeColumnTotalsAtom);
      return Boolean(totals[colId]);
    }),
  (a, b) => a === b,
);

// セル値から数値を抽出するヘルパー
export const parseCellValueToNumber = (value: string): number | null => {
  if (!value || typeof value !== "string") return null;
  const trimmed = value.trim();
  if (trimmed === "") return null;

  // カンマ、通貨記号などを除去
  const sanitized = trimmed.replace(/[¥$,\s]/g, "");
  const num = Number(sanitized);
  return Number.isFinite(num) ? num : null;
};

// 数値をフォーマットするヘルパー（カンマ区切りなし）
export const formatTotalNumber = (num: number): string => {
  const hasDecimals = !Number.isInteger(num);
  return new Intl.NumberFormat("ja-JP", {
    useGrouping: false,
    maximumFractionDigits: hasDecimals ? 4 : 0,
  }).format(num);
};

// アクティブシートの全列の合計計算値 Record<ColumnId, string>
export const activeColumnSummaryValuesAtom = atom<Record<ColumnId, string>>(
  (get) => {
    const visibleRowOrder = get(visibleRowOrderAtom);
    const totals = get(activeColumnTotalsAtom);
    const edits = get(cellEditsAtom);
    const baseValues = get(baseCellValuesAtom);
    const configs = get(activeColumnConfigsAtom);

    const result: Record<ColumnId, string> = {} as Record<ColumnId, string>;

    const activeColIds = Object.entries(totals)
      .filter(([, isEnabled]) => isEnabled)
      .map(([colId]) => colId as ColumnId);

    if (activeColIds.length === 0) {
      return result;
    }

    for (const colId of activeColIds) {
      let sum = 0;
      let hasNumericValue = false;
      const config = configs[colId];

      for (const rowId of visibleRowOrder) {
        let cellVal = "";
        if (config && config.type === "lookup") {
          cellVal = getLookupValue(
            get,
            { rowId, colId },
            config.lookup,
            baseValues,
          );
        } else {
          const key = `${rowId}-${colId}`;
          cellVal = key in edits ? edits[key] : (baseValues[key] ?? "");
        }

        const num = parseCellValueToNumber(cellVal);
        if (num !== null) {
          sum += num;
          hasNumericValue = true;
        }
      }

      if (hasNumericValue) {
        result[colId] = formatTotalNumber(sum);
      } else {
        result[colId] = "-";
      }
    }

    return result;
  },
);

// 特定列の合計値を取得する selector family
export const columnTotalValueFamily = atomFamily(
  (colId: ColumnId) =>
    atom((get) => {
      const summaryValues = get(activeColumnSummaryValuesAtom);
      return summaryValues[colId] ?? "";
    }),
  (a, b) => a === b,
);

// 特定列の合計表示を切り替えるアクション
export const toggleColumnTotalAtom = atom(null, (get, set, colId: ColumnId) => {
  const activeSheetId = get(activeSheetIdAtom);
  if (!activeSheetId) return;

  const currentTotals = get(activeColumnTotalsAtom);
  const currentValue = Boolean(currentTotals[colId]);

  set(activeColumnTotalsAtom, {
    ...currentTotals,
    [colId]: !currentValue,
  });
});

// 特定列の合計表示を設定するアクション
export const setColumnTotalAtom = atom(
  null,
  (get, set, { colId, enabled }: { colId: ColumnId; enabled: boolean }) => {
    const activeSheetId = get(activeSheetIdAtom);
    if (!activeSheetId) return;

    const currentTotals = get(activeColumnTotalsAtom);
    set(activeColumnTotalsAtom, {
      ...currentTotals,
      [colId]: enabled,
    });
  },
);
