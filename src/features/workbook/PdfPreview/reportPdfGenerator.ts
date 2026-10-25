import jsPDF from "jspdf";
import autoTable, { type RowInput } from "jspdf-autotable";
import type { ReportLayout } from "../services/reportLayout/reportLayout.types";

const NOTO_SANS_JP_REGULAR_TTF = "/fonts/NotoSansJP-Regular.ttf";
const NOTO_SANS_JP_BOLD_TTF = "/fonts/NotoSansJP-Bold.ttf";

export interface ReportPdfOptions {
  includeSummary: boolean;
  includeDetails: boolean;
}

const fetchFontAsBase64 = async (url: string): Promise<string> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch font: ${response.statusText}`);
  }
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      resolve(base64String.split(",")[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

const formatNumber = (
  val: number | string | undefined,
  format?: string,
): string => {
  if (val === undefined || val === null || val === "") return "";
  const num = typeof val === "number" ? val : Number.parseFloat(val);
  if (Number.isNaN(num)) return String(val);

  switch (format) {
    case "decimal4":
      return num.toLocaleString("ja-JP", {
        minimumFractionDigits: 4,
        maximumFractionDigits: 4,
      });
    case "decimal2":
      return num.toLocaleString("ja-JP", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    case "decimal6":
      return num.toLocaleString("ja-JP", {
        minimumFractionDigits: 6,
        maximumFractionDigits: 6,
      });
    case "percentage":
      return `${num.toLocaleString("ja-JP", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })} %`;
    case "integer":
      return Math.round(num).toLocaleString("ja-JP");
    default:
      return num.toLocaleString("ja-JP");
  }
};

const formatDateTime = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const h = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  const s = String(date.getSeconds()).padStart(2, "0");
  return `${y}/${m}/${d} ${h}:${min}:${s}`;
};

export const generateReportPdf = async (
  layout: ReportLayout,
  records: Record<string, string>[],
  options: ReportPdfOptions,
): Promise<{ doc: jsPDF; filename: string }> => {
  const doc = new jsPDF({
    orientation: layout.paper.orientation === "landscape" ? "l" : "p",
    unit: "mm",
    format: "a4",
  });

  let fontName = "helvetica";
  try {
    const [regularBase64, boldBase64] = await Promise.all([
      fetchFontAsBase64(NOTO_SANS_JP_REGULAR_TTF),
      fetchFontAsBase64(NOTO_SANS_JP_BOLD_TTF),
    ]);
    doc.addFileToVFS("NotoSansJP-Regular.ttf", regularBase64);
    doc.addFont("NotoSansJP-Regular.ttf", "NotoSansJP", "normal");
    doc.addFileToVFS("NotoSansJP-Bold.ttf", boldBase64);
    doc.addFont("NotoSansJP-Bold.ttf", "NotoSansJP", "bold");
    doc.setFont("NotoSansJP", "normal");
    fontName = "NotoSansJP";
  } catch (error) {
    console.warn(
      "NotoSansJP font loading failed, fallback to helvetica",
      error,
    );
  }

  const firstRecord = records[0] ?? {};
  const extractMonth = (ym?: string) => {
    if (!ym) return "";
    if (ym.includes("-")) {
      const parts = ym.split("-");
      return parts[1] || "";
    }
    return ym.length >= 6 ? ym.slice(4, 6) : ym;
  };

  const extractYear = (y?: string, ym?: string) => {
    if (y && y.length >= 4) return y.slice(0, 4);
    if (ym && ym.length >= 4) return ym.slice(0, 4);
    return "2020";
  };

  const allFromYMs = records
    .map((r) => r.from_year_month)
    .filter((v): v is string => Boolean(v));
  const allToYMs = records
    .map((r) => r.to_year_month)
    .filter((v): v is string => Boolean(v));

  const sortedFromYMs = [...allFromYMs].sort();
  const sortedToYMs = [...allToYMs].sort();

  const minFromYM = sortedFromYMs[0] || firstRecord.from_year_month || "";
  const maxToYM =
    sortedToYMs[sortedToYMs.length - 1] ||
    firstRecord.to_year_month ||
    minFromYM;

  const year = extractYear(firstRecord.year, minFromYM);
  const fromMonth = extractMonth(minFromYM) || "04";
  const toMonth = extractMonth(maxToYM) || fromMonth;

  // メタデータ値の動的解決関数
  const resolveMetaValue = (field?: string): string => {
    if (!field) return "";
    if (field === "accounting_unit_full") {
      return `${firstRecord.accounting_unit_code ?? ""}  ${firstRecord.accounting_unit_name ?? ""}`.trim();
    }
    if (field === "office_full") {
      return `${firstRecord.office_code ?? ""}  ${firstRecord.office_name ?? ""}`.trim();
    }
    if (field === "cost_dept_full") {
      return `${firstRecord.cost_dept_code ?? ""}  ${firstRecord.cost_dept_name ?? ""}`.trim();
    }
    return firstRecord[field] ?? "";
  };

  const printTimestamp = formatDateTime(new Date());

  // === 汎用テーブル構造の構築 ===
  const columns = layout.table.columns;
  const groupsConfig = layout.table.groups;
  const detailConfig = layout.table.detail;

  // 階層データ構造
  type DetailRow = {
    name: string;
    values: Record<string, number>;
  };

  type GroupNode = {
    level: number;
    code: string;
    name: string;
    subGroups: Map<string, GroupNode>;
    details: DetailRow[];
    subtotals: Record<string, number>;
  };

  const rootGroups = new Map<string, GroupNode>();

  for (const record of records) {
    let currentMap = rootGroups;
    let currentNode: GroupNode | null = null;

    // 定義された階層グループを順に走査
    for (const grp of groupsConfig) {
      const code = record[grp.codeField] ?? "";
      const name = record[grp.nameField] ?? "";

      let node = currentMap.get(code);
      if (!node) {
        node = {
          level: grp.level,
          code,
          name,
          subGroups: new Map(),
          details: [],
          subtotals: {},
        };
        currentMap.set(code, node);
      }
      currentNode = node;
      currentMap = node.subGroups;
    }

    // 明細レコードの抽出
    const detailValues: Record<string, number> = {};
    for (const [colId, fieldName] of Object.entries(detailConfig.fields)) {
      detailValues[colId] = Number.parseFloat(record[fieldName] ?? "0") || 0;
    }

    const detailName = record[detailConfig.nameField] ?? "";
    const detailRow: DetailRow = {
      name: detailName,
      values: detailValues,
    };

    if (currentNode) {
      (currentNode as GroupNode).details.push(detailRow);
    }
  }

  // 小計をボトムアップで集計する再帰関数
  const calculateSubtotals = (node: GroupNode): Record<string, number> => {
    const totals: Record<string, number> = {};

    // 子グループがあればその合計を加算
    for (const subNode of node.subGroups.values()) {
      const subTotals = calculateSubtotals(subNode);
      for (const [colId, val] of Object.entries(subTotals)) {
        totals[colId] = (totals[colId] || 0) + val;
      }
    }

    // 直接保持する明細行を加算
    for (const detail of node.details) {
      for (const [colId, val] of Object.entries(detail.values)) {
        totals[colId] = (totals[colId] || 0) + val;
      }
    }

    node.subtotals = totals;
    return totals;
  };

  for (const rootNode of rootGroups.values()) {
    calculateSubtotals(rootNode);
  }

  // === autoTable 用 body データの再帰生成 ===
  const body: RowInput[] = [];

  const renderGroupToBody = (node: GroupNode, indentLevel: number) => {
    const grpConfig = groupsConfig.find((g) => g.level === node.level);
    const indent = "  ".repeat(indentLevel);

    // 1. グループヘッダー行
    // 最上位グループ（level === 1）は常に出力。
    // 子グループ（level > 1）は、明細出力が有効（includeDetails）またはさらに子グループを持つ場合のみ出力
    const shouldRenderHeader =
      node.level === 1 || node.subGroups.size > 0 || options.includeDetails;

    if (shouldRenderHeader) {
      const headerRow: RowInput = [
        {
          content: `${indent}${node.name}`,
          styles: {
            fontStyle: node.level === 1 ? "bold" : "normal",
            halign: "left",
          },
        },
      ];
      for (let c = 1; c < columns.length; c++) {
        headerRow.push("");
      }
      body.push(headerRow);
    }

    // 2. 子グループの展開
    for (const subNode of node.subGroups.values()) {
      renderGroupToBody(subNode, indentLevel + 1);
    }

    // 3. 明細行の出力 (最下層グループかつ options.includeDetails の場合)
    if (node.subGroups.size === 0 && options.includeDetails) {
      const detailIndent = "  ".repeat(indentLevel + 1);
      for (const detail of node.details) {
        const row: RowInput = [
          {
            content: `${detailIndent}${detail.name}`,
            styles: { halign: "left" },
          },
        ];
        // 2列目以降の値
        for (let c = 1; c < columns.length; c++) {
          const col = columns[c];
          if (!col) continue;
          const val = detail.values[col.id];
          row.push({
            content: formatNumber(val, col.format),
            styles: { halign: col.align },
          });
        }
        body.push(row);
      }
    }

    // 4. 小計行の出力 (subtotal.enabled かつ options.includeSummary の場合)
    if (grpConfig?.subtotal.enabled && options.includeSummary) {
      const namePlaceholder = "${" + "name}";
      const label = grpConfig.subtotal.labelPattern.replace(
        namePlaceholder,
        node.name,
      );
      const isTopLevel = node.level === 1;
      const subtotalRow: RowInput = [
        {
          content: `${indent}${label}`,
          styles: {
            fillColor: isTopLevel ? [235, 235, 235] : [244, 244, 244],
            fontStyle: isTopLevel ? "bold" : "normal",
            halign: "left",
          },
        },
      ];

      for (let c = 1; c < columns.length; c++) {
        const col = columns[c];
        if (!col) continue;
        const aggType = grpConfig.subtotal.aggregations[col.id] ?? "blank";
        const val = node.subtotals[col.id];

        subtotalRow.push({
          content: aggType === "sum" ? formatNumber(val, col.format) : "",
          styles: {
            fillColor: isTopLevel ? [235, 235, 235] : [244, 244, 244],
            fontStyle: isTopLevel ? "bold" : "normal",
            halign: col.align,
          },
        });
      }
      body.push(subtotalRow);
    }
  };

  for (const rootNode of rootGroups.values()) {
    renderGroupToBody(rootNode, 0);
  }

  // === autoTable のカラム幅とスタイルの動的構築 ===
  const totalRatio = columns.reduce((acc, col) => acc + col.widthRatio, 0);
  const printableWidthMm = 190; // A4 210mm - 左右マージン 10mm x 2
  const autoTableColumnStyles: Record<
    number,
    { cellWidth: number; halign: "left" | "right" | "center" }
  > = {};

  for (let i = 0; i < columns.length; i++) {
    const col = columns[i];
    if (!col) continue;
    const colWidth = (col.widthRatio / totalRatio) * printableWidthMm;
    autoTableColumnStyles[i] = {
      cellWidth: colWidth,
      halign: col.align,
    };
  }

  const tableHead = [columns.map((c) => c.headerText)];

  // autoTable を実行
  autoTable(doc, {
    head: tableHead,
    body: body,
    startY: 56, // ヘッダーメタ情報エリアの下から開始
    margin: { top: 56, bottom: 15, left: 10, right: 10 },
    theme: "plain",
    styles: {
      font: fontName,
      fontSize: 8.5,
      cellPadding: { top: 1.5, right: 2, bottom: 1.5, left: 2 },
      textColor: [30, 30, 30],
      lineColor: [220, 220, 220],
      lineWidth: 0.1,
    },
    headStyles: {
      fillColor: [205, 205, 205],
      textColor: [20, 20, 20],
      fontStyle: "bold",
      halign: "center",
      valign: "middle",
      lineColor: [255, 255, 255],
      lineWidth: 0.5,
    },
    columnStyles: autoTableColumnStyles,
    didDrawPage: (data) => {
      const pageNumber = data.pageNumber;
      const totalPages = (
        doc as unknown as { internal: { getNumberOfPages: () => number } }
      ).internal.getNumberOfPages();

      // 各ページ上部ヘッダー描画
      doc.setFont(fontName, "normal");
      doc.setFontSize(8);
      doc.setTextColor(50, 50, 50);

      // 右上: 印刷日時 & ページ番号
      doc.text(printTimestamp, 200, 10, { align: "right" });
      doc.text(`PAGE:${pageNumber}/${totalPages}`, 200, 14, { align: "right" });

      // 中央: 帳票タイトル
      doc.setFont(fontName, "bold");
      doc.setFontSize(14);
      doc.text(layout.header.title || layout.name, 105, 12, {
        align: "center",
      });

      // サブタイトル
      if (layout.header.subtitleTemplate) {
        const subTitle = layout.header.subtitleTemplate
          .replace("{year}", year)
          .replace("{from_month}", fromMonth)
          .replace("{to_month}", toMonth);
        doc.setFont(fontName, "normal");
        doc.setFontSize(9);
        doc.text(subTitle, 105, 18, { align: "center" });
      }

      // 左側メタ情報
      doc.setFont(fontName, "normal");
      doc.setFontSize(8.5);
      layout.header.metaSections.left.forEach((item, idx) => {
        const val = resolveMetaValue(item.field);
        doc.text(`${item.label.padEnd(5, "　")} ${val}`, 10, 25 + idx * 5);
      });

      // 右側メタ情報
      layout.header.metaSections.right.forEach((item, idx) => {
        doc.text(`${item.label}：${item.text ?? ""}`, 175, 25 + idx * 5);
      });

      // サマリーボックス (生産量・歩留等)
      const summaryBox = layout.header.metaSections.summaryBox;
      if (summaryBox && summaryBox.items.length > 0) {
        const boxX = 135;
        const boxY = 28;
        const boxW = 65;
        const itemCount = summaryBox.items.length;
        const colW = boxW / itemCount;

        // ラベルヘッダー背景
        doc.setFillColor(215, 215, 215);
        doc.rect(boxX, boxY, boxW, 5, "F");

        doc.setFont(fontName, "normal");
        doc.setFontSize(8);
        doc.setTextColor(30, 30, 30);

        summaryBox.items.forEach((item, idx) => {
          const itemX = boxX + idx * colW + colW / 2;
          doc.text(item.label, itemX, boxY + 3.7, { align: "center" });
          const rawVal = item.field ? firstRecord[item.field] : "";
          const formattedVal = formatNumber(rawVal, item.format);
          doc.text(formattedVal, boxX + (idx + 1) * colW - 2, boxY + 9, {
            align: "right",
          });
        });
      }
    },
  });

  // 全ページ番号の総ページ数を正確に更新するため再走査
  const pageCount = (
    doc as unknown as { internal: { getNumberOfPages: () => number } }
  ).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFont(fontName, "normal");
    doc.setFontSize(8);
    doc.setTextColor(50, 50, 50);
    // PAGE番号のエリアを白クリアして最新の totalPages で上書き描画
    doc.setFillColor(255, 255, 255);
    doc.rect(178, 11, 23, 4, "F");
    doc.text(`PAGE:${i}/${pageCount}`, 200, 14, { align: "right" });
  }

  return {
    doc,
    filename: `${layout.sheetId || "report"}_${year}${fromMonth}.pdf`,
  };
};
