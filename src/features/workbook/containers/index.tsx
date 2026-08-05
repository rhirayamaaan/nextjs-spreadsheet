"use client";

import { useAtom } from "jotai";
import type { FC } from "react";
import { Cell } from "../Cell/components";
import { CellContainer } from "../Cell/containers";
import { Workbook } from "../components";
import { SheetTabs } from "../components/SheetTabs";
import { Toolbar } from "../components/Toolbar";
import { PdfPreview } from "../PdfPreview/components";
import { usePdfPreviewContainer } from "../PdfPreview/containers/usePdfPreviewContainer";
import { RowStatus } from "../RowStatus/components";
import { RowStatusContainer } from "../RowStatus/containers";
import { Sheet } from "../Sheet/components";
import { useSheetContainer } from "../Sheet/containers/useSheetContainer";
import { type RowId, viewModeAtom } from "../stores";
import { useExportExcel } from "./useExportExcel";
import { useExportPdf } from "./useExportPdf";
import { MOCK_SHEETS, useSheetLoader } from "./useSheetLoader";

export const WorkbookContainer: FC = () => {
  const { activeSheet, activeSheetId, handleSelectSheet } = useSheetLoader();

  const { exportCurrentSheet, isExporting: isExportingExcel } =
    useExportExcel();
  const { previewCurrentSheetPdf, isExporting: isExportingPdf } =
    useExportPdf();

  const [viewMode] = useAtom(viewModeAtom);

  const previewProps = usePdfPreviewContainer();

  const {
    parentRef,
    rowVirtualizer,
    columnVirtualizer,
    selection,
    handleChangeColumnWidth,
  } = useSheetContainer();

  // COMPOSE SHEET PROPS (Composition Layer)
  const composedColumns = columnVirtualizer.getVirtualItems().map((item) => ({
    id: item.key,
    index: item.index,
    start: item.start,
    size: item.size,
  }));

  const composedRows = rowVirtualizer.getVirtualItems().map((item) => ({
    id: item.key,
    index: item.index,
    start: item.start,
    size: item.size,
    status: (
      <RowStatusContainer rowId={item.key as RowId}>
        {(statusProps) => <RowStatus {...statusProps} />}
      </RowStatusContainer>
    ),
    cells: composedColumns.map((col) => (
      <CellContainer
        key={`${item.key}-${col.id}`}
        row={item.index}
        col={col.index}
      >
        {(cellProps) => <Cell {...cellProps} />}
      </CellContainer>
    )),
  }));

  if (viewMode === "pdf-preview") {
    return <PdfPreview {...previewProps} />;
  }

  return (
    <Workbook
      toolbar={
        <Toolbar
          sheetName={activeSheet?.name}
          onExport={exportCurrentSheet}
          onPreviewPdf={previewCurrentSheetPdf}
          isExportingExcel={isExportingExcel}
          isExportingPdf={isExportingPdf}
        />
      }
      tabs={
        <SheetTabs
          activeSheetId={activeSheetId}
          sheets={MOCK_SHEETS}
          onSelectSheet={handleSelectSheet}
        />
      }
      sheet={
        <Sheet
          ref={parentRef}
          rows={composedRows}
          columns={composedColumns}
          totalWidth={columnVirtualizer.getTotalSize()}
          totalHeight={rowVirtualizer.getTotalSize()}
          selection={selection}
          onChangeColumnWidth={handleChangeColumnWidth}
        />
      }
    />
  );
};
