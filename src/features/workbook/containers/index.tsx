"use client";

import { DndContext, pointerWithin } from "@dnd-kit/core";
import {
  horizontalListSortingStrategy,
  SortableContext,
} from "@dnd-kit/sortable";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { type FC, useCallback, useMemo, useState } from "react";
import { useI18n } from "@/i18n/useI18n";
import { Cell } from "../Cell/components";
import { CellContainer } from "../Cell/containers";
import { EmptySheet, Workbook } from "../components";
import { localMessages } from "../components/i18n";
import { LoadingOverlay } from "../components/LoadingOverlay";
import { SheetTabs } from "../components/SheetTabs";
import { Toolbar } from "../components/Toolbar";
import { PdfPreview } from "../PdfPreview/components";
import { usePdfPreviewContainer } from "../PdfPreview/containers/usePdfPreviewContainer";
import { RowStatus } from "../RowStatus/components";
import { RowStatusContainer } from "../RowStatus/containers";
import {
  type AxisLayout,
  FooterCell,
  HeaderCell,
  Sheet,
} from "../Sheet/components";
import { ColumnFilterModal } from "../Sheet/components/ColumnFilterModal";
import { ColumnSettingModal } from "../Sheet/components/ColumnSettingModal";
import { ColumnHeaderContainer } from "../Sheet/containers/ColumnHeaderContainer";
import { useSheetContainer } from "../Sheet/containers/useSheetContainer";
import { SheetMenuDrawer } from "../SheetMenuDrawer/components";
import { useSheetMenuDrawerContainer } from "../SheetMenuDrawer/containers/useSheetMenuDrawerContainer";
import {
  activeColumnSummaryValuesAtom,
  type ColumnId,
  clearColumnFilterAtom,
  hasActiveColumnTotalsAtom,
  isColumnId,
  type RowId,
  removeColumnBindingAtom,
  selectionAtom,
  sheetCategoriesAtom,
  toggleColumnTotalAtom,
  viewModeAtom,
} from "../stores";
import { Toast } from "../Toast/components";
import { useToastContainer } from "../Toast/containers/useToastContainer";
import { useExportExcel } from "./useExportExcel";
import { useExportPdf } from "./useExportPdf";
import { useSaveSheet } from "./useSaveSheet";
import { useSheetLoader } from "./useSheetLoader";
import { useWorkbookMetadataLoader } from "./useWorkbookMetadataLoader";

export const WorkbookContainer: FC = () => {
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

  const drawerProps = useSheetMenuDrawerContainer({
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
    sortableColumnOrder,
    columnNames,
    sensors,
    handleDragStart,
    handleDragEnd,
    handleChangeColumnWidth,
    handleKeyDown,
    getRowLayout,
    getColumnLayout,
  } = useSheetContainer();

  const { t } = useI18n(localMessages);
  const { showToast, toastProps } = useToastContainer();
  const setSelection = useSetAtom(selectionAtom);

  const scrollToCell = useCallback(
    (rowIndex: number, colIndex: number) => {
      const container = parentRef.current;
      const rowLayout = getRowLayout(rowIndex);
      const colLayout = getColumnLayout(colIndex);

      const cellTop = rowLayout?.start ?? rowIndex * 35;
      const cellLeft = colLayout?.start ?? 0;
      const cellWidth = colLayout?.size ?? 100;

      // 該当セルが画面上部（ヘッダー下）に見えるようターゲットY座標を決定
      const targetTop = Math.max(0, cellTop - 20);

      // 横スクロールの計算
      let targetLeft = container ? container.scrollLeft : 0;
      if (container) {
        const currentLeft = container.scrollLeft;
        const containerWidth = container.clientWidth;
        // 画面外にある場合は表示範囲に入るようスクロール
        if (
          cellLeft < currentLeft ||
          cellLeft + cellWidth > currentLeft + containerWidth - 60
        ) {
          targetLeft = Math.max(0, cellLeft - 60);
        }
      }

      // 1. スクロールコンテナ本体をスムーズスクロール
      if (container) {
        container.scrollTo({
          top: targetTop,
          left: targetLeft,
          behavior: "smooth",
        });
      }

      // 2. 選択状態を該当セルにセット
      setSelection({
        start: { row: rowIndex, col: colIndex },
        end: { row: rowIndex, col: colIndex },
      });
    },
    [parentRef, getRowLayout, getColumnLayout, setSelection],
  );

  const handleValidationError = useCallback(
    (error: { rowIndex: number; colIndex: number }) => {
      scrollToCell(error.rowIndex, error.colIndex);
      showToast({
        type: "error",
        title: t("validationErrorTitle"),
        message: t("validationErrorMessage"),
        requiresConfirm: true,
      });
    },
    [scrollToCell, showToast, t],
  );

  const handleSaveSuccess = useCallback(() => {
    showToast({
      type: "success",
      title: t("saveSuccessTitle"),
      message: t("saveSuccessMessage"),
      duration: 3500,
    });
  }, [showToast, t]);

  const handleSaveError = useCallback(() => {
    showToast({
      type: "error",
      title: t("saveErrorTitle"),
      message: t("saveErrorMessage"),
      requiresConfirm: true,
    });
  }, [showToast, t]);

  const { saveCurrentSheet, isSaving } = useSaveSheet({
    onValidationError: handleValidationError,
    onSuccess: handleSaveSuccess,
    onError: handleSaveError,
  });

  const handleSave = useCallback(async () => {
    await saveCurrentSheet();
  }, [saveCurrentSheet]);

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
          >
            {(cellProps) => <Cell {...cellProps} />}
          </CellContainer>
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
          <HeaderCell
            {...headerProps}
            onOpenSettingModal={(colId) => setSettingModalColId(colId)}
            onRemoveBinding={(colId) => removeColumnBinding(colId)}
            onOpenFilterModal={(colId) => setFilterModalColId(colId)}
            onClearFilter={(colId) => clearColumnFilter(colId)}
            onToggleTotal={(colId) => toggleColumnTotal(colId)}
          />
        )}
      </ColumnHeaderContainer>
    ),
    [removeColumnBinding, clearColumnFilter, toggleColumnTotal],
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
              hasActiveSheet={Boolean(activeSheetId)}
              onExport={exportCurrentSheet}
              onPreviewPdf={previewCurrentSheetPdf}
              onSave={handleSave}
              onOpenMenu={() => setIsDrawerOpen(true)}
              isExportingExcel={isExportingExcel}
              isExportingPdf={isExportingPdf}
              isSaving={isSaving}
            />
          }
          tabs={
            <SheetTabs
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
                  hasFooter={hasFooter}
                  renderFooterCell={renderFooterCell}
                  onKeyDown={handleKeyDown}
                />
              </SortableContext>
            ) : (
              <EmptySheet onOpenMenu={() => setIsDrawerOpen(true)} />
            )
          }
        />
      </DndContext>
      <SheetMenuDrawer {...drawerProps} />
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
      <Toast {...toastProps} />
      <LoadingOverlay open={isSaving} message={t("saving")} />
    </>
  );
};
