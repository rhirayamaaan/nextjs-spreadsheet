"use client";

import { DndContext, pointerWithin } from "@dnd-kit/core";
import {
  horizontalListSortingStrategy,
  SortableContext,
} from "@dnd-kit/sortable";
import { useAtom } from "jotai";
import { type FC, useCallback, useMemo } from "react";
import { Cell } from "../Cell/components";
import { CellContainer } from "../Cell/containers";
import { Workbook } from "../components";
import { SheetTabs } from "../components/SheetTabs";
import { Toolbar } from "../components/Toolbar";
import { PdfPreview } from "../PdfPreview/components";
import { usePdfPreviewContainer } from "../PdfPreview/containers/usePdfPreviewContainer";
import { RowStatus } from "../RowStatus/components";
import { RowStatusContainer } from "../RowStatus/containers";
import { type AxisLayout, HeaderCell, Sheet } from "../Sheet/components";
import { ColumnHeaderContainer } from "../Sheet/containers/ColumnHeaderContainer";
import { useSheetContainer } from "../Sheet/containers/useSheetContainer";
import { type ColumnId, type RowId, viewModeAtom } from "../stores";
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
    columnOrder,
    columnNames,
    sensors,
    handleDragStart,
    handleDragEnd,
    handleChangeColumnWidth,
  } = useSheetContainer();

  // COMPOSE SHEET PROPS (Composition Layer)
  const virtualCols = columnVirtualizer.getVirtualItems();
  const virtualRows = rowVirtualizer.getVirtualItems();

  const composedColumns = useMemo(
    () =>
      virtualCols.map((item) => ({
        id: item.key,
        index: item.index,
        start: item.start,
        size: item.size,
        label: columnNames[item.key as ColumnId] ?? `列 ${item.index + 1}`,
      })),
    [virtualCols, columnNames],
  );

  const composedRows = useMemo(
    () =>
      virtualRows.map((item) => ({
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
      })),
    [virtualRows, composedColumns],
  );

  const renderHeaderCell = useCallback(
    (
      col: AxisLayout,
      resizingId: string | number | bigint | null,
      handleMouseDownResizer: (
        id: string | number | bigint,
        width: number,
      ) => (event: React.MouseEvent) => void,
    ) => (
      <ColumnHeaderContainer
        key={col.id}
        col={col}
        resizingId={resizingId}
        onMouseDownResizer={handleMouseDownResizer}
      >
        {(headerProps) => <HeaderCell {...headerProps} />}
      </ColumnHeaderContainer>
    ),
    [],
  );

  if (viewMode === "pdf-preview") {
    return <PdfPreview {...previewProps} />;
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={pointerWithin}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
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
          <SortableContext
            items={columnOrder}
            strategy={horizontalListSortingStrategy}
          >
            <Sheet
              ref={parentRef}
              rows={composedRows}
              columns={composedColumns}
              totalWidth={columnVirtualizer.getTotalSize()}
              totalHeight={rowVirtualizer.getTotalSize()}
              selection={selection}
              onChangeColumnWidth={handleChangeColumnWidth}
              renderHeaderCell={renderHeaderCell}
            />
          </SortableContext>
        }
      />
    </DndContext>
  );
};
