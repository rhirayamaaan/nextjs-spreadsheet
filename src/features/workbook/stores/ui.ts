import { atom } from "jotai";
import type { ColumnId, Selection, ViewMode, WorkbookStatus } from "./types";

export const workbookStatusAtom = atom<WorkbookStatus>("idle");
export const activeCellAtom = atom<{ row: number; col: number } | null>(null);
export const selectionAtom = atom<Selection>(null);

// --- UI State ---
export const activeSheetIdAtom = atom<string | null>(null);
export const viewModeAtom = atom<ViewMode>("editor");
export const pdfPreviewUrlAtom = atom<string | null>(null);
export const columnWidthOverridesAtom = atom<Record<ColumnId, number>>({});
