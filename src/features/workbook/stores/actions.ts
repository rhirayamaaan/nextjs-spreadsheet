import { atom } from "jotai";
import { columnOrderAtom, rowOrderAtom } from "./derived";
import { cellEditsAtom, rowStatusesAtom } from "./edit";
import {
  createRowId,
  type InsertPosition,
  type RowId,
  type RowStatus,
} from "./types";
import { selectionAtom } from "./ui";

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

  const startCol = 0;
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
