import { z } from "zod";
import type {
  ColumnId,
  ColumnValidationRule,
  DateTimeFormat,
  PulldownBinding,
  RowId,
  SheetData,
  ValidationErrorInfo,
} from "../../stores/types";
import {
  type CustomValidatorRegistry,
  resolveCustomValidator,
} from "../../validators";
import { parseDateTimeString } from "./datetime";

/**
 * リレーション定義と行IDから親セルの値・名称を取得するヘルパー関数
 */
export const getParentColumnInfo = (
  relation: PulldownBinding["relation"],
  rowId: RowId,
  cellEdits: Record<string, string>,
  baseValues: Record<string, string>,
  columnNames?: Record<ColumnId, string>,
): { parentColValue?: string; parentColName?: string } => {
  if (!relation) return {};
  const parentKey = `${rowId}-${relation.parentColId}`;
  const parentColValue =
    parentKey in cellEdits
      ? cellEdits[parentKey]
      : (baseValues[parentKey] ?? "");
  const parentColName = columnNames?.[relation.parentColId];
  return { parentColValue, parentColName };
};

/**
 * Temporal API を用いた厳密な日付・日時フォーマット検証
 */
export const isValidDateTime = (
  val: string,
  format: DateTimeFormat,
): boolean => {
  if (!val) return true;
  return parseDateTimeString(val, format) !== null;
};

/**
 * 高速ルール検証（15万セルを数ミリ秒で判定するため Zod インスタンス生成をバイパス）
 */
export const checkRuleValid = (
  rule: Exclude<
    ColumnValidationRule,
    { type: "reference" | "unique" | "custom" }
  >,
  value: string,
): boolean => {
  switch (rule.type) {
    case "required":
      return value.trim().length > 0;

    case "number":
      return (
        value === "" ||
        (!Number.isNaN(Number(value)) &&
          !Number.isNaN(Number.parseFloat(value)))
      );

    case "string":
      return true;

    case "alphanumeric":
      return value === "" || /^[a-zA-Z0-9]+$/.test(value);

    case "alpha":
      return value === "" || /^[a-zA-Z]+$/.test(value);

    case "numeric":
      return value === "" || /^[0-9]+$/.test(value);

    case "maxLength":
      return value.length <= rule.length;

    case "minLength":
      return value.length >= rule.length;

    case "datetime":
      return isValidDateTime(value, rule.format);

    default:
      return true;
  }
};

/**
 * 各単一バリデーションルールを Zod スキーマへマッピング
 */
export const ruleToZodSchema = (
  rule: Exclude<
    ColumnValidationRule,
    { type: "reference" | "unique" | "custom" }
  >,
): z.ZodType<string> => {
  switch (rule.type) {
    case "required":
      return z.string().trim().min(1);

    case "number":
      return z
        .string()
        .refine(
          (val) =>
            val === "" ||
            (!Number.isNaN(Number(val)) && !Number.isNaN(parseFloat(val))),
        );

    case "string":
      return z.string();

    case "alphanumeric":
      return z
        .string()
        .refine((val) => val === "" || /^[a-zA-Z0-9]+$/.test(val));

    case "alpha":
      return z.string().refine((val) => val === "" || /^[a-zA-Z]+$/.test(val));

    case "numeric":
      return z.string().refine((val) => val === "" || /^[0-9]+$/.test(val));

    case "maxLength":
      return z.string().refine((val) => val.length <= rule.length);

    case "minLength":
      return z
        .string()
        .refine((val) => val === "" || val.length >= rule.length);

    case "datetime":
      return z
        .string()
        .refine((val) => val === "" || isValidDateTime(val, rule.format));
  }
};

/**
 * バリデーションルール違反時のエラー情報（i18n キー・パラメータ）へマッピング
 */
export const ruleToValidationErrorInfo = (
  rule: Exclude<ColumnValidationRule, { type: "reference" | "custom" }>,
): ValidationErrorInfo => {
  switch (rule.type) {
    case "maxLength":
    case "minLength":
      return { key: rule.type, params: { length: rule.length } };

    case "datetime":
      return { key: rule.type, params: { format: rule.format } };

    default:
      return { key: rule.type };
  }
};

export type ValidationContext = {
  pulldownConfig?: PulldownBinding;
  masterSheetData?: SheetData;
  cellEdits?: Record<string, string>;
  parentColValue?: string;
  parentColName?: string;
  targetColName?: string;
  duplicateValues?: Set<string>;
  sheetId?: string;
  rowId?: RowId;
  colId?: ColumnId;
  getRowValue?: (colId: ColumnId | string) => string;
  customValidators?: CustomValidatorRegistry;
};

