"use client";

import { DndContext, pointerWithin } from "@dnd-kit/core";
import {
  horizontalListSortingStrategy,
  SortableContext,
} from "@dnd-kit/sortable";
import { useAtom, useSetAtom } from "jotai";
import { type FC, useCallback, useMemo, useState } from "react";
import { CellContainer } from "../Cell/containers";
import { Workbook } from "../components";
import { SheetTabs } from "../components/SheetTabs";
import { Toolbar } from "../components/Toolbar";
import { PdfPreview } from "../PdfPreview/components";
import { usePdfPreviewContainer } from "../PdfPreview/containers/usePdfPreviewContainer";
import { RowStatus } from "../RowStatus/components";
import { RowStatusContainer } from "../RowStatus/containers";
import { type AxisLayout, HeaderCell, Sheet } from "../Sheet/components";
import { ColumnFilterModal } from "../Sheet/components/ColumnFilterModal";
import { ColumnSettingModal } from "../Sheet/components/ColumnSettingModal";
import { ColumnHeaderContainer } from "../Sheet/containers/ColumnHeaderContainer";
import { useSheetContainer } from "../Sheet/containers/useSheetContainer";
import {
  type ColumnId,
  clearColumnFilterAtom,
  type RowId,
  removeColumnBindingAtom,
  viewModeAtom,
} from "../stores";
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
    columnOrder,
    columnNames,
    sensors,
    handleDragStart,
    handleDragEnd,
    handleChangeColumnWidth,
    getRowLayout,
    getColumnLayout,
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
            rowId={item.key as RowId}
            colId={col.id as ColumnId}
          />
        )),
      })),
    [virtualRows, composedColumns],
  );

  const [settingModalColId, setSettingModalColId] = useState<ColumnId | null>(
    null,
  );
  const [filterModalColId, setFilterModalColId] = useState<ColumnId | null>(
    null,
  );

  const removeColumnBinding = useSetAtom(removeColumnBindingAtom);
  const clearColumnFilter = useSetAtom(clearColumnFilterAtom);

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
        {(headerProps) => (
          <HeaderCell
            {...headerProps}
            onOpenSettingModal={(colId) => setSettingModalColId(colId)}
            onRemoveBinding={(colId) => removeColumnBinding(colId)}
            onOpenFilterModal={(colId) => setFilterModalColId(colId)}
            onClearFilter={(colId) => clearColumnFilter(colId)}
          />
        )}
      </ColumnHeaderContainer>
    ),
    [removeColumnBinding, clearColumnFilter],
  );

  if (viewMode === "pdf-preview") {
    return <PdfPreview {...previewProps} />;
  }

  return (
    <>
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
                getRowLayout={getRowLayout}
                getColumnLayout={getColumnLayout}
                onChangeColumnWidth={handleChangeColumnWidth}
                renderHeaderCell={renderHeaderCell}
              />
            </SortableContext>
          }
        />
      </DndContext>
      {settingModalColId !== null && (
        <ColumnSettingModal
          key={settingModalColId}
          targetColId={settingModalColId}
          open={true}
          onOpenChange={(open) => {
            if (!open) setSettingModalColId(null);
          }}
        />
      )}
      {filterModalColId !== null && (
        <ColumnFilterModal
          key={filterModalColId}
          targetColId={filterModalColId}
          open={true}
          onOpenChange={(open) => {
            if (!open) setFilterModalColId(null);
          }}
        />
      )}
    </>
  );
};
