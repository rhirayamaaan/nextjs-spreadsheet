import type {
  SheetCategoryRaw,
  SheetTemplateRaw,
} from "@/features/workbook/stores";

export const MOCK_SHEET_CATEGORIES: SheetCategoryRaw[] = [
  {
    id: "planning",
    name: { ja: "計画・実績", en: "Planning & Actual" },
    description: {
      ja: "生産量や各種計画・実績データの管理",
      en: "Management of production volume, plans, and actuals",
    },
  },
  {
    id: "master",
    name: { ja: "マスタ管理", en: "Master Data" },
    description: {
      ja: "会計単位、事業所、原価部門などの各種マスタデータ",
      en: "Master data for accounting units, offices, cost departments, etc.",
    },
  },
];

export const productionVolumeTemplate: SheetTemplateRaw = {
  id: "production-volume",
  name: { ja: "生産量登録", en: "Production Volume Registration" },
  category: "planning",
  description: {
    ja: "生産量および上がり数量の実績・計画登録シート",
    en: "Actual & planned volume registration sheet",
  },
  isFavorite: true,
  defaultRowCount: 10000,
  columns: [
    {
      field: "type",
      headerName: { ja: "タイプ", en: "Type" },
      type: { type: "text" },
      validations: [{ type: "required" }, { type: "string" }],
      width: 120,
      align: "left",
    },
    {
      field: "category",
      headerName: { ja: "データ種別", en: "Category" },
      type: { type: "text" },
      validations: [{ type: "required" }],
      width: 140,
      align: "left",
    },
    {
      field: "year",
      headerName: { ja: "年度", en: "Fiscal Year" },
      type: { type: "datetime", format: "yyyy" },
      validations: [{ type: "required" }, { type: "datetime", format: "yyyy" }],
      width: 100,
      align: "center",
    },
    {
      field: "month",
      headerName: { ja: "対象月", en: "Target Month" },
      type: { type: "datetime", format: "MM" },
      validations: [{ type: "required" }, { type: "datetime", format: "MM" }],
      width: 90,
      align: "center",
    },
    {
      field: "production_year_month",
      headerName: { ja: "生産年月", en: "Production Y/M" },
      type: { type: "datetime", format: "yyyy-MM" },
      validations: [
        { type: "required" },
        { type: "datetime", format: "yyyy-MM" },
      ],
      width: 110,
      align: "center",
    },
    {
      field: "production_date",
      headerName: { ja: "生産日", en: "Production Date" },
      type: { type: "datetime", format: "yyyy-MM-dd" },
      validations: [
        { type: "required" },
        { type: "datetime", format: "yyyy-MM-dd" },
      ],
      width: 130,
      align: "center",
    },
    {
      field: "production_datetime",
      headerName: { ja: "生産日時", en: "Production DateTime" },
      type: { type: "datetime", format: "yyyy-MM-dd HH:mm" },
      validations: [
        { type: "required" },
        { type: "datetime", format: "yyyy-MM-dd HH:mm" },
      ],
      width: 165,
      align: "center",
    },
    {
      field: "accounting_unit_code",
      headerName: { ja: "会計単位", en: "Accounting Unit" },
      type: {
        type: "pulldown",
        mode: "combobox",
        sourceTemplateId: "accounting-unit-master",
        sourceKeyField: "code",
        lookupFields: [
          {
            field: "accounting_unit_name",
            headerName: { ja: "会計単位名", en: "Accounting Unit Name" },
            sourceField: "name",
          },
        ],
      },
      validations: [{ type: "required" }, { type: "reference" }],
      width: 130,
      align: "left",
    },
    {
      field: "accounting_unit_name",
      headerName: { ja: "会計単位名", en: "Accounting Unit Name" },
      type: {
        type: "lookup",
        parentField: "accounting_unit_code",
        sourceTemplateId: "accounting-unit-master",
        sourceField: "name",
      },
      width: 180,
      readOnly: true,
      align: "left",
    },
    {
      field: "office_code",
      headerName: { ja: "事業所", en: "Office" },
      type: {
        type: "pulldown",
        mode: "combobox",
        sourceTemplateId: "office-master",
        sourceKeyField: "code",
        lookupFields: [
          {
            field: "office_name",
            headerName: { ja: "事業所名", en: "Office Name" },
            sourceField: "name",
          },
        ],
      },
      validations: [{ type: "required" }, { type: "reference" }],
      width: 120,
      align: "left",
    },
    {
      field: "office_name",
      headerName: { ja: "事業所名", en: "Office Name" },
      type: {
        type: "lookup",
        parentField: "office_code",
        sourceTemplateId: "office-master",
        sourceField: "name",
      },
      width: 160,
      readOnly: true,
      align: "left",
    },
    {
      field: "cost_dept_code",
      headerName: { ja: "原価部門", en: "Cost Department" },
      type: {
        type: "pulldown",
        mode: "combobox",
        sourceTemplateId: "cost-department-master",
        sourceKeyField: "code",
        relation: {
          parentField: "office_code",
          targetSheetId: "cost-department-master",
          sourceFilterField: "office_code",
        },
        lookupFields: [
          {
            field: "cost_dept_name",
            headerName: { ja: "原価部門名", en: "Cost Department Name" },
            sourceField: "name",
          },
        ],
      },
      validations: [{ type: "required" }, { type: "reference" }],
      width: 130,
      align: "left",
    },
    {
      field: "cost_dept_name",
      headerName: { ja: "原価部門名", en: "Cost Department Name" },
      type: {
        type: "lookup",
        parentField: "cost_dept_code",
        sourceTemplateId: "cost-department-master",
        sourceField: "name",
      },
      width: 180,
      readOnly: true,
      align: "left",
    },
    {
      field: "cost_spec",
      headerName: { ja: "原価規格", en: "Cost Standard" },
      type: { type: "text" },
      validations: [
        { type: "alphanumeric" },
        { type: "maxLength", length: 10 },
      ],
      width: 130,
      align: "left",
    },
    {
      field: "production_volume",
      headerName: { ja: "生産量", en: "Production Volume" },
      type: { type: "number", format: "integer" },
      validations: [{ type: "required" }, { type: "number" }],
      width: 140,
      hasTotal: true,
      align: "right",
    },
    {
      field: "yield_volume",
      headerName: { ja: "上がり数量", en: "Finished Volume" },
      type: { type: "number", format: "integer" },
      validations: [{ type: "number" }],
      width: 140,
      hasTotal: true,
      align: "right",
    },
  ],
};

