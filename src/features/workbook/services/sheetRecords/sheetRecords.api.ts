import { apiClient } from "@/lib/query";

export const fetchSheetRecords = async (
  sheetId: string,
): Promise<Record<string, string>[]> => {
  const data = await apiClient.get<{ records: Record<string, string>[] }>(
    `/api/sheets/${sheetId}/records`,
  );
  return data.records;
};

export const saveSheetRecordsApi = (
  sheetId: string,
  sheetName: string,
  diff: unknown,
): Promise<{ success: boolean; sheetId: string; savedAt: string }> => {
  return apiClient.post<{ success: boolean; sheetId: string; savedAt: string }>(
    `/api/sheets/${sheetId}/records`,
    {
      sheetId,
      sheetName,
      updatedAt: new Date().toISOString(),
      diff,
    },
  );
};
