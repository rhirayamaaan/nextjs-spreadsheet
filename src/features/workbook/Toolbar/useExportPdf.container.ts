import { useAtom, useAtomValue, useSetAtom, useStore } from "jotai";
import jsPDF from "jspdf";
import autoTable, { type Styles } from "jspdf-autotable";
import { useCallback, useMemo, useState } from "react";
import { useCurrentLocale } from "@/i18n/context";
import { generateReportPdf } from "../PdfPreview/reportPdfGenerator";
import { reportLayoutQuery } from "../services/reportLayout/reportLayout.query";
import { localizeReportLayout } from "../services/reportLayout/reportLayout.types";
import {
  activeColumnConfigsAtom,
  activeSheetIdAtom,
  baseCellValuesAtom,
  cellEditsAtom,
  columnNamesAtom,
  columnOrderAtom,
  columnWidthOverridesAtom,
  getLookupValue,
  pdfPreviewTypeAtom,
  pdfPreviewUrlAtom,
  rowOrderAtom,
  viewModeAtom,
  visibleRecordsAtom,
} from "../stores";

const NOTO_SANS_JP_REGULAR_TTF = "/fonts/NotoSansJP-Regular.ttf";
const NOTO_SANS_JP_BOLD_TTF = "/fonts/NotoSansJP-Bold.ttf";

const initialColumnStyles: Record<string, Partial<Styles>> = {};

