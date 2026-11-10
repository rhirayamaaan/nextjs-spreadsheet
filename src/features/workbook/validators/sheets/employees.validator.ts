import { apiClient } from "@/lib/query";
import type { CustomValidator } from "../types";

/**
 * 他カラム参照の独自バリデータ（同期）
 * 例: 雇用区分が「契約」または「パート」の場合、契約終了日の入力が必須
 */
export const requireIfContractEmployee: CustomValidator = ({
  value,
  getRowValue,
}) => {
  // 雇用区分カラムの値を取得（カラム名はプロジェクトの実態に合わせて取得・判定可能）
  const employmentType =
    getRowValue("employmentType") || getRowValue("col_employment_type");

  const isContractOrPart =
    employmentType === "契約" ||
    employmentType === "パート" ||
    employmentType === "contract";

  if (isContractOrPart && !value.trim()) {
    return {
      valid: false,
      message: "雇用区分が契約/パートの場合は契約終了日を入力してください",
    };
  }

  return { valid: true };
};

/**
 * サーバー通信を伴う独自バリデータ（非同期）
 * 例: 社員コードのDB一意性チェック
 */
export const uniqueEmployeeCodeOnServer: CustomValidator = async ({
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
      // リクエストがキャンセルされた場合は有効としてスルー（最新リクエストが上書きするため）
      return { valid: true };
    }
    // ネットワークエラー等のフォールバック
    return {
      valid: false,
      message: "サーバー検証通信に失敗しました",
    };
  }
};

/**
 * 社員シート向けバリデータ辞書
 */
export const employeeValidators: Record<string, CustomValidator> = {
  "employees:requireIfContract": requireIfContractEmployee,
  "server:uniqueEmployeeCode": uniqueEmployeeCodeOnServer,
};
