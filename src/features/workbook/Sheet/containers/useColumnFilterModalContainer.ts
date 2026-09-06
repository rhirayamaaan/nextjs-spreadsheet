import { useAtomValue, useSetAtom } from "jotai";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getOrInitSheetData } from "../../containers/useSheetLoader";
import {
  activeColumnConfigFamily,
  activeColumnFilterFamily,
  cellEditsAtom,
  clearColumnFilterAtom,
  columnNamesAtom,
  columnUniqueValuesFamily,
  referencedSheetsDataAtom,
  setColumnFilterAtom,
} from "../../stores";
import type {
  ColumnFilterModalPresenterProps,
  ColumnFilterModalProps,
  FilterOption,
} from "../components/ColumnFilterModal/types";

export const useColumnFilterModalContainer = ({
  open,
  onOpenChange,
  targetColId,
}: ColumnFilterModalProps): ColumnFilterModalPresenterProps => {
  const columnNames = useAtomValue(columnNamesAtom);
  const columnName = columnNames[targetColId] ?? "";

  const uniqueValues = useAtomValue(
    useMemo(() => columnUniqueValuesFamily(targetColId), [targetColId]),
  );

  const existingFilter = useAtomValue(
    useMemo(() => activeColumnFilterFamily(targetColId), [targetColId]),
  );

  const config = useAtomValue(
    useMemo(() => activeColumnConfigFamily(targetColId), [targetColId]),
  );
  const referencedSheets = useAtomValue(referencedSheetsDataAtom);
  const cellEdits = useAtomValue(cellEditsAtom);

  const isFilterActive = existingFilter !== undefined;

  const options: FilterOption[] = useMemo(() => {
    if (config?.type === "pulldown") {
      const { sourceSheetId, sourceKeyColId, lookupColumns } = config.pulldown;
      const masterSheet =
        referencedSheets[sourceSheetId] ?? getOrInitSheetData(sourceSheetId);
      const labelMap = new Map<string, string>();

      if (masterSheet) {
        for (const rId of masterSheet.rows) {
          const key = `${rId}-${sourceKeyColId}`;
          const keyVal =
            key in cellEdits ? cellEdits[key] : (masterSheet.values[key] ?? "");
          const labels = lookupColumns
            .map((l) => {
              const lKey = `${rId}-${l.sourceColId}`;
              return lKey in cellEdits
                ? cellEdits[lKey]
                : (masterSheet.values[lKey] ?? "");
            })
            .filter(Boolean)
            .join(" - ");

          if (keyVal && labels) {
            labelMap.set(keyVal, labels);
          }
        }
      }

      return uniqueValues.map((val) => {
        const lookup = labelMap.get(val);
        return {
          value: val,
          label: val === "" ? "(空白)" : lookup ? `${val} (${lookup})` : val,
          detail: lookup,
        };
      });
    }

    return uniqueValues.map((val) => ({
      value: val,
      label: val === "" ? "(空白)" : val,
    }));
  }, [config, referencedSheets, cellEdits, uniqueValues]);

  // Local selection state inside the modal
  const [selectedValues, setSelectedValues] = useState<string[]>(() => {
    if (existingFilter) {
      return existingFilter.selectedValues;
    }
    return uniqueValues;
  });

  const [searchQuery, setSearchQuery] = useState<string>("");

  // Reset local state when modal opens or uniqueValues changes
  useEffect(() => {
    if (open) {
      if (existingFilter) {
        setSelectedValues(existingFilter.selectedValues);
      } else {
        setSelectedValues(uniqueValues);
      }
      setSearchQuery("");
    }
  }, [open, existingFilter, uniqueValues]);

  const setColumnFilter = useSetAtom(setColumnFilterAtom);
  const clearColumnFilter = useSetAtom(clearColumnFilterAtom);

  const handleToggleValue = useCallback((value: string) => {
    setSelectedValues((prev) => {
      if (prev.includes(value)) {
        return prev.filter((v) => v !== value);
      }
      return [...prev, value];
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    setSelectedValues(uniqueValues);
  }, [uniqueValues]);

  const handleDeselectAll = useCallback(() => {
    setSelectedValues([]);
  }, []);

  const handleApply = useCallback(() => {
    // If all unique values are selected, it is equivalent to no filter
    if (selectedValues.length === uniqueValues.length) {
      clearColumnFilter(targetColId);
    } else {
      setColumnFilter({
        colId: targetColId,
        selectedValues,
      });
    }
    onOpenChange(false);
  }, [
    selectedValues,
    uniqueValues,
    clearColumnFilter,
    setColumnFilter,
    targetColId,
    onOpenChange,
  ]);

  const handleClearFilter = useCallback(() => {
    clearColumnFilter(targetColId);
    onOpenChange(false);
  }, [clearColumnFilter, targetColId, onOpenChange]);

  const handleCancel = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  return {
    open,
    onOpenChange,
    columnName,
    options,
    selectedValues,
    searchQuery,
    onChangeSearchQuery: setSearchQuery,
    onToggleValue: handleToggleValue,
    onSelectAll: handleSelectAll,
    onDeselectAll: handleDeselectAll,
    onApply: handleApply,
    onClearFilter: handleClearFilter,
    onCancel: handleCancel,
    isFilterActive,
  };
};
