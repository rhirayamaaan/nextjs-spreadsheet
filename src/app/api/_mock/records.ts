import {
  MOCK_ACCOUNT_CATEGORIES,
  MOCK_COST_STANDARDS,
  MOCK_RECEIPT_DEPARTMENTS,
  MOCK_RECEIPT_PAYMENT_CATEGORIES,
  MOCK_RECEIPT_PAYMENT_ITEMS,
  MOCK_RECEIPT_PAYMENT_RECORDS,
} from "./receiptPaymentRecords";

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
  { code: "1011", name: "第１事業部" },
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

const MOCK_COST_DEPTS = [
  {
    office_code: "12",
    code: "3010",
    name: "プラスチック成型",
    category: "製造",
  },
  { office_code: "13", code: "3000", name: "統括製造課", category: "管理" },
  { office_code: "13", code: "3001", name: "第1製造課", category: "製造" },
  { office_code: "13", code: "3010", name: "資材課", category: "補助" },
  { office_code: "27", code: "3002", name: "第2製造課", category: "製造" },
  { office_code: "27", code: "3003", name: "第3製造課", category: "製造" },
  { office_code: "23", code: "3004", name: "精製加工課", category: "製造" },
  { office_code: "23", code: "3005", name: "充填課", category: "製造" },
  { office_code: "40", code: "3006", name: "包装課", category: "製造" },
  { office_code: "40", code: "3007", name: "品質保証課", category: "補助" },
  { office_code: "01", code: "3008", name: "工務課", category: "補助" },
  { office_code: "01", code: "3009", name: "生産管理課", category: "補助" },
];

export const MOCK_UNITS_MASTER = [
  { code: "PCS", name: "個" },
  { code: "KG", name: "キログラム" },
  { code: "L", name: "リットル" },
  { code: "BOX", name: "箱" },
];

export const MOCK_COST_CLASSIFICATIONS_MASTER = [
  { code: "1", name: "材料費" },
  { code: "3", name: "変動費" },
  { code: "6", name: "固定費" },
];

export const MOCK_MAJOR_EXPENSES_MASTER = [
  { code: "11", name: "原材料費" },
  { code: "32", name: "水道光熱費" },
  { code: "33", name: "運搬費" },
  { code: "35", name: "補助材料費" },
  { code: "51", name: "労務費" },
  { code: "63", name: "減価償却費" },
  { code: "64", name: "修繕費" },
  { code: "66", name: "消耗品費" },
  { code: "67", name: "その他経費" },
  { code: "68", name: "配賦共通費" },
];

export const MOCK_EXPENSES_MASTER = [
  { code: "1110", name: "原材料" },
  { code: "3210", name: "電力費" },
  { code: "3220", name: "ガス費" },
  { code: "3230", name: "蒸気費" },
  { code: "3240", name: "用水費" },
  { code: "3310", name: "運搬費" },
  { code: "3510", name: "補助材料費" },
  { code: "5110", name: "労務費" },
  { code: "6310", name: "減価償却費" },
  { code: "6410", name: "機械修繕費" },
  { code: "6420", name: "金型修繕費" },
  { code: "6610", name: "消耗品費" },
  { code: "6710", name: "その他経費" },
  { code: "6810", name: "配賦共通費" },
];

