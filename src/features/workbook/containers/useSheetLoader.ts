import { useAtom, useSetAtom } from "jotai";
import { useCallback, useEffect } from "react";
import {
  activeSheetIdAtom,
  baseCellValuesAtom,
  baseColumnNamesAtom,
  baseColumnOrderAtom,
  baseRowOrderAtom,
  type ColumnConfig,
  type ColumnId,
  columnConfigsAtom,
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
      name: "生産量登録",
      rowCount: 100000,
      colCount: 11,
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
  if (sheetIndex === 3) {
    return {
      id: "sheet-3",
      name: "会計単位",
      rowCount: 11,
      colCount: 2,
    };
  }
  if (sheetIndex === 4) {
    return {
      id: "sheet-4",
      name: "事業所",
      rowCount: 47,
      colCount: 2,
    };
  }
  return {
    id: `sheet-${sheetIndex}`,
    name: `シート ${sheetIndex}`,
    rowCount: 1000 + ((sheetIndex * 450) % 9001),
    colCount: 10 + ((sheetIndex * 2) % 41),
  };
});

const MOCK_TYPES = ["TYPE-A", "TYPE-B", "TYPE-C", "TYPE-D", "TYPE-E", "TYPE-F"];

const MOCK_CATEGORIES = [
  "CATEGORY-A",
  "CATEGORY-B",
  "CATEGORY-C",
  "CATEGORY-D",
  "CATEGORY-E",
  "CATEGORY-F",
];

const MOCK_YEARS = ["2020", "2021", "2022", "2023", "2024", "2025", "2026"];

const MOCK_OFFICES = ["08", "09", "10", "11", "12", "13", "14"];

const MOCK_ACCOUNTING_UNITS = [
  { code: "1000", name: "経営企画部" },
  { code: "1001", name: "総務部" },
  { code: "1002", name: "人事部" },
  { code: "1003", name: "財務経理部" },
  { code: "1004", name: "営業本部" },
  { code: "1005", name: "マーケティング部" },
  { code: "1006", name: "研究開発部" },
  { code: "1007", name: "生産技術部" },
  { code: "1008", name: "製造本部" },
  { code: "1009", name: "品質管理部" },
  { code: "1010", name: "購買調達部" },
];

const MOCK_OFFICES_MASTER = [
  { code: "01", name: "北海道事業所" },
  { code: "02", name: "青森事業所" },
  { code: "03", name: "岩手事業所" },
  { code: "04", name: "宮城事業所" },
  { code: "05", name: "秋田事業所" },
  { code: "06", name: "山形事業所" },
  { code: "07", name: "福島事業所" },
  { code: "08", name: "茨城事業所" },
  { code: "09", name: "栃木事業所" },
  { code: "10", name: "群馬事業所" },
  { code: "11", name: "埼玉事業所" },
  { code: "12", name: "千葉事業所" },
  { code: "13", name: "東京事業所" },
  { code: "14", name: "神奈川事業所" },
  { code: "15", name: "新潟事業所" },
  { code: "16", name: "富山事業所" },
  { code: "17", name: "石川事業所" },
  { code: "18", name: "福井事業所" },
  { code: "19", name: "山梨事業所" },
  { code: "20", name: "長野事業所" },
  { code: "21", name: "岐阜事業所" },
  { code: "22", name: "静岡事業所" },
  { code: "23", name: "愛知事業所" },
  { code: "24", name: "三重事業所" },
  { code: "25", name: "滋賀事業所" },
  { code: "26", name: "京都事業所" },
  { code: "27", name: "大阪事業所" },
  { code: "28", name: "兵庫事業所" },
  { code: "29", name: "奈良事業所" },
  { code: "30", name: "和歌山事業所" },
  { code: "31", name: "鳥取事業所" },
  { code: "32", name: "島根事業所" },
  { code: "33", name: "岡山事業所" },
  { code: "34", name: "広島事業所" },
  { code: "35", name: "山口事業所" },
  { code: "36", name: "徳島事業所" },
  { code: "37", name: "香川事業所" },
  { code: "38", name: "愛媛事業所" },
  { code: "39", name: "高知事業所" },
  { code: "40", name: "福岡事業所" },
  { code: "41", name: "佐賀事業所" },
  { code: "42", name: "長崎事業所" },
  { code: "43", name: "熊本事業所" },
  { code: "44", name: "大分事業所" },
  { code: "45", name: "宮崎事業所" },
  { code: "46", name: "鹿児島事業所" },
  { code: "47", name: "沖縄事業所" },
];

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

export const sheetColumnConfigsCache: Record<
  string,
  Record<ColumnId, ColumnConfig>
