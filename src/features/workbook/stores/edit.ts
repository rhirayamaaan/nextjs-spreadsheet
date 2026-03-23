import { atom } from "jotai";
import type { ColumnId, RowId, RowStatus } from "./types";

// --- Diff State (Global across all tabs because of UUIDs) ---
export const cellEditsAtom = atom<Record<string, string>>({});
export const rowStatusesAtom = atom<Record<RowId, RowStatus>>({});

export const modifiedRowOrdersAtom = atom<Record<string, RowId[]>>({});
export const modifiedColumnOrdersAtom = atom<Record<string, ColumnId[]>>({});
