import { apiClient } from "@/lib/query";
import type { ReportLayout } from "./reportLayout.types";

export const fetchReportLayout = async (
  sheetId: string,
): Promise<ReportLayout | null> => {
  try {
    const data = await apiClient.get<{
      success: boolean;
      sheetId: string;
      layout: ReportLayout | null;
    }>(`/api/sheets/${sheetId}/report-layout`);
    return data.layout;
  } catch (_error) {
    // 帳票定義が存在しないシートの場合は 404 等が返る想定
    return null;
  }
};