const BASE_EXPENSE_ITEMS = [
  {
    cost_classification_code: "1",
    cost_classification_name: "材料費",
    major_expense_code: "11",
    major_expense_name: "原材料費",
    expense_code: "1110",
    expense_name: "原材料",
    quantity: "51040859",
    unit_price: "0.83",
    amount: "42611623",
    unit_consumption: "132.071787",
    cost_per_unit: "110.26",
  },
  {
    cost_classification_code: "3",
    cost_classification_name: "変動費",
    major_expense_code: "32",
    major_expense_name: "水道光熱費",
    expense_code: "3210",
    expense_name: "電力費",
    quantity: "1000",
    unit_price: "100",
    amount: "100000",
    unit_consumption: "0.002588",
    cost_per_unit: "0.26",
  },
  {
    cost_classification_code: "3",
    cost_classification_name: "変動費",
    major_expense_code: "32",
    major_expense_name: "水道光熱費",
    expense_code: "3220",
    expense_name: "ガス費",
    quantity: "100",
    unit_price: "350",
    amount: "35000",
    unit_consumption: "0.000259",
    cost_per_unit: "0.09",
  },
  {
    cost_classification_code: "3",
    cost_classification_name: "変動費",
    major_expense_code: "32",
    major_expense_name: "水道光熱費",
    expense_code: "3230",
    expense_name: "蒸気費",
    quantity: "500",
    unit_price: "50",
    amount: "25000",
    unit_consumption: "0.001294",
    cost_per_unit: "0.06",
  },
  {
    cost_classification_code: "3",
    cost_classification_name: "変動費",
    major_expense_code: "32",
    major_expense_name: "水道光熱費",
    expense_code: "3240",
    expense_name: "用水費",
    quantity: "3000",
    unit_price: "10",
    amount: "30000",
    unit_consumption: "0.007763",
    cost_per_unit: "0.08",
  },
  {
    cost_classification_code: "3",
    cost_classification_name: "変動費",
    major_expense_code: "33",
    major_expense_name: "運搬費",
    expense_code: "3310",
    expense_name: "運搬費",
    quantity: "100",
    unit_price: "360",
    amount: "36000",
    unit_consumption: "0.000259",
    cost_per_unit: "0.09",
  },
  {
    cost_classification_code: "3",
    cost_classification_name: "変動費",
    major_expense_code: "35",
    major_expense_name: "補助材料費",
    expense_code: "3510",
    expense_name: "補助材料費",
    quantity: "10",
    unit_price: "1800",
    amount: "18000",
    unit_consumption: "0.000026",
    cost_per_unit: "0.05",
  },
  {
    cost_classification_code: "6",
    cost_classification_name: "固定費",
    major_expense_code: "51",
    major_expense_name: "労務費",
    expense_code: "5110",
    expense_name: "労務費",
    quantity: "0",
    unit_price: "0",
    amount: "39076317",
    unit_consumption: "0",
    cost_per_unit: "101.11",
  },
  {
    cost_classification_code: "6",
    cost_classification_name: "固定費",
    major_expense_code: "63",
    major_expense_name: "減価償却費",
    expense_code: "6310",
    expense_name: "減価償却費",
    quantity: "0",
    unit_price: "0",
    amount: "14958000",
    unit_consumption: "0",
    cost_per_unit: "38.7",
  },
  {
    cost_classification_code: "6",
    cost_classification_name: "固定費",
    major_expense_code: "64",
    major_expense_name: "修繕費",
    expense_code: "6410",
    expense_name: "機械修繕費",
    quantity: "10",
    unit_price: "7677.4",
    amount: "76774",
    unit_consumption: "0.000026",
    cost_per_unit: "0.2",
  },
  {
    cost_classification_code: "6",
    cost_classification_name: "固定費",
    major_expense_code: "64",
    major_expense_name: "修繕費",
    expense_code: "6420",
    expense_name: "金型修繕費",
    quantity: "0",
    unit_price: "0",
    amount: "810000",
    unit_consumption: "0",
    cost_per_unit: "2.1",
  },
  {
    cost_classification_code: "6",
    cost_classification_name: "固定費",
    major_expense_code: "66",
    major_expense_name: "消耗品費",
    expense_code: "6610",
    expense_name: "消耗品費",
    quantity: "10",
    unit_price: "4472.6",
    amount: "44726",
    unit_consumption: "0.000026",
    cost_per_unit: "0.12",
  },
  {
    cost_classification_code: "6",
    cost_classification_name: "固定費",
    major_expense_code: "67",
    major_expense_name: "その他経費",
    expense_code: "6710",
    expense_name: "その他経費",
    quantity: "10",
    unit_price: "9042.4",
    amount: "90424",
    unit_consumption: "0.000026",
    cost_per_unit: "0.23",
  },
  {
    cost_classification_code: "6",
    cost_classification_name: "固定費",
    major_expense_code: "68",
    major_expense_name: "配賦共通費",
    expense_code: "6810",
    expense_name: "配賦共通費",
    quantity: "394519.3123",
    unit_price: "50.65",
    amount: "19982830",
    unit_consumption: "1.020846",
    cost_per_unit: "51.71",
  },
];

