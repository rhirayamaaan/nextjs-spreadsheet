"use client";

import { useAtom, useSetAtom } from "jotai";
import { useHydrateAtoms } from "jotai/utils";
import dynamic from "next/dynamic";
import { type FC, Suspense, useCallback, useRef, useState } from "react";
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
import { SheetContainer, type SheetHandle } from "./Sheet/Sheet.container";
import { SheetPresenter } from "./Sheet/Sheet.presenter";
import { SheetMenuDrawerPresenter } from "./SheetMenuDrawer/SheetMenuDrawer.presenter";
import { useSheetMenuDrawer } from "./SheetMenuDrawer/useSheetMenuDrawer.container";
import { SheetTabsPresenter } from "./SheetTabs.presenter";
import {
  clearColumnFilterAtom,
  injectedCustomValidatorsAtom,
  type RowId,
  removeColumnBindingAtom,
  selectionAtom,
  toggleColumnTotalAtom,
  viewModeAtom,
} from "./stores";
import { ToastPresenter } from "./Toast/Toast.presenter";
import { useToast } from "./Toast/useToast.container";
import { ToolbarPresenter } from "./Toolbar/Toolbar.presenter";
import { useToolbar } from "./Toolbar/useToolbar.container";
import { useColumnModals } from "./useColumnModals.container";
import { useSheetLoader } from "./useSheetLoader.container";
import { useWorkbookSave } from "./useWorkbookSave.container";
import type { CustomValidatorRegistry } from "./validators";
import { WorkbookPresenter } from "./Workbook.presenter";
import { WorkbookLoadingPresenter } from "./WorkbookLoading.presenter";

export type WorkbookProps = {
  customValidators?: CustomValidatorRegistry;
};

const WorkbookRoot: FC<WorkbookProps> = ({ customValidators }) => {
  // 1. 初回レンダー時にフレーム遅延なく宣言的注入
  useHydrateAtoms([[injectedCustomValidatorsAtom, customValidators]]);

  // 2. Props が動的に変更された場合もレンダーフェーズ中に同期（useEffect 不要）
  const [prevValidators, setPrevValidators] = useState(customValidators);
  const setInjected = useSetAtom(injectedCustomValidatorsAtom);
  if (customValidators !== prevValidators) {
    setPrevValidators(customValidators);
    setInjected(customValidators);
  }

  const {
    activeSheet,
    activeSheetId,
    openSheets,
    openSheetIds,
    favoriteSheetIds,
    categories,
    sheetTemplates,
    sheetsByCategory,
    handleSelectSheet,
    handleOpenSheet,
    handleCloseSheet,
    handleToggleFavoriteSheet,
  } = useSheetLoader();

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const [viewMode] = useAtom(viewModeAtom);
  const pdfPreviewProps = usePdfPreview();

  const { t } = useI18n(localMessages);
  const { toastProps, showToast } = useToast();

  const sheetRef = useRef<SheetHandle>(null);
  const setSelection = useSetAtom(selectionAtom);

  const handleValidationError = useCallback(
    (error: { rowIndex: number; colIndex: number; message?: string }) => {
      setSelection({
        start: { row: error.rowIndex, col: error.colIndex },
        end: { row: error.rowIndex, col: error.colIndex },
      });
      sheetRef.current?.scrollToCell(error.rowIndex, error.colIndex);
      showToast({
        type: "error",
        titleKey: "validationErrorTitle",
        message: error.message,
        messageKey: error.message ? undefined : "validationErrorMessage",
        requiresConfirm: true,
        onClose: () => {
          sheetRef.current?.focusSheet();
        },
      });
    },
    [setSelection, showToast],
  );

  const { handleSave, isSaving } = useWorkbookSave({
    showToast,
    t,
    onValidationError: handleValidationError,
  });

  const {
    settingModalColId,
    filterModalColId,
    handleOpenSettingModal,
    handleCloseSettingModal,
    handleOpenFilterModal,
    handleCloseFilterModal,
  } = useColumnModals();

  const removeColumnBinding = useSetAtom(removeColumnBindingAtom);
  const clearColumnFilter = useSetAtom(clearColumnFilterAtom);
  const toggleColumnTotal = useSetAtom(toggleColumnTotalAtom);

  const toolbarProps = useToolbar({
    sheetName: activeSheet?.name,
    hasActiveSheet: Boolean(activeSheetId),
    onSave: handleSave,
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

  const renderCell = useCallback(
    (
      cellProps: Parameters<
        React.ComponentProps<typeof SheetContainer>["renderCell"]
      >[0],
    ) => (
      <CellContainer
        key={`${cellProps.rowId}-${cellProps.colId}`}
        {...cellProps}
      >
        {(props) => <CellPresenter {...props} />}
      </CellContainer>
    ),
    [],
  );

  const renderRowStatus = useCallback(
    ({ rowId }: { rowId: RowId }) => (
      <RowStatusContainer rowId={rowId}>
        {(statusProps) => <RowStatusPresenter {...statusProps} />}
      </RowStatusContainer>
    ),
    [],
  );

  const renderColumnHeader = useCallback(
    ({
      col,
      resizingId,
      onMouseDownResizer,
    }: Parameters<
      React.ComponentProps<typeof SheetContainer>["renderColumnHeader"]
    >[0]) => (
      <ColumnHeaderContainer
        key={col.id}
        col={col}
        resizingId={resizingId}
        onMouseDownResizer={onMouseDownResizer}
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

  if (viewMode === "pdf-preview") {
    return <PdfPreviewPresenter {...pdfPreviewProps} />;
  }

  return (
    <>
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
          activeSheetId && sheetTemplates[activeSheetId] ? (
            <SheetContainer
              ref={sheetRef}
              key={activeSheetId}
              activeSheetId={activeSheetId}
              template={sheetTemplates[activeSheetId]}
              templates={sheetTemplates}
              renderCell={renderCell}
              renderRowStatus={renderRowStatus}
              renderColumnHeader={renderColumnHeader}
            >
              {(sheetProps) => <SheetPresenter {...sheetProps} />}
            </SheetContainer>
          ) : (
            <EmptySheetPresenter onOpenMenu={() => setIsDrawerOpen(true)} />
          )
        }
      />
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

const WorkbookRootWithSuspense: FC<WorkbookProps> = (props) => (
  <Suspense fallback={<WorkbookLoadingPresenter />}>
    <WorkbookRoot {...props} />
  </Suspense>
);

export const Workbook = dynamic(
  () => Promise.resolve(WorkbookRootWithSuspense),
  { ssr: false },
);