export type ValidationResult = {
  valid: boolean;
  message?: string;
  errorInfo?: ValidationErrorInfo;
};

/**
 * reference ルールおよびマスタ親キーリレーションの整合性検証（早期リターンガード節）
 */
export const validateReferenceRule = (
  value: string,
  context?: ValidationContext,
): ValidationResult => {
  // 空値、依存データ不足、またはマスタ未ロード時はスキップ（空値は required 側で検証）
  if (
    !value ||
    !context?.pulldownConfig ||
    !context?.masterSheetData ||
    context.masterSheetData.rows.length === 0
  ) {
    return { valid: true };
  }

  const { sourceKeyColId, relation } = context.pulldownConfig;
  const master = context.masterSheetData;
  const edits = context.cellEdits ?? {};

  // 1. コードがマスタ全体に存在するか確認
  const matchingRows = master.rows.filter((rId) => {
    const key = `${rId}-${sourceKeyColId}`;
    const masterVal = key in edits ? edits[key] : master.values[key];
    return masterVal === value;
  });

  if (matchingRows.length === 0) {
    return {
      valid: false,
      errorInfo: { key: "reference" },
    };
  }

  // 2. リレーション（親キー）未設定ならパス
  if (!relation) {
    return { valid: true };
  }

  // 3. 親セル未入力または親キーとの不整合を検証
  const hasValidRelation =
    Boolean(context.parentColValue) &&
    matchingRows.some((rId) => {
      const filterKey = `${rId}-${relation.sourceFilterColId}`;
      const filterVal =
        filterKey in edits ? edits[filterKey] : master.values[filterKey];
      return filterVal === context.parentColValue;
    });

  if (!hasValidRelation) {
    return {
      valid: false,
      errorInfo: {
        key: "referenceRelation",
        params: {
          parent: context.parentColName ?? "",
          target: context.targetColName ?? "",
        },
      },
    };
  }

  return { valid: true };
};

/**
 * 同期カスタムルールの検証（早期リターンガード節）
 */
export const validateCustomRule = (
  rule: Extract<ColumnValidationRule, { type: "custom" }>,
  value: string,
  context?: ValidationContext,
): ValidationResult => {
  // サーバー通信バリデータ（server: プレフィックス）はセル確定時に非同期で実行するため、同期ループではスキップ
  if (rule.name.startsWith("server:")) {
    return { valid: true };
  }

  const validator = resolveCustomValidator(
    rule.name,
    context?.sheetId,
    context?.customValidators,
  );
  if (!validator) {
    return { valid: true };
  }

  const res = validator({
    value,
    colId: context?.colId ?? ("" as ColumnId),
    rowId: context?.rowId ?? ("" as RowId),
    sheetId: context?.sheetId ?? "",
    getRowValue: context?.getRowValue ?? (() => ""),
    options: rule.options,
  });

  // 非同期 Promise または正常終了ならパス
  if (!res || res instanceof Promise || res.valid) {
    return { valid: true };
  }

  return {
    valid: false,
    message: res.message,
    errorInfo: res.errorInfo ?? (res.message ? undefined : { key: "invalid" }),
  };
};

/**
 * バリデーションルール配列を手前から順次評価する関数（パイプライン・早期終了）
 * 途中のルールで違反があった場合、即座に false とエラー情報（i18nキー・パラメータ）を返却
 */
export const validateCellRules = (
  rules: ColumnValidationRule[] | undefined,
  value: string,
  context?: ValidationContext,
): ValidationResult => {
  if (!rules || rules.length === 0) return { valid: true };

  for (const rule of rules) {
    if (rule.type === "reference") {
      const refResult = validateReferenceRule(value, context);
      if (!refResult.valid) {
        return refResult;
      }
      continue;
    }

    if (rule.type === "unique") {
      if (value.trim() !== "" && context?.duplicateValues?.has(value)) {
        return {
          valid: false,
          errorInfo: { key: "unique" },
        };
      }
      continue;
    }

    if (rule.type === "custom") {
      const customResult = validateCustomRule(rule, value, context);
      if (!customResult.valid) {
        return customResult;
      }
      continue;
    }

    // 高速ルール検証（Zod インスタンス生成をバイパス）
    if (!checkRuleValid(rule, value)) {
      return {
        valid: false,
        errorInfo: ruleToValidationErrorInfo(rule),
      };
    }
  }

  return { valid: true };
};
