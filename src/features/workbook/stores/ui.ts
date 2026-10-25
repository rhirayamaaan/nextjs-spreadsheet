import { atom } from "jotai";
import type {
  ActiveCell,
  ColumnId,
  Selection,
  ViewMode,
  WorkbookStatus,
} from "./types";

export const workbookStatusAtom = atom<WorkbookStatus>("idle");
export const activeCellAtom = atom<ActiveCell>(null);
export const selectionAtom = atom<Selection>(null);

// --- UI State (純粋な UI 状態として管理。初期値フォールバックはコンテナ層で行う) ---
export const openSheetIdsAtom = atom<string[] | null>(null);
export const activeSheetIdAtom = atom<string | null>(null);
export const favoriteSheetIdsAtom = atom<string[] | null>(null);

export const viewModeAtom = atom<ViewMode>("editor");
export const pdfPreviewUrlAtom = atom<string | null>(null);
export const columnWidthOverridesAtom = atom<Record<ColumnId, number>>({});
