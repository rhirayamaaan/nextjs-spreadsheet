import { useCallback, useMemo, useState } from "react";
import type {
  SearchableSheet,
  SheetMenuDrawerPresenterProps,
  SheetMenuDrawerProps,
} from "./types";

export const useSheetMenuDrawerContainer = ({
  open,
  onOpenChange,
  categories,
  sheetsByCategory,
  openSheetIds,
  activeSheetId,
  onSelectSheet,
}: SheetMenuDrawerProps): SheetMenuDrawerPresenterProps => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null,
  );

  // 全シート一覧（検索用）
  const allSheets = useMemo<SearchableSheet[]>(() => {
    return sheetsByCategory.flatMap((group) =>
      group.sheets.map((sheet) => ({
        ...sheet,
        categoryName: group.category.name,
      })),
    );
  }, [sheetsByCategory]);

  // 検索フィルタリング結果
  const searchResults = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return [];

    return allSheets.filter((sheet) => {
      const matchName = sheet.name.toLowerCase().includes(query);
      const matchDesc = sheet.description?.toLowerCase().includes(query);
      const matchCat = sheet.categoryName.toLowerCase().includes(query);
      return matchName || matchDesc || matchCat;
    });
  }, [allSheets, searchQuery]);

  // 選択中のカテゴリオブジェクトと所属シート
  const selectedGroup = useMemo(() => {
    if (!selectedCategoryId) return null;
    return (
      sheetsByCategory.find((g) => g.category.id === selectedCategoryId) ?? null
    );
  }, [sheetsByCategory, selectedCategoryId]);

  const handleSelectSheet = useCallback(
    (sheetId: string) => {
      onSelectSheet(sheetId);
      onOpenChange(false);
    },
    [onSelectSheet, onOpenChange],
  );

  const handleSelectCategory = useCallback((categoryId: string) => {
    setSelectedCategoryId(categoryId);
  }, []);

  const handleBackToMain = useCallback(() => {
    setSelectedCategoryId(null);
  }, []);

  const handleOpenChange = useCallback(
    (isOpen: boolean) => {
      onOpenChange(isOpen);
      if (!isOpen) {
        // ドロワーが閉じたときに内部状態を初期化
        setSearchQuery("");
        setSelectedCategoryId(null);
      }
    },
    [onOpenChange],
  );

  const totalSheetsCount = allSheets.length;

  return {
    open,
    onOpenChange: handleOpenChange,
    categories,
    sheetsByCategory,
    openSheetIds,
    activeSheetId,
    searchQuery,
    onChangeSearchQuery: setSearchQuery,
    selectedGroup,
    searchResults,
    totalSheetsCount,
    onSelectSheet: handleSelectSheet,
    onSelectCategory: handleSelectCategory,
    onBackToMain: handleBackToMain,
  };
};