export const accountingUnitTemplate: SheetTemplateRaw = {
  id: "accounting-unit-master",
  name: { ja: "会計単位", en: "Accounting Unit" },
  category: "master",
  description: {
    ja: "会計単位（部署・部門）のマスタシート",
    en: "Master sheet for accounting units (departments/divisions)",
  },
  isFavorite: false,
  defaultRowCount: 11,
  columns: [
    {
      field: "code",
      headerName: { ja: "会計単位コード", en: "Accounting Unit Code" },
      type: { type: "text" },
      validations: [{ type: "required" }, { type: "alphanumeric" }],
      width: 160,
      align: "left",
    },
    {
      field: "name",
      headerName: { ja: "会計単位名", en: "Accounting Unit Name" },
      type: { type: "text" },
      validations: [{ type: "required" }],
      width: 240,
      align: "left",
    },
  ],
};

export const unitTemplate: SheetTemplateRaw = {
  id: "unit-master",
  name: { ja: "単位マスタ", en: "Unit Master" },
  category: "master",
  description: {
    ja: "数量等の単位（PCS, KG, L等）のマスタシート",
    en: "Master sheet for units of measure (PCS, KG, L, etc.)",
  },
  isFavorite: false,
  defaultRowCount: 4,
  columns: [
    {
      field: "code",
      headerName: { ja: "単位コード", en: "Unit Code" },
      type: { type: "text" },
      validations: [{ type: "required" }],
      width: 120,
      align: "center",
    },
    {
      field: "name",
      headerName: { ja: "単位名称", en: "Unit Name" },
      type: { type: "text" },
      validations: [{ type: "required" }],
      width: 160,
      align: "left",
    },
  ],
};

export const costClassificationTemplate: SheetTemplateRaw = {
  id: "cost-classification-master",
  name: { ja: "費用区分マスタ", en: "Cost Classification Master" },
  category: "master",
  description: {
    ja: "費用区分（材料費、変動費、固定費）のマスタシート",
    en: "Master sheet for cost classifications (material, variable, fixed)",
  },
  isFavorite: false,
  defaultRowCount: 3,
  columns: [
    {
      field: "code",
      headerName: { ja: "費用区分コード", en: "Cost Classification Code" },
      type: { type: "text" },
      validations: [{ type: "required" }],
      width: 140,
      align: "center",
    },
    {
      field: "name",
      headerName: { ja: "費用区分名称", en: "Cost Classification Name" },
      type: { type: "text" },
      validations: [{ type: "required" }],
      width: 180,
      align: "left",
    },
  ],
};

export const majorExpenseTemplate: SheetTemplateRaw = {
  id: "major-expense-master",
  name: { ja: "大費目マスタ", en: "Major Expense Master" },
  category: "master",
  description: {
    ja: "大費目（原材料費、水道光熱費、労務費等）のマスタシート",
    en: "Master sheet for major expenses (raw materials, utilities, labor, etc.)",
  },
  isFavorite: false,
  defaultRowCount: 10,
  columns: [
    {
      field: "code",
      headerName: { ja: "大費目コード", en: "Major Expense Code" },
      type: { type: "text" },
      validations: [{ type: "required" }],
      width: 130,
      align: "center",
    },
    {
      field: "name",
      headerName: { ja: "大費目名称", en: "Major Expense Name" },
      type: { type: "text" },
      validations: [{ type: "required" }],
      width: 200,
      align: "left",
    },
  ],
};

