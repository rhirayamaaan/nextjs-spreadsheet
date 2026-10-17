import { useAtomValue, useSetAtom } from "jotai";
import { useEffect, useState } from "react";
import {
  MOCK_FAVORITE_SHEET_IDS,
  MOCK_INITIAL_OPEN_SHEET_IDS,
  MOCK_SHEET_CATEGORIES,
  MOCK_SHEET_TEMPLATES,
} from "../mock";
import {
  favoriteSheetIdsAtom,
  initWorkbookMetadataAtom,
  openSheetIdsAtom,
  sheetCategoriesAtom,
  sheetTemplatesAtom,
} from "../stores";

/**
 * アプリケーション初期化時にワークブックのメタデータ（カテゴリ、全シート雛形カタログ、初期オープンシート、お気に入りシート）を動的にロードするフック
 */
export const useWorkbookMetadataLoader = () => {
  const [isMetadataLoaded, setIsMetadataLoaded] = useState(false);
  const initMetadata = useSetAtom(initWorkbookMetadataAtom);
  const categories = useAtomValue(sheetCategoriesAtom);
  const sheetTemplates = useAtomValue(sheetTemplatesAtom);
  const openSheetIds = useAtomValue(openSheetIdsAtom);
  const favoriteSheetIds = useAtomValue(favoriteSheetIdsAtom);

  useEffect(() => {
    initMetadata({
      categories: MOCK_SHEET_CATEGORIES,
      templates: MOCK_SHEET_TEMPLATES,
      initialOpenSheetIds: MOCK_INITIAL_OPEN_SHEET_IDS,
      favoriteSheetIds: MOCK_FAVORITE_SHEET_IDS,
    });
    setIsMetadataLoaded(true);
  }, [initMetadata]);

  return {
    isMetadataLoaded,
    categories,
    sheetTemplates,
    openSheetIds,
    favoriteSheetIds,
  };
};
