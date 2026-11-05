import { NextResponse } from "next/server";
import type { ReportLayoutRaw } from "@/features/workbook/services/reportLayout/reportLayout.types";

export const dynamic = "force-dynamic";

export const departmentCostReportLayout: ReportLayoutRaw = {
  id: "department-cost-report",
  sheetId: "department-cost",
  name: { ja: "部門原価表", en: "Department Cost Report" },
  paper: {
    size: "A4",
    orientation: "portrait",
    marginsMm: {
      top: 10,
      right: 10,
      bottom: 10,
      left: 10,
    },
  },
  requiredSingleFilters: [
    "accounting_unit_code",
    "office_code",
    "cost_dept_code",
  ],
  header: {
    title: { ja: "部門原価表", en: "Department Cost Report" },
    subtitleTemplate: {
      ja: "（ 実績デモ 実績原価計算 {year}年度 {from_month}月〜{to_month}月 ）",
      en: "( Actual Demo Cost Calculation FY{year} {from_month} - {to_month} )",
    },
    metaSections: {
      left: [
        {
          label: { ja: "会計単位", en: "Accounting Unit" },
          field: "accounting_unit_full",
        },
        { label: { ja: "事業所", en: "Office" }, field: "office_full" },
        {
          label: { ja: "原価部門", en: "Cost Department" },
          field: "cost_dept_full",
        },
      ],
      right: [
        {
          label: { ja: "金額", en: "Currency" },
          text: { ja: "円", en: "JPY" },
        },
      ],
      summaryBox: {
        items: [
          {
            label: { ja: "生産量", en: "Production Vol" },
            field: "production_volume",
            format: "decimal4",
          },
          {
            label: { ja: "歩留", en: "Yield Rate" },
            field: "yield_rate",
            format: "percentage",
          },
        ],
      },
    },
  },
  design: {
    theme: {
      colors: {
        text: "#1e1e1e",
        mutedText: "#323232",
        borderColor: "#dcdcdc",
        tableHeaderFill: "#cdcdcd",
        tableHeaderText: "#141414",
        subtotalLevel1Fill: "#ebebeb",
        subtotalLevel2Fill: "#f4f4f4",
        summaryBoxFill: "#d7d7d7",
      },
      typography: {
        titleFontSize: 14,
        subtitleFontSize: 9,
        metaFontSize: 8.5,
        tableHeaderFontSize: 8.5,
        tableBodyFontSize: 8.5,
        pageFooterFontSize: 8,
      },
      table: {
        startY: 56,
        cellPaddingMm: {
          top: 1.5,
          right: 2,
          bottom: 1.5,
          left: 2,
        },
        gridLineWidthMm: 0.1,
      },
    },
    headerLayout: {
      titleY: 12,
      subtitleY: 18,
      metaLeftX: 10,
      metaLeftStartY: 25,
      metaLeftLinePitch: 5,
      metaRightX: 175,
      metaRightStartY: 25,
      metaRightLinePitch: 5,
      summaryBox: {
        x: 135,
        y: 28,
        width: 65,
      },
    },
  },
  table: {
    columns: [
      {
        id: "item_name",
        headerText: {
          ja: "費用区分\n大費目\n費目",
          en: "Classification\nMajor Exp\nExpense",
        },
        widthRatio: 2.3,
        align: "left",
        format: "string",
      },
      {
        id: "quantity",
        headerText: { ja: "数量", en: "Quantity" },
        widthRatio: 1.3,
        align: "right",
        format: "decimal4",
      },
      {
        id: "unit_price",
        headerText: { ja: "単価", en: "Unit Price" },
        widthRatio: 1.0,
        align: "right",
        format: "decimal2",
      },
      {
        id: "amount",
        headerText: { ja: "金額", en: "Amount" },
        widthRatio: 1.2,
        align: "right",
        format: "integer",
      },
      {
        id: "unit_consumption",
        headerText: { ja: "原単位", en: "Unit Consump" },
        widthRatio: 1.1,
        align: "right",
        format: "decimal6",
      },
      {
        id: "cost_per_unit",
        headerText: { ja: "原単価", en: "Unit Cost" },
        widthRatio: 1.0,
        align: "right",
        format: "decimal2",
      },
    ],
    groups: [
      {
        level: 1,
        codeField: "cost_classification_code",
        nameField: "cost_classification_name",
        subtotal: {
          enabled: true,
          // biome-ignore lint/suspicious/noTemplateCurlyInString: template placeholder
          labelPattern: { ja: "${name} 計", en: "${name} Subtotal" },
          aggregations: {
            quantity: "sum",
            unit_price: "blank",
            amount: "sum",
            unit_consumption: "blank",
            cost_per_unit: "sum",
          },
        },
      },
      {
        level: 2,
        codeField: "major_expense_code",
        nameField: "major_expense_name",
        subtotal: {
          enabled: true,
          // biome-ignore lint/suspicious/noTemplateCurlyInString: template placeholder
          labelPattern: { ja: "${name} 計", en: "${name} Subtotal" },
          aggregations: {
            quantity: "sum",
            unit_price: "blank",
            amount: "sum",
            unit_consumption: "blank",
            cost_per_unit: "sum",
          },
        },
      },
    ],
    detail: {
      nameField: "expense_name",
      fields: {
        quantity: "quantity",
        unit_price: "unit_price",
        amount: "amount",
        unit_consumption: "unit_consumption",
        cost_per_unit: "cost_per_unit",
      },
    },
  },
};

const MOCK_REPORT_LAYOUTS: Record<string, ReportLayoutRaw> = {
  "department-cost": departmentCostReportLayout,
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ sheetId: string }> },
) {
  const { sheetId } = await params;
  const layout = MOCK_REPORT_LAYOUTS[sheetId] ?? null;

  if (!layout) {
    return NextResponse.json(
      { success: false, sheetId, layout: null },
      { status: 404 },
    );
  }

  return NextResponse.json({
    success: true,
    sheetId,
    layout,
  });
}
