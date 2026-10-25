import { atom } from "jotai";
import { atomFamily } from "jotai-family";
import { workbookMetadataQuery } from "../services/workbookMetadata/workbookMetadata.query";
import type { ColumnId, ColumnValidationRule, SheetTemplate } from "./types";
import { activeSheetIdAtom } from "./ui";

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

  const metadata = get(workbookMetadataQuery.sync);
  const template = metadata.templates[activeSheetId];
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
