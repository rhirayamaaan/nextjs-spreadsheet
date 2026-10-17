export const locales = ["ja", "en"] as const;

export const commonMessages = {
  ja: {
    ok: "OK",
    cancel: "キャンセル",
    search: "検索する",

    // バリデーション共通メッセージ
    validationRequired: "入力必須項目です",
    validationNumber: "数値を入力してください",
    validationString: "文字列を入力してください",
    validationAlphanumeric: "半角英数字で入力してください",
    validationAlpha: "半角英字で入力してください",
    validationNumeric: "半角数字で入力してください",
    validationMaxLength: "{length}文字以内で入力してください",
    validationMinLength: "{length}文字以上で入力してください",
    validationReference: "マスタに存在しない値です",
    validationReferenceRelation: "{parent}に{target}がありません",
    validationDatetime: "{format}の形式で正しい日付を入力してください",
    validationInvalid: "入力値が不正です",
  },
  en: {
    ok: "OK",
    cancel: "Cancel",
    search: "Search",

    // Validation common messages
    validationRequired: "This field is required",
    validationNumber: "Please enter a valid number",
    validationString: "Please enter a string",
    validationAlphanumeric: "Please enter alphanumeric characters",
    validationAlpha: "Please enter alphabetic characters",
    validationNumeric: "Please enter digits only",
    validationMaxLength: "Must be at most {length} characters",
    validationMinLength: "Must be at least {length} characters",
    validationReference: "Value does not exist in master data",
    validationReferenceRelation: "{target} does not exist in {parent}",
    validationDatetime: "Please enter a valid date in {format} format",
    validationInvalid: "Invalid value",
  },
} as const;
