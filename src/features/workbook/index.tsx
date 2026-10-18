"use client";

import { DndContext, pointerWithin } from "@dnd-kit/core";
import {
  horizontalListSortingStrategy,
  SortableContext,
} from "@dnd-kit/sortable";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import dynamic from "next/dynamic";
import { type FC, useCallback, useMemo, useState } from "react";
import { useI18n } from "@/i18n/useI18n";
import { CellContainer } from "./Cell/Cell.container";
import { CellPresenter } from "./Cell/Cell.presenter";
import { ColumnFilterModalContainer } from "./ColumnFilterModal/ColumnFilterModal.container";
import { ColumnFilterModalPresenter } from "./ColumnFilterModal/ColumnFilterModal.presenter";
import { ColumnSettingModalContainer } from "./ColumnSettingModal/ColumnSettingModal.container";
import { ColumnSettingModalPresenter } from "./ColumnSettingModal/ColumnSettingModal.presenter";
import { EmptySheetPresenter } from "./EmptySheet.presenter";
import { localMessages } from "./i18n";
import { LoadingOverlayPresenter } from "./LoadingOverlay.presenter";
import { PdfPreviewPresenter } from "./PdfPreview/PdfPreview.presenter";
import { usePdfPreview } from "./PdfPreview/usePdfPreview.container";
import { RowStatusContainer } from "./RowStatus/RowStatus.container";
import { RowStatusPresenter } from "./RowStatus/RowStatus.presenter";
import { ColumnHeaderContainer } from "./Sheet/ColumnHeader.container";
import { ColumnHeaderPresenter } from "./Sheet/ColumnHeader.presenter";
import {
  type AxisLayout,
  FooterCell,
  SheetPresenter,
} from "./Sheet/Sheet.presenter";
import { useSheetContainer } from "./Sheet/useSheet.container";
import { SheetMenuDrawerPresenter } from "./SheetMenuDrawer/SheetMenuDrawer.presenter";
import { useSheetMenuDrawer } from "./SheetMenuDrawer/useSheetMenuDrawer.container";
import { SheetTabsPresenter } from "./SheetTabs.presenter";
import {
  activeColumnSummaryValuesAtom,
  type ColumnId,
  clearColumnFilterAtom,
  hasActiveColumnTotalsAtom,
  isColumnId,
  type RowId,
  removeColumnBindingAtom,
  sheetCategoriesAtom,
  toggleColumnTotalAtom,
  viewModeAtom,
} from "./stores";
import { ToastPresenter } from "./Toast/Toast.presenter";
import { useToast } from "./Toast/useToast.container";
import { ToolbarPresenter } from "./Toolbar/Toolbar.presenter";
import { useToolbar } from "./Toolbar/useToolbar.container";
import { useColumnModals } from "./useColumnModals.container";
import { useSheetLoader } from "./useSheetLoader.container";
import { useWorkbookMetadataLoader } from "./useWorkbookMetadataLoader.container";
import { useWorkbookSave } from "./useWorkbookSave.container";
import { WorkbookPresenter } from "./Workbook.presenter";

