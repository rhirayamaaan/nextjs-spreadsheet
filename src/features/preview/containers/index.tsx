"use client";

import { type ComponentProps, type FC, useCallback, useMemo } from "react";
import { Cell } from "../Cell/components";
import { CellContainer } from "../Cell/containers";
import { Workbook } from "../components";
import { SheetTabs } from "../components/SheetTabs";
import { Toolbar } from "../components/Toolbar";
import { FileUpload } from "../FileUpload/components";
import { Sheet } from "../Sheet/components";
import type { ParsedCell } from "../types";
import { useExcelLoader } from "./useExcelLoader";

export const PreviewContainer: FC = () => {
  const {
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
  } = useExcelLoader();

  // Stable render function for Cell presentational component
  const renderCell = useCallback(
    (cellProps: ComponentProps<typeof Cell>) => <Cell {...cellProps} />,
    [],
  );

  // COMPOSE CELLS AND ROWS (Composition Layer)
  const composedRows = useMemo(() => {
    if (!activeSheet) return [];

    return activeSheet.rowsData.map((rowCells, rIdx) => ({
      id: rIdx,
      cells: rowCells.map((cell: ParsedCell) => (
        <CellContainer key={cell.address} cell={cell} onClick={handleCellClick}>
          {renderCell}
        </CellContainer>
      )),
    }));
  }, [activeSheet, handleCellClick, renderCell]);

  if (!parsedWorkbook || !activeSheet) {
    return (
      <FileUpload
        onFileChange={handleFileChange}
        isLoading={isLoading}
        error={error}
      />
    );
  }

  return (
    <Workbook
      toolbar={
        <Toolbar
          fileName={fileName}
          fileSize={fileSize}
          selectedCellAddress={selectedCellAddress}
          selectedCellValue={selectedCellValue}
          onFileChange={handleFileChange}
          isLoading={isLoading}
        />
      }
      tabs={
        <SheetTabs
          sheetNames={sheetNames}
          activeSheetIndex={activeSheetIndex}
          onSelectSheet={handleSelectSheet}
        />
      }
      sheet={
        <Sheet
          columnCount={activeSheet.columnCount}
          columnWidths={currentColumnWidths}
          rows={composedRows}
          selectedCellAddress={selectedCellAddress}
          activeSheet={activeSheet}
          onChangeColumnWidth={handleChangeColumnWidth}
        />
      }
    />
  );
};

export default PreviewContainer;