export const expenseTemplate: SheetTemplateRaw = {
  id: "expense-master",
  name: { ja: "費目マスタ", en: "Expense Master" },
  category: "master",
  description: {
    ja: "費目（原材料、電力費、労務費等）のマスタシート",
    en: "Master sheet for expense items",
  },
  isFavorite: false,
  defaultRowCount: 14,
  columns: [
    {
      field: "code",
      headerName: { ja: "費目コード", en: "Expense Code" },
      type: { type: "text" },
      validations: [{ type: "required" }],
      width: 130,
      align: "center",
    },
    {
      field: "name",
      headerName: { ja: "費目名称", en: "Expense Name" },
      type: { type: "text" },
      validations: [{ type: "required" }],
      width: 200,
      align: "left",
    },
  ],
};

export const officeTemplate: SheetTemplateRaw = {
  id: "office-master",
  name: { ja: "事業所", en: "Office" },
  category: "master",
  description: {
    ja: "全国事業所のマスタシート",
    en: "Master sheet for nationwide offices and facilities",
  },
  isFavorite: false,
  defaultRowCount: 47,
  columns: [
    {
      field: "code",
      headerName: { ja: "事業所コード", en: "Office Code" },
      type: { type: "text" },
      validations: [{ type: "required" }, { type: "alphanumeric" }],
      width: 140,
      align: "left",
    },
    {
      field: "name",
      headerName: { ja: "事業所名", en: "Office Name" },
      type: { type: "text" },
      validations: [{ type: "required" }],
      width: 220,
      align: "left",
    },
  ],
};

export const costDepartmentTemplate: SheetTemplateRaw = {
  id: "cost-department-master",
  name: { ja: "原価部門マスタ", en: "Cost Department Master" },
  category: "master",
  description: {
    ja: "原価部門および製造課のマスタシート",
    en: "Master sheet for cost departments and manufacturing sections",
  },
  isFavorite: false,
  defaultRowCount: 11,
  columns: [
    {
      field: "office_code",
      headerName: { ja: "事業所コード", en: "Office Code" },
      type: { type: "text" },
      validations: [{ type: "required" }, { type: "alphanumeric" }],
      width: 140,
      align: "left",
    },
    {
      field: "code",
      headerName: { ja: "原価部門コード", en: "Cost Department Code" },
      type: { type: "text" },
      validations: [{ type: "required" }, { type: "alphanumeric" }],
      width: 150,
      align: "left",
    },
    {
      field: "name",
      headerName: { ja: "原価部門名", en: "Cost Department Name" },
      type: { type: "text" },
      validations: [{ type: "required" }],
      width: 220,
      align: "left",
    },
    {
      field: "category",
      headerName: { ja: "部門区分", en: "Department Classification" },
      type: { type: "text" },
      width: 140,
      align: "left",
    },
  ],
};

