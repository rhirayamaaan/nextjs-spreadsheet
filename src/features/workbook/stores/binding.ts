import { atom, type Getter } from "jotai";
import { atomFamily } from "jotai-family";
import { cellEditsAtom } from "./edit";
import type {
  CellAddress,
  ColumnConfig,
  ColumnId,
  LookupBinding,
  SheetData,
} from "./types";

import { activeSheetIdAtom } from "./ui";

// Record<sheetId, Record<ColumnId, ColumnConfig>>
export const columnConfigsAtom = atom<
  Record<string, Record<ColumnId, ColumnConfig>>
>({});

// Global store for sheets that are referenced as master data
export const referencedSheetsDataAtom = atom<Record<string, SheetData>>({});

const EMPTY_CONFIGS: Record<ColumnId, ColumnConfig> = {};

// Column configs for the active sheet
export const activeColumnConfigsAtom = atom<Record<ColumnId, ColumnConfig>>(
  (get) => {
    const activeSheetId = get(activeSheetIdAtom);
    if (!activeSheetId) return EMPTY_CONFIGS;
    const allConfigs = get(columnConfigsAtom);
    return allConfigs[activeSheetId] ?? EMPTY_CONFIGS;
  },
);

// Selector family to get column config for a specific column in active sheet
export const activeColumnConfigFamily = atomFamily((colId: ColumnId) =>
  atom((get) => {
    const configs = get(activeColumnConfigsAtom);
    return configs[colId] ?? { type: "default" };
  }),
);

// Dynamic lookup value selector
export const getLookupValue = (
  get: Getter,
  address: CellAddress,
  lookup: LookupBinding,
  baseCellValues: Record<string, string>,
): string => {
  const { parentColId, sourceSheetId, sourceColId } = lookup;
  const parentKey = `${address.rowId}-${parentColId}`;
  const cellEdits = get(cellEditsAtom);
  const parentValue =
    parentKey in cellEdits
      ? cellEdits[parentKey]
      : (baseCellValues[parentKey] ?? "");

  if (!parentValue) return "";

  const masterSheet = get(referencedSheetsDataAtom)[sourceSheetId];
  if (!masterSheet) return "";

  // Find parent pulldown binding to know the master's key column
  const activeSheetId = get(activeSheetIdAtom);
  const sheetConfigs = get(columnConfigsAtom)[activeSheetId ?? ""] ?? {};
  const parentConfig = sheetConfigs[parentColId];
  if (!parentConfig || parentConfig.type !== "pulldown") return "";

  const sourceKeyColId = parentConfig.pulldown.sourceKeyColId;

  // Find the row in masterSheet matching parentValue
  for (const rowId of masterSheet.rows) {
    const key = `${rowId}-${sourceKeyColId}`;
    const rowKeyVal =
      key in cellEdits ? cellEdits[key] : masterSheet.values[key];
    if (rowKeyVal === parentValue) {
      const targetKey = `${rowId}-${sourceColId}`;
      return (
        (targetKey in cellEdits
          ? cellEdits[targetKey]
          : masterSheet.values[targetKey]) ?? ""
      );
    }
  }

  return "";
};
