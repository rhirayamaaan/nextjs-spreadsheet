import { apiClient } from "@/lib/query";
import type { SheetCategory, SheetTemplate } from "../../stores";

export type WorkbookMetadataResponse = {
  categories: SheetCategory[];
  templates: Record<string, SheetTemplate>;
  initialOpenSheetIds: string[];
  favoriteSheetIds: string[];
};

export const fetchWorkbookMetadata = (): Promise<WorkbookMetadataResponse> => {
  return apiClient.get<WorkbookMetadataResponse>("/api/workbook/metadata");
};
