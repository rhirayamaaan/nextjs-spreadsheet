import { useMemo } from "react";
import { useCurrentLocale } from "@/i18n/context";
import { useSuspenseQuery } from "@/lib/query";
import { workbookMetadataQuery } from "./services/workbookMetadata/workbookMetadata.query";
import {
  localizeSheetCategory,
  localizeSheetTemplate,
  type SheetCategory,
  type SheetTemplate,
} from "./stores";

export type WorkbookMetadata = {
  categories: SheetCategory[];
  sheetTemplates: Record<string, SheetTemplate>;
  initialOpenSheetIds: string[];
  favoriteSheetIds: string[];
};

/**
 * ワークブックのメタデータ（カテゴリ、全シート雛形カタログ、初期オープンシート、お気に入りシート）を
 * Suspense Query でロードし、現在ロケールに応じて解決した上で提供するデータローダーフック。
 */
export const useWorkbookMetadataLoader = (): WorkbookMetadata => {
  const { data } = useSuspenseQuery(workbookMetadataQuery);
  const { locale } = useCurrentLocale();

  const categories = useMemo(() => {
    return data.categories.map((c) => localizeSheetCategory(c, locale));
  }, [data.categories, locale]);

  const sheetTemplates = useMemo(() => {
    const result: Record<string, SheetTemplate> = {};
    for (const [id, t] of Object.entries(data.templates)) {
      result[id] = localizeSheetTemplate(t, locale);
    }
    return result;
  }, [data.templates, locale]);

  return {
    categories,
    sheetTemplates,
    initialOpenSheetIds: data.initialOpenSheetIds,
    favoriteSheetIds: data.favoriteSheetIds,
  };
};