export const departmentCostTemplate: SheetTemplateRaw = {
  id: "department-cost",
  name: { ja: "部門原価表", en: "Department Cost Report" },
  category: "planning",
  description: {
    ja: "原価部門別の費用・原単位の実績帳票データ",
    en: "Report data for costs and unit requirements by cost department",
  },
  isFavorite: true,
  defaultRowCount: 54,
  columns: [
    {
      field: "year",
      headerName: { ja: "年度", en: "Fiscal Year" },
      type: { type: "datetime", format: "yyyy" },
      validations: [{ type: "required" }, { type: "datetime", format: "yyyy" }],
      width: 90,
      align: "center",
    },
    {
      field: "from_year_month",
      headerName: { ja: "自年月", en: "From Y/M" },
      type: { type: "datetime", format: "yyyy-MM" },
      validations: [
        { type: "required" },
        { type: "datetime", format: "yyyy-MM" },
      ],
      width: 100,
      align: "center",
    },
    {
      field: "to_year_month",
      headerName: { ja: "至年月", en: "To Y/M" },
      type: { type: "datetime", format: "yyyy-MM" },
      validations: [
        { type: "required" },
        { type: "datetime", format: "yyyy-MM" },
      ],
      width: 100,
      align: "center",
    },
    {
      field: "accounting_unit_code",
      headerName: { ja: "会計単位", en: "Accounting Unit" },
      type: {
        type: "pulldown",
        mode: "combobox",
        sourceTemplateId: "accounting-unit-master",
        sourceKeyField: "code",
        lookupFields: [
          {
            field: "accounting_unit_name",
            headerName: { ja: "会計単位名称", en: "Accounting Unit Name" },
            sourceField: "name",
          },
        ],
      },
      validations: [{ type: "required" }, { type: "reference" }],
      width: 120,
      align: "left",
    },
    {
      field: "accounting_unit_name",
      headerName: { ja: "会計単位名称", en: "Accounting Unit Name" },
      type: {
        type: "lookup",
        parentField: "accounting_unit_code",
        sourceTemplateId: "accounting-unit-master",
        sourceField: "name",
      },
      width: 150,
      readOnly: true,
      align: "left",
    },
    {
      field: "office_code",
      headerName: { ja: "事業所", en: "Office" },
      type: {
        type: "pulldown",
        mode: "combobox",
        sourceTemplateId: "office-master",
        sourceKeyField: "code",
        lookupFields: [
          {
            field: "office_name",
            headerName: { ja: "事業所名称", en: "Office Name" },
            sourceField: "name",
          },
        ],
      },
      validations: [{ type: "required" }, { type: "reference" }],
      width: 100,
      align: "left",
    },
    {
      field: "office_name",
      headerName: { ja: "事業所名称", en: "Office Name" },
      type: {
        type: "lookup",
        parentField: "office_code",
        sourceTemplateId: "office-master",
        sourceField: "name",
      },
      width: 130,
      readOnly: true,
      align: "left",
    },
    {
      field: "cost_dept_code",
      headerName: { ja: "原価部門", en: "Cost Department" },
      type: {
        type: "pulldown",
        mode: "combobox",
        sourceTemplateId: "cost-department-master",
        sourceKeyField: "code",
        relation: {
          parentField: "office_code",
          targetSheetId: "cost-department-master",
          sourceFilterField: "office_code",
        },
        lookupFields: [
          {
            field: "cost_dept_name",
            headerName: { ja: "原価部門名称", en: "Cost Department Name" },
            sourceField: "name",
          },
        ],
      },
      validations: [{ type: "required" }, { type: "reference" }],
      width: 120,
      align: "left",
    },
    {
      field: "cost_dept_name",
      headerName: { ja: "原価部門名称", en: "Cost Department Name" },
      type: {
        type: "lookup",
        parentField: "cost_dept_code",
        sourceTemplateId: "cost-department-master",
        sourceField: "name",
      },
      width: 160,
      readOnly: true,
      align: "left",
    },
    {
      field: "production_volume",
      headerName: { ja: "生産量", en: "Production Volume" },
      type: { type: "number", format: "decimal" },
      width: 120,
      align: "right",
    },
    {
      field: "unit",
      headerName: { ja: "単位", en: "Unit" },
      type: {
        type: "pulldown",
        mode: "combobox",
        sourceTemplateId: "unit-master",
        sourceKeyField: "code",
        lookupFields: [
          {
            field: "unit_name",
            headerName: { ja: "単位名称", en: "Unit Name" },
            sourceField: "name",
          },
        ],
      },
      validations: [{ type: "required" }, { type: "reference" }],
      width: 80,
      align: "center",
    },
    {
      field: "unit_name",
      headerName: { ja: "単位名称", en: "Unit Name" },
      type: {
        type: "lookup",
        parentField: "unit",
        sourceTemplateId: "unit-master",
        sourceField: "name",
      },
      width: 90,
      readOnly: true,
      align: "center",
    },
    {
      field: "yield_rate",
      headerName: { ja: "歩留", en: "Yield Rate" },
      type: { type: "number", format: "decimal" },
      width: 80,
      align: "right",
    },
    {
      field: "cost_classification_code",
      headerName: { ja: "費用区分", en: "Cost Classification" },
      type: {
        type: "pulldown",
        mode: "combobox",
        sourceTemplateId: "cost-classification-master",
        sourceKeyField: "code",
        lookupFields: [
          {
            field: "cost_classification_name",
            headerName: { ja: "費用区分名称", en: "Cost Classification Name" },
            sourceField: "name",
          },
        ],
      },
      validations: [{ type: "required" }, { type: "reference" }],
      width: 90,
      align: "center",
    },
    {
      field: "cost_classification_name",
      headerName: { ja: "費用区分名称", en: "Cost Classification Name" },
      type: {
        type: "lookup",
        parentField: "cost_classification_code",
        sourceTemplateId: "cost-classification-master",
        sourceField: "name",
      },
      width: 120,
      readOnly: true,
      align: "left",
    },
    {
      field: "major_expense_code",
      headerName: { ja: "大費目", en: "Major Expense" },
      type: {
        type: "pulldown",
        mode: "combobox",
        sourceTemplateId: "major-expense-master",
        sourceKeyField: "code",
        lookupFields: [
          {
            field: "major_expense_name",
            headerName: { ja: "大費目名称", en: "Major Expense Name" },
            sourceField: "name",
          },
        ],
      },
      validations: [{ type: "required" }, { type: "reference" }],
      width: 90,
      align: "center",
    },
    {
      field: "major_expense_name",
      headerName: { ja: "大費目名称", en: "Major Expense Name" },
      type: {
        type: "lookup",
        parentField: "major_expense_code",
        sourceTemplateId: "major-expense-master",
        sourceField: "name",
      },
      width: 150,
      readOnly: true,
      align: "left",
    },
    {
      field: "expense_code",
      headerName: { ja: "費目", en: "Expense" },
      type: {
        type: "pulldown",
        mode: "combobox",
        sourceTemplateId: "expense-master",
        sourceKeyField: "code",
        lookupFields: [
          {
            field: "expense_name",
            headerName: { ja: "費目名称", en: "Expense Name" },
            sourceField: "name",
          },
        ],
      },
      validations: [{ type: "required" }, { type: "reference" }],
      width: 90,
      align: "center",
    },
    {
      field: "expense_name",
      headerName: { ja: "費目名称", en: "Expense Name" },
      type: {
        type: "lookup",
        parentField: "expense_code",
        sourceTemplateId: "expense-master",
        sourceField: "name",
      },
      width: 160,
      readOnly: true,
      align: "left",
    },
    {
      field: "quantity",
      headerName: { ja: "数量", en: "Quantity" },
      type: { type: "number", format: "decimal" },
      width: 130,
      align: "right",
    },
    {
      field: "unit_price",
      headerName: { ja: "単価", en: "Unit Price" },
      type: { type: "number", format: "decimal" },
      width: 100,
      align: "right",
    },
    {
      field: "amount",
      headerName: { ja: "金額", en: "Amount" },
      type: { type: "number", format: "integer" },
      width: 120,
      align: "right",
    },
    {
      field: "unit_consumption",
      headerName: { ja: "原単位", en: "Unit Consumption" },
      type: { type: "number", format: "decimal" },
      width: 120,
      align: "right",
    },
    {
      field: "cost_per_unit",
      headerName: { ja: "原単価", en: "Unit Cost" },
      type: { type: "number", format: "decimal" },
      width: 100,
      align: "right",
    },
  ],
};

