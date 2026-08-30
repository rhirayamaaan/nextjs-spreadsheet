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
  referencedSheetsDataAtom,
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
  if (sheetIndex === 2) {
    return {
      id: "sheet-2",
      name: "商品マスター",
      rowCount: 15,
      colCount: 4,
    };
  }
  return {
    id: `sheet-${sheetIndex}`,
    name: `シート ${sheetIndex}`,
    rowCount: 1000 + ((sheetIndex * 450) % 9001),
    colCount: 10 + ((sheetIndex * 2) % 41),
  };
});

const MOCK_PRODUCTS = [
  {
    code: "PRD-001",
    name: "MacBook Pro 14",
    price: "248,000円",
    category: "PC",
  },
  {
    code: "PRD-002",
    name: "Magic Mouse",
    price: "10,800円",
    category: "アクセサリ",
  },
  {
    code: "PRD-003",
    name: "Magic Keyboard",
    price: "19,800円",
    category: "アクセサリ",
  },
  {
    code: "PRD-004",
    name: "Studio Display 27",
    price: "219,800円",
    category: "ディスプレイ",
  },
  {
    code: "PRD-005",
    name: "AirPods Pro",
    price: "39,800円",
    category: "オーディオ",
  },
  {
    code: "PRD-006",
    name: "エルゴノミクスチェア",
    price: "64,000円",
    category: "家具",
  },
  {
    code: "PRD-007",
    name: "電動昇降デスク",
    price: "52,000円",
    category: "家具",
  },
  {
    code: "PRD-008",
    name: "USB-C ハブ 7-in-1",
    price: "5,400円",
    category: "周辺機器",
  },
  {
    code: "PRD-009",
    name: "4K Webカメラ",
    price: "16,200円",
    category: "周辺機器",
  },
  {
    code: "PRD-010",
    name: "卓上LEDデスクライト",
    price: "7,800円",
    category: "照明",
  },
  {
    code: "PRD-011",
    name: "モニターアーム",
    price: "13,500円",
    category: "アクセサリ",
  },
  {
    code: "PRD-012",
    name: "デスクマット レザー",
    price: "3,200円",
    category: "文具",
  },
  {
    code: "PRD-013",
    name: "急速充電器 65W GaN",
    price: "4,900円",
    category: "電源",
  },
  {
    code: "PRD-014",
    name: "外付けSSD 1TB",
    price: "18,400円",
    category: "ストレージ",
  },
  {
    code: "PRD-015",
    name: "Bluetoothスピーカー",
    price: "12,000円",
    category: "オーディオ",
  },
];

export const sheetDataCache: Record<
  string,
  {
    rows: RowId[];
    cols: ColumnId[];
    colNames: Record<ColumnId, string>;
    values: Record<string, string>;
  }
> = {};

export const getOrInitSheetData = (sheetId: string) => {
  if (!sheetDataCache[sheetId]) {
    const sheet = MOCK_SHEETS.find((s) => s.id === sheetId);
    if (!sheet) return null;

    const sheetIndex = MOCK_SHEETS.indexOf(sheet);
    const { rowCount, colCount } = sheet;

    const rows = Array.from({ length: rowCount }, () => createRowId());
    const cols = Array.from({ length: colCount }, () => createColumnId());
    const colNames: Record<ColumnId, string> = {};
    const initialValues: Record<string, string> = {};

    if (sheetId === "sheet-2") {
      // 商品マスター固有の列名とデータ
      const productColHeaders = ["商品コード", "商品名", "単価", "カテゴリ"];
      for (let c = 0; c < cols.length; c++) {
        colNames[cols[c]] = productColHeaders[c] ?? getColumnLabel(c);
      }
      for (let r = 0; r < rows.length; r++) {
        const prod = MOCK_PRODUCTS[r % MOCK_PRODUCTS.length];
        initialValues[`${rows[r]}-${cols[0]}`] = prod.code;
        initialValues[`${rows[r]}-${cols[1]}`] = prod.name;
        initialValues[`${rows[r]}-${cols[2]}`] = prod.price;
        initialValues[`${rows[r]}-${cols[3]}`] = prod.category;
      }
    } else {
      for (let c = 0; c < cols.length; c++) {
        colNames[cols[c]] = getColumnLabel(c);
      }
      for (let r = 0; r < rows.length; r++) {
        for (let c = 0; c < cols.length; c++) {
          initialValues[`${rows[r]}-${cols[c]}`] =
            `${sheetIndex + 1}-${c + 1}:${r + 1}`;
        }
      }
    }

    sheetDataCache[sheetId] = {
      rows,
      cols,
      colNames,
      values: initialValues,
    };
  }

  const sheet = MOCK_SHEETS.find((s) => s.id === sheetId);
  return {
    id: sheetId,
    name: sheet?.name ?? sheetId,
    ...sheetDataCache[sheetId],
  };
};

export const useSheetLoader = () => {
  const [activeSheetId, setActiveSheetId] = useAtom(activeSheetIdAtom);
  const setBaseRowOrder = useSetAtom(baseRowOrderAtom);
  const setBaseColumnOrder = useSetAtom(baseColumnOrderAtom);
  const setBaseColumnNames = useSetAtom(baseColumnNamesAtom);
  const setBaseValues = useSetAtom(baseCellValuesAtom);

  const setReferencedSheets = useSetAtom(referencedSheetsDataAtom);

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

      // Preload product master into referenced sheets atom as default candidate
      const masterData = getOrInitSheetData("sheet-2");
      if (masterData) {
        setReferencedSheets((prev) => ({
          ...prev,
          "sheet-2": masterData,
          [sheetId]: data,
        }));
      }
    },
    [
      setBaseValues,
      setBaseRowOrder,
      setBaseColumnOrder,
      setBaseColumnNames,
      setActiveSheetId,
      setReferencedSheets,
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
