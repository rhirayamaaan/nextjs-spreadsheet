import { atom } from "jotai";
import { atomFamily } from "jotai-family";

export type CellId = {
  row: number;
  col: number;
};

export const cellFamily = atomFamily(
  (params: CellId) => {
    const initialValue = `${params.col + 1}:${params.row + 1}`;
    return atom(initialValue);
  },
  (a, b) => a.row === b.row && a.col === b.col,
);

export const columnWidthOverridesAtom = atom<Record<number, number>>({});

export const editingCellAtom = atom<CellId | null>(null);
