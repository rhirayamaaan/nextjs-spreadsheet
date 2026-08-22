import { useAtom, useSetAtom } from "jotai";
import { useCallback, useEffect } from "react";
import {
  activeSheetIdAtom,
  baseCellValuesAtom,
  baseColumnNamesAtom,
  baseColumnOrderAtom,
  baseRowOrderAtom,
  type ColumnId,
  createColumnId,
  createRowId,
  type RowId,
} from "../stores";

const getColumnLabel = (index: number): string => {
  let label = "";
  let n = index + 1;
  while (n > 0) {
    const rem = (n - 1) % 26;
    label = String.fromCharCode(65 + rem) + label;
    n = Math.floor((n - 1) / 26);
  }
  return label;
};

export const MOCK_SHEETS = Array.from({ length: 20 }, (_, i) => {
  const sheetIndex = i + 1;
  if (sheetIndex === 1) {
    return {
      id: "sheet-1",
      name: "シート 1",
      rowCount: 10000,
      colCount: 30,
    };
  }
  return {
    id: `sheet-${sheetIndex}`,
    name: `シート ${sheetIndex}`,
    rowCount: 1000 + ((sheetIndex * 450) % 9001),
    colCount: 10 + ((sheetIndex * 2) % 41),
  };
});

const sheetDataCache: Record<
  string,
  {
    rows: RowId[];
    cols: ColumnId[];
    colNames: Record<ColumnId, string>;
    values: Record<string, string>;
  }
> = {};

export const useSheetLoader = () => {
  const [activeSheetId, setActiveSheetId] = useAtom(activeSheetIdAtom);
  const setBaseRowOrder = useSetAtom(baseRowOrderAtom);
  const setBaseColumnOrder = useSetAtom(baseColumnOrderAtom);
  const setBaseColumnNames = useSetAtom(baseColumnNamesAtom);
  const setBaseValues = useSetAtom(baseCellValuesAtom);

  const loadSheetData = useCallback(
    (sheetId: string) => {
      if (!sheetDataCache[sheetId]) {
        const sheet = MOCK_SHEETS.find((s) => s.id === sheetId);
        if (!sheet) return;

        const sheetIndex = MOCK_SHEETS.indexOf(sheet);
        const { rowCount, colCount } = sheet;

        const rows = Array.from({ length: rowCount }, () => createRowId());
        const cols = Array.from({ length: colCount }, () => createColumnId());
        const colNames: Record<ColumnId, string> = {};
        for (let c = 0; c < cols.length; c++) {
          colNames[cols[c]] = getColumnLabel(c);
        }

        const initialValues: Record<string, string> = {};

        for (let r = 0; r < rows.length; r++) {
          for (let c = 0; c < cols.length; c++) {
            initialValues[`${rows[r]}-${cols[c]}`] =
              `${sheetIndex + 1}-${c + 1}:${r + 1}`;
          }
        }
        sheetDataCache[sheetId] = {
          rows,
          cols,
          colNames,
          values: initialValues,
        };
      }

      const { rows, cols, colNames, values } = sheetDataCache[sheetId];
      setBaseValues(values);
      setBaseRowOrder(rows);
      setBaseColumnOrder(cols);
      setBaseColumnNames(colNames);
      setActiveSheetId(sheetId);
    },
    [
      setBaseValues,
      setBaseRowOrder,
      setBaseColumnOrder,
      setBaseColumnNames,
      setActiveSheetId,
    ],
  );

  useEffect(() => {
    if (!activeSheetId) {
      loadSheetData(MOCK_SHEETS[0].id);
    }
  }, [activeSheetId, loadSheetData]);

  const handleSelectSheet = useCallback(
    (id: string) => {
      loadSheetData(id);
    },
    [loadSheetData],
  );

  const activeSheet = MOCK_SHEETS.find((s) => s.id === activeSheetId);

  return {
    activeSheet,
    activeSheetId,
    handleSelectSheet,
  };
};
