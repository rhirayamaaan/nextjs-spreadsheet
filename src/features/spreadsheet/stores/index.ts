import { atom } from "jotai";
import { atomFamily } from "jotai-family";

export type CellId = {
  row: number;
  col: number;
};

export type Selection = {
  start: CellId;
  end: CellId;
} | null;

export type SpreadsheetStatus = "idle" | "selecting" | "editing";

export const cellFamily = atomFamily(
  (params: CellId) => {
    const initialValue = `${params.col + 1}:${params.row + 1}`;
    return atom(initialValue);
  },
  (a, b) => a.row === b.row && a.col === b.col,
);

export const columnWidthOverridesAtom = atom<Record<number, number>>({});

export const spreadsheetStatusAtom = atom<SpreadsheetStatus>("idle");

export const activeCellAtom = atom<CellId | null>(null);

export const selectionAtom = atom<Selection>(null);
