import { useAtom, useSetAtom } from "jotai";
import { useHydrateAtoms } from "jotai/utils";
import { useCallback, useEffect, useMemo } from "react";
import {
  activeSheetIdAtom,
  closeSheetAtom,
  computeSheetsByCategory,
  favoriteSheetIdsAtom,
  openSheetAtom,
  openSheetIdsAtom,
  type SheetCategory,
  type SheetTemplate,
  toggleFavoriteSheetAtom,
} from "./stores";
import { useWorkbookMetadataLoader } from "./useWorkbookMetadataLoader.container";

export type UseSheetLoaderReturn = {
  activeSheet?: SheetTemplate;
  activeSheetId: string | null;
  openSheets: SheetTemplate[];
  openSheetIds: string[];
  favoriteSheetIds: string[];
  categories: SheetCategory[];
  sheetTemplates: Record<string, SheetTemplate>;
  sheetsByCategory: { category: SheetCategory; sheets: SheetTemplate[] }[];
  handleSelectSheet: (id: string) => void;
  handleOpenSheet: (sheetId: string) => void;
  handleCloseSheet: (sheetId: string) => void;
  handleToggleFavoriteSheet: (sheetId: string) => void;
};

/**
 * ワークブックのシート一覧・タブ開閉・アクティブシート選択状態を管理し、
 * Presenter が描画に必要な ViewModel を集約・加工して提供するコンテナフック。
 */
export const useSheetLoader = (): UseSheetLoaderReturn => {
  const metadata = useWorkbookMetadataLoader();
  const {
    categories,
    sheetTemplates,
    initialOpenSheetIds,
    favoriteSheetIds: initialFavoriteSheetIds,
  } = metadata;

  const initialActiveSheetId = initialOpenSheetIds[0] ?? null;

  // 1. 初回レンダー時に初期オープンシート・初期アクティブシートを Jotai Atom に注入
  useHydrateAtoms([
    [openSheetIdsAtom, initialOpenSheetIds],
    [activeSheetIdAtom, initialActiveSheetId],
    [favoriteSheetIdsAtom, initialFavoriteSheetIds],
  ]);

  // 2. Jotai Atoms の購読と更新関数
  const [storedOpenSheetIds] = useAtom(openSheetIdsAtom);
  const [selectedSheetId, setSelectedSheetId] = useAtom(activeSheetIdAtom);
  const [storedFavoriteSheetIds] = useAtom(favoriteSheetIdsAtom);

  const setOpenSheet = useSetAtom(openSheetAtom);
  const setCloseSheet = useSetAtom(closeSheetAtom);
  const setToggleFavoriteSheet = useSetAtom(toggleFavoriteSheetAtom);

  // 3. 開いているシート一覧の UI 状態
  // storedOpenSheetIds !== null で空配列 [] を正しく保持（全シート閉じる動作の保証）
  const openSheetIds = useMemo(() => {
    return storedOpenSheetIds !== null
      ? storedOpenSheetIds
      : initialOpenSheetIds;
  }, [storedOpenSheetIds, initialOpenSheetIds]);

  // 4. アクティブシートの解決（null のまま放置せず、確実に先頭シートへ正規化）
  const activeSheetId = useMemo(() => {
    if (selectedSheetId && openSheetIds.includes(selectedSheetId)) {
      return selectedSheetId;
    }
    return openSheetIds[0] ?? null;
  }, [selectedSheetId, openSheetIds]);

  // activeSheetIdAtom が未同期の場合は同期
  useEffect(() => {
    if (activeSheetId !== selectedSheetId) {
      setSelectedSheetId(activeSheetId);
    }
  }, [activeSheetId, selectedSheetId, setSelectedSheetId]);

  // 5. お気に入りシート一覧の UI 状態
  const favoriteSheetIds = useMemo(() => {
    return storedFavoriteSheetIds ?? initialFavoriteSheetIds;
  }, [storedFavoriteSheetIds, initialFavoriteSheetIds]);

  // 6. Presenter 向け ViewModel の加工
  const openSheets = useMemo(() => {
    return openSheetIds
      .map((id) => sheetTemplates[id])
      .filter((t): t is SheetTemplate => Boolean(t));
  }, [openSheetIds, sheetTemplates]);

  const sheetsByCategory = useMemo(() => {
    return computeSheetsByCategory(categories, sheetTemplates);
  }, [categories, sheetTemplates]);

  const activeSheet = activeSheetId ? sheetTemplates[activeSheetId] : undefined;

  // 7. アクションハンドラ
  const handleSelectSheet = useCallback(
    (id: string) => {
      setSelectedSheetId(id);
    },
    [setSelectedSheetId],
  );

  const handleOpenSheet = useCallback(
    (sheetId: string) => {
      setOpenSheet({ sheetId, defaultOpenIds: openSheetIds });
      setSelectedSheetId(sheetId);
    },
    [setOpenSheet, setSelectedSheetId, openSheetIds],
  );

  const handleCloseSheet = useCallback(
    (sheetId: string) => {
      setCloseSheet({ sheetId, defaultOpenIds: openSheetIds });
    },
    [setCloseSheet, openSheetIds],
  );

  const handleToggleFavoriteSheet = useCallback(
    (sheetId: string) => {
      setToggleFavoriteSheet({
        sheetId,
        defaultFavorites: favoriteSheetIds,
      });
    },
    [setToggleFavoriteSheet, favoriteSheetIds],
  );

  return {
    activeSheet,
    activeSheetId,
    openSheets,
    openSheetIds,
    favoriteSheetIds,
    categories,
    sheetTemplates,
    sheetsByCategory,
    handleSelectSheet,
    handleOpenSheet,
    handleCloseSheet,
    handleToggleFavoriteSheet,
  };
};
