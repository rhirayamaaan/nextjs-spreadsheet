import type { ColumnId, RowId, ValidationErrorInfo } from "../stores/types";

/**
 * カスタムバリデータに渡されるコンテキスト
 */
export type CustomValidationContext = {
  value: string;
  colId: ColumnId;
  rowId: RowId;
  sheetId: string;
  getRowValue: (colId: ColumnId | string) => string;
  signal?: AbortSignal;
  options?: unknown;
};

/**
 * カスタムバリデータの検証結果
 */
export type CustomValidationResult = {
  valid: boolean;
  message?: string;
  errorInfo?: ValidationErrorInfo;
};

/**
 * 統一カスタムバリデータ関数
 * 同期結果（CustomValidationResult）または 非同期結果（Promise<CustomValidationResult>）を返却
 */
export type CustomValidator = (
  context: CustomValidationContext,
) => CustomValidationResult | Promise<CustomValidationResult>;

/**
 * カスタムバリデータレジストリ（2層構造）
 */
export type CustomValidatorRegistry = {
  /** 全シート横断の共通バリデータ */
  common?: Record<string, CustomValidator>;
  /** シートIDごとに分離されたバリデータ辞書 */
  sheets?: {
    [sheetId: string]: Record<string, CustomValidator>;
  };
};