export const accountCategoryTemplate: SheetTemplateRaw = {
  id: "account-category-master",
  name: { ja: "勘定区分マスタ", en: "Account Category Master" },
  category: "master",
  description: {
    ja: "原材料、部品等の勘定区分マスタ",
    en: "Account category master for raw materials, parts, etc.",
  },
  isFavorite: false,
  defaultRowCount: 2,
  columns: [
    {
      field: "code",
      headerName: { ja: "勘定区分コード", en: "Account Category Code" },
      type: { type: "text" },
      validations: [{ type: "required" }],
      width: 120,
      align: "center",
    },
    {
      field: "name",
      headerName: { ja: "勘定区分名称", en: "Account Category Name" },
      type: { type: "text" },
      validations: [{ type: "required" }],
      width: 160,
      align: "left",
    },
  ],
};

export const receiptDepartmentTemplate: SheetTemplateRaw = {
  id: "receipt-department-master",
  name: { ja: "受払部門マスタ", en: "Receipt/Payment Department Master" },
  category: "master",
  description: {
    ja: "受払部門のマスタシート",
    en: "Master sheet for receipt/payment departments",
  },
  isFavorite: false,
  defaultRowCount: 4,
  columns: [
    {
      field: "code",
      headerName: { ja: "受払部門コード", en: "Receipt/Payment Dept Code" },
      type: { type: "text" },
      validations: [{ type: "required" }],
      width: 120,
      align: "center",
    },
    {
      field: "name",
      headerName: { ja: "受払部門名称", en: "Receipt/Payment Dept Name" },
      type: { type: "text" },
      validations: [{ type: "required" }],
      width: 180,
      align: "left",
    },
  ],
};

export const costStandardTemplate: SheetTemplateRaw = {
  id: "cost-standard-master",
  name: { ja: "原価規格マスタ", en: "Cost Standard Master" },
  category: "master",
  description: {
    ja: "ペレット、部品等の原価規格マスタシート",
    en: "Cost standard master sheet for pellets, parts, etc.",
  },
  isFavorite: false,
  defaultRowCount: 50,
  columns: [
    {
      field: "code",
      headerName: { ja: "原価規格コード", en: "Cost Standard Code" },
      type: { type: "text" },
      validations: [{ type: "required" }],
      width: 120,
      align: "center",
    },
    {
      field: "name",
      headerName: { ja: "原価規格名称", en: "Cost Standard Name" },
      type: { type: "text" },
      validations: [{ type: "required" }],
      width: 180,
      align: "left",
    },
  ],
};

