import { apiClient } from "@/lib/query";

export const fetchSheetRecords = async (
  sheetId: string,
): Promise<Record<string, string>[]> => {
  const data = await apiClient.get<{ records: Record<string, string>[] }>(
    `/api/sheets/${sheetId}/records`,
  );
  return data.records;
};

export type SaveSheetRecordsResponse = {
  success: boolean;
  sheetId: string;
  savedAt?: string;
  errors?: Array<{
    rowId: string;
    colId: string;
    message: string;
  }>;
};

export const saveSheetRecordsApi = (
  sheetId: string,
  sheetName: string,
  diff: unknown,
): Promise<SaveSheetRecordsResponse> => {
  return apiClient.post<SaveSheetRecordsResponse>(
    `/api/sheets/${sheetId}/records`,
    {
      sheetId,
      sheetName,
      updatedAt: new Date().toISOString(),
      diff,
    },
  );
};
