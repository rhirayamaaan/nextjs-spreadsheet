import type { I18nString } from "@/i18n/types";
import { type Locale, resolveI18nString } from "@/i18n/types";

export interface ReportPaperConfig {
  size: "A4" | "A3" | "B5";
  orientation: "portrait" | "landscape";
  marginsMm: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

export interface ReportMetaItem {
  label: string;
  field?: string;
  text?: string;
  format?: string;
  unit?: string;
}

export interface ReportHeaderConfig {
  title: string;
  subtitleTemplate?: string;
  metaSections: {
    left: ReportMetaItem[];
    right: ReportMetaItem[];
    summaryBox?: {
      title?: string;
      items: ReportMetaItem[];
    };
  };
}

export interface ReportColumnConfig {
  id: string;
  headerText: string;
  widthRatio: number;
  align: "left" | "right" | "center";
  format?:
    | "string"
    | "integer"
    | "decimal2"
    | "decimal4"
    | "decimal6"
    | "percentage";
}

export interface ReportGroupSubtotalConfig {
  enabled: boolean;
  labelPattern: string; // e.g. "${name} 計"
  aggregations: Record<string, "sum" | "blank">;
}

export interface ReportGroupConfig {
  level: number;
  codeField: string;
  nameField: string;
  subtotal: ReportGroupSubtotalConfig;
}

export interface ReportDetailConfig {
  nameField: string;
  fields: Record<string, string>; // columnId -> dataField
}

export interface ReportTableConfig {
  columns: ReportColumnConfig[];
  groups: ReportGroupConfig[];
  detail: ReportDetailConfig;
}

export type RgbColor = [number, number, number];

export type ColorValue = string | RgbColor;

export interface ReportColorsConfig {
  text?: ColorValue;
  mutedText?: ColorValue;
  borderColor?: ColorValue;
  tableHeaderFill?: ColorValue;
  tableHeaderText?: ColorValue;
  subtotalLevel1Fill?: ColorValue;
  subtotalLevel2Fill?: ColorValue;
  summaryBoxFill?: ColorValue;
}

export interface ReportTypographyConfig {
  fontFamily?: string;
  titleFontSize?: number;
  subtitleFontSize?: number;
  metaFontSize?: number;
  tableHeaderFontSize?: number;
  tableBodyFontSize?: number;
  pageFooterFontSize?: number;
}

export interface ReportTableStyleConfig {
  startY?: number;
  cellPaddingMm?: {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
  };
  gridLineWidthMm?: number;
}

export interface ReportSummaryBoxLayoutConfig {
  x?: number;
  y?: number;
  width?: number;
}

export interface ReportHeaderLayoutConfig {
  titleY?: number;
  subtitleY?: number;
  metaLeftX?: number;
  metaLeftStartY?: number;
  metaLeftLinePitch?: number;
  metaRightX?: number;
  metaRightStartY?: number;
  metaRightLinePitch?: number;
  summaryBox?: ReportSummaryBoxLayoutConfig;
}

export interface ReportDesignConfig {
  theme?: {
    colors?: ReportColorsConfig;
    typography?: ReportTypographyConfig;
    table?: ReportTableStyleConfig;
  };
  headerLayout?: ReportHeaderLayoutConfig;
}

export interface ReportLayout {
  id: string;
  sheetId: string;
  name: string;
  paper: ReportPaperConfig;
  /**
   * 帳票出力の前提条件として、単一選択（ユニーク値が1件）に絞り込まれている必要があるフィールドの配列
   * 例: ["accounting_unit_code", "office_code", "cost_dept_code"]
   */
  requiredSingleFilters?: string[];
  header: ReportHeaderConfig;
  table: ReportTableConfig;
  design?: ReportDesignConfig;
}

// --- Raw Types (API レスポンスの多言語生データ型) ---

export interface ReportMetaItemRaw {
  label: I18nString;
  field?: string;
  text?: I18nString;
  format?: string;
  unit?: I18nString;
}

export interface ReportHeaderConfigRaw {
  title: I18nString;
  subtitleTemplate?: I18nString;
  metaSections: {
    left: ReportMetaItemRaw[];
    right: ReportMetaItemRaw[];
    summaryBox?: {
      title?: I18nString;
      items: ReportMetaItemRaw[];
    };
  };
}

export interface ReportColumnConfigRaw {
  id: string;
  headerText: I18nString;
  widthRatio: number;
  align: "left" | "right" | "center";
  format?:
    | "string"
    | "integer"
    | "decimal2"
    | "decimal4"
    | "decimal6"
    | "percentage";
}

export interface ReportGroupSubtotalConfigRaw {
  enabled: boolean;
  labelPattern: I18nString;
  aggregations: Record<string, "sum" | "blank">;
}

export interface ReportGroupConfigRaw {
  level: number;
  codeField: string;
  nameField: string;
  subtotal: ReportGroupSubtotalConfigRaw;
}

export interface ReportTableConfigRaw {
  columns: ReportColumnConfigRaw[];
  groups: ReportGroupConfigRaw[];
  detail: ReportDetailConfig;
}

export interface ReportLayoutRaw {
  id: string;
  sheetId: string;
  name: I18nString;
  paper: ReportPaperConfig;
  requiredSingleFilters?: string[];
  header: ReportHeaderConfigRaw;
  table: ReportTableConfigRaw;
  design?: ReportDesignConfig;
}

export const localizeReportLayout = (
  layout: ReportLayoutRaw | ReportLayout,
  locale: Locale,
): ReportLayout => {
  return {
    ...layout,
    name: resolveI18nString(layout.name, locale),
    header: {
      ...layout.header,
      title: resolveI18nString(layout.header.title, locale),
      subtitleTemplate: layout.header.subtitleTemplate
        ? resolveI18nString(layout.header.subtitleTemplate, locale)
        : undefined,
      metaSections: {
        left: layout.header.metaSections.left.map((item) => ({
          ...item,
          label: resolveI18nString(item.label, locale),
          text: item.text ? resolveI18nString(item.text, locale) : undefined,
          unit: item.unit ? resolveI18nString(item.unit, locale) : undefined,
        })),
        right: layout.header.metaSections.right.map((item) => ({
          ...item,
          label: resolveI18nString(item.label, locale),
          text: item.text ? resolveI18nString(item.text, locale) : undefined,
          unit: item.unit ? resolveI18nString(item.unit, locale) : undefined,
        })),
        summaryBox: layout.header.metaSections.summaryBox
          ? {
              ...layout.header.metaSections.summaryBox,
              title: layout.header.metaSections.summaryBox.title
                ? resolveI18nString(
                    layout.header.metaSections.summaryBox.title,
                    locale,
                  )
                : undefined,
              items: layout.header.metaSections.summaryBox.items.map(
                (item) => ({
                  ...item,
                  label: resolveI18nString(item.label, locale),
                  text: item.text
                    ? resolveI18nString(item.text, locale)
                    : undefined,
                  unit: item.unit
                    ? resolveI18nString(item.unit, locale)
                    : undefined,
                }),
              ),
            }
          : undefined,
      },
    },
    table: {
      ...layout.table,
      columns: layout.table.columns.map((col) => ({
        ...col,
        headerText: resolveI18nString(col.headerText, locale),
      })),
      groups: layout.table.groups.map((group) => ({
        ...group,
        subtotal: {
          ...group.subtotal,
          labelPattern: resolveI18nString(group.subtotal.labelPattern, locale),
        },
      })),
    },
  };
};