> = {};

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

    if (sheetId === "sheet-1") {
      // 生産量登録固有の列名とデータ（参照列を含む）
      const productionColHeaders = [
        "タイプ",
        "データ種別",
        "年度",
        "会計単位",
        "会計単位名",
        "事業所",
        "事業所名",
        "原価部門",
        "原価規格",
        "生産量",
        "上がり数量",
      ];
      for (let c = 0; c < cols.length; c++) {
        colNames[cols[c]] = productionColHeaders[c] ?? getColumnLabel(c);
      }

      for (let r = 0; r < rows.length; r++) {
        const type = MOCK_TYPES[r % MOCK_TYPES.length];
        const category =
          MOCK_CATEGORIES[(r + Math.floor(r / 6)) % MOCK_CATEGORIES.length];
        const year = MOCK_YEARS[(r * 3) % MOCK_YEARS.length];
        const accountingUnit = String(1000 + ((r * 2) % 11)); // 1000..1010
        const office =
          MOCK_OFFICES[(r + Math.floor(r / 3)) % MOCK_OFFICES.length]; // 08..14
        const costDept = String(3000 + ((r * 5) % 11)); // 3000..3010

        // 原価規格: 5桁目は1~9、1,2桁目は00~20 (例: 10020, 30010)
        const digit5 = 1 + ((r * 7) % 9);
        const lowerDigits = (r * 11) % 21;
        const costSpec = `${digit5}00${String(lowerDigits).padStart(2, "0")}`;

        // 生産量: 1,000 ~ 500,000
        const baseVolume = 1000 + ((r * 49900 + (r % 7) * 1111) % 499001);
        const productionVolume = Math.max(
          1000,
          Math.min(500000, Math.round(baseVolume / 100) * 100),
        );

        // 上がり数量: 生産量の値より適度に増やす
        const yieldRatio = 1.05 + (r % 15) * 0.01 + (r % 3) * 0.03;
        const yieldVolume =
          Math.round((productionVolume * yieldRatio) / 10) * 10;

        const rowValues = [
          type,
          category,
          year,
          accountingUnit,
          "", // 参照列（会計単位名）: 動的に解決
          office,
          "", // 参照列（事業所名）: 動的に解決
          costDept,
          costSpec,
          String(productionVolume),
          String(yieldVolume),
        ];

        for (let c = 0; c < cols.length; c++) {
          initialValues[`${rows[r]}-${cols[c]}`] = rowValues[c] ?? "";
        }
      }

      // 会計単位と事業所をデフォルトでコンボボックスプルダウンに設定し、参照列（会計単位名、事業所名）を構成
      const sheet3Data = getOrInitSheetData("sheet-3");
      const sheet4Data = getOrInitSheetData("sheet-4");
      const defaultConfigs: Record<ColumnId, ColumnConfig> = {};

      if (sheet3Data && sheet3Data.cols.length >= 2) {
        defaultConfigs[cols[3]] = {
          type: "pulldown",
          pulldown: {
            sourceSheetId: "sheet-3",
            sourceKeyColId: sheet3Data.cols[0],
            lookupColumns: [
              {
                lookupColId: cols[4],
                sourceColId: sheet3Data.cols[1],
                sourceColName: "会計単位名",
              },
            ],
            mode: "combobox",
          },
        };

        defaultConfigs[cols[4]] = {
          type: "lookup",
          lookup: {
            parentColId: cols[3],
            sourceSheetId: "sheet-3",
            sourceColId: sheet3Data.cols[1],
          },
        };
      }

      if (sheet4Data && sheet4Data.cols.length >= 2) {
        defaultConfigs[cols[5]] = {
          type: "pulldown",
          pulldown: {
            sourceSheetId: "sheet-4",
            sourceKeyColId: sheet4Data.cols[0],
            lookupColumns: [
              {
                lookupColId: cols[6],
                sourceColId: sheet4Data.cols[1],
                sourceColName: "事業所名",
              },
            ],
            mode: "combobox",
          },
        };

        defaultConfigs[cols[6]] = {
          type: "lookup",
          lookup: {
            parentColId: cols[5],
            sourceSheetId: "sheet-4",
            sourceColId: sheet4Data.cols[1],
          },
        };
      }

      sheetColumnConfigsCache["sheet-1"] = defaultConfigs;
    } else if (sheetId === "sheet-2") {
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
    } else if (sheetId === "sheet-3") {
      // 会計単位固有の列名とデータ
      const accountingUnitColHeaders = ["会計単位コード", "会計単位名"];
      for (let c = 0; c < cols.length; c++) {
        colNames[cols[c]] = accountingUnitColHeaders[c] ?? getColumnLabel(c);
      }
      for (let r = 0; r < rows.length; r++) {
        const unit = MOCK_ACCOUNTING_UNITS[r % MOCK_ACCOUNTING_UNITS.length];
        initialValues[`${rows[r]}-${cols[0]}`] = unit.code;
        initialValues[`${rows[r]}-${cols[1]}`] = unit.name;
      }
    } else if (sheetId === "sheet-4") {
      // 事業所固有の列名とデータ
      const officeColHeaders = ["事業所コード", "事業所名"];
      for (let c = 0; c < cols.length; c++) {
        colNames[cols[c]] = officeColHeaders[c] ?? getColumnLabel(c);
      }
      for (let r = 0; r < rows.length; r++) {
        const office = MOCK_OFFICES_MASTER[r % MOCK_OFFICES_MASTER.length];
        initialValues[`${rows[r]}-${cols[0]}`] = office.code;
        initialValues[`${rows[r]}-${cols[1]}`] = office.name;
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
  const setColumnConfigs = useSetAtom(columnConfigsAtom);

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

      // Set default column configs if available for this sheet
      if (sheetColumnConfigsCache[sheetId]) {
        setColumnConfigs((prev) => ({
          ...prev,
          [sheetId]: {
            ...sheetColumnConfigsCache[sheetId],
            ...(prev[sheetId] ?? {}),
          },
        }));
      }

      // Preload masters into referenced sheets atom as default candidates
      const masterSheets = ["sheet-2", "sheet-3", "sheet-4"];
      const referenced: Record<
        string,
        NonNullable<ReturnType<typeof getOrInitSheetData>>
      > = {
        [sheetId]: data,
      };
      for (const mId of masterSheets) {
        const mData = getOrInitSheetData(mId);
        if (mData) {
          referenced[mId] = mData;
        }
      }
      setReferencedSheets((prev) => ({
        ...prev,
        ...referenced,
      }));
    },
    [
      setBaseValues,
      setBaseRowOrder,
      setBaseColumnOrder,
      setBaseColumnNames,
      setActiveSheetId,
      setColumnConfigs,
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
