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
