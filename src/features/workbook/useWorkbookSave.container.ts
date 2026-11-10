import { useSetAtom, useStore } from "jotai";
import { useCallback, useState } from "react";
import { ApiError } from "@/lib/query";
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
  asyncValidationErrorsAtom,
  baseCellValuesAtom,
  type ColumnId,
  cellCustomStatusesAtom,
  cellEditsAtom,
  columnNamesAtom,
  columnOrderAtom,
  commitSheetEditsAtom,
  customValidatorRegistryAtom,
  type RowId,
  referencedSheetsDataAtom,
  rowStatusesAtom,
  selectionAtom,
  sheetTemplatesAtom,
  validatingCellsAtom,
  visibleRowOrderAtom,
} from "./stores";
import type { ToastMessage } from "./Toast/Toast.presenter";

export type UseWorkbookSaveOptions = {
  showToast: (message: ToastMessage) => void;
  // biome-ignore lint/suspicious/noExplicitAny: i18n のキー型との柔軟な互換性のため
  t?: (key: any, params?: any) => string;
  onValidationError?: (error: FirstValidationError) => void;
};

export type UseWorkbookSaveReturn = {
  handleSave: () => Promise<void>;
  isSaving: boolean;
};

export const useWorkbookSave = ({
  showToast,
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
        titleKey: "validationErrorTitle",
        message: error.message,
        messageKey: error.message ? undefined : "validationErrorMessage",
        requiresConfirm: true,
      });
    },
    [onValidationError, setSelection, showToast],
  );

  const handleSaveSuccess = useCallback(() => {
    showToast({
      type: "success",
      titleKey: "saveSuccessTitle",
      messageKey: "saveSuccessMessage",
      duration: 3500,
    });
  }, [showToast]);

  const handleSaveError = useCallback(() => {
    showToast({
      type: "error",
      titleKey: "saveErrorTitle",
      messageKey: "saveErrorMessage",
      requiresConfirm: true,
    });
  }, [showToast]);

  const handleSave = useCallback(async () => {
    const activeSheetId = store.get(activeSheetIdAtom);
    if (!activeSheetId) return;

    const validatingCells = store.get(validatingCellsAtom);
    if (validatingCells.size > 0) {
      showToast({
        type: "error",
        titleKey: "validationErrorTitle",
        message: "現在セルの検証中です。検証が完了してから保存してください。",
        requiresConfirm: true,
      });
      return;
    }

    setIsSaving(true);
    // UI のローディング表示を優先描画
    await new Promise((resolve) => setTimeout(resolve, 0));

    const visibleRows = store.get(visibleRowOrderAtom);
    const columns = store.get(columnOrderAtom);

    const applyServerErrors = (
      errors: Array<{ rowId: string; colId: string; message: string }>,
    ) => {
      const nextCustomStatuses = { ...store.get(cellCustomStatusesAtom) };
      for (const err of errors) {
        const key = `${err.rowId}-${err.colId}`;
        nextCustomStatuses[key] = {
          status: "error",
          message: err.message,
        };
      }
      store.set(cellCustomStatusesAtom, nextCustomStatuses);

      const firstServerErr = errors[0];
      const serverRowId = firstServerErr.rowId as RowId;
      const serverColId = firstServerErr.colId as ColumnId;
      const rowIndex = visibleRows.indexOf(serverRowId);
      const colIndex = columns.indexOf(serverColId);

      if (rowIndex !== -1 && colIndex !== -1) {
        handleValidationError({
          rowIndex,
          colIndex,
          rowId: serverRowId,
          colId: serverColId,
          message: firstServerErr.message,
        });
      } else {
        showToast({
          type: "error",
          titleKey: "validationErrorTitle",
          messageKey: "validationErrorMessage",
        });
      }
    };

    try {
      const columnConfigs = store.get(activeColumnConfigsAtom);
      const columnValidations = store.get(activeColumnValidationsAtom);
      const columnNames = store.get(columnNamesAtom);
      const referencedSheets = store.get(referencedSheetsDataAtom);
      const cellEdits = store.get(cellEditsAtom);
      const baseValues = store.get(baseCellValuesAtom);
      const rowStatuses = store.get(rowStatusesAtom);
      const customStatuses = {
        ...store.get(cellCustomStatusesAtom),
        ...store.get(asyncValidationErrorsAtom),
      };
      const templates = store.get(sheetTemplatesAtom);
      const sheetTemplate = templates[activeSheetId];

      // 1. バリデーションチェック (O(1) 高速インデックス検証)
      const customValidators = store.get(customValidatorRegistryAtom);
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
        sheetId: activeSheetId,
        customValidators,
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

      // サーバー側一括検証エラーのハンドリング (200 レスポンスでエラーが返る場合)
      if (!res.success && res.errors && res.errors.length > 0) {
        applyServerErrors(res.errors);
        return;
      }

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
      if (
        error instanceof ApiError &&
        error.data &&
        typeof error.data === "object" &&
        "errors" in error.data &&
        Array.isArray((error.data as { errors?: unknown[] }).errors)
      ) {
        const errors = (
          error.data as {
            errors: Array<{ rowId: string; colId: string; message: string }>;
          }
        ).errors;
        applyServerErrors(errors);
        return;
      }
      console.error("[SaveSheet] Save failed:", error);
      handleSaveError();
    } finally {
      setIsSaving(false);
    }
  }, [
    store,
    handleValidationError,
    handleSaveSuccess,
    handleSaveError,
    showToast,
  ]);

  return {
    handleSave,
    isSaving,
  };
};
