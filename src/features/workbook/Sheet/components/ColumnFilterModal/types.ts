import type { ColumnId } from "../../../stores";

export type FilterOption = {
  value: string;
  label: string;
  detail?: string;
};

export type ColumnFilterModalPresenterProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  columnName: string;
  options: FilterOption[];
  selectedValues: string[];
  searchQuery: string;
  onChangeSearchQuery: (query: string) => void;
  onToggleValue: (value: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onApply: () => void;
  onClearFilter: () => void;
  onCancel: () => void;
  isFilterActive: boolean;
};

export type ColumnFilterModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetColId: ColumnId;
};
