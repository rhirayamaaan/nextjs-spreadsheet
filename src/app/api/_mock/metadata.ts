import type { SheetCategory, SheetTemplate } from "@/features/workbook/stores";

export const MOCK_SHEET_CATEGORIES: SheetCategory[] = [
  {
    id: "planning",
    name: "計画・実績",
    description: "生産量や各種計画・実績データの管理",
  },
  {
    id: "master",
    name: "マスタ管理",
    description: "会計単位、事業所、原価部門などの各種マスタデータ",
  },
];

export const productionVolumeTemplate: SheetTemplate = {
  id: "production-volume",
  name: "生産量登録",
  category: "planning",
  description: "生産量および上がり数量の実績・計画登録シート",
  isFavorite: true,
  defaultRowCount: 10000,
  columns: [
    {
      field: "type",
      headerName: "タイプ",
      type: { type: "text" },
      validations: [{ type: "required" }, { type: "string" }],
      width: 120,
      align: "left",
    },
    {
      field: "category",
      headerName: "データ種別",
      type: { type: "text" },
      validations: [{ type: "required" }],
      width: 140,
      align: "left",
    },
    {
      field: "year",
      headerName: "年度",
      type: { type: "datetime", format: "yyyy" },
      validations: [{ type: "required" }, { type: "datetime", format: "yyyy" }],
      width: 100,
      align: "center",
    },
    {
      field: "month",
      headerName: "対象月",
      type: { type: "datetime", format: "MM" },
      validations: [{ type: "required" }, { type: "datetime", format: "MM" }],
      width: 90,
      align: "center",
    },
    {
      field: "production_year_month",
      headerName: "生産年月",
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
      headerName: "生産日",
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
      headerName: "生産日時",
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
      headerName: "会計単位",
      type: {
        type: "pulldown",
        mode: "combobox",
        sourceTemplateId: "accounting-unit-master",
        sourceKeyField: "code",
        lookupFields: [
          {
            field: "accounting_unit_name",
            headerName: "会計単位名",
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
      headerName: "会計単位名",
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
      headerName: "事業所",
      type: {
        type: "pulldown",
        mode: "combobox",
        sourceTemplateId: "office-master",
        sourceKeyField: "code",
        lookupFields: [
          {
            field: "office_name",
            headerName: "事業所名",
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
      headerName: "事業所名",
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
      headerName: "原価部門",
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
            headerName: "原価部門名",
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
      headerName: "原価部門名",
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
      headerName: "原価規格",
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
      headerName: "生産量",
      type: { type: "number", format: "integer" },
      validations: [{ type: "required" }, { type: "number" }],
      width: 140,
      hasTotal: true,
      align: "right",
    },
    {
      field: "yield_volume",
      headerName: "上がり数量",
      type: { type: "number", format: "integer" },
      validations: [{ type: "number" }],
      width: 140,
      hasTotal: true,
      align: "right",
    },
  ],
};

export const accountingUnitTemplate: SheetTemplate = {
  id: "accounting-unit-master",
  name: "会計単位",
  category: "master",
  description: "会計単位（部署・部門）のマスタシート",
  isFavorite: false,
  defaultRowCount: 11,
  columns: [
    {
      field: "code",
      headerName: "会計単位コード",
      type: { type: "text" },
      validations: [{ type: "required" }, { type: "alphanumeric" }],
      width: 160,
      align: "left",
    },
    {
      field: "name",
      headerName: "会計単位名",
      type: { type: "text" },
      validations: [{ type: "required" }],
      width: 240,
      align: "left",
    },
  ],
};

export const unitTemplate: SheetTemplate = {
  id: "unit-master",
  name: "単位マスタ",
  category: "master",
  description: "数量等の単位（PCS, KG, L等）のマスタシート",
  isFavorite: false,
  defaultRowCount: 4,
  columns: [
    {
      field: "code",
      headerName: "単位コード",
      type: { type: "text" },
      validations: [{ type: "required" }],
      width: 120,
      align: "center",
    },
    {
      field: "name",
      headerName: "単位名称",
      type: { type: "text" },
      validations: [{ type: "required" }],
      width: 160,
      align: "left",
    },
  ],
};

export const costClassificationTemplate: SheetTemplate = {
  id: "cost-classification-master",
  name: "費用区分マスタ",
  category: "master",
  description: "費用区分（材料費、変動費、固定費）のマスタシート",
  isFavorite: false,
  defaultRowCount: 3,
  columns: [
    {
      field: "code",
      headerName: "費用区分コード",
      type: { type: "text" },
      validations: [{ type: "required" }],
      width: 140,
      align: "center",
    },
    {
      field: "name",
      headerName: "費用区分名称",
      type: { type: "text" },
      validations: [{ type: "required" }],
      width: 180,
      align: "left",
    },
  ],
};

export const majorExpenseTemplate: SheetTemplate = {
  id: "major-expense-master",
  name: "大費目マスタ",
  category: "master",
  description: "大費目（原材料費、水道光熱費、労務費等）のマスタシート",
  isFavorite: false,
  defaultRowCount: 10,
  columns: [
    {
      field: "code",
      headerName: "大費目コード",
      type: { type: "text" },
      validations: [{ type: "required" }],
      width: 130,
      align: "center",
    },
    {
      field: "name",
      headerName: "大費目名称",
      type: { type: "text" },
      validations: [{ type: "required" }],
      width: 200,
      align: "left",
    },
  ],
};

export const expenseTemplate: SheetTemplate = {
  id: "expense-master",
  name: "費目マスタ",
  category: "master",
  description: "費目（原材料、電力費、労務費等）のマスタシート",
  isFavorite: false,
  defaultRowCount: 14,
  columns: [
    {
      field: "code",
      headerName: "費目コード",
      type: { type: "text" },
      validations: [{ type: "required" }],
      width: 130,
      align: "center",
    },
    {
      field: "name",
      headerName: "費目名称",
      type: { type: "text" },
      validations: [{ type: "required" }],
      width: 200,
      align: "left",
    },
  ],
};

export const officeTemplate: SheetTemplate = {
  id: "office-master",
  name: "事業所",
  category: "master",
  description: "全国事業所のマスタシート",
  isFavorite: false,
  defaultRowCount: 47,
  columns: [
    {
      field: "code",
      headerName: "事業所コード",
      type: { type: "text" },
      validations: [{ type: "required" }, { type: "alphanumeric" }],
      width: 140,
      align: "left",
    },
    {
      field: "name",
      headerName: "事業所名",
      type: { type: "text" },
      validations: [{ type: "required" }],
      width: 220,
      align: "left",
    },
  ],
};

export const costDepartmentTemplate: SheetTemplate = {
  id: "cost-department-master",
  name: "原価部門マスタ",
  category: "master",
  description: "原価部門および製造課のマスタシート",
  isFavorite: false,
  defaultRowCount: 11,
  columns: [
    {
      field: "office_code",
      headerName: "事業所コード",
      type: { type: "text" },
      validations: [{ type: "required" }, { type: "alphanumeric" }],
      width: 140,
      align: "left",
    },
    {
      field: "code",
      headerName: "原価部門コード",
      type: { type: "text" },
      validations: [{ type: "required" }, { type: "alphanumeric" }],
      width: 150,
      align: "left",
    },
    {
      field: "name",
      headerName: "原価部門名",
      type: { type: "text" },
      validations: [{ type: "required" }],
      width: 220,
      align: "left",
    },
    {
      field: "category",
      headerName: "部門区分",
      type: { type: "text" },
      width: 140,
      align: "left",
    },
  ],
};

export const departmentCostTemplate: SheetTemplate = {
  id: "department-cost",
  name: "部門原価表",
  category: "planning",
  description: "原価部門別の費用・原単位の実績帳票データ",
  isFavorite: true,
  defaultRowCount: 54,
  columns: [
    {
      field: "year",
      headerName: "年度",
      type: { type: "datetime", format: "yyyy" },
      validations: [{ type: "required" }, { type: "datetime", format: "yyyy" }],
      width: 90,
      align: "center",
    },
    {
      field: "from_year_month",
      headerName: "自年月",
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
      headerName: "至年月",
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
      headerName: "会計単位",
      type: {
        type: "pulldown",
        mode: "combobox",
        sourceTemplateId: "accounting-unit-master",
        sourceKeyField: "code",
        lookupFields: [
          {
            field: "accounting_unit_name",
            headerName: "会計単位名称",
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
      headerName: "会計単位名称",
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
      headerName: "事業所",
      type: {
        type: "pulldown",
        mode: "combobox",
        sourceTemplateId: "office-master",
        sourceKeyField: "code",
        lookupFields: [
          {
            field: "office_name",
            headerName: "事業所名称",
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
      headerName: "事業所名称",
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
      headerName: "原価部門",
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
            headerName: "原価部門名称",
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
      headerName: "原価部門名称",
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
      headerName: "生産量",
      type: { type: "number", format: "decimal" },
      width: 120,
      align: "right",
    },
    {
      field: "unit",
      headerName: "単位",
      type: {
        type: "pulldown",
        mode: "combobox",
        sourceTemplateId: "unit-master",
        sourceKeyField: "code",
        lookupFields: [
          {
            field: "unit_name",
            headerName: "単位名称",
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
      headerName: "単位名称",
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
      headerName: "歩留",
      type: { type: "number", format: "decimal" },
      width: 80,
      align: "right",
    },
    {
      field: "cost_classification_code",
      headerName: "費用区分",
      type: {
        type: "pulldown",
        mode: "combobox",
        sourceTemplateId: "cost-classification-master",
        sourceKeyField: "code",
        lookupFields: [
          {
            field: "cost_classification_name",
            headerName: "費用区分名称",
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
      headerName: "費用区分名称",
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
      headerName: "大費目",
      type: {
        type: "pulldown",
        mode: "combobox",
        sourceTemplateId: "major-expense-master",
        sourceKeyField: "code",
        lookupFields: [
          {
            field: "major_expense_name",
            headerName: "大費目名称",
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
      headerName: "大費目名称",
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
      headerName: "費目",
      type: {
        type: "pulldown",
        mode: "combobox",
        sourceTemplateId: "expense-master",
        sourceKeyField: "code",
        lookupFields: [
          {
            field: "expense_name",
            headerName: "費目名称",
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
      headerName: "費目名称",
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
      headerName: "数量",
      type: { type: "number", format: "decimal" },
      width: 130,
      align: "right",
    },
    {
      field: "unit_price",
      headerName: "単価",
      type: { type: "number", format: "decimal" },
      width: 100,
      align: "right",
    },
    {
      field: "amount",
      headerName: "金額",
      type: { type: "number", format: "integer" },
      width: 120,
      align: "right",
    },
    {
      field: "unit_consumption",
      headerName: "原単位",
      type: { type: "number", format: "decimal" },
      width: 120,
      align: "right",
    },
    {
      field: "cost_per_unit",
      headerName: "原単価",
      type: { type: "number", format: "decimal" },
      width: 100,
      align: "right",
    },
  ],
};

export const MOCK_SHEET_TEMPLATES: Record<string, SheetTemplate> = {
  [productionVolumeTemplate.id]: productionVolumeTemplate,
  [accountingUnitTemplate.id]: accountingUnitTemplate,
  [officeTemplate.id]: officeTemplate,
  [costDepartmentTemplate.id]: costDepartmentTemplate,
  [unitTemplate.id]: unitTemplate,
  [costClassificationTemplate.id]: costClassificationTemplate,
  [majorExpenseTemplate.id]: majorExpenseTemplate,
  [expenseTemplate.id]: expenseTemplate,
  [departmentCostTemplate.id]: departmentCostTemplate,
};

export const MOCK_INITIAL_OPEN_SHEET_IDS: string[] = [
  departmentCostTemplate.id,
];

export const MOCK_FAVORITE_SHEET_IDS: string[] = Object.values(
  MOCK_SHEET_TEMPLATES,
)
  .filter((template) => template.isFavorite)
  .map((template) => template.id);
