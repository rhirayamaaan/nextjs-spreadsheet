import { atom } from "jotai";
import { atomFamily } from "jotai-family";
import { z } from "zod";

export const RowIdSchema = z.uuid().brand<"RowId">();
export const ColumnIdSchema = z.uuid().brand<"ColumnId">();

export type RowId = z.infer<typeof RowIdSchema>;
export type ColumnId = z.infer<typeof ColumnIdSchema>;

export const createRowId = () => RowIdSchema.parse(crypto.randomUUID());
export const createColumnId = () => ColumnIdSchema.parse(crypto.randomUUID());

export type CellAddress = {
  rowId: RowId;
  colId: ColumnId;
};

export type Selection = {
  start: { row: number; col: number };
  end: { row: number; col: number };
} | null;

export type WorkbookStatus = "idle" | "selecting" | "editing";
export type RowStatus = "added" | "edited" | "deleted" | "none";
export type InsertPosition = "above" | "below";

// --- Tab (Sheet) Management ---
export const activeSheetIdAtom = atom<string | null>(null);

// --- Diff State (Global across all tabs because of UUIDs) ---
export const cellEditsAtom = atom<Record<string, string>>({});
export const rowStatusesAtom = atom<Record<RowId, RowStatus>>({});
export const columnWidthOverridesAtom = atom<Record<ColumnId, number>>({});

export const modifiedRowOrdersAtom = atom<Record<string, RowId[]>>({});
export const modifiedColumnOrdersAtom = atom<Record<string, ColumnId[]>>({});

// --- Base State (Populated from API for the active tab) ---
export const baseCellValuesAtom = atom<Record<string, string>>({});
export const baseRowOrderAtom = atom<RowId[]>([]);
export const baseColumnOrderAtom = atom<ColumnId[]>([]);

// --- Derived State for Active Tab ---
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

// --- Actions ---

export const resetRowStatusesAtom = atom(null, (get, set) => {
  const activeRowIds = get(rowOrderAtom);
  const currentStatuses = { ...get(rowStatusesAtom) };

  // Only reset statuses for rows in the active sheet
  activeRowIds.forEach((id) => {
    delete currentStatuses[id];
  });

  set(rowStatusesAtom, currentStatuses);
});

export const addRowAtom = atom(null, (get, set) => {
  const newId = createRowId();
  const rowOrder = get(rowOrderAtom);
  set(rowOrderAtom, [...rowOrder, newId]);
  set(rowStatusesAtom, {
    ...get(rowStatusesAtom),
    [newId]: "added",
  });
});

export const insertRowAtom = atom(
  null,
  (
    get,
    set,
    { rowId, position }: { rowId: RowId; position: InsertPosition },
  ) => {
    const rowOrder = get(rowOrderAtom);
    const rowIndex = rowOrder.indexOf(rowId);
    if (rowIndex === -1) return;

    const newId = createRowId();
    const newRowOrder = [...rowOrder];
    const insertIndex = position === "above" ? rowIndex : rowIndex + 1;
    newRowOrder.splice(insertIndex, 0, newId);

    set(rowOrderAtom, newRowOrder);
    set(rowStatusesAtom, {
      ...get(rowStatusesAtom),
      [newId]: "added",
    });
  },
);

export const deleteRowAtom = atom(null, (get, set, rowId: RowId) => {
  const rowStatuses = get(rowStatusesAtom);
  set(rowStatusesAtom, {
    ...rowStatuses,
    [rowId]: "deleted",
  });
});

export const pasteRowsAtom = atom(null, (get, set, rowsData: string[][]) => {
  const columnOrder = get(columnOrderAtom);
  const currentRowOrder = get(rowOrderAtom);
  const currentEdits = get(cellEditsAtom);
  const currentRowStatuses = get(rowStatusesAtom);
  const selection = get(selectionAtom);

  const startCol = selection
    ? Math.min(selection.start.col, selection.end.col)
    : 0;
  const insertIndex = selection
    ? Math.max(selection.start.row, selection.end.row) + 1
    : currentRowOrder.length;

  const newRowIds: RowId[] = [];
  const newCellEdits: Record<string, string> = {};
  const newRowStatuses: Record<RowId, RowStatus> = { ...currentRowStatuses };

  for (const rowData of rowsData) {
    const rowId = createRowId();
    newRowIds.push(rowId);
    newRowStatuses[rowId] = "added";

    rowData.forEach((value, index) => {
      const colIndex = startCol + index;
      if (colIndex < columnOrder.length) {
        const colId = columnOrder[colIndex];
        newCellEdits[`${rowId}-${colId}`] = value;
      }
    });
  }

  const newRowOrder = [...currentRowOrder];
  newRowOrder.splice(insertIndex, 0, ...newRowIds);

  set(rowOrderAtom, newRowOrder);
  set(cellEditsAtom, {
    ...currentEdits,
    ...newCellEdits,
  });
  set(rowStatusesAtom, newRowStatuses);
});

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

export const workbookStatusAtom = atom<WorkbookStatus>("idle");

export const activeCellAtom = atom<{ row: number; col: number } | null>(null);

export const selectionAtom = atom<Selection>(null);
