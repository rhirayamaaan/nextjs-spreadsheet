import type { SheetCategory, SheetTemplate } from "../stores";

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

export const officeTemplate: SheetTemplate = {
  id: "office-master",
  name: "事業所",
  category: "master",
  description: "全国事業所のマスタシート",
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

export const MOCK_SHEET_TEMPLATES: Record<string, SheetTemplate> = {
  [productionVolumeTemplate.id]: productionVolumeTemplate,
  [accountingUnitTemplate.id]: accountingUnitTemplate,
  [officeTemplate.id]: officeTemplate,
  [costDepartmentTemplate.id]: costDepartmentTemplate,
};

export const MOCK_INITIAL_OPEN_SHEET_IDS: string[] = [];