export const receiptPaymentCategoryTemplate: SheetTemplateRaw = {
  id: "receipt-payment-category-master",
  name: { ja: "受払区分マスタ", en: "Receipt/Payment Category Master" },
  category: "master",
  description: {
    ja: "前月残高、受入、払出、当月残高等の受払区分マスタ",
    en: "Receipt/payment category master (beginning balance, receipts, issues, ending balance)",
  },
  isFavorite: false,
  defaultRowCount: 4,
  columns: [
    {
      field: "code",
      headerName: { ja: "受払区分コード", en: "Receipt/Payment Category Code" },
      type: { type: "text" },
      validations: [{ type: "required" }],
      width: 120,
      align: "center",
    },
    {
      field: "name",
      headerName: { ja: "受払区分名称", en: "Receipt/Payment Category Name" },
      type: { type: "text" },
      validations: [{ type: "required" }],
      width: 160,
      align: "left",
    },
  ],
};

export const receiptPaymentItemTemplate: SheetTemplateRaw = {
  id: "receipt-payment-item-master",
  name: { ja: "受払項目マスタ", en: "Receipt/Payment Item Master" },
  category: "master",
  description: {
    ja: "購入、仕掛品へ払出等の受払項目マスタ",
    en: "Receipt/payment item master (purchases, transfers to WIP, etc.)",
  },
  isFavorite: false,
  defaultRowCount: 10,
  columns: [
    {
      field: "code",
      headerName: { ja: "受払項目コード", en: "Receipt/Payment Item Code" },
      type: { type: "text" },
      validations: [{ type: "required" }],
      width: 120,
      align: "center",
    },
    {
      field: "name",
      headerName: { ja: "受払項目名称", en: "Receipt/Payment Item Name" },
      type: { type: "text" },
      validations: [{ type: "required" }],
      width: 180,
      align: "left",
    },
  ],
};