const DEPARTMENT_COST_CONFIGS = [
  // 1. 千葉事業所 (12) - プラスチック成型 (3010) - 2020年05月
  {
    year: "2020",
    from_year_month: "2020-05",
    to_year_month: "2020-05",
    accounting_unit_code: "1011",
    accounting_unit_name: "第１事業部",
    office_code: "12",
    office_name: "千葉事業所",
    cost_dept_code: "3010",
    cost_dept_name: "プラスチック成型",
    production_volume: "386463",
    unit: "PCS",
    unit_name: "個",
    yield_rate: "98",
    multiplier: 1.0,
  },
  // 2. 千葉事業所 (12) - プラスチック成型 (3010) - 2020年04月
  {
    year: "2020",
    from_year_month: "2020-04",
    to_year_month: "2020-04",
    accounting_unit_code: "1011",
    accounting_unit_name: "第１事業部",
    office_code: "12",
    office_name: "千葉事業所",
    cost_dept_code: "3010",
    cost_dept_name: "プラスチック成型",
    production_volume: "372000",
    unit: "PCS",
    unit_name: "個",
    yield_rate: "97.5",
    multiplier: 0.95,
  },
  // 3. 東京事業所 (13) - 統括製造課 (3000) - 2020年05月
  {
    year: "2020",
    from_year_month: "2020-05",
    to_year_month: "2020-05",
    accounting_unit_code: "1008",
    accounting_unit_name: "製造本部",
    office_code: "13",
    office_name: "東京事業所",
    cost_dept_code: "3000",
    cost_dept_name: "統括製造課",
    production_volume: "520000",
    unit: "PCS",
    unit_name: "個",
    yield_rate: "98.2",
    multiplier: 1.25,
  },
  // 4. 東京事業所 (13) - 第1製造課 (3001) - 2020年05月
  {
    year: "2020",
    from_year_month: "2020-05",
    to_year_month: "2020-05",
    accounting_unit_code: "1008",
    accounting_unit_name: "製造本部",
    office_code: "13",
    office_name: "東京事業所",
    cost_dept_code: "3001",
    cost_dept_name: "第1製造課",
    production_volume: "480000",
    unit: "KG",
    unit_name: "キログラム",
    yield_rate: "98.0",
    multiplier: 1.15,
  },
  // 5. 大阪事業所 (27) - 第2製造課 (3002) - 2020年05月
  {
    year: "2020",
    from_year_month: "2020-05",
    to_year_month: "2020-05",
    accounting_unit_code: "1008",
    accounting_unit_name: "製造本部",
    office_code: "27",
    office_name: "大阪事業所",
    cost_dept_code: "3002",
    cost_dept_name: "第2製造課",
    production_volume: "430000",
    unit: "KG",
    unit_name: "キログラム",
    yield_rate: "97.8",
    multiplier: 1.08,
  },
  // 6. 愛知事業所 (23) - 充填課 (3005) - 2020年05月
  {
    year: "2020",
    from_year_month: "2020-05",
    to_year_month: "2020-05",
    accounting_unit_code: "1008",
    accounting_unit_name: "製造本部",
    office_code: "23",
    office_name: "愛知事業所",
    cost_dept_code: "3005",
    cost_dept_name: "充填課",
    production_volume: "350000",
    unit: "L",
    unit_name: "リットル",
    yield_rate: "99.0",
    multiplier: 0.9,
  },
  // 7. 福岡事業所 (40) - 包装課 (3006) - 2020年05月
  {
    year: "2020",
    from_year_month: "2020-05",
    to_year_month: "2020-05",
    accounting_unit_code: "1008",
    accounting_unit_name: "製造本部",
    office_code: "40",
    office_name: "福岡事業所",
    cost_dept_code: "3006",
    cost_dept_name: "包装課",
    production_volume: "290000",
    unit: "BOX",
    unit_name: "箱",
    yield_rate: "98.5",
    multiplier: 0.8,
  },
];

