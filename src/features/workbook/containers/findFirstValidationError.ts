import type {
  CellStatusInfo,
  ColumnConfig,
  ColumnId,
  ColumnValidationRule,
  RowId,
  RowStatus,
  SheetData,
  ValidationErrorInfo,
} from "../stores/types";
import { getParentColumnInfo, validateCellRules } from "../utils/validation";

export type FirstValidationError = {
  rowIndex: number;
  colIndex: number;
  rowId: RowId;
  colId: ColumnId;
  errorInfo?: ValidationErrorInfo;
  message?: string;
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
  for (let r = 0; r < visibleRows.length; r++) {
    const rowId = visibleRows[r];
    if (!rowId) continue;
    // 削除された行はバリデーション検証対象外
    if (rowStatuses[rowId] === "deleted") continue;

    for (let c = 0; c < columns.length; c++) {
      const colId = columns[c];
      if (!colId) continue;
      const key = `${rowId}-${colId}`;

      // 1. カスタムステータスにエラーがある場合
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

      // 2. Lookup 列は読み取り専用のためスキップ
      const colConfig = columnConfigs[colId];
      if (colConfig?.type === "lookup") continue;

      // 3. 現在のセル値
      const cellValue =
        key in cellEdits ? cellEdits[key] : (baseValues[key] ?? "");

      // 4. バリデーション評価
      const validations = columnValidations[colId];
      const pulldownConfig =
        colConfig?.type === "pulldown" ? colConfig.pulldown : undefined;
      const masterSheetData = pulldownConfig
        ? referencedSheets[
            pulldownConfig.relation?.targetSheetId ??
              pulldownConfig.sourceSheetId
          ]
        : undefined;

      const targetColName = columnNames?.[colId];
      const { parentColValue, parentColName } = getParentColumnInfo(
        pulldownConfig?.relation,
        rowId,
        cellEdits,
        baseValues,
        columnNames,
      );

      const result = validateCellRules(validations, cellValue, {
        pulldownConfig,
        masterSheetData,
        cellEdits,
        parentColValue,
        parentColName,
        targetColName,
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
