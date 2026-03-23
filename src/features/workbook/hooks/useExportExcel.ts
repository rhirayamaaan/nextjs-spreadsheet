import { useStore } from "jotai";
import { useCallback } from "react";
import * as xlsx from "xlsx";
import {
  activeSheetIdAtom,
  baseCellValuesAtom,
  cellEditsAtom,
  columnOrderAtom,
  rowOrderAtom,
} from "../stores";

export const useExportExcel = () => {
  const store = useStore();

  const exportCurrentSheet = useCallback(() => {
    const activeSheetId = store.get(activeSheetIdAtom);
    if (!activeSheetId) return;

    const rowOrder = store.get(rowOrderAtom);
    const colOrder = store.get(columnOrderAtom);
    const baseValues = store.get(baseCellValuesAtom);
    const edits = store.get(cellEditsAtom);

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

    // Convert the array of arrays to a worksheet
    const worksheet = xlsx.utils.aoa_to_sheet(data);

    // Create a new workbook and append the worksheet
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, activeSheetId);

    // Write the workbook and trigger download
    xlsx.writeFile(workbook, `${activeSheetId}.xlsx`);
  }, [store]);

  return { exportCurrentSheet };
};
