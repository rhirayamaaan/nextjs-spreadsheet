import { useSetAtom, useStore } from "jotai";
import { type RefObject, useCallback, useState } from "react";
import {
  type FirstValidationError,
  findFirstValidationError,
} from "./logics/business/findFirstValidationError";
import { saveSheetApi } from "./services/api";
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
  selectionAtom,
  sheetTemplatesAtom,
  visibleRowOrderAtom,
} from "./stores";
import type { ToastMessage } from "./Toast/Toast.presenter";

type CellLayout = { start: number; size: number } | undefined;

export type UseWorkbookSaveOptions = {
  parentRef: RefObject<HTMLDivElement | null>;
  getRowLayout: (index: number) => CellLayout;
  getColumnLayout: (index: number) => CellLayout;
  showToast: (message: ToastMessage) => void;
  // biome-ignore lint/suspicious/noExplicitAny: i18n のキー型との柔軟な互換性のため
  t: (key: any, params?: any) => string;
};

export type UseWorkbookSaveReturn = {
  handleSave: () => Promise<void>;
  isSaving: boolean;
};

export const useWorkbookSave = ({
  parentRef,
  getRowLayout,
  getColumnLayout,
  showToast,
  t,
}: UseWorkbookSaveOptions): UseWorkbookSaveReturn => {
  const store = useStore();
  const setSelection = useSetAtom(selectionAtom);
  const [isSaving, setIsSaving] = useState(false);

  const scrollToCell = useCallback(
    (rowIndex: number, colIndex: number) => {
      const container = parentRef.current;
      const rowLayout = getRowLayout(rowIndex);
      const colLayout = getColumnLayout(colIndex);

      const cellTop = rowLayout?.start ?? rowIndex * 35;
      const cellLeft = colLayout?.start ?? 0;
      const cellWidth = colLayout?.size ?? 100;

      const targetTop = Math.max(0, cellTop - 20);

      let targetLeft = container ? container.scrollLeft : 0;
      if (container) {
        const currentLeft = container.scrollLeft;
        const containerWidth = container.clientWidth;
        if (
          cellLeft < currentLeft ||
          cellLeft + cellWidth > currentLeft + containerWidth - 60
        ) {
          targetLeft = Math.max(0, cellLeft - 60);
        }
      }

      if (container) {
        container.scrollTo({
          top: targetTop,
          left: targetLeft,
          behavior: "smooth",
        });
      }

      setSelection({
        start: { row: rowIndex, col: colIndex },
        end: { row: rowIndex, col: colIndex },
      });
    },
    [parentRef, getRowLayout, getColumnLayout, setSelection],
  );

  const handleValidationError = useCallback(
    (error: FirstValidationError) => {
      scrollToCell(error.rowIndex, error.colIndex);
      showToast({
        type: "error",
        title: t("validationErrorTitle"),
        message: t("validationErrorMessage"),
        requiresConfirm: true,
      });
    },
    [scrollToCell, showToast, t],
  );

  const handleSaveSuccess = useCallback(() => {
    showToast({
      type: "success",
      title: t("saveSuccessTitle"),
      message: t("saveSuccessMessage"),
      duration: 3500,
    });
  }, [showToast, t]);

  const handleSaveError = useCallback(() => {
    showToast({
      type: "error",
      title: t("saveErrorTitle"),
      message: t("saveErrorMessage"),
      requiresConfirm: true,
    });
  }, [showToast, t]);

  const handleSave = useCallback(async () => {
    const activeSheetId = store.get(activeSheetIdAtom);
    if (!activeSheetId) return;

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

    // 1. バリデーションチェック
    const firstError = findFirstValidationError({
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
      handleValidationError(firstError);
      return;
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
      store.set(commitSheetEditsAtom);
      handleSaveSuccess();
    } catch (error) {
      console.error("[SaveSheet] Save failed:", error);
      handleSaveError();
    } finally {
      setIsSaving(false);
    }
  }, [store, handleValidationError, handleSaveSuccess, handleSaveError]);

  return {
    handleSave,
    isSaving,
  };
};
