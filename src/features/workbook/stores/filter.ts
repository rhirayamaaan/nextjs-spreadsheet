import { atom } from "jotai";
import { atomFamily } from "jotai-family";
import { baseCellValuesAtom } from "./base";
import { activeColumnConfigsAtom, getLookupValue } from "./binding";
import { rowOrderAtom } from "./derived";
import { cellEditsAtom } from "./edit";
import type { ColumnFilter, ColumnId, RowId } from "./types";
import { activeSheetIdAtom } from "./ui";

// sheetId -> Record<ColumnId, ColumnFilter>
export const columnFiltersAtom = atom<
  Record<string, Record<ColumnId, ColumnFilter>>
>({});

export const activeColumnFiltersAtom = atom(
  (get) => {
    const activeSheetId = get(activeSheetIdAtom);
    if (!activeSheetId) return {} as Record<ColumnId, ColumnFilter>;
    const filters = get(columnFiltersAtom);
    return filters[activeSheetId] ?? ({} as Record<ColumnId, ColumnFilter>);
  },
  (
    get,
    set,
    newFilters:
      | Record<ColumnId, ColumnFilter>
      | ((
          prev: Record<ColumnId, ColumnFilter>,
        ) => Record<ColumnId, ColumnFilter>),
  ) => {
    const activeSheetId = get(activeSheetIdAtom);
    if (!activeSheetId) return;

    const currentFilters = get(activeColumnFiltersAtom);
    const nextFilters =
      typeof newFilters === "function"
        ? newFilters(currentFilters)
        : newFilters;

    const allFilters = get(columnFiltersAtom);
    set(columnFiltersAtom, {
      ...allFilters,
      [activeSheetId]: nextFilters,
    });
  },
);

export const activeColumnFilterFamily = atomFamily(
  (colId: ColumnId) =>
    atom((get) => {
      const filters = get(activeColumnFiltersAtom);
      return filters[colId];
    }),
  (a, b) => a === b,
);

// 特定の列に存在するユニークな値の一覧を抽出する selector
export const columnUniqueValuesFamily = atomFamily(
  (colId: ColumnId) =>
    atom((get) => {
      const rowOrder = get(rowOrderAtom);
      const edits = get(cellEditsAtom);
      const baseValues = get(baseCellValuesAtom);
      const configs = get(activeColumnConfigsAtom);
      const config = configs[colId];

      const valueSet = new Set<string>();

      for (const rowId of rowOrder) {
        if (config && config.type === "lookup") {
          const val = getLookupValue(
            get,
            { rowId, colId },
            config.lookup,
            baseValues,
          );
          valueSet.add(val);
        } else {
          const key = `${rowId}-${colId}`;
          const val = key in edits ? edits[key] : (baseValues[key] ?? "");
          valueSet.add(val);
        }
      }

      // 空白文字列も含め、ソートして返す
      const values = Array.from(valueSet);
      return values.sort((a, b) => {
        if (a === "") return 1;
        if (b === "") return -1;
        return a.localeCompare(b, undefined, {
          numeric: true,
          sensitivity: "base",
        });
      });
    }),
  (a, b) => a === b,
);

// フィルター適用後の表示行一覧
export const visibleRowOrderAtom = atom<RowId[]>((get) => {
  const rowOrder = get(rowOrderAtom);
  const filters = get(activeColumnFiltersAtom);

  const activeColFilterEntries = Object.entries(filters).filter(
    ([, filter]) => filter && Array.isArray(filter.selectedValues),
  ) as [ColumnId, ColumnFilter][];

  if (activeColFilterEntries.length === 0) {
    return rowOrder;
  }

  const edits = get(cellEditsAtom);
  const baseValues = get(baseCellValuesAtom);
  const configs = get(activeColumnConfigsAtom);

  return rowOrder.filter((rowId) => {
    for (const [colId, filter] of activeColFilterEntries) {
      let cellValue = "";
      const config = configs[colId];
      if (config && config.type === "lookup") {
        cellValue = getLookupValue(
          get,
          { rowId, colId },
          config.lookup,
          baseValues,
        );
      } else {
        const key = `${rowId}-${colId}`;
        cellValue = key in edits ? edits[key] : (baseValues[key] ?? "");
      }

      if (!filter.selectedValues.includes(cellValue)) {
        return false;
      }
    }
    return true;
  });
});

export const setColumnFilterAtom = atom(
  null,
  (
    get,
    set,
    { colId, selectedValues }: { colId: ColumnId; selectedValues: string[] },
  ) => {
    const activeSheetId = get(activeSheetIdAtom);
    if (!activeSheetId) return;

    const currentFilters = get(activeColumnFiltersAtom);
    set(activeColumnFiltersAtom, {
      ...currentFilters,
      [colId]: { selectedValues },
    });
  },
);

export const clearColumnFilterAtom = atom(null, (get, set, colId: ColumnId) => {
  const activeSheetId = get(activeSheetIdAtom);
  if (!activeSheetId) return;

  const currentFilters = { ...get(activeColumnFiltersAtom) };
  delete currentFilters[colId];
  set(activeColumnFiltersAtom, currentFilters);
});

export const clearAllFiltersAtom = atom(null, (get, set) => {
  const activeSheetId = get(activeSheetIdAtom);
  if (!activeSheetId) return;

  set(activeColumnFiltersAtom, {});
});
