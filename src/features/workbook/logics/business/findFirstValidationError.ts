import {
  type CellStatusInfo,
  type ColumnConfig,
  type ColumnId,
  type ColumnValidationRule,
  isSubtotalRowId,
  type RowId,
  type RowStatus,
  type SheetData,
  type ValidationErrorInfo,
} from "../../stores/types";
import { getParentColumnInfo, validateCellRules } from "./validation";

export type FirstValidationError = {
  rowIndex: number;
  colIndex: number;
  rowId: RowId;
  colId: ColumnId;
  errorInfo?: ValidationErrorInfo;
  message?: string;
};

type MasterIndex = {
  validKeys: Set<string>;
  relationValidKeys?: Map<string, Set<string>>; // parentVal -> Set<childVal>
};

export const findFirstValidationError = ({
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
}: {
  visibleRows: RowId[];
  columns: ColumnId[];
  columnConfigs: Record<ColumnId, ColumnConfig>;
  columnValidations: Record<ColumnId, ColumnValidationRule[]>;
  referencedSheets: Record<string, SheetData>;
  cellEdits: Record<string, string>;
  baseValues: Record<string, string>;
  rowStatuses: Record<RowId, RowStatus>;
  customStatuses: Record<string, CellStatusInfo>;
  columnNames?: Record<ColumnId, string>;
}): FirstValidationError | null => {
  // 1. 各プルダウン列のマスタ検証用 O(1) インデックスを事前生成 (500,000回のループとProxyアクセスを撲滅)
  const masterIndexes = new Map<ColumnId, MasterIndex>();

  for (const colId of columns) {
    const colConfig = columnConfigs[colId];
    if (colConfig?.type !== "pulldown") continue;

    const { sourceSheetId, sourceKeyColId, relation } = colConfig.pulldown;
    const targetMasterId = relation?.targetSheetId ?? sourceSheetId;
    const master = referencedSheets[targetMasterId];
    if (!master || master.rows.length === 0) continue;

    const validKeys = new Set<string>();
    const relationValidKeys = relation
      ? new Map<string, Set<string>>()
      : undefined;

    for (const rId of master.rows) {
      const key = `${rId}-${sourceKeyColId}`;
      const val = key in cellEdits ? cellEdits[key] : master.values[key];
      if (val) {
        validKeys.add(val);
        if (relation && relationValidKeys) {
          const filterKey = `${rId}-${relation.sourceFilterColId}`;
          const parentVal =
            filterKey in cellEdits
              ? cellEdits[filterKey]
              : (master.values[filterKey] ?? "");
          let childSet = relationValidKeys.get(parentVal);
          if (!childSet) {
            childSet = new Set<string>();
            relationValidKeys.set(parentVal, childSet);
          }
          childSet.add(val);
        }
      }
    }

    masterIndexes.set(colId, { validKeys, relationValidKeys });
  }

  // 2. 各列の unique バリデーション用重複値インデックスを事前生成 (O(N))
  const columnDuplicates = new Map<ColumnId, Set<string>>();
  for (const colId of columns) {
    const rules = columnValidations[colId];
    if (!rules?.some((r) => r.type === "unique")) continue;

    const seen = new Set<string>();
    const duplicates = new Set<string>();
    for (const rId of visibleRows) {
      if (isSubtotalRowId(rId) || rowStatuses[rId] === "deleted") continue;
      const key = `${rId}-${colId}`;
      const val = key in cellEdits ? cellEdits[key] : (baseValues[key] ?? "");
      if (val.trim() === "") continue;

      if (seen.has(val)) {
        duplicates.add(val);
      } else {
        seen.add(val);
      }
    }
    columnDuplicates.set(colId, duplicates);
  }

  // 3. 全行・全列のバリデーション評価
  for (let r = 0; r < visibleRows.length; r++) {
    const rowId = visibleRows[r];
    if (!rowId) continue;
    // 削除された行はバリデーション検証対象外
    if (rowStatuses[rowId] === "deleted") continue;

    for (let c = 0; c < columns.length; c++) {
      const colId = columns[c];
      if (!colId) continue;
      const key = `${rowId}-${colId}`;

      // (1) カスタムステータスにエラーがある場合
      const customStatus = customStatuses[key];
      if (customStatus?.status === "error") {
        return {
          rowIndex: r,
          colIndex: c,
          rowId,
          colId,
          errorInfo: customStatus.errorInfo,
          message: customStatus.message,
        };
      }

      // (2) Lookup 列は読み取り専用のためスキップ
      const colConfig = columnConfigs[colId];
      if (colConfig?.type === "lookup") continue;

      // (3) 現在のセル値
      const cellValue =
        key in cellEdits ? cellEdits[key] : (baseValues[key] ?? "");

      // (4) プルダウン/マスタ参照の高速 O(1) 検証
      const masterIdx = masterIndexes.get(colId);
      if (masterIdx && cellValue) {
        // マスタ存在チェック
        if (!masterIdx.validKeys.has(cellValue)) {
          return {
            rowIndex: r,
            colIndex: c,
            rowId,
            colId,
            errorInfo: { key: "reference" },
          };
        }

        // 親キーリレーション検証
        if (masterIdx.relationValidKeys && colConfig?.type === "pulldown") {
          const relation = colConfig.pulldown.relation;
          if (relation) {
            const { parentColValue, parentColName } = getParentColumnInfo(
              relation,
              rowId,
              cellEdits,
              baseValues,
              columnNames,
            );
            const validChildren = parentColValue
              ? masterIdx.relationValidKeys.get(parentColValue)
              : undefined;

            if (!validChildren || !validChildren.has(cellValue)) {
              return {
                rowIndex: r,
                colIndex: c,
                rowId,
                colId,
                errorInfo: {
                  key: "referenceRelation",
                  params: {
                    parent: parentColName ?? "",
                    target: columnNames?.[colId] ?? "",
                  },
                },
              };
            }
          }
        }
      }

      // (5) その他のルール（required, number, datetime 等）の評価
      // reference ルールは上記 O(1) で解決済みのため除外して評価
      const allRules = columnValidations[colId];
      if (!allRules || allRules.length === 0) continue;

      const nonRefRules = allRules.filter((rule) => rule.type !== "reference");
      if (nonRefRules.length === 0) continue;

      const result = validateCellRules(nonRefRules, cellValue, {
        duplicateValues: columnDuplicates.get(colId),
      });
      if (!result.valid) {
        return {
          rowIndex: r,
          colIndex: c,
          rowId,
          colId,
          errorInfo: result.errorInfo,
        };
      }
    }
  }

  return null;
};
