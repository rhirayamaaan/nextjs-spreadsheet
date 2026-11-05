import { z } from "zod";
import type { I18nString } from "@/i18n/types";

export const RowIdSchema = z.string().min(1).brand<"RowId">();
export const ColumnIdSchema = z.string().min(1).brand<"ColumnId">();

export type RowId = z.infer<typeof RowIdSchema>;
export type ColumnId = z.infer<typeof ColumnIdSchema>;

export const createRowId = () => RowIdSchema.parse(crypto.randomUUID());
export const createColumnId = () => ColumnIdSchema.parse(crypto.randomUUID());

export const createRecordRowId = (sheetId: string, index: number): RowId =>
  RowIdSchema.parse(`${sheetId}-r${index}`);

export const createSubtotalRowId = (groupId: string): RowId =>
  RowIdSchema.parse(`subtotal-${groupId}`);

export const isSubtotalRowId = (rowId: RowId): boolean =>
  rowId.startsWith("subtotal-");

export const parseRowIndex = (rowId: RowId, sheetId: string): number | null => {
  const prefix = `${sheetId}-r`;
  if (rowId.startsWith(prefix)) {
    const num = Number.parseInt(rowId.slice(prefix.length), 10);
    return Number.isNaN(num) ? null : num;
  }
  return null;
};

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

export type ActiveCell = {
  row: number;
  col: number;
  initialValue?: string;
} | null;

export type MoveDirection = {
  deltaRow: number;
  deltaCol: number;
};

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
  | "unique"
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
  | { type: "datetime"; format: DateTimeFormat }
  | { type: "unique" };

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

export type SheetMode = "edit" | "inquiry";

export type SubtotalAggregationType = "sum" | "avg" | "blank";

export type SubtotalConfig = {
  enabled: boolean;
  /** グルーピングのキーとなるフィールド一覧（「年度」から「受払区分」まで） */
  groupByKeys: string[];
  /** 小計ラベル（例: （計））を表示するカラムのfield */
  labelField: string;
  /** 小計行に表示するラベル文字列 (デフォルト: "（計）") */
  labelPattern?: string;
  /** 各数値列の集計種別 ("sum" | "blank") */
  aggregations: Record<string, SubtotalAggregationType>;
};

export type SheetTemplate = {
  id: string;
  name: string;
  category: string;
  description?: string;
  isFavorite?: boolean;
  columns: ColumnTemplate[];
  defaultRowCount?: number;
  subtotalConfig?: SubtotalConfig;
};

// --- Raw Types (API レスポンスに含まれる多言語生データ型) ---

export type ColumnTemplateTypeRaw =
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
        headerName: I18nString;
        sourceField: string;
      }[];
    }
  | {
      type: "lookup";
      parentField: string;
      sourceTemplateId: string;
      sourceField: string;
    };

export type ColumnTemplateRaw = {
  field: string;
  headerName: I18nString;
  type: ColumnTemplateTypeRaw;
  validations?: ColumnValidationRule[];
  width?: number;
  hasTotal?: boolean;
  readOnly?: boolean;
  align?: "left" | "center" | "right";
};

export type SheetCategoryRaw = {
  id: string;
  name: I18nString;
  description?: I18nString;
};

export type SubtotalConfigRaw = {
  enabled: boolean;
  groupByKeys: string[];
  labelField: string;
  labelPattern?: I18nString;
  aggregations: Record<string, SubtotalAggregationType>;
};

export type SheetTemplateRaw = {
  id: string;
  name: I18nString;
  category: string;
  description?: I18nString;
  isFavorite?: boolean;
  columns: ColumnTemplateRaw[];
  defaultRowCount?: number;
  subtotalConfig?: SubtotalConfigRaw;
};
