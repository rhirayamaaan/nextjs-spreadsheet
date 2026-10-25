import { useSuspenseQuery } from "@/lib/query";
import { workbookMetadataQuery } from "./services/workbookMetadata/workbookMetadata.query";
import type { SheetCategory, SheetTemplate } from "./stores";

export type WorkbookMetadata = {
  categories: SheetCategory[];
  sheetTemplates: Record<string, SheetTemplate>;
  initialOpenSheetIds: string[];
  favoriteSheetIds: string[];
};

/**
 * ワークブックの静的メタデータ（カテゴリ、全シート雛形カタログ、初期オープンシート、お気に入りシート）を
 * Suspense Query でロードし、UI コンテナに集約して返却する純粋なデータローダーフック。
 */
export const useWorkbookMetadataLoader = (): WorkbookMetadata => {
  const { data } = useSuspenseQuery(workbookMetadataQuery);

  return {
    categories: data.categories,
    sheetTemplates: data.templates,
    initialOpenSheetIds: data.initialOpenSheetIds,
    favoriteSheetIds: data.favoriteSheetIds,
  };
};
