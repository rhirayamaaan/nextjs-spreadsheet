import { useSetAtom, useStore } from "jotai";
import jsPDF from "jspdf";
import autoTable, { type Styles } from "jspdf-autotable";
import { useCallback, useState } from "react";
import {
  activeColumnConfigsAtom,
  activeSheetIdAtom,
  baseCellValuesAtom,
  cellEditsAtom,
  columnNamesAtom,
  columnOrderAtom,
  columnWidthOverridesAtom,
  getLookupValue,
  pdfPreviewUrlAtom,
  rowOrderAtom,
  viewModeAtom,
} from "../stores";

const NOTO_SANS_JP_REGULAR_TTF = "/fonts/NotoSansJP-Regular.ttf";
const NOTO_SANS_JP_BOLD_TTF = "/fonts/NotoSansJP-Bold.ttf";

const initialColumnStyles: Record<string, Partial<Styles>> = {};

export const useExportPdf = () => {
  const store = useStore();
  const [isExporting, setIsExporting] = useState(false);
  const setPdfPreviewUrl = useSetAtom(pdfPreviewUrlAtom);
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

  const generatePdf = useCallback(async () => {
    const activeSheetId = store.get(activeSheetIdAtom);
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
  }, [store, fetchFontAsBase64]);

  const previewCurrentSheetPdf = useCallback(async () => {
    setIsExporting(true);
    try {
      const result = await generatePdf();
      if (result) {
        const blob = result.doc.output("blob");
        const url = URL.createObjectURL(blob);
        setPdfPreviewUrl(url);
        setViewMode("pdf-preview");
      }
    } catch (error) {
      console.error("PDF preview generation failed", error);
      alert("PDF preview generation failed");
    } finally {
      setIsExporting(false);
    }
  }, [generatePdf, setPdfPreviewUrl, setViewMode]);

  return { previewCurrentSheetPdf, isExporting };
};
