import { apiClient } from "@/lib/query";
import type { CustomValidator } from "../types";

/**
 * 他カラム参照バリデータ（同期）
 * 例: 「タイプ (type)」が "特別" の場合、「データ種別 (category)」の入力を必須化
 */
export const requireCategoryIfSpecial: CustomValidator = ({
  value,
  getRowValue,
}) => {
  const typeVal = getRowValue("type");
  if (typeVal === "特別" && !value.trim()) {
    return {
      valid: false,
      message: "タイプが「特別」の場合はデータ種別の入力が必須です",
    };
  }
  return { valid: true };
};

/**
 * サーバー通信バリデータ（非同期）
 * 例: タイプコードがサーバーDBで有効かの検証
 */
export const validateProductionTypeOnServer: CustomValidator = async ({
  value,
  signal,
  sheetId,
  colId,
}) => {
  if (!value || !value.trim()) {
    return { valid: true };
  }

  try {
    const res = await apiClient.post<{ valid: boolean; message?: string }>(
      `/api/sheets/${sheetId}/validate-cell`,
      {
        colId,
        value: value.trim(),
      },
      { signal },
    );

    return {
      valid: res.valid,
      message: res.message,
    };
  } catch (error: unknown) {
    if (error instanceof Error && error.name === "AbortError") {
      return { valid: true };
    }
    return {
      valid: false,
      message: "サーバー通信検証エラーが発生しました",
    };
  }
};

export const productionVolumeValidators: Record<string, CustomValidator> = {
  "production-volume:requireCategoryIfSpecial": requireCategoryIfSpecial,
  "server:validateProductionType": validateProductionTypeOnServer,
};
