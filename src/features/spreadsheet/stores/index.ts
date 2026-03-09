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

export type SpreadsheetStatus = "idle" | "selecting" | "editing";
export type RowStatus = "added" | "edited" | "deleted" | "none";

export const rowOrderAtom = atom<RowId[]>([]);
export const rowStatusesAtom = atom<Record<RowId, RowStatus>>({});
export const columnOrderAtom = atom<ColumnId[]>([]);

export const initialCellValuesAtom = atom<
  Record<`${RowId}-${ColumnId}`, string>
>({});

export const resetRowStatusesAtom = atom(null, (_, set) => {
  set(rowStatusesAtom, {});
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
  const currentInitialValues = get(initialCellValuesAtom);
  const currentRowStatuses = get(rowStatusesAtom);

  const newRowIds: RowId[] = [];
  const newCellValues: Record<string, string> = {};
  const newRowStatuses: Record<RowId, RowStatus> = { ...currentRowStatuses };

  for (const rowData of rowsData) {
    const rowId = createRowId();
    newRowIds.push(rowId);
    newRowStatuses[rowId] = "added";

    columnOrder.forEach((colId, index) => {
      const value = rowData[index] ?? "";
      newCellValues[`${rowId}-${colId}`] = value;
    });
  }

  set(rowOrderAtom, [...currentRowOrder, ...newRowIds]);
  set(initialCellValuesAtom, {
    ...currentInitialValues,
    ...newCellValues,
  });
  set(rowStatusesAtom, newRowStatuses);
});

export const cellFamily = atomFamily(
  (address: CellAddress) => {
    const key = `${address.rowId}-${address.colId}` as const;
    const localValueAtom = atom<string | undefined>(undefined);

    return atom(
      (get) => {
        const localValue = get(localValueAtom);
        if (localValue !== undefined) {
          return localValue;
        }
        return get(initialCellValuesAtom)[key] ?? ""; // 未編集なら初期データから取得
      },
      (get, set, newValue: string) => {
        const currentValue =
          get(localValueAtom) ?? get(initialCellValuesAtom)[key] ?? "";
        if (currentValue === newValue) return;

        set(localValueAtom, newValue); // 編集時はローカルのみ更新

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

export const columnWidthOverridesAtom = atom<Record<ColumnId, number>>({});

export const spreadsheetStatusAtom = atom<SpreadsheetStatus>("idle");

export const activeCellAtom = atom<{ row: number; col: number } | null>(null);

export const selectionAtom = atom<Selection>(null);