export const receiptPaymentTemplate: SheetTemplateRaw = {
  id: "receipt-payment-info",
  name: { ja: "受払情報", en: "Receipt/Payment Information" },
  category: "planning",
  description: {
    ja: "原材料・部品等の受払実績および小計照会シート",
    en: "Receipt/payment actuals and subtotal inquiry sheet",
  },
  isFavorite: true,
  defaultRowCount: 140,
  subtotalConfig: {
    enabled: true,
    groupByKeys: [
      "year",
      "year_month",
      "accounting_unit_code",
      "office_code",
      "account_category_code",
      "department_code",
      "cost_standard_code",
      "receipt_payment_category_code",
    ],
    labelField: "receipt_payment_item_name",
    labelPattern: { ja: "（計）", en: "(Subtotal)" },
    aggregations: {
      quantity: "sum",
      moving_average_cost_amount: "sum",
      amount: "sum",
      variable_cost_amount: "sum",
    },
  },
  columns: [
    {
      field: "year",
      headerName: { ja: "年度", en: "Fiscal Year" },
      type: { type: "datetime", format: "yyyy" },
      validations: [{ type: "required" }, { type: "datetime", format: "yyyy" }],
      width: 80,
      align: "center",
    },
    {
      field: "year_month",
      headerName: { ja: "年月", en: "Year/Month" },
      type: { type: "datetime", format: "yyyy-MM" },
      validations: [
        { type: "required" },
        { type: "datetime", format: "yyyy-MM" },
      ],
      width: 90,
      align: "center",
    },
    {
      field: "accounting_unit_code",
      headerName: { ja: "会計単位", en: "Accounting Unit" },
      type: {
        type: "pulldown",
        mode: "combobox",
        sourceTemplateId: "accounting-unit-master",
        sourceKeyField: "code",
        lookupFields: [
          {
            field: "accounting_unit_name",
            headerName: { ja: "会計単位名", en: "Accounting Unit Name" },
            sourceField: "name",
          },
        ],
      },
      validations: [{ type: "required" }, { type: "reference" }],
      width: 85,
      align: "center",
    },
    {
      field: "accounting_unit_name",
      headerName: { ja: "会計単位名", en: "Accounting Unit Name" },
      type: {
        type: "lookup",
        parentField: "accounting_unit_code",
        sourceTemplateId: "accounting-unit-master",
        sourceField: "name",
      },
      width: 120,
      readOnly: true,
      align: "left",
    },
    {
      field: "office_code",
      headerName: { ja: "事業所", en: "Office" },
      type: {
        type: "pulldown",
        mode: "combobox",
        sourceTemplateId: "office-master",
        sourceKeyField: "code",
        lookupFields: [
          {
            field: "office_name",
            headerName: { ja: "事業所名称", en: "Office Name" },
            sourceField: "name",
          },
        ],
      },
      validations: [{ type: "required" }, { type: "reference" }],
      width: 75,
      align: "center",
    },
    {
      field: "office_name",
      headerName: { ja: "事業所名称", en: "Office Name" },
      type: {
        type: "lookup",
        parentField: "office_code",
        sourceTemplateId: "office-master",
        sourceField: "name",
      },
      width: 110,
      readOnly: true,
      align: "left",
    },
    {
      field: "account_category_code",
      headerName: { ja: "勘定区分", en: "Account Category" },
      type: {
        type: "pulldown",
        mode: "combobox",
        sourceTemplateId: "account-category-master",
        sourceKeyField: "code",
        lookupFields: [
          {
            field: "account_category_name",
            headerName: { ja: "勘定区分名", en: "Account Category Name" },
            sourceField: "name",
          },
        ],
      },
      validations: [{ type: "required" }, { type: "reference" }],
      width: 80,
      align: "center",
    },
    {
      field: "account_category_name",
      headerName: { ja: "勘定区分名", en: "Account Category Name" },
      type: {
        type: "lookup",
        parentField: "account_category_code",
        sourceTemplateId: "account-category-master",
        sourceField: "name",
      },
      width: 100,
      readOnly: true,
      align: "left",
    },
    {
      field: "department_code",
      headerName: { ja: "受払部門", en: "Receipt/Payment Dept" },
      type: {
        type: "pulldown",
        mode: "combobox",
        sourceTemplateId: "receipt-department-master",
        sourceKeyField: "code",
        lookupFields: [
          {
            field: "department_name",
            headerName: { ja: "受払部門名", en: "Receipt/Payment Dept Name" },
            sourceField: "name",
          },
        ],
      },
      validations: [{ type: "required" }, { type: "reference" }],
      width: 90,
      align: "center",
    },
    {
      field: "department_name",
      headerName: { ja: "受払部門名", en: "Receipt/Payment Dept Name" },
      type: {
        type: "lookup",
        parentField: "department_code",
        sourceTemplateId: "receipt-department-master",
        sourceField: "name",
      },
      width: 130,
      readOnly: true,
      align: "left",
    },
    {
      field: "cost_standard_code",
      headerName: { ja: "原価規格", en: "Cost Standard" },
      type: {
        type: "pulldown",
        mode: "combobox",
        sourceTemplateId: "cost-standard-master",
        sourceKeyField: "code",
        lookupFields: [
          {
            field: "cost_standard_name",
            headerName: { ja: "原価規格名", en: "Cost Standard Name" },
            sourceField: "name",
          },
        ],
      },
      validations: [{ type: "required" }, { type: "reference" }],
      width: 90,
      align: "center",
    },
    {
      field: "cost_standard_name",
      headerName: { ja: "原価規格名", en: "Cost Standard Name" },
      type: {
        type: "lookup",
        parentField: "cost_standard_code",
        sourceTemplateId: "cost-standard-master",
        sourceField: "name",
      },
      width: 130,
      readOnly: true,
      align: "left",
    },
    {
      field: "receipt_payment_category_code",
      headerName: { ja: "受払区分", en: "Receipt/Payment Category" },
      type: {
        type: "pulldown",
        mode: "combobox",
        sourceTemplateId: "receipt-payment-category-master",
        sourceKeyField: "code",
        lookupFields: [
          {
            field: "receipt_payment_category_name",
            headerName: {
              ja: "受払区分名",
              en: "Receipt/Payment Category Name",
            },
            sourceField: "name",
          },
        ],
      },
      validations: [{ type: "required" }, { type: "reference" }],
      width: 80,
      align: "center",
    },
    {
      field: "receipt_payment_category_name",
      headerName: { ja: "受払区分名", en: "Receipt/Payment Category Name" },
      type: {
        type: "lookup",
        parentField: "receipt_payment_category_code",
        sourceTemplateId: "receipt-payment-category-master",
        sourceField: "name",
      },
      width: 95,
      readOnly: true,
      align: "left",
    },
    {
      field: "receipt_payment_item_code",
      headerName: { ja: "受払項目", en: "Receipt/Payment Item" },
      type: {
        type: "pulldown",
        mode: "combobox",
        sourceTemplateId: "receipt-payment-item-master",
        sourceKeyField: "code",
        lookupFields: [
          {
            field: "receipt_payment_item_name",
            headerName: { ja: "受払項目名", en: "Receipt/Payment Item Name" },
            sourceField: "name",
          },
        ],
      },
      validations: [{ type: "required" }, { type: "reference" }],
      width: 85,
      align: "center",
    },
    {
      field: "receipt_payment_item_name",
      headerName: { ja: "受払項目名", en: "Receipt/Payment Item Name" },
      type: {
        type: "lookup",
        parentField: "receipt_payment_item_code",
        sourceTemplateId: "receipt-payment-item-master",
        sourceField: "name",
      },
      width: 120,
      readOnly: true,
      align: "left",
    },
    {
      field: "quantity",
      headerName: { ja: "数量", en: "Quantity" },
      type: { type: "number", format: "decimal" },
      width: 130,
      align: "right",
    },
    {
      field: "unit_code",
      headerName: { ja: "単位", en: "Unit" },
      type: {
        type: "pulldown",
        mode: "combobox",
        sourceTemplateId: "unit-master",
        sourceKeyField: "code",
        lookupFields: [
          {
            field: "unit_name",
            headerName: { ja: "単位名", en: "Unit Name" },
            sourceField: "name",
          },
        ],
      },
      validations: [{ type: "required" }, { type: "reference" }],
      width: 65,
      align: "center",
    },
    {
      field: "unit_name",
      headerName: { ja: "単位名", en: "Unit Name" },
      type: {
        type: "lookup",
        parentField: "unit_code",
        sourceTemplateId: "unit-master",
        sourceField: "name",
      },
      width: 85,
      readOnly: true,
      align: "left",
    },
    {
      field: "moving_average_cost",
      headerName: { ja: "移動平均原価", en: "Moving Avg Cost" },
      type: { type: "number", format: "decimal" },
      width: 110,
      align: "right",
    },
    {
      field: "unit_price",
      headerName: { ja: "単価", en: "Unit Price" },
      type: { type: "number", format: "decimal" },
      width: 90,
      align: "right",
    },
    {
      field: "moving_average_cost_amount",
      headerName: { ja: "移動平均原価金額", en: "Moving Avg Cost Amount" },
      type: { type: "number", format: "integer" },
      width: 140,
      align: "right",
    },
    {
      field: "amount",
      headerName: { ja: "金額", en: "Amount" },
      type: { type: "number", format: "integer" },
      width: 120,
      align: "right",
    },
    {
      field: "variable_cost_unit_price",
      headerName: { ja: "変動費単価", en: "Variable Cost Unit Price" },
      type: { type: "number", format: "decimal" },
      width: 100,
      align: "right",
    },
    {
      field: "variable_cost_amount",
      headerName: { ja: "変動費金額", en: "Variable Cost Amount" },
      type: { type: "number", format: "integer" },
      width: 120,
      align: "right",
    },
    {
      field: "counterpart_accounting_unit_code",
      headerName: { ja: "相手会計単位", en: "Counterpart Accounting Unit" },
      type: {
        type: "pulldown",
        mode: "combobox",
        sourceTemplateId: "accounting-unit-master",
        sourceKeyField: "code",
        lookupFields: [
          {
            field: "counterpart_accounting_unit_name",
            headerName: {
              ja: "相手会計単位名",
              en: "Counterpart Accounting Unit Name",
            },
            sourceField: "name",
          },
        ],
      },
      width: 100,
      align: "center",
    },
    {
      field: "counterpart_accounting_unit_name",
      headerName: {
        ja: "相手会計単位名",
        en: "Counterpart Accounting Unit Name",
      },
      type: {
        type: "lookup",
        parentField: "counterpart_accounting_unit_code",
        sourceTemplateId: "accounting-unit-master",
        sourceField: "name",
      },
      width: 120,
      readOnly: true,
      align: "left",
    },
  ],
};