const MOCK_DEPARTMENT_COST_RECORDS: Record<string, string>[] =
  DEPARTMENT_COST_CONFIGS.flatMap((cfg) =>
    BASE_EXPENSE_ITEMS.map((item) => {
      const isOriginal = cfg.multiplier === 1.0;
      const quantityNum = Number.parseFloat(item.quantity) || 0;
      const amountNum = Number.parseFloat(item.amount) || 0;
      const unitPriceNum = Number.parseFloat(item.unit_price) || 0;
      const prodVolNum = Number.parseFloat(cfg.production_volume) || 1;

      const adjQty = isOriginal
        ? item.quantity
        : String(Math.round(quantityNum * cfg.multiplier * 100) / 100);
      const adjAmt = isOriginal
        ? item.amount
        : String(Math.round(amountNum * cfg.multiplier));
      const adjCostPerUnit = isOriginal
        ? item.cost_per_unit
        : (Math.round(amountNum * cfg.multiplier) / prodVolNum).toFixed(2);

      return {
        year: cfg.year,
        from_year_month: cfg.from_year_month,
        to_year_month: cfg.to_year_month,
        accounting_unit_code: cfg.accounting_unit_code,
        accounting_unit_name: cfg.accounting_unit_name,
        office_code: cfg.office_code,
        office_name: cfg.office_name,
        cost_dept_code: cfg.cost_dept_code,
        cost_dept_name: cfg.cost_dept_name,
        production_volume: cfg.production_volume,
        unit: cfg.unit,
        unit_name: cfg.unit_name,
        yield_rate: cfg.yield_rate,
        cost_classification_code: item.cost_classification_code,
        cost_classification_name: item.cost_classification_name,
        major_expense_code: item.major_expense_code,
        major_expense_name: item.major_expense_name,
        expense_code: item.expense_code,
        expense_name: item.expense_name,
        quantity: adjQty,
        unit_price: isOriginal ? item.unit_price : String(unitPriceNum),
        amount: adjAmt,
        unit_consumption: item.unit_consumption,
        cost_per_unit: adjCostPerUnit,
      };
    }),
  );

/**
 * 疑似 API: バックエンドから返却されるプレーンなレコード配列（生データ）を返す
 */
