import { atom } from "jotai";
import type { ColumnId, RowId } from "./types";

// --- Base State (Populated from API for the active tab) ---
export const baseCellValuesAtom = atom<Record<string, string>>({});
export const baseRowOrderAtom = atom<RowId[]>([]);
export const baseColumnOrderAtom = atom<ColumnId[]>([]);
