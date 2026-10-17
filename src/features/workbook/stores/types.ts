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
export type CellStatus = "none" | "edited" | "error";
export type DateTimeFormat =
  | "yyyy-MM-dd"
  | "yyyy-MM-dd HH:mm"
  | "yyyy-MM-dd hh:mm"
  | "yyyy-MM"
  | "yyyy"
  | "MM";

export type ValidationErrorKey =
  | "required"
  | "number"
  | "string"
  | "alphanumeric"
  | "alpha"
  | "numeric"
  | "maxLength"
  | "minLength"
  | "reference"
  | "referenceRelation"
  | "datetime"
  | "invalid";

export type ValidationErrorInfo = {
  key: ValidationErrorKey;
  params?: Record<string, string | number>;
};

export type CellStatusInfo = {
  status: CellStatus;
  message?: string;
  errorInfo?: ValidationErrorInfo;
};

export type InsertPosition = "above" | "below";

export type ViewMode = "editor" | "pdf-preview";

export type PulldownMode = "dropdown" | "combobox";

export type LookupColumnDefinition = {
  lookupColId: ColumnId;
  sourceColId: ColumnId;
  sourceColName?: string;
};

export type ColumnRelation = {
  parentField: string;
  targetSheetId?: string;
  sourceFilterField: string;
};

export type PulldownBinding = {
  sourceSheetId: string;
  sourceKeyColId: ColumnId;
  lookupColumns: LookupColumnDefinition[];
  mode: PulldownMode;
  relation?: {
    parentColId: ColumnId;
    targetSheetId: string;
    sourceFilterColId: ColumnId;
  };
};

export type LookupBinding = {
  parentColId: ColumnId;
  sourceSheetId: string;
  sourceColId: ColumnId;
};

export type ColumnConfig =
  | { type: "default"; readOnly?: boolean }
  | { type: "datetime"; format: DateTimeFormat; readOnly?: boolean }
  | { type: "pulldown"; pulldown: PulldownBinding; readOnly?: boolean }
  | { type: "lookup"; lookup: LookupBinding; readOnly?: boolean };

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

// --- Sheet & Column Template Types (雛形スキーマ型定義) ---

export type ColumnValidationRule =
  | { type: "required" }
  | { type: "number" }
  | { type: "string" }
  | { type: "alphanumeric" }
  | { type: "alpha" }
  | { type: "numeric" }
  | { type: "maxLength"; length: number }
  | { type: "minLength"; length: number }
  | { type: "reference" }
  | { type: "datetime"; format: DateTimeFormat };

export type ColumnTemplateType =
  | { type: "text" }
  | { type: "number"; format?: "currency" | "integer" | "decimal" }
  | { type: "datetime"; format: DateTimeFormat }
  | {
      type: "pulldown";
      mode: "dropdown" | "combobox";
      sourceTemplateId: string;
      sourceKeyField: string;
      relation?: ColumnRelation;
      lookupFields: {
        field: string;
        headerName: string;
        sourceField: string;
      }[];
    }
  | {
      type: "lookup";
      parentField: string;
      sourceTemplateId: string;
      sourceField: string;
    };

export type ColumnTemplate = {
  field: string;
  headerName: string;
  type: ColumnTemplateType;
  validations?: ColumnValidationRule[];
  width?: number;
  hasTotal?: boolean;
  readOnly?: boolean;
  align?: "left" | "center" | "right";
};

export type SheetCategory = {
  id: string;
  name: string;
  description?: string;
};

export type SheetTemplate = {
  id: string;
  name: string;
  category: string;
  description?: string;
  columns: ColumnTemplate[];
  defaultRowCount?: number;
};
