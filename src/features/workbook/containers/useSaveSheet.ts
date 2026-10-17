import { useStore } from "jotai";
import { useCallback, useState } from "react";
import { saveSheetApi } from "../services/api";
import {
  activeColumnConfigsAtom,
  activeColumnValidationsAtom,
  activeSheetIdAtom,
  baseCellValuesAtom,
  cellCustomStatusesAtom,
  cellEditsAtom,
  columnNamesAtom,
  columnOrderAtom,
  commitSheetEditsAtom,
  referencedSheetsDataAtom,
  rowStatusesAtom,
  sheetTemplatesAtom,
  visibleRowOrderAtom,
} from "../stores";
import {
  type FirstValidationError,
  findFirstValidationError,
} from "./findFirstValidationError";

export type UseSaveSheetOptions = {
  onValidationError?: (error: FirstValidationError) => void;
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
};

export const useSaveSheet = ({
  onValidationError,
  onSuccess,
  onError,
}: UseSaveSheetOptions = {}) => {
  const store = useStore();
  const [isSaving, setIsSaving] = useState(false);

  const saveCurrentSheet = useCallback(async (): Promise<boolean> => {
    const activeSheetId = store.get(activeSheetIdAtom);
    if (!activeSheetId) return false;

    const visibleRows = store.get(visibleRowOrderAtom);
    const columns = store.get(columnOrderAtom);
    const columnConfigs = store.get(activeColumnConfigsAtom);
    const columnValidations = store.get(activeColumnValidationsAtom);
    const columnNames = store.get(columnNamesAtom);
    const referencedSheets = store.get(referencedSheetsDataAtom);
    const cellEdits = store.get(cellEditsAtom);
    const baseValues = store.get(baseCellValuesAtom);
    const rowStatuses = store.get(rowStatusesAtom);
    const customStatuses = store.get(cellCustomStatusesAtom);
    const templates = store.get(sheetTemplatesAtom);
    const sheetTemplate = templates[activeSheetId];

    // 1. バリデーションチェック (上から順に走査)
    const firstError: FirstValidationError | null = findFirstValidationError({
      visibleRows,
      columns,
      columnConfigs,
      columnValidations,
      referencedSheets,
      cellEdits,
      baseValues,
      rowStatuses,
      customStatuses,
      columnNames,
    });

    if (firstError) {
      console.warn(
        `[Validation] Error at row ${firstError.rowIndex + 1}, col ${firstError.colIndex + 1}:`,
        firstError,
      );
      onValidationError?.(firstError);
      return false;
    }

    // 2. 保存API実行
    setIsSaving(true);
    try {
      const payload = {
        sheetId: activeSheetId,
        sheetName: sheetTemplate?.name ?? activeSheetId,
        updatedAt: new Date().toISOString(),
        diff: {
          cellEdits,
          rowStatuses,
        },
        snapshot: {
          rows: visibleRows,
          columns,
          values: { ...baseValues, ...cellEdits },
        },
      };

      await saveSheetApi(payload);

      // 案A: 保存成功時にステートを確定・コミット
      store.set(commitSheetEditsAtom);

      onSuccess?.();
      return true;
    } catch (error) {
      console.error("[SaveSheet] Save failed:", error);
      onError?.(error);
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [store, onValidationError, onSuccess, onError]);

  return { saveCurrentSheet, isSaving };
};
