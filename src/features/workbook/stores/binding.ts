import { atom, type Getter } from "jotai";
import { atomFamily } from "jotai-family";
import { localeAtom } from "@/i18n/context";
import { getSheetDependencyIds } from "../logics/business/buildSheetData";
import { sheetRecordsQuery } from "../services/sheetRecords/sheetRecords.query";
import { buildSheetData } from "./base";
import { cellEditsAtom } from "./edit";
import { sheetTemplatesAtom } from "./templates";
import type {
  CellAddress,
  ColumnConfig,
  ColumnId,
  LookupBinding,
  SheetData,
  SheetTemplate,
} from "./types";
import { activeSheetIdAtom } from "./ui";

// ユーザーが動的に設定・カスタマイズした列設定（Record<sheetId, Record<ColumnId, ColumnConfig>>）
export const columnConfigsAtom = atom<
  Record<string, Record<ColumnId, ColumnConfig>>
>({});

// 参照先マスタシートのオンデマンド解決アトム（Jotai 非同期 Atom から導出・アクティブシートの依存先のみフェッチ）
export const referencedSheetsDataAtom = atom<Record<string, SheetData>>(
  (get) => {
    const activeSheetId = get(activeSheetIdAtom);
    const templates = get(sheetTemplatesAtom);
    const result: Record<string, SheetData> = {};

    if (!activeSheetId) return result;

    const dependencyIds = getSheetDependencyIds(activeSheetId, templates);

    const locale = get(localeAtom);
    for (const sheetId of dependencyIds) {
      const template = templates[sheetId];
      if (!template) continue;
      const records = get(sheetRecordsQuery.sync(sheetId));
      result[sheetId] = buildSheetData(sheetId, template, records, locale);
    }

    return result;
  },
);

const EMPTY_CONFIGS: Record<ColumnId, ColumnConfig> = {};

/**
 * テンプレート定義から静的な列設定マップを生成するヘルパー関数
 */
export const buildConfigsFromTemplate = (
  template: SheetTemplate,
): Record<ColumnId, ColumnConfig> => {
  const configs: Record<ColumnId, ColumnConfig> = {};

  for (const colDef of template.columns) {
    const colId = colDef.field as ColumnId;
    if (colDef.type.type === "datetime") {
      configs[colId] = {
        type: "datetime",
        format: colDef.type.format,
        readOnly: colDef.readOnly,
      };
    } else if (colDef.type.type === "pulldown") {
      const { sourceTemplateId, sourceKeyField, lookupFields, mode, relation } =
        colDef.type;
      configs[colId] = {
        type: "pulldown",
        readOnly: colDef.readOnly,
        pulldown: {
          sourceSheetId: sourceTemplateId,
          sourceKeyColId: sourceKeyField as ColumnId,
          lookupColumns: lookupFields.map((lf) => ({
            lookupColId: lf.field as ColumnId,
            sourceColId: lf.sourceField as ColumnId,
            sourceColName: lf.headerName,
          })),
          mode,
          relation: relation
            ? {
                parentColId: relation.parentField as ColumnId,
                targetSheetId: relation.targetSheetId ?? sourceTemplateId,
                sourceFilterColId: relation.sourceFilterField as ColumnId,
              }
            : undefined,
        },
      };
    } else if (colDef.type.type === "lookup") {
      configs[colId] = {
        type: "lookup",
        readOnly: true,
        lookup: {
          parentColId: colDef.type.parentField as ColumnId,
          sourceSheetId: colDef.type.sourceTemplateId,
          sourceColId: colDef.type.sourceField as ColumnId,
        },
      };
    } else if (colDef.readOnly) {
      configs[colId] = { type: "default", readOnly: true };
    }
  }

  return configs;
};

// Column configs for the active sheet（静的設定とユーザーオーバーライドの合成）
export const activeColumnConfigsAtom = atom<Record<ColumnId, ColumnConfig>>(
  (get) => {
    const activeSheetId = get(activeSheetIdAtom);
    if (!activeSheetId) return EMPTY_CONFIGS;

    const templates = get(sheetTemplatesAtom);
    const template = templates[activeSheetId];
    const baseConfigs = template
      ? buildConfigsFromTemplate(template)
      : EMPTY_CONFIGS;
    const userConfigs = get(columnConfigsAtom)[activeSheetId] ?? EMPTY_CONFIGS;

    return { ...baseConfigs, ...userConfigs };
  },
);

// Selector family to get column config for a specific column in active sheet
export const activeColumnConfigFamily = atomFamily((colId: ColumnId) =>
  atom((get) => {
    const configs = get(activeColumnConfigsAtom);
    return configs[colId] ?? { type: "default" };
  }),
);

// Dynamic lookup value selector
export const getLookupValue = (
  get: Getter,
  address: CellAddress,
  lookup: LookupBinding,
  baseCellValues: Record<string, string>,
): string => {
  const { parentColId, sourceSheetId, sourceColId } = lookup;
  const parentKey = `${address.rowId}-${parentColId}`;
  const cellEdits = get(cellEditsAtom);
  const parentValue =
    parentKey in cellEdits
      ? cellEdits[parentKey]
      : (baseCellValues[parentKey] ?? "");

  if (!parentValue) return "";

  const masterSheet = get(referencedSheetsDataAtom)[sourceSheetId];
  if (!masterSheet) return "";

  const configs = get(activeColumnConfigsAtom);
  const parentConfig = configs[parentColId];
  if (!parentConfig || parentConfig.type !== "pulldown") return "";

  const sourceKeyColId = parentConfig.pulldown.sourceKeyColId;

  const relation = parentConfig.pulldown.relation;
  const grandParentValue = relation
    ? (cellEdits[`${address.rowId}-${relation.parentColId}`] ??
      baseCellValues[`${address.rowId}-${relation.parentColId}`] ??
      "")
    : undefined;

  // 親キー（事業所等）が未入力・存在しない場合は参照しない
  if (relation && !grandParentValue) return "";

  // Find the row in masterSheet matching parentValue and relation
  for (const rowId of masterSheet.rows) {
    const key = `${rowId}-${sourceKeyColId}`;
    const rowKeyVal =
      key in cellEdits ? cellEdits[key] : masterSheet.values[key];
    if (rowKeyVal !== parentValue) continue;

    if (relation) {
      const filterKey = `${rowId}-${relation.sourceFilterColId}`;
      const filterVal =
        filterKey in cellEdits
          ? cellEdits[filterKey]
          : masterSheet.values[filterKey];
      if (filterVal !== grandParentValue) continue;
    }

    const targetKey = `${rowId}-${sourceColId}`;
    return (
      (targetKey in cellEdits
        ? cellEdits[targetKey]
        : masterSheet.values[targetKey]) ?? ""
    );
  }

  return "";
};
