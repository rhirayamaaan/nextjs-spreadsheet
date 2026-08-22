"use client";

import ExcelJS from "exceljs";
import { type ChangeEvent, useCallback, useMemo, useState } from "react";
import type { ParsedCell, ParsedWorkbook } from "../types";
import { parseWorksheet } from "../utils/excelParser";

export function useExcelLoader() {
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<number | null>(null);
  const [parsedWorkbook, setParsedWorkbook] = useState<ParsedWorkbook | null>(
    null,
  );
  const [activeSheetIndex, setActiveSheetIndex] = useState<number>(0);
  const [selectedCellAddress, setSelectedCellAddress] = useState<string | null>(
    null,
  );
  const [selectedCellValue, setSelectedCellValue] = useState<string | null>(
    null,
  );
  const [columnWidthsMap, setColumnWidthsMap] = useState<
    Record<string, number[]>
  >({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setFileSize(file.size);
    setIsLoading(true);
    setError(null);
    setSelectedCellAddress(null);
    setSelectedCellValue(null);

    try {
      const buffer = await file.arrayBuffer();
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(buffer);

      const sheets: ParsedWorkbook["sheets"] = [];
      const widthsMap: Record<string, number[]> = {};

      workbook.eachSheet((worksheet) => {
        const parsed = parseWorksheet(worksheet);
        sheets.push(parsed);
        widthsMap[worksheet.name] = parsed.columnWidths;
      });

      if (sheets.length === 0) {
        throw new Error("No worksheets found");
      }

      setParsedWorkbook({
        name: file.name,
        sheets,
      });
      setColumnWidthsMap(widthsMap);
      setActiveSheetIndex(0);
    } catch (err) {
      console.error("Failed to parse Excel file", err);
      setError(
        "Excelファイルのパースに失敗しました。ファイルが壊れているか、保護されている可能性があります。",
      );
      setParsedWorkbook(null);
    } finally {
      setIsLoading(false);
      event.target.value = "";
    }
  };

  const handleChangeColumnWidth = useCallback(
    (colIndex: number, newWidth: number) => {
      if (!parsedWorkbook) return;
      const activeSheet = parsedWorkbook.sheets[activeSheetIndex];
      if (!activeSheet) return;

      setColumnWidthsMap((prev) => {
        const currentWidths = prev[activeSheet.name]
          ? [...prev[activeSheet.name]]
          : [...activeSheet.columnWidths];
        currentWidths[colIndex] = newWidth;
        return {
          ...prev,
          [activeSheet.name]: currentWidths,
        };
      });
    },
    [parsedWorkbook, activeSheetIndex],
  );

  const activeSheet = parsedWorkbook?.sheets[activeSheetIndex];
  const currentColumnWidths = useMemo(() => {
    if (!activeSheet) return [];
    return columnWidthsMap[activeSheet.name] || activeSheet.columnWidths;
  }, [activeSheet, columnWidthsMap]);

  const handleCellClick = useCallback((cell: ParsedCell) => {
    setSelectedCellAddress(cell.address);
    setSelectedCellValue(cell.value);
  }, []);

  const sheetNames = useMemo(() => {
    if (!parsedWorkbook) return [];
    return parsedWorkbook.sheets.map((s) => s.name);
  }, [parsedWorkbook]);

  const handleSelectSheet = useCallback((index: number) => {
    setActiveSheetIndex(index);
    setSelectedCellAddress(null);
    setSelectedCellValue(null);
  }, []);

  return {
    fileName,
    fileSize,
    parsedWorkbook,
    activeSheet,
    activeSheetIndex,
    selectedCellAddress,
    selectedCellValue,
    currentColumnWidths,
    sheetNames,
    isLoading,
    error,
    handleFileChange,
    handleChangeColumnWidth,
    handleCellClick,
    handleSelectSheet,
  };
}
