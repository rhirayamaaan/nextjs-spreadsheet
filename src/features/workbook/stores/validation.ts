import { atom } from "jotai";
import { atomFamily } from "jotai-family";
import {
  type CustomValidatorRegistry,
  defaultValidatorRegistry,
  mergeCustomValidatorRegistries,
} from "../validators";
import { sheetTemplatesAtom } from "./templates";
import type {
  CellStatusInfo,
  ColumnId,
  ColumnValidationRule,
  SheetTemplate,
} from "./types";
import { activeSheetIdAtom } from "./ui";

/**
 * 現在サーバー通信（非同期バリデーション）実行中のセルキー集合
 * キー形式: `${rowId}-${colId}`
 */
export const validatingCellsAtom = atom<Set<string>>(new Set<string>());

/**
 * 非同期バリデーションによって返されたエラーマップ
 * キー形式: `${rowId}-${colId}`
 */
export const asyncValidationErrorsAtom = atom<Record<string, CellStatusInfo>>(
  {},
);

/**
 * セルキーごとの AbortController マネージャー（古い通信の中断用）
 */
export const asyncValidationControllers = new Map<string, AbortController>();

/**
 * 外部から注入されたカスタムバリデータレジストリ（未設定時は undefined）
 */
export const injectedCustomValidatorsAtom = atom<
  CustomValidatorRegistry | undefined
>(undefined);

/**
 * 登録されているカスタムバリデータレジストリ（デフォルト + 外部注入の合成派生アトム）
 */
export const customValidatorRegistryAtom = atom<
  CustomValidatorRegistry,
  [CustomValidatorRegistry | undefined],
  void
>(
  (get) =>
    mergeCustomValidatorRegistries(
      defaultValidatorRegistry,
      get(injectedCustomValidatorsAtom),
    ),
  (_get, set, update) => {
    set(injectedCustomValidatorsAtom, update);
  },
);

// Record<sheetId, Record<ColumnId, ColumnValidationRule[]>>
export const columnValidationsAtom = atom<
  Record<string, Record<ColumnId, ColumnValidationRule[]>>
>({});

const EMPTY_VALIDATIONS: Record<ColumnId, ColumnValidationRule[]> = {};

/**
 * テンプレート定義からデフォルトの列バリデーションマップを生成する純粋関数
 */
export const buildBaseValidationsFromTemplate = (
  template: SheetTemplate,
): Record<ColumnId, ColumnValidationRule[]> => {
  const validations: Record<ColumnId, ColumnValidationRule[]> = {};
  for (const col of template.columns) {
    if (col.validations && col.validations.length > 0) {
      validations[col.field as ColumnId] = col.validations;
    }
  }
  return validations;
};

// アクティブシートの列バリデーション定義（テンプレート定義 + ユーザーオーバーライドの合成）
export const activeColumnValidationsAtom = atom<
  Record<ColumnId, ColumnValidationRule[]>
>((get) => {
  const activeSheetId = get(activeSheetIdAtom);
  if (!activeSheetId) return EMPTY_VALIDATIONS;

  const templates = get(sheetTemplatesAtom);
  const template = templates[activeSheetId];
  const baseValidations = template
    ? buildBaseValidationsFromTemplate(template)
    : EMPTY_VALIDATIONS;

  const userValidations = get(columnValidationsAtom)[activeSheetId] ?? {};
  return { ...baseValidations, ...userValidations };
});

// 列ごとのバリデーションルール取得 Family
export const activeColumnValidationFamily = atomFamily((colId: ColumnId) =>
  atom((get) => {
    const validations = get(activeColumnValidationsAtom);
    return validations[colId] ?? [];
  }),
);