export const MOCK_SHEET_TEMPLATES: Record<string, SheetTemplateRaw> = {
  [productionVolumeTemplate.id]: productionVolumeTemplate,
  [accountingUnitTemplate.id]: accountingUnitTemplate,
  [officeTemplate.id]: officeTemplate,
  [costDepartmentTemplate.id]: costDepartmentTemplate,
  [unitTemplate.id]: unitTemplate,
  [costClassificationTemplate.id]: costClassificationTemplate,
  [majorExpenseTemplate.id]: majorExpenseTemplate,
  [expenseTemplate.id]: expenseTemplate,
  [departmentCostTemplate.id]: departmentCostTemplate,
  [accountCategoryTemplate.id]: accountCategoryTemplate,
  [receiptDepartmentTemplate.id]: receiptDepartmentTemplate,
  [costStandardTemplate.id]: costStandardTemplate,
  [receiptPaymentCategoryTemplate.id]: receiptPaymentCategoryTemplate,
  [receiptPaymentItemTemplate.id]: receiptPaymentItemTemplate,
  [receiptPaymentTemplate.id]: receiptPaymentTemplate,
};

export const MOCK_INITIAL_OPEN_SHEET_IDS: string[] = [
  receiptPaymentTemplate.id,
  departmentCostTemplate.id,
];

export const MOCK_FAVORITE_SHEET_IDS: string[] = Object.values(
  MOCK_SHEET_TEMPLATES,
)
  .filter((template) => template.isFavorite)
  .map((template) => template.id);
