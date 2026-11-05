import { apiClient } from "@/lib/query";
import type { SheetCategoryRaw, SheetTemplateRaw } from "../../stores";

export type WorkbookMetadataResponse = {
  categories: SheetCategoryRaw[];
  templates: Record<string, SheetTemplateRaw>;
  initialOpenSheetIds: string[];
  favoriteSheetIds: string[];
};

export const fetchWorkbookMetadata = (): Promise<WorkbookMetadataResponse> => {
  return apiClient.get<WorkbookMetadataResponse>("/api/workbook/metadata");
};
