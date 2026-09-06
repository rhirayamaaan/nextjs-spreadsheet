import ExcelJS from "exceljs";
import { useStore } from "jotai";
import { useCallback, useState } from "react";
import {
  activeColumnSummaryValuesAtom,
  activeSheetIdAtom,
  baseCellValuesAtom,
  cellEditsAtom,
  columnOrderAtom,
  hasActiveColumnTotalsAtom,
  rowOrderAtom,
} from "../stores";

export const useExportExcel = () => {
  const store = useStore();
  const [isExporting, setIsExporting] = useState(false);

  const exportCurrentSheet = useCallback(async () => {
    const activeSheetId = store.get(activeSheetIdAtom);
    if (!activeSheetId) return;

    setIsExporting(true);
    try {
      const rowOrder = store.get(rowOrderAtom);
      const colOrder = store.get(columnOrderAtom);
      const baseValues = store.get(baseCellValuesAtom);
      const edits = store.get(cellEditsAtom);
      const hasTotals = store.get(hasActiveColumnTotalsAtom);
      const summaryValues = store.get(activeColumnSummaryValuesAtom);

      const data: string[][] = [];

      // Construct the 2D array of data representing the spreadsheet
      for (const rowId of rowOrder) {
        const rowData: string[] = [];
        for (const colId of colOrder) {
          const key = `${rowId}-${colId}`;
          const value = edits[key] ?? baseValues[key] ?? "";
          rowData.push(value);
        }
        data.push(rowData);
      }

      // Append total row if totals are enabled
      if (hasTotals) {
        const totalRowData: string[] = colOrder.map(
          (colId) => summaryValues[colId] ?? "",
        );
        data.push(totalRowData);
      }

      // Create a new workbook and add a worksheet
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet(activeSheetId);

      // Add data to the worksheet
      worksheet.addRows(data);

      // Write to a buffer and trigger download
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${activeSheetId}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Excel export failed", error);
      alert("Excel export failed");
    } finally {
      setIsExporting(false);
    }
  }, [store]);

  return { exportCurrentSheet, isExporting };
};
