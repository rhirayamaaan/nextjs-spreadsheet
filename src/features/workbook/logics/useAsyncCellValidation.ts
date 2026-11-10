import { atom, type Getter, type Setter, useSetAtom } from "jotai";
import { baseCellValuesAtom } from "../stores/base";
import { cellCustomStatusesAtom, cellEditsAtom } from "../stores/edit";
import type { ColumnId, RowId } from "../stores/types";
import { activeSheetIdAtom } from "../stores/ui";
import {
  activeColumnValidationsAtom,
  asyncValidationControllers,
  asyncValidationErrorsAtom,
  customValidatorRegistryAtom,
  validatingCellsAtom,
} from "../stores/validation";
import {
  type CustomValidationContext,
  type CustomValidationResult,
  type CustomValidator,
  resolveCustomValidator,
} from "../validators";

// --- 状態操作ヘルパー ---

const clearCustomStatus = (get: Getter, set: Setter, key: string) => {
  const current = get(cellCustomStatusesAtom);
  if (!(key in current)) return;
  const next = { ...current };
  delete next[key];
  set(cellCustomStatusesAtom, next);
};

const clearAsyncError = (get: Getter, set: Setter, key: string) => {
  const current = get(asyncValidationErrorsAtom);
  if (!(key in current)) return;
  const next = { ...current };
  delete next[key];
  set(asyncValidationErrorsAtom, next);
};

const setAsyncError = (
  get: Getter,
  set: Setter,
  key: string,
  result: CustomValidationResult,
) => {
  set(asyncValidationErrorsAtom, {
    ...get(asyncValidationErrorsAtom),
    [key]: {
      status: "error",
      message: result.message,
      errorInfo: result.errorInfo ?? { key: "invalid" },
    },
  });
};

// --- コントローラー＆ローディング管理 ---

const renewAbortController = (cellKey: string): AbortController => {
  const prev = asyncValidationControllers.get(cellKey);
  if (prev) {
    prev.abort();
  }
  const controller = new AbortController();
  asyncValidationControllers.set(cellKey, controller);
  return controller;
};

const cleanupController = (
  cellKey: string,
  controller: AbortController,
  set: Setter,
) => {
  if (asyncValidationControllers.get(cellKey) !== controller) return;

  asyncValidationControllers.delete(cellKey);
  set(validatingCellsAtom, (prev) => {
    const next = new Set(prev);
    next.delete(cellKey);
    return next;
  });
};

/**
 * 単一ルールの実行（例外・中断・ローディング解除を内部にカプセル化）
 */
const executeValidator = async ({
  validator,
  context,
  controller,
  onStartAsync,
  onFinish,
}: {
  validator: CustomValidator;
  context: CustomValidationContext;
  controller: AbortController;
  onStartAsync: () => void;
  onFinish: () => void;
}): Promise<CustomValidationResult | null> => {
  try {
    const result = validator(context);

    if (!(result instanceof Promise)) {
      return result;
    }

    onStartAsync();
    const asyncRes = await result;
    return controller.signal.aborted ? null : asyncRes;
  } catch (err: unknown) {
    if (err instanceof Error && err.name === "AbortError") {
      return null;
    }
    console.error(
      `[Validation Error] for cell ${context.rowId}-${context.colId}:`,
      err,
    );
    return null;
  } finally {
    onFinish();
  }
};

// --- アクション Atom ---

export type ValidateCellAsyncPayload = {
  rowId: RowId;
  colId: ColumnId;
  newValue: string;
};

export const validateCellAsyncAtom = atom(
  null,
  async (get, set, { rowId, colId, newValue }: ValidateCellAsyncPayload) => {
    const sheetId = get(activeSheetIdAtom);
    if (!sheetId) return;

    const cellKey = `${rowId}-${colId}`;

    // 1. セル編集時に既存の保存時サーバーエラーを解除
    clearCustomStatus(get, set, cellKey);

    const validations = get(activeColumnValidationsAtom)[colId] ?? [];
    const customRules = validations.filter((r) => r.type === "custom");

    // カスタムルールがない場合は非同期エラーを解除して終了
    if (customRules.length === 0) {
      clearAsyncError(get, set, cellKey);
      return;
    }

    // 2. 行コンテキスト準備
    const registry = get(customValidatorRegistryAtom);
    const cellEdits = get(cellEditsAtom);
    const baseValues = get(baseCellValuesAtom);

    const getRowValue = (targetColId: ColumnId | string) => {
      const key = `${rowId}-${targetColId}`;
      return targetColId === colId
        ? newValue
        : (cellEdits[key] ?? baseValues[key] ?? "");
    };

    // 3. ルールを順次実行（短絡評価）
    for (const rule of customRules) {
      const validator = resolveCustomValidator(rule.name, sheetId, registry);
      if (!validator) continue;

      const controller = renewAbortController(cellKey);

      const result = await executeValidator({
        validator,
        context: {
          value: newValue,
          colId,
          rowId,
          sheetId,
          getRowValue,
          signal: controller.signal,
          options: rule.options,
        },
        controller,
        onStartAsync: () => {
          set(validatingCellsAtom, (prev) => new Set(prev).add(cellKey));
        },
        onFinish: () => {
          cleanupController(cellKey, controller, set);
        },
      });

      // Abort された場合は後続処理を中断
      if (result === null) return;

      // エラー発生時は記録して評価を終了
      if (!result.valid) {
        setAsyncError(get, set, cellKey, result);
        return;
      }
    }

    // 4. すべてのルールを通過した場合は非同期エラーを解除
    clearAsyncError(get, set, cellKey);
  },
);

/**
 * セル確定時に非同期カスタムバリデータをトリガーするカスタムフック
 */
export const useAsyncCellValidation = () => {
  const validateCellAsync = useSetAtom(validateCellAsyncAtom);
  return { validateCellAsync };
};
