import { atom } from "jotai";
import { atomFamily } from "jotai-family";
import {
  baseCellValuesAtom,
  baseColumnOrderAtom,
  baseRowOrderAtom,
} from "./base";
import {
  cellEditsAtom,
  modifiedColumnOrdersAtom,
  modifiedRowOrdersAtom,
  rowStatusesAtom,
} from "./edit";
import type { CellAddress, ColumnId, RowId } from "./types";
import { activeSheetIdAtom } from "./ui";

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

export const cellFamily = atomFamily(
  (address: CellAddress) => {
    const key = `${address.rowId}-${address.colId}` as const;

    return atom(
      (get) => {
        const edits = get(cellEditsAtom);
        if (key in edits) {
          return edits[key];
        }
        return get(baseCellValuesAtom)[key] ?? ""; // 未編集なら初期データから取得
      },
      (get, set, newValue: string) => {
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
