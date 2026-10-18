import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useCallback, useEffect } from "react";
import { fetchMockSheetRecords } from "./mock";
import {
  activeSheetIdAtom,
  baseCellValuesAtom,
  baseColumnNamesAtom,
  baseColumnOrderAtom,
  baseRowOrderAtom,
  type ColumnConfig,
  type ColumnId,
  type ColumnRelation,
  type ColumnValidationRule,
  closeSheetAtom,
  columnConfigsAtom,
  columnTotalsAtom,
  columnValidationsAtom,
  createColumnId,
  createRowId,
  favoriteSheetIdsAtom,
  openSheetAtom,
  openSheetIdsAtom,
  openSheetsAtom,
  type PulldownBinding,
  referencedSheetsDataAtom,
  type SheetData,
  type SheetTemplate,
  sheetDataMapAtom,
  sheetFieldToColIdMapAtom,
  sheetsByCategoryAtom,
  sheetTemplatesAtom,
  toggleFavoriteSheetAtom,
} from "./stores";

/**
 * 列定義のリレーション設定から参照先 ColumnId などを解決する純粋ヘルパー関数
 */
const resolveColumnRelation = (
  relation: ColumnRelation | undefined,
  defaultTargetSheetId: string,
  fieldToColId: Record<string, ColumnId>,
  getFieldToColMap: (
    templateId: string,
  ) => Record<string, ColumnId> | undefined,
): PulldownBinding["relation"] => {
  if (!relation) return undefined;

  const targetSheetId = relation.targetSheetId ?? defaultTargetSheetId;
  const parentColId = fieldToColId[relation.parentField];
  const targetColMap = getFieldToColMap(targetSheetId) ?? {};
  const sourceFilterColId = targetColMap[relation.sourceFilterField];

  if (!parentColId || !sourceFilterColId) return undefined;

  return {
    parentColId,
    targetSheetId,
    sourceFilterColId,
  };
};

/**
 * 雛形（Template）と生データ（Raw Records）からスプレッドシート用データを生成する純粋ヘルパー関数
 */
export const buildSheetData = (
  sheetId: string,
  template: SheetTemplate,
  getFieldToColMap: (
    templateId: string,
  ) => Record<string, ColumnId> | undefined,
): {
  data: SheetData;
  fieldToColId: Record<string, ColumnId>;
  configs: Record<ColumnId, ColumnConfig>;
  totals: Record<ColumnId, boolean>;
  validations: Record<ColumnId, ColumnValidationRule[]>;
} | null => {
  const columns = template.columns;
  const rawRecords = fetchMockSheetRecords(
    sheetId,
    template.defaultRowCount ?? 100,
  );

  const rows = Array.from({ length: rawRecords.length }, () => createRowId());
  const cols = Array.from({ length: columns.length }, () => createColumnId());
  const colNames: Record<ColumnId, string> = {};
  const fieldToColId: Record<string, ColumnId> = {};
  const configs: Record<ColumnId, ColumnConfig> = {};
  const totals: Record<ColumnId, boolean> = {};
  const validations: Record<ColumnId, ColumnValidationRule[]> = {};
  const initialValues: Record<string, string> = {};

  // 1. 列情報の初期化
  for (let c = 0; c < columns.length; c++) {
    const colDef = columns[c];
    const colId = cols[c];
    if (!colDef || !colId) continue;

    colNames[colId] = colDef.headerName;
    fieldToColId[colDef.field] = colId;

    if (colDef.validations && colDef.validations.length > 0) {
      validations[colId] = colDef.validations;
    }

    if (colDef.hasTotal) {
      totals[colId] = true;
    }
    if (colDef.readOnly && colDef.type.type !== "lookup") {
      configs[colId] = { type: "default", readOnly: true };
    }
  }

  // 2. セル値のマッピング
  for (let r = 0; r < rows.length; r++) {
    const record = rawRecords[r] ?? {};
    const rowId = rows[r];
    if (!rowId) continue;

    for (let c = 0; c < columns.length; c++) {
      const colDef = columns[c];
      const colId = cols[c];
      if (!colDef || !colId) continue;

      initialValues[`${rowId}-${colId}`] = record[colDef.field] ?? "";
    }
  }

  // 3. プルダウンおよび参照列（Lookup）の自動バインド解決
  for (const colDef of columns) {
    const colId = fieldToColId[colDef.field];
    if (!colId) continue;

    if (colDef.type.type === "datetime") {
      configs[colId] = {
        type: "datetime",
        format: colDef.type.format,
        readOnly: colDef.readOnly,
      };
    } else if (colDef.type.type === "pulldown") {
      const { sourceTemplateId, sourceKeyField, lookupFields, mode, relation } =
        colDef.type;
      const sourceColMap = getFieldToColMap(sourceTemplateId) ?? {};
      const sourceKeyColId = sourceColMap[sourceKeyField];

      const resolvedRelation = resolveColumnRelation(
        relation,
        sourceTemplateId,
        fieldToColId,
        getFieldToColMap,
      );

      if (sourceKeyColId) {
        const resolvedLookups = lookupFields
          .map((lf) => ({
            lookupColId: fieldToColId[lf.field],
            sourceColId: sourceColMap[lf.sourceField],
            sourceColName: lf.headerName,
          }))
          .filter(
            (
              l,
            ): l is {
              lookupColId: ColumnId;
              sourceColId: ColumnId;
              sourceColName: string;
            } => Boolean(l.lookupColId && l.sourceColId),
          );

        configs[colId] = {
          type: "pulldown",
          readOnly: colDef.readOnly,
          pulldown: {
            sourceSheetId: sourceTemplateId,
            sourceKeyColId,
            lookupColumns: resolvedLookups,
            mode,
            relation: resolvedRelation,
          },
        };
      }
    } else if (colDef.type.type === "lookup") {
      const { parentField, sourceTemplateId, sourceField } = colDef.type;
      const sourceColMap = getFieldToColMap(sourceTemplateId) ?? {};
      const parentColId = fieldToColId[parentField];
      const sourceColId = sourceColMap[sourceField];

      if (parentColId && sourceColId) {
        configs[colId] = {
          type: "lookup",
          readOnly: true,
          lookup: {
            parentColId,
            sourceSheetId: sourceTemplateId,
            sourceColId,
          },
        };
      }
    }
  }

  return {
    data: {
      id: sheetId,
      name: template.name,
      rows,
      cols,
      colNames,
      values: initialValues,
    },
    fieldToColId,
    configs,
    totals,
    validations,
  };
};

