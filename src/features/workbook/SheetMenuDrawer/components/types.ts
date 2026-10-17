import type { SheetCategory, SheetTemplate } from "../../stores/types";

export type SheetMenuDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: SheetCategory[];
  sheetsByCategory: { category: SheetCategory; sheets: SheetTemplate[] }[];
  openSheetIds: string[];
  activeSheetId: string | null;
  onSelectSheet: (sheetId: string) => void;
};

export type SearchableSheet = SheetTemplate & {
  categoryName: string;
};

export type SheetMenuDrawerPresenterProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: SheetCategory[];
  sheetsByCategory: { category: SheetCategory; sheets: SheetTemplate[] }[];
  openSheetIds: string[];
  activeSheetId: string | null;
  searchQuery: string;
  onChangeSearchQuery: (query: string) => void;
  selectedGroup: { category: SheetCategory; sheets: SheetTemplate[] } | null;
  searchResults: SearchableSheet[];
  totalSheetsCount: number;
  onSelectSheet: (sheetId: string) => void;
  onSelectCategory: (categoryId: string) => void;
  onBackToMain: () => void;
};
