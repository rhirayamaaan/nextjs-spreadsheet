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

/**
 * 疑似 API: バックエンドから返却されるプレーンなレコード配列（生データ）を返す
 */
export const fetchMockSheetRecords = (
  sheetId: string,
  rowCount = 100,
): Record<string, string>[] => {
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

  // デフォルトフォールバック（新規シート用）
  return Array.from({ length: rowCount }, (_, r) => ({
    col1: `DATA-${r + 1}`,
  }));
};
