import { z } from "zod";

export const RowIdSchema = z.uuid().brand<"RowId">();
export const ColumnIdSchema = z.uuid().brand<"ColumnId">();

export type RowId = z.infer<typeof RowIdSchema>;
export type ColumnId = z.infer<typeof ColumnIdSchema>;

export const createRowId = () => RowIdSchema.parse(crypto.randomUUID());
export const createColumnId = () => ColumnIdSchema.parse(crypto.randomUUID());

export const isRowId = (id: unknown): id is RowId =>
  RowIdSchema.safeParse(id).success;
export const isColumnId = (id: unknown): id is ColumnId =>
  ColumnIdSchema.safeParse(id).success;

export type CellAddress = {
  rowId: RowId;
  colId: ColumnId;
};

export type Selection = {
  start: { row: number; col: number };
  end: { row: number; col: number };
} | null;

export type WorkbookStatus = "idle" | "selecting" | "editing";
export type RowStatus = "added" | "edited" | "deleted" | "none";
export type InsertPosition = "above" | "below";

export type ViewMode = "editor" | "pdf-preview";

export type PulldownMode = "dropdown" | "combobox";

export type LookupColumnDefinition = {
  lookupColId: ColumnId;
  sourceColId: ColumnId;
  sourceColName?: string;
};

export type PulldownBinding = {
  sourceSheetId: string;
  sourceKeyColId: ColumnId;
  lookupColumns: LookupColumnDefinition[];
  mode: PulldownMode;
};

export type LookupBinding = {
  parentColId: ColumnId;
  sourceSheetId: string;
  sourceColId: ColumnId;
};

export type ColumnConfig =
  | { type: "default" }
  | { type: "pulldown"; pulldown: PulldownBinding }
  | { type: "lookup"; lookup: LookupBinding };

export type ColumnFilter = {
  selectedValues: string[];
};

export type SheetData = {
  id: string;
  name: string;
  rows: RowId[];
  cols: ColumnId[];
  colNames: Record<ColumnId, string>;
  values: Record<string, string>;
};
