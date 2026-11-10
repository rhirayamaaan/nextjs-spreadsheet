/**
 * 共通バリデータ名カタログ
 */
export type CommonValidatorName = "common:postalCode" | "common:dateRangeOrder";

/**
 * サーバー通信バリデータ名カタログ
 */
export type ServerValidatorName =
  | "server:uniqueEmployeeCode"
  | "server:validateProductionType"
  | "server:checkCustomerExists"
  | "server:checkProductStock";

/**
 * シート別独自バリデータ名カタログ
 */
export type SheetScopedValidatorName =
  | "employees:requireIfContract"
  | "production-volume:requireCategoryIfSpecial"
  | "orders:requireApproverIfOverAmount";

/**
 * 登録可能なバリデータ名の型定義
 * 主要な規約名カタログの自動補完・型チェックを効かせつつ、拡張のために (string & {}) を許容
 */
export type CustomValidatorName =
  | CommonValidatorName
  | ServerValidatorName
  | SheetScopedValidatorName
  | (string & {});