export const fetchMockSheetRecords = (
  sheetId: string,
  rowCount = 100,
): Record<string, string>[] => {
  if (sheetId === "department-cost") {
    return MOCK_DEPARTMENT_COST_RECORDS;
  }
  if (sheetId === "production-volume") {
    const records: Record<string, string>[] = [];
    for (let r = 0; r < rowCount; r++) {
      const type = MOCK_TYPES[r % MOCK_TYPES.length] ?? "TYPE-A";
      const category =
        MOCK_CATEGORIES[(r + Math.floor(r / 6)) % MOCK_CATEGORIES.length] ??
        "CATEGORY-A";
      const year = MOCK_YEARS[(r * 3) % MOCK_YEARS.length] ?? "2024";
      const unit =
        MOCK_ACCOUNTING_UNITS[r % MOCK_ACCOUNTING_UNITS.length] ??
        MOCK_ACCOUNTING_UNITS[0];
      const office =
        MOCK_OFFICES_MASTER[
          (r + Math.floor(r / 3)) % MOCK_OFFICES_MASTER.length
        ] ?? MOCK_OFFICES_MASTER[0];
      const costDept =
        MOCK_COST_DEPTS.find((c) => c.office_code === office.code) ??
        MOCK_COST_DEPTS[r % MOCK_COST_DEPTS.length] ??
        MOCK_COST_DEPTS[0];
      const officeCode = costDept.office_code;

      // 原価規格
      const digit5 = 1 + ((r * 7) % 9);
      const lowerDigits = (r * 11) % 21;
      const costSpec = `${digit5}00${String(lowerDigits).padStart(2, "0")}`;

      // 生産量: 1,000 ~ 500,000
      const baseVolume = 1000 + ((r * 49900 + (r % 7) * 1111) % 499001);
      const productionVolume = Math.max(
        1000,
        Math.min(500000, Math.round(baseVolume / 100) * 100),
      );

      // 上がり数量
      const yieldRatio = 1.05 + (r % 15) * 0.01 + (r % 3) * 0.03;
      const yieldVolume = Math.round((productionVolume * yieldRatio) / 10) * 10;

      // 生産日・年月・日時
      const month = String((r % 12) + 1).padStart(2, "0");
      const day = String((r % 28) + 1).padStart(2, "0");
      const hour = String(8 + (r % 10)).padStart(2, "0");
      const minute = String((r * 15) % 60).padStart(2, "0");
      const productionYearMonth = `${year}-${month}`;
      const productionDate = `${year}-${month}-${day}`;
      const productionDatetime = `${productionDate} ${hour}:${minute}`;

      records.push({
        type,
        category,
        year,
        month,
        production_year_month: productionYearMonth,
        production_date: productionDate,
        production_datetime: productionDatetime,
        accounting_unit_code: unit.code,
        office_code: officeCode,
        cost_dept_code: costDept.code,
        cost_spec: costSpec,
        production_volume: String(productionVolume),
        yield_volume: String(yieldVolume),
      });
    }
    return records;
  }

  if (sheetId === "accounting-unit-master") {
    return MOCK_ACCOUNTING_UNITS.map((u) => ({
      code: u.code,
      name: u.name,
    }));
  }

  if (sheetId === "office-master") {
    return MOCK_OFFICES_MASTER.map((o) => ({
      code: o.code,
      name: o.name,
    }));
  }

  if (sheetId === "cost-department-master") {
    return MOCK_COST_DEPTS.map((c) => ({
      office_code: c.office_code,
      code: c.code,
      name: c.name,
      category: c.category,
    }));
  }

  if (sheetId === "unit-master") {
    return MOCK_UNITS_MASTER.map((u) => ({
      code: u.code,
      name: u.name,
    }));
  }

  if (sheetId === "cost-classification-master") {
    return MOCK_COST_CLASSIFICATIONS_MASTER.map((c) => ({
      code: c.code,
      name: c.name,
    }));
  }

  if (sheetId === "major-expense-master") {
    return MOCK_MAJOR_EXPENSES_MASTER.map((m) => ({
      code: m.code,
      name: m.name,
    }));
  }

  if (sheetId === "expense-master") {
    return MOCK_EXPENSES_MASTER.map((e) => ({
      code: e.code,
      name: e.name,
    }));
  }

  if (sheetId === "account-category-master") {
    return MOCK_ACCOUNT_CATEGORIES;
  }

  if (sheetId === "receipt-department-master") {
    return MOCK_RECEIPT_DEPARTMENTS;
  }

  if (sheetId === "cost-standard-master") {
    return MOCK_COST_STANDARDS;
  }

  if (sheetId === "receipt-payment-category-master") {
    return MOCK_RECEIPT_PAYMENT_CATEGORIES;
  }

  if (sheetId === "receipt-payment-item-master") {
    return MOCK_RECEIPT_PAYMENT_ITEMS;
  }

  if (sheetId === "receipt-payment-info") {
    return MOCK_RECEIPT_PAYMENT_RECORDS;
  }

  // デフォルトフォールバック（新規シート用）
  return Array.from({ length: rowCount }, (_, r) => ({
    col1: `DATA-${r + 1}`,
  }));
};
