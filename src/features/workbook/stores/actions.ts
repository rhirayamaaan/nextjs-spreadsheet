import { atom } from "jotai";
import { columnConfigsAtom } from "./binding";
import { columnNamesAtom, columnOrderAtom, rowOrderAtom } from "./derived";
import { cellEditsAtom, rowStatusesAtom } from "./edit";
import {
  type ColumnId,
  createColumnId,
  createRowId,
  type InsertPosition,
  type LookupColumnDefinition,
  type PulldownMode,
  type RowId,
  type RowStatus,
} from "./types";
import { activeSheetIdAtom, selectionAtom } from "./ui";

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

export type ApplyColumnBindingPayload = {
  targetColId: ColumnId;
  keyColName?: string;
  sourceSheetId: string;
  sourceKeyColId: ColumnId;
  selectedLookupCols: {
    sourceColId: ColumnId;
    headerName: string;
  }[];
  mode: PulldownMode;
};

export const applyColumnBindingAtom = atom(
  null,
  (get, set, payload: ApplyColumnBindingPayload) => {
    const {
      targetColId,
      keyColName,
      sourceSheetId,
      sourceKeyColId,
      selectedLookupCols,
      mode,
    } = payload;

    const activeSheetId = get(activeSheetIdAtom);
    if (!activeSheetId) return;

    const currentOrders = get(columnOrderAtom);
    const colConfigs = { ...(get(columnConfigsAtom)[activeSheetId] ?? {}) };

    // If targetColId already had previous lookup columns, remove them first
    const existingConfig = colConfigs[targetColId];
    let workingOrder = [...currentOrders];
    if (existingConfig && existingConfig.type === "pulldown") {
      const oldLookupColIds = new Set(
        existingConfig.pulldown.lookupColumns.map((l) => l.lookupColId),
      );
      workingOrder = workingOrder.filter((id) => !oldLookupColIds.has(id));
      for (const oldId of oldLookupColIds) {
        delete colConfigs[oldId];
      }
    }

    const targetIndex = workingOrder.indexOf(targetColId);
    if (targetIndex === -1) return;

    // Create new lookup columns
    const newLookupDefinitions: LookupColumnDefinition[] = [];
    const newLookupColIds: ColumnId[] = [];
    const newNames: Record<ColumnId, string> = {};

    if (keyColName) {
      newNames[targetColId] = keyColName;
    }

    for (const item of selectedLookupCols) {
      const newColId = createColumnId();
      newLookupColIds.push(newColId);
      newLookupDefinitions.push({
        lookupColId: newColId,
        sourceColId: item.sourceColId,
        sourceColName: item.headerName,
      });
      newNames[newColId] = item.headerName;

      colConfigs[newColId] = {
        type: "lookup",
        lookup: {
          parentColId: targetColId,
          sourceSheetId,
          sourceColId: item.sourceColId,
        },
      };
    }

    colConfigs[targetColId] = {
      type: "pulldown",
      pulldown: {
        sourceSheetId,
        sourceKeyColId,
        lookupColumns: newLookupDefinitions,
        mode,
      },
    };

    // Insert lookup columns right after targetColId
    workingOrder.splice(targetIndex + 1, 0, ...newLookupColIds);

    set(columnOrderAtom, workingOrder);
    set(columnNamesAtom, (prev) => ({ ...prev, ...newNames }));
    set(columnConfigsAtom, {
      ...get(columnConfigsAtom),
      [activeSheetId]: colConfigs,
    });
  },
);

export const removeColumnBindingAtom = atom(
  null,
  (get, set, targetColId: ColumnId) => {
    const activeSheetId = get(activeSheetIdAtom);
    if (!activeSheetId) return;

    const currentConfigs = { ...(get(columnConfigsAtom)[activeSheetId] ?? {}) };
    const config = currentConfigs[targetColId];
    if (!config || config.type !== "pulldown") return;

    const lookupColIds = new Set(
      config.pulldown.lookupColumns.map((l) => l.lookupColId),
    );

    delete currentConfigs[targetColId];
    for (const lookupId of lookupColIds) {
      delete currentConfigs[lookupId];
    }

    const currentOrder = get(columnOrderAtom);
    const newOrder = currentOrder.filter((id) => !lookupColIds.has(id));

    set(columnOrderAtom, newOrder);
    set(columnConfigsAtom, {
      ...get(columnConfigsAtom),
      [activeSheetId]: currentConfigs,
    });
  },
);

export const reorderColumnsWithFollowersAtom = atom(
  null,
  (
    get,
    set,
    { activeColId, overColId }: { activeColId: ColumnId; overColId: ColumnId },
  ) => {
    if (activeColId === overColId) return;
    const activeSheetId = get(activeSheetIdAtom);
    if (!activeSheetId) return;

    const currentOrder = get(columnOrderAtom);
    const configs = get(columnConfigsAtom)[activeSheetId] ?? {};

    const activeConfig = configs[activeColId];
    // Lookup columns cannot be moved directly
    if (activeConfig?.type === "lookup") return;

    const activeFollowers: ColumnId[] = [];
    if (activeConfig?.type === "pulldown") {
      const pulldownConfig = activeConfig.pulldown;
      activeFollowers.push(
        ...pulldownConfig.lookupColumns.map((l) => l.lookupColId),
      );
    }

    const movingGroup = [activeColId, ...activeFollowers];
    const movingGroupSet = new Set(movingGroup);

    const oldIndex = currentOrder.indexOf(activeColId);
    let overIndex = currentOrder.indexOf(overColId);
    if (oldIndex === -1 || overIndex === -1) return;

    const overConfig = configs[overColId];
    if (overConfig?.type === "lookup") {
      const parentColId = overConfig.lookup.parentColId;
      const parentConfig = configs[parentColId];
      if (parentConfig?.type === "pulldown") {
        const lastFollower =
          parentConfig.pulldown.lookupColumns[
            parentConfig.pulldown.lookupColumns.length - 1
          ];
        if (lastFollower) {
          overIndex = currentOrder.indexOf(lastFollower.lookupColId);
        }
      }
    }

    const remaining = currentOrder.filter((id) => !movingGroupSet.has(id));

    let targetIndex = remaining.indexOf(overColId);
    if (targetIndex === -1) {
      targetIndex = remaining.length;
    } else if (oldIndex < overIndex) {
      targetIndex = targetIndex + 1;
    }

    remaining.splice(targetIndex, 0, ...movingGroup);
    set(columnOrderAtom, remaining);
  },
);