/**
 * 選択されたシートのデータ構築・状態管理およびキャッシュを行うフック
 */
export const useSheetLoader = () => {
  const [activeSheetId, setActiveSheetId] = useAtom(activeSheetIdAtom);
  const [sheetDataMap, setSheetDataMap] = useAtom(sheetDataMapAtom);
  const [fieldToColMap, setFieldToColMap] = useAtom(sheetFieldToColIdMapAtom);
  const sheetTemplates = useAtomValue(sheetTemplatesAtom);
  const openSheetIds = useAtomValue(openSheetIdsAtom);
  const openSheets = useAtomValue(openSheetsAtom);
  const sheetsByCategory = useAtomValue(sheetsByCategoryAtom);
  const favoriteSheetIds = useAtomValue(favoriteSheetIdsAtom);

  const setBaseRowOrder = useSetAtom(baseRowOrderAtom);
  const setBaseColumnOrder = useSetAtom(baseColumnOrderAtom);
  const setBaseColumnNames = useSetAtom(baseColumnNamesAtom);
  const setBaseValues = useSetAtom(baseCellValuesAtom);
  const setColumnConfigs = useSetAtom(columnConfigsAtom);
  const setColumnTotals = useSetAtom(columnTotalsAtom);
  const setColumnValidations = useSetAtom(columnValidationsAtom);
  const setReferencedSheets = useSetAtom(referencedSheetsDataAtom);
  const setOpenSheet = useSetAtom(openSheetAtom);
  const setCloseSheet = useSetAtom(closeSheetAtom);
  const setToggleFavoriteSheet = useSetAtom(toggleFavoriteSheetAtom);

  const getOrInitSheetData = useCallback(
    (sheetId: string): SheetData | null => {
      // 1. すでに Jotai Atom にデータが存在する場合はそれを返す
      if (sheetDataMap[sheetId]) {
        return sheetDataMap[sheetId];
      }

      // 2. マスタ依存解決用の内部ヘルパー
      const currentFieldMap = { ...fieldToColMap };
      const currentDataMap = { ...sheetDataMap };
      const newConfigs: Record<string, Record<ColumnId, ColumnConfig>> = {};
      const newTotals: Record<string, Record<ColumnId, boolean>> = {};
      const newValidations: Record<
        string,
        Record<ColumnId, ColumnValidationRule[]>
      > = {};

      const resolveSheet = (targetId: string): SheetData | null => {
        if (currentDataMap[targetId]) {
          return currentDataMap[targetId];
        }

        const template = sheetTemplates[targetId];
        if (!template) return null;

        // 依存先マスタを先に再帰解決
        for (const col of template.columns) {
          if (col.type.type === "pulldown" || col.type.type === "lookup") {
            const depId = col.type.sourceTemplateId;
            if (!currentDataMap[depId]) {
              resolveSheet(depId);
            }
            if (
              col.type.type === "pulldown" &&
              col.type.relation?.targetSheetId
            ) {
              const relTargetId = col.type.relation.targetSheetId;
              if (!currentDataMap[relTargetId]) {
                resolveSheet(relTargetId);
              }
            }
          }
        }

        const built = buildSheetData(
          targetId,
          template,
          (id) => currentFieldMap[id],
        );
        if (!built) return null;

        currentDataMap[targetId] = built.data;
        currentFieldMap[targetId] = built.fieldToColId;
        newConfigs[targetId] = built.configs;
        newTotals[targetId] = built.totals;
        newValidations[targetId] = built.validations;

        return built.data;
      };

      const result = resolveSheet(sheetId);
      if (!result) return null;

      // 3. Jotai Atoms を一括更新（GC管理可能なステートに保存）
      setSheetDataMap((prev) => ({ ...prev, ...currentDataMap }));
      setFieldToColMap((prev) => ({ ...prev, ...currentFieldMap }));
      setColumnConfigs((prev) => ({ ...prev, ...newConfigs }));
      setColumnTotals((prev) => ({ ...prev, ...newTotals }));
      setColumnValidations((prev) => ({ ...prev, ...newValidations }));
      setReferencedSheets((prev) => ({ ...prev, ...currentDataMap }));

      return result;
    },
    [
      sheetDataMap,
      fieldToColMap,
      sheetTemplates,
      setSheetDataMap,
      setFieldToColMap,
      setColumnConfigs,
      setColumnTotals,
      setColumnValidations,
      setReferencedSheets,
    ],
  );

  const loadSheetData = useCallback(
    (sheetId: string) => {
      const data = getOrInitSheetData(sheetId);
      if (!data) return;

      const { rows, cols, colNames, values } = data;
      setBaseValues(values);
      setBaseRowOrder(rows);
      setBaseColumnOrder(cols);
      setBaseColumnNames(colNames);
      setActiveSheetId(sheetId);
    },
    [
      getOrInitSheetData,
      setBaseValues,
      setBaseRowOrder,
      setBaseColumnOrder,
      setBaseColumnNames,
      setActiveSheetId,
    ],
  );

  // 初期アクティブシートの自動ロード
  useEffect(() => {
    if (!activeSheetId && openSheetIds.length > 0) {
      const initialSheetId = openSheetIds[0];
      if (initialSheetId && sheetTemplates[initialSheetId]) {
        loadSheetData(initialSheetId);
      }
    }
  }, [activeSheetId, openSheetIds, sheetTemplates, loadSheetData]);

  const handleSelectSheet = useCallback(
    (id: string) => {
      loadSheetData(id);
    },
    [loadSheetData],
  );

  const handleOpenSheet = useCallback(
    (sheetId: string) => {
      setOpenSheet(sheetId);
      loadSheetData(sheetId);
    },
    [setOpenSheet, loadSheetData],
  );

  const handleCloseSheet = useCallback(
    (sheetId: string) => {
      const nextOpenIds = openSheetIds.filter((id) => id !== sheetId);
      if (activeSheetId === sheetId) {
        const nextActiveId = nextOpenIds[0] ?? null;
        if (nextActiveId) {
          loadSheetData(nextActiveId);
        }
      }
      setCloseSheet(sheetId);
    },
    [activeSheetId, openSheetIds, loadSheetData, setCloseSheet],
  );

  const handleToggleFavoriteSheet = useCallback(
    (sheetId: string) => {
      setToggleFavoriteSheet(sheetId);
    },
    [setToggleFavoriteSheet],
  );

  const activeSheet = activeSheetId ? sheetTemplates[activeSheetId] : undefined;

  return {
    activeSheet,
    activeSheetId,
    openSheets,
    openSheetIds,
    favoriteSheetIds,
    sheetsByCategory,
    handleSelectSheet,
    handleOpenSheet,
    handleCloseSheet,
    handleToggleFavoriteSheet,
    getOrInitSheetData,
  };
};