const WorkbookRoot: FC = () => {
  useWorkbookMetadataLoader();
  const {
    activeSheet,
    activeSheetId,
    openSheets,
    openSheetIds,
    favoriteSheetIds,
    sheetsByCategory,
    handleSelectSheet,
    handleOpenSheet,
    handleCloseSheet,
    handleToggleFavoriteSheet,
  } = useSheetLoader();
  const categories = useAtomValue(sheetCategoriesAtom);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const [viewMode] = useAtom(viewModeAtom);
  const pdfPreviewProps = usePdfPreview();

  const {
    parentRef,
    rowVirtualizer,
    columnVirtualizer,
    sortableColumnOrder,
    columnNames,
    selection,
    sensors,
    handleDragStart,
    handleDragEnd,
    handleChangeColumnWidth,
    handleMouseDown,
    handleKeyDown,
    focusSheet,
    getRowLayout,
    getColumnLayout,
  } = useSheetContainer();

  const { t } = useI18n(localMessages);
  const { toastProps, showToast } = useToast();

  const { handleSave, isSaving } = useWorkbookSave({
    parentRef,
    getRowLayout,
    getColumnLayout,
    showToast,
    t,
  });

  const {
    settingModalColId,
    filterModalColId,
    handleOpenSettingModal,
    handleCloseSettingModal,
    handleOpenFilterModal,
    handleCloseFilterModal,
  } = useColumnModals();

  const toolbarProps = useToolbar({
    sheetName: activeSheet?.name,
    hasActiveSheet: Boolean(activeSheetId),
    onSave: handleSave,
    onOpenMenu: () => setIsDrawerOpen(true),
    isSaving,
  });

  const drawerProps = useSheetMenuDrawer({
    open: isDrawerOpen,
    onOpenChange: setIsDrawerOpen,
    categories,
    sheetsByCategory,
    openSheetIds,
    favoriteSheetIds,
    activeSheetId,
    onSelectSheet: handleOpenSheet,
    onToggleFavorite: handleToggleFavoriteSheet,
  });

  const virtualRows = rowVirtualizer.getVirtualItems();
  const virtualCols = columnVirtualizer.getVirtualItems();

  const composedColumns = useMemo(
    () =>
      virtualCols.map((col) => ({
        id: col.key,
        index: col.index,
        start: col.start,
        size: col.size,
        label: columnNames[col.key as ColumnId] ?? `列 ${col.index + 1}`,
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
            {(statusProps) => <RowStatusPresenter {...statusProps} />}
          </RowStatusContainer>
        ),
        cells: composedColumns.map((col) => (
          <CellContainer
            key={`${item.key}-${col.id}`}
            row={item.index}
            col={col.index}
            rowId={item.key as RowId}
            colId={col.id as ColumnId}
            onFinishEditing={focusSheet}
          >
            {(cellProps) => <CellPresenter {...cellProps} />}
          </CellContainer>
        )),
      })),
    [virtualRows, composedColumns, focusSheet],
  );

  const removeColumnBinding = useSetAtom(removeColumnBindingAtom);
  const clearColumnFilter = useSetAtom(clearColumnFilterAtom);
  const toggleColumnTotal = useSetAtom(toggleColumnTotalAtom);
  const hasFooter = useAtomValue(hasActiveColumnTotalsAtom);
  const summaryValues = useAtomValue(activeColumnSummaryValuesAtom);

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
          <ColumnHeaderPresenter
            {...headerProps}
            onOpenSettingModal={handleOpenSettingModal}
            onRemoveBinding={(colId) => removeColumnBinding(colId)}
            onOpenFilterModal={handleOpenFilterModal}
            onClearFilter={(colId) => clearColumnFilter(colId)}
            onToggleTotal={(colId) => toggleColumnTotal(colId)}
          />
        )}
      </ColumnHeaderContainer>
    ),
    [
      handleOpenSettingModal,
      handleOpenFilterModal,
      removeColumnBinding,
      clearColumnFilter,
      toggleColumnTotal,
    ],
  );

  const renderFooterCell = useCallback(
    (col: AxisLayout) => {
      const colId = isColumnId(col.id) ? col.id : null;
      const value = colId ? summaryValues[colId] : "";
      return <FooterCell value={value} />;
    },
    [summaryValues],
  );

  if (viewMode === "pdf-preview") {
    return <PdfPreviewPresenter {...pdfPreviewProps} />;
  }

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={pointerWithin}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <WorkbookPresenter
          toolbar={<ToolbarPresenter {...toolbarProps} />}
          tabs={
            <SheetTabsPresenter
              activeSheetId={activeSheetId}
              sheets={openSheets}
              onSelectSheet={handleSelectSheet}
              onCloseSheet={handleCloseSheet}
              onOpenMenu={() => setIsDrawerOpen(true)}
            />
          }
          sheet={
            activeSheetId ? (
              <SortableContext
                items={sortableColumnOrder}
                strategy={horizontalListSortingStrategy}
              >
                <SheetPresenter
                  ref={parentRef}
                  selection={selection}
                  rows={composedRows}
                  columns={composedColumns}
                  totalWidth={columnVirtualizer.getTotalSize()}
                  totalHeight={rowVirtualizer.getTotalSize()}
                  getRowLayout={getRowLayout}
                  getColumnLayout={getColumnLayout}
                  onChangeColumnWidth={handleChangeColumnWidth}
                  renderHeaderCell={renderHeaderCell}
                  hasFooter={hasFooter}
                  renderFooterCell={renderFooterCell}
                  onKeyDown={handleKeyDown}
                  onMouseDown={handleMouseDown}
                />
              </SortableContext>
            ) : (
              <EmptySheetPresenter onOpenMenu={() => setIsDrawerOpen(true)} />
            )
          }
        />
      </DndContext>
      <SheetMenuDrawerPresenter {...drawerProps} />
      {settingModalColId !== null && (
        <ColumnSettingModalContainer
          key={settingModalColId}
          targetColId={settingModalColId}
          open={true}
          onOpenChange={(open) => {
            if (!open) handleCloseSettingModal();
          }}
        >
          {(modalProps) => <ColumnSettingModalPresenter {...modalProps} />}
        </ColumnSettingModalContainer>
      )}
      {filterModalColId !== null && (
        <ColumnFilterModalContainer
          key={filterModalColId}
          targetColId={filterModalColId}
          open={true}
          onOpenChange={(open) => {
            if (!open) handleCloseFilterModal();
          }}
        >
          {(modalProps) => <ColumnFilterModalPresenter {...modalProps} />}
        </ColumnFilterModalContainer>
      )}
      <ToastPresenter {...toastProps} />
      <LoadingOverlayPresenter open={isSaving} message={t("saving")} />
    </>
  );
};

export const Workbook = dynamic(() => Promise.resolve(WorkbookRoot), {
  ssr: false,
});
