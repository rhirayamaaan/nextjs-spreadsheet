import { atom } from "jotai";
import { atomFamily } from "jotai-family";
import {
  getParentColumnInfo,
  validateCellRules,
} from "../logics/business/validation";
import {
  baseCellValuesAtom,
  baseColumnNamesAtom,
  baseColumnOrderAtom,
  baseRowOrderAtom,
} from "./base";
import {
  activeColumnConfigsAtom,
  getLookupValue,
  referencedSheetsDataAtom,
} from "./binding";
import {
  cellCustomStatusesAtom,
  cellEditsAtom,
  modifiedColumnNamesAtom,
  modifiedColumnOrdersAtom,
  modifiedRowOrdersAtom,
  rowStatusesAtom,
} from "./edit";
import type { CellAddress, CellStatusInfo, ColumnId, RowId } from "./types";
import { activeCellAtom, activeSheetIdAtom } from "./ui";
import { activeColumnValidationsAtom } from "./validation";

export const isCellEditingFamily = atomFamily(
  ({ row, col }: { row: number; col: number }) =>
    atom((get) => {
      const active = get(activeCellAtom);
      return active?.row === row && active?.col === col;
    }),
  (a, b) => a.row === b.row && a.col === b.col,
);

export const cellEditingInitialValueFamily = atomFamily(
  ({ row, col }: { row: number; col: number }) =>
    atom((get) => {
      const active = get(activeCellAtom);
      if (active?.row === row && active?.col === col) {
        return active.initialValue;
      }
      return undefined;
    }),
  (a, b) => a.row === b.row && a.col === b.col,
);

export const rowOrderAtom = atom(
  (get) => {
    const activeSheetId = get(activeSheetIdAtom);
    if (!activeSheetId) return get(baseRowOrderAtom);

    const modifiedOrders = get(modifiedRowOrdersAtom);
    return modifiedOrders[activeSheetId] ?? get(baseRowOrderAtom);
  },
  (get, set, newOrder: RowId[] | ((prev: RowId[]) => RowId[])) => {
    const activeSheetId = get(activeSheetIdAtom);
    if (!activeSheetId) return;

    const currentOrder = get(rowOrderAtom);
    const nextOrder =
      typeof newOrder === "function" ? newOrder(currentOrder) : newOrder;

    set(modifiedRowOrdersAtom, {
      ...get(modifiedRowOrdersAtom),
      [activeSheetId]: nextOrder,
    });
  },
);

export const columnOrderAtom = atom(
  (get) => {
    const activeSheetId = get(activeSheetIdAtom);
    if (!activeSheetId) return get(baseColumnOrderAtom);

    const modifiedOrders = get(modifiedColumnOrdersAtom);
    return modifiedOrders[activeSheetId] ?? get(baseColumnOrderAtom);
  },
  (get, set, newOrder: ColumnId[] | ((prev: ColumnId[]) => ColumnId[])) => {
    const activeSheetId = get(activeSheetIdAtom);
    if (!activeSheetId) return;

    const currentOrder = get(columnOrderAtom);
    const nextOrder =
      typeof newOrder === "function" ? newOrder(currentOrder) : newOrder;

    set(modifiedColumnOrdersAtom, {
      ...get(modifiedColumnOrdersAtom),
      [activeSheetId]: nextOrder,
    });
  },
);

export const sortableColumnOrderAtom = atom((get) => {
  const currentOrder = get(columnOrderAtom);
  const activeConfigs = get(activeColumnConfigsAtom);
  return currentOrder.filter((id) => activeConfigs[id]?.type !== "lookup");
});

export const columnNamesAtom = atom(
  (get) => {
    const baseNames = get(baseColumnNamesAtom);
    const activeSheetId = get(activeSheetIdAtom);
    if (!activeSheetId) return baseNames;
    const modified = get(modifiedColumnNamesAtom)[activeSheetId] ?? {};
    return { ...baseNames, ...modified };
  },
  (
    get,
    set,
    newNames:
      | Record<ColumnId, string>
      | ((prev: Record<ColumnId, string>) => Record<ColumnId, string>),
  ) => {
    const activeSheetId = get(activeSheetIdAtom);
    if (!activeSheetId) return;

    const currentNames = get(columnNamesAtom);
    const nextNames =
      typeof newNames === "function" ? newNames(currentNames) : newNames;

    set(modifiedColumnNamesAtom, {
      ...get(modifiedColumnNamesAtom),
      [activeSheetId]: nextNames,
    });
  },
);

