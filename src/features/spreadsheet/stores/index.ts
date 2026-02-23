import { atom } from "jotai";
import { atomFamily } from "jotai-family";
import { z } from "zod";

export const RowIdSchema = z.uuid().brand<"RowId">();
export const ColumnIdSchema = z.uuid().brand<"ColumnId">();

export type RowId = z.infer<typeof RowIdSchema>;
export type ColumnId = z.infer<typeof ColumnIdSchema>;

export const createRowId = () => RowIdSchema.parse(crypto.randomUUID());
export const createColumnId = () => ColumnIdSchema.parse(crypto.randomUUID());

export type CellAddress = {
  rowId: RowId;
  colId: ColumnId;
};

export type Selection = {
  start: { row: number; col: number };
  end: { row: number; col: number };
} | null;

export type SpreadsheetStatus = "idle" | "selecting" | "editing";

export const rowOrderAtom = atom<RowId[]>([]);
export const columnOrderAtom = atom<ColumnId[]>([]);

export const initialCellValuesAtom = atom<
  Record<`${RowId}-${ColumnId}`, string>
>({});

export const cellFamily = atomFamily(
  (address: CellAddress) => {
    const key = `${address.rowId}-${address.colId}` as const;
    const localValueAtom = atom<string | undefined>(undefined);

    return atom(
      (get) => {
        const localValue = get(localValueAtom);
        if (localValue !== undefined) {
          return localValue;
        }
        return get(initialCellValuesAtom)[key] ?? ""; // 未編集なら初期データから取得
      },
      (_, set, newValue: string) => {
        set(localValueAtom, newValue); // 編集時はローカルのみ更新
      },
    );
  },
  (a, b) => a.rowId === b.rowId && a.colId === b.colId,
);

export const columnWidthOverridesAtom = atom<Record<ColumnId, number>>({});

export const spreadsheetStatusAtom = atom<SpreadsheetStatus>("idle");

export const activeCellAtom = atom<{ row: number; col: number } | null>(null);

export const selectionAtom = atom<Selection>(null);
