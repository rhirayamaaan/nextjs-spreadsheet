import type { CustomValidator } from "../types";

/**
 * 郵便番号フォーマット検証 (xxx-xxxx または 7桁数字)
 */
export const postalCodeValidator: CustomValidator = ({ value }) => {
  if (!value) return { valid: true };
  const isValid = /^\d{3}-?\d{4}$/.test(value.trim());
  if (!isValid) {
    return {
      valid: false,
      message: "郵便番号の形式が正しくありません (例: 123-4567)",
    };
  }
  return { valid: true };
};

/**
 * 共通バリデータ一覧
 */
export const commonValidators: Record<string, CustomValidator> = {
  "common:postalCode": postalCodeValidator,
};
