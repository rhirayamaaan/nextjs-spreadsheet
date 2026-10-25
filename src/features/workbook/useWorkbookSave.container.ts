import { useSetAtom, useStore } from "jotai";
import { useCallback, useState } from "react";
import { applyEditsToRecords } from "./logics/business/buildSheetData";
import {
  type FirstValidationError,
  findFirstValidationError,
} from "./logics/business/findFirstValidationError";
import { saveSheetRecordsApi } from "./services/sheetRecords/sheetRecords.api";
import { sheetRecordsQuery } from "./services/sheetRecords/sheetRecords.query";
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

export type UseWorkbookSaveOptions = {
  showToast: (message: ToastMessage) => void;
  // biome-ignore lint/suspicious/noExplicitAny: i18n のキー型との柔軟な互換性のため
  t: (key: any, params?: any) => string;
  onValidationError?: (error: FirstValidationError) => void;
};

export type UseWorkbookSaveReturn = {
  handleSave: () => Promise<void>;
  isSaving: boolean;
};

export const useWorkbookSave = ({
  showToast,
  t,
  onValidationError,
}: UseWorkbookSaveOptions): UseWorkbookSaveReturn => {
  const store = useStore();
  const setSelection = useSetAtom(selectionAtom);
  const [isSaving, setIsSaving] = useState(false);

  const handleValidationError = useCallback(
    (error: FirstValidationError) => {
      if (onValidationError) {
        onValidationError(error);
        return;
      }
      setSelection({
        start: { row: error.rowIndex, col: error.colIndex },
        end: { row: error.rowIndex, col: error.colIndex },
      });
      showToast({
        type: "error",
        title: t("validationErrorTitle"),
        message: t("validationErrorMessage"),
        requiresConfirm: true,
      });
    },
    [onValidationError, setSelection, showToast, t],
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

    setIsSaving(true);
    // UI のローディング表示を優先描画
    await new Promise((resolve) => setTimeout(resolve, 0));

    try {
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

      // 1. バリデーションチェック (O(1) 高速インデックス検証)
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
        setIsSaving(false);
        console.warn(
          `[Validation] Error at row ${firstError.rowIndex + 1}, col ${firstError.colIndex + 1}:`,
          firstError,
        );
        handleValidationError(firstError);
        return;
      }

      // 2. 保存API実行（Diff のみ送信）
      const res = await saveSheetRecordsApi(
        activeSheetId,
        sheetTemplate?.name ?? activeSheetId,
        {
          cellEdits,
          rowStatuses,
        },
      );

      if (!res.success) {
        throw new Error("Save operation reported failure");
      }

      // 1. キャッシュの生レコードに編集差分を直接反映（再フェッチ不要・画面サスペンド完全防止）
      store.set(sheetRecordsQuery(activeSheetId), (prevRecords) =>
        applyEditsToRecords(prevRecords, activeSheetId, cellEdits),
      );

      // 2. 編集差分をクリア
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