export const useExportPdf = () => {
  const store = useStore();
  const { locale } = useCurrentLocale();
  const [activeSheetId] = useAtom(activeSheetIdAtom);
  const reportLayout = useAtomValue(
    reportLayoutQuery.sync(activeSheetId ?? ""),
  );
  const [records] = useAtom(visibleRecordsAtom);

  const localizedReportLayout = useMemo(() => {
    return reportLayout ? localizeReportLayout(reportLayout, locale) : null;
  }, [reportLayout, locale]);

  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isExportingReportPdf, setIsExportingReportPdf] = useState(false);
  const setPdfPreviewUrl = useSetAtom(pdfPreviewUrlAtom);
  const setPdfPreviewType = useSetAtom(pdfPreviewTypeAtom);
  const setViewMode = useSetAtom(viewModeAtom);

  const fetchFontAsBase64 = useCallback(
    async (url: string): Promise<string> => {
      const response = await fetch(url);
      if (!response.ok)
        throw new Error(`Failed to fetch font: ${response.statusText}`);
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
    },
    [],
  );

  const generateDefaultPdf = useCallback(async () => {
    if (!activeSheetId) return null;

    const rowOrder = store.get(rowOrderAtom);
    const colOrder = store.get(columnOrderAtom);
    const baseValues = store.get(baseCellValuesAtom);
    const edits = store.get(cellEditsAtom);
    const columnWidthOverrides = store.get(columnWidthOverridesAtom);
    const columnConfigs = store.get(activeColumnConfigsAtom);
    const columnNames = store.get(columnNamesAtom);

    // 参照列（lookup）を右端に配置
    const nonLookupCols = colOrder.filter(
      (colId) => columnConfigs[colId]?.type !== "lookup",
    );
    const lookupCols = colOrder.filter(
      (colId) => columnConfigs[colId]?.type === "lookup",
    );
    const exportColOrder = [...nonLookupCols, ...lookupCols];

    const orientation = exportColOrder.length > 8 ? "l" : "p";
    const doc = new jsPDF({ orientation, unit: "mm", format: "a4" });

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
    } catch (fontError) {
      console.warn("Font loading failed, falling back to helvetica", fontError);
    }

    const body: string[][] = [];
    for (const rowId of rowOrder) {
      const rowData: string[] = [];
      for (const colId of exportColOrder) {
        const config = columnConfigs[colId];
        let value = "";
        if (config && config.type === "lookup") {
          value = getLookupValue(
            store.get,
            { rowId, colId },
            config.lookup,
            baseValues,
          );
        } else {
          const key = `${rowId}-${colId}`;
          value = edits[key] ?? baseValues[key] ?? "";
        }
        rowData.push(value);
      }
      body.push(rowData);
    }

    const head = [
      exportColOrder.map(
        (colId, i) => columnNames[colId] || (i + 1).toString(),
      ),
    ];
    const dynamicFontSize = Math.max(
      6,
      Math.min(9, 12 - exportColOrder.length * 0.2),
    );

    autoTable(doc, {
      head: head,
      body: body,
      theme: "grid",
      styles: {
        font: fontName,
        fontSize: dynamicFontSize,
        cellPadding: 1.5,
        lineColor: [200, 200, 200],
        lineWidth: 0.1,
        textColor: [60, 60, 60],
        valign: "middle",
      },
      headStyles: {
        fillColor: [245, 245, 245],
        textColor: [80, 80, 80],
        fontStyle: "bold",
        lineWidth: 0.2,
      },
      columnStyles: exportColOrder.reduce((acc, colId, index) => {
        if (columnWidthOverrides[colId]) {
          acc[index] = { cellWidth: "auto", minCellWidth: 10 };
        }
        return acc;
      }, initialColumnStyles),
      margin: { top: 20, left: 10, right: 10, bottom: 15 },
      didDrawPage: (_data) => {
        doc.setFontSize(10);
        doc.text(`Sheet: ${activeSheetId}`, 10, 15);
      },
    });

    return { doc, filename: `${activeSheetId}.pdf` };
  }, [activeSheetId, store, fetchFontAsBase64]);

  // 1. 通常の表PDFプレビュー
  const previewCurrentSheetPdf = useCallback(async () => {
    setIsExportingPdf(true);
    try {
      const result = await generateDefaultPdf();
      if (result) {
        const blob = result.doc.output("blob");
        const url = URL.createObjectURL(blob);
        setPdfPreviewType("table");
        setPdfPreviewUrl(url);
        setViewMode("pdf-preview");
      }
    } catch (error) {
      console.error("Table PDF preview generation failed", error);
      alert("Table PDF preview generation failed");
    } finally {
      setIsExportingPdf(false);
    }
  }, [generateDefaultPdf, setPdfPreviewType, setPdfPreviewUrl, setViewMode]);

  // 2. 帳票PDFプレビュー
  const previewCurrentSheetReportPdf = useCallback(async () => {
    if (!localizedReportLayout || !records || records.length === 0) return;
    setIsExportingReportPdf(true);
    try {
      const result = await generateReportPdf(localizedReportLayout, records, {
        includeSummary: true,
        includeDetails: true,
      });
      if (result) {
        const blob = result.doc.output("blob");
        const url = URL.createObjectURL(blob);
        setPdfPreviewType("report");
        setPdfPreviewUrl(url);
        setViewMode("pdf-preview");
      }
    } catch (error) {
      console.error("Report PDF preview generation failed", error);
      alert("Report PDF preview generation failed");
    } finally {
      setIsExportingReportPdf(false);
    }
  }, [
    localizedReportLayout,
    records,
    setPdfPreviewType,
    setPdfPreviewUrl,
    setViewMode,
  ]);

  const hasReportLayout = Boolean(reportLayout);
  const columnNames = store.get(columnNamesAtom);

  const { isPreconditionSatisfied, unfulfilledFilterLabels } = useMemo(() => {
    if (!reportLayout) {
      return { isPreconditionSatisfied: false, unfulfilledFilterLabels: [] };
    }
    if (!records || records.length === 0) {
      return { isPreconditionSatisfied: false, unfulfilledFilterLabels: [] };
    }

    const requiredFields = reportLayout.requiredSingleFilters ?? [];
    if (requiredFields.length === 0) {
      return { isPreconditionSatisfied: true, unfulfilledFilterLabels: [] };
    }

    const unfulfilled: string[] = [];
    for (const field of requiredFields) {
      const uniqueValues = new Set(
        records.map((r) => r[field]).filter(Boolean),
      );
      if (uniqueValues.size !== 1) {
        unfulfilled.push(
          (columnNames as Record<string, string>)[field] || field,
        );
      }
    }

    return {
      isPreconditionSatisfied: unfulfilled.length === 0,
      unfulfilledFilterLabels: unfulfilled,
    };
  }, [reportLayout, records, columnNames]);

  const isReportPdfDisabled = !hasReportLayout || !isPreconditionSatisfied;

  return {
    previewCurrentSheetPdf,
    previewCurrentSheetReportPdf,
    isExportingPdf,
    isExportingReportPdf,
    hasReportLayout,
    isPreconditionSatisfied,
    unfulfilledFilterLabels,
    isReportPdfDisabled,
  };
};
