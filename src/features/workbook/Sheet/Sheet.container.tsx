import { DndContext, pointerWithin } from "@dnd-kit/core";
import {
  horizontalListSortingStrategy,
  SortableContext,
} from "@dnd-kit/sortable";
import { Flex, Spinner } from "@radix-ui/themes";
import { useAtomValue } from "jotai";
import {
  type FC,
  type ForwardedRef,
  forwardRef,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
  Suspense,
  useCallback,
  useMemo,
} from "react";
import { useI18n } from "@/i18n/useI18n";
import { useSuspenseQuery } from "@/lib/query";
import { getSheetDependencyIds } from "../logics/business/buildSheetData";
import { sheetRecordsQuery } from "../services/sheetRecords/sheetRecords.query";
import {
  activeColumnSummaryValuesAtom,
  type ColumnId,
  hasActiveColumnTotalsAtom,
  isColumnId,
  type RowId,
  type SheetTemplate,
} from "../stores";
import { sheetMessages } from "./i18n";
import {
  type AxisLayout,
  FooterCell,
  type SheetPresenterProps,
} from "./Sheet.presenter";
import { type SheetHandle, useSheetContainer } from "./useSheet.container";

export type { SheetHandle };

export type SheetContainerProps = {
  activeSheetId: string;
  template: SheetTemplate;
  templates: Record<string, SheetTemplate>;
  renderCell: (cellProps: {
    row: number;
    col: number;
    rowId: RowId;
    colId: ColumnId;
    onFinishEditing?: () => void;
  }) => ReactNode;
  renderRowStatus: (statusProps: { rowId: RowId }) => ReactNode;
  renderColumnHeader: (headerProps: {
    col: AxisLayout;
    resizingId: string | number | bigint | null;
    onMouseDownResizer: (
      id: string | number | bigint,
      width: number,
    ) => (event: ReactMouseEvent) => void;
  }) => ReactNode;
  children: (props: SheetPresenterProps) => ReactNode;
};

/**
 * 依存シートを並列で事前フェッチ（Suspense）するコンポーネント
 */
const SheetPrefetcher: FC<{ sheetId: string }> = ({ sheetId }) => {
  useSuspenseQuery(sheetRecordsQuery, sheetId);
  return null;
};

const SheetInner: FC<
  SheetContainerProps & { sheetRef?: ForwardedRef<SheetHandle> }
> = ({
  renderCell,
  renderRowStatus,
  renderColumnHeader,
  children,
  sheetRef,
}) => {
  // 仮想スクロール・キーボード操作・DnD 制御フック (Ref・スクロール制御は内部で完全カプセル化)
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
    handleScroll,
    focusSheet,
    getRowLayout,
    getColumnLayout,
  } = useSheetContainer(sheetRef);

  const { t } = useI18n(sheetMessages);
  const virtualRows = rowVirtualizer.getVirtualItems();
  const virtualCols = columnVirtualizer.getVirtualItems();

  const composedColumns = useMemo(
    () =>
      virtualCols.map((col) => ({
        id: col.key,
        index: col.index,
        start: col.start,
        size: col.size,
        label:
          columnNames[col.key as ColumnId] ??
          t("defaultColumnName", { index: col.index + 1 }),
      })),
    [virtualCols, columnNames, t],
  );

  const composedRows = useMemo(
    () =>
      virtualRows.map((item) => ({
        id: item.key,
        index: item.index,
        start: item.start,
        size: item.size,
        status: renderRowStatus({ rowId: item.key as RowId }),
        cells: composedColumns.map((col) =>
          renderCell({
            row: item.index,
            col: col.index,
            rowId: item.key as RowId,
            colId: col.id as ColumnId,
            onFinishEditing: focusSheet,
          }),
        ),
      })),
    [virtualRows, composedColumns, focusSheet, renderCell, renderRowStatus],
  );

  const hasFooter = useAtomValue(hasActiveColumnTotalsAtom);
  const summaryValues = useAtomValue(activeColumnSummaryValuesAtom);

  const renderHeaderCell = useCallback(
    (
      col: AxisLayout,
      resizingId: string | number | bigint | null,
      handleMouseDownResizer: (
        id: string | number | bigint,
        width: number,
      ) => (event: ReactMouseEvent) => void,
    ) =>
      renderColumnHeader({
        col,
        resizingId,
        onMouseDownResizer: handleMouseDownResizer,
      }),
    [renderColumnHeader],
  );

  const renderFooterCell = useCallback(
    (col: AxisLayout) => {
      const colId = isColumnId(col.id) ? col.id : null;
      const value = colId ? summaryValues[colId] : "";
      return <FooterCell value={value} />;
    },
    [summaryValues],
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={pointerWithin}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={sortableColumnOrder}
        strategy={horizontalListSortingStrategy}
      >
        {children({
          ref: parentRef,
          selection,
          rows: composedRows,
          columns: composedColumns,
          totalWidth: columnVirtualizer.getTotalSize(),
          totalHeight: rowVirtualizer.getTotalSize(),
          getRowLayout,
          getColumnLayout,
          onChangeColumnWidth: handleChangeColumnWidth,
          renderHeaderCell,
          hasFooter,
          renderFooterCell,
          onKeyDown: handleKeyDown,
          onMouseDown: handleMouseDown,
          onScroll: handleScroll,
        })}
      </SortableContext>
    </DndContext>
  );
};

export const SheetContainer = forwardRef<SheetHandle, SheetContainerProps>(
  (props, ref) => {
    const { activeSheetId, templates } = props;
    const neededSheetIds = useMemo(() => {
      return getSheetDependencyIds(activeSheetId, templates);
    }, [activeSheetId, templates]);

    return (
      <Suspense
        fallback={
          <Flex align="center" justify="center" width="100%" height="100%">
            <Spinner size="3" />
          </Flex>
        }
      >
        {/* 兄弟要素としてマウントすることで全依存シートを並列フェッチ (ウォーターフォール解消) */}
        {neededSheetIds.map((id) => (
          <SheetPrefetcher key={id} sheetId={id} />
        ))}
        <SheetInner {...props} sheetRef={ref} />
      </Suspense>
    );
  },
);
SheetContainer.displayName = "SheetContainer";