export const cellFamily = atomFamily(
  (address: CellAddress) => {
    const key = `${address.rowId}-${address.colId}` as const;

    return atom(
      (get) => {
        // If column is a lookup column, resolve dynamically from master sheet
        const configs = get(activeColumnConfigsAtom);
        const colConfig = configs[address.colId];
        if (colConfig && colConfig.type === "lookup") {
          return getLookupValue(
            get,
            address,
            colConfig.lookup,
            get(baseCellValuesAtom),
          );
        }

        const edits = get(cellEditsAtom);
        if (key in edits) {
          return edits[key];
        }
        return get(baseCellValuesAtom)[key] ?? ""; // 未編集なら初期データから取得
      },
      (get, set, newValue: string) => {
        // Lookup or readOnly column is read-only
        const configs = get(activeColumnConfigsAtom);
        const colConfig = configs[address.colId];
        if (colConfig && (colConfig.type === "lookup" || colConfig.readOnly)) {
          return;
        }

        const baseValue = get(baseCellValuesAtom)[key] ?? "";
        const edits = get(cellEditsAtom);
        const currentValue = edits[key] ?? baseValue;

        if (currentValue === newValue) return;

        set(cellEditsAtom, { ...edits, [key]: newValue }); // 編集時はDiffのみ更新

        const rowStatuses = get(rowStatusesAtom);
        const currentStatus = rowStatuses[address.rowId] ?? "none";

        if (currentStatus === "none") {
          set(rowStatusesAtom, {
            ...rowStatuses,
            [address.rowId]: "edited",
          });
        }
      },
    );
  },
  (a, b) => a.rowId === b.rowId && a.colId === b.colId,
);

export const cellStatusFamily = atomFamily(
  (address: CellAddress) => {
    const key = `${address.rowId}-${address.colId}` as const;

    return atom(
      (get): CellStatusInfo => {
        // 1. バリデーションエラーや明示的なカスタムステータスを優先
        const customStatuses = get(cellCustomStatusesAtom);
        if (customStatuses[key] && customStatuses[key].status !== "none") {
          return customStatuses[key];
        }

        // 2. Lookup 列は読み取り専用のため変更なし扱い
        const configs = get(activeColumnConfigsAtom);
        const colConfig = configs[address.colId];
        if (colConfig && colConfig.type === "lookup") {
          return { status: "none" };
        }

        // 3. 現在のセル値を取得
        const edits = get(cellEditsAtom);
        const baseValue = get(baseCellValuesAtom)[key] ?? "";
        const cellValue = key in edits ? edits[key] : baseValue;

        // 4. 列のバリデーションルールを順次検証
        const validations = get(activeColumnValidationsAtom)[address.colId];
        const pulldownConfig =
          colConfig?.type === "pulldown" ? colConfig.pulldown : undefined;
        const masterSheetData = pulldownConfig
          ? get(referencedSheetsDataAtom)[
              pulldownConfig.relation?.targetSheetId ??
                pulldownConfig.sourceSheetId
            ]
          : undefined;

        const colNames = get(columnNamesAtom);
        const targetColName = colNames[address.colId];
        const { parentColValue, parentColName } = getParentColumnInfo(
          pulldownConfig?.relation,
          address.rowId,
          edits,
          get(baseCellValuesAtom),
          colNames,
        );

        const validationResult = validateCellRules(validations, cellValue, {
          pulldownConfig,
          masterSheetData,
          cellEdits: edits,
          parentColValue,
          parentColName,
          targetColName,
        });

        if (!validationResult.valid) {
          return {
            status: "error",
            errorInfo: validationResult.errorInfo,
          };
        }

        // 5. セルの値が初期値から変更されているか判定
        if (key in edits && edits[key] !== baseValue) {
          return { status: "edited" };
        }

        return { status: "none" };
      },
      (get, set, nextStatus: CellStatusInfo) => {
        const customStatuses = get(cellCustomStatusesAtom);
        if (nextStatus.status === "none" && !nextStatus.message) {
          const updated = { ...customStatuses };
          delete updated[key];
          set(cellCustomStatusesAtom, updated);
        } else {
          set(cellCustomStatusesAtom, {
            ...customStatuses,
            [key]: nextStatus,
          });
        }
      },
    );
  },
  (a, b) => a.rowId === b.rowId && a.colId === b.colId,
);
