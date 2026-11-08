import { useVirtualizer } from "@tanstack/react-virtual";
import { useAtom, useAtomValue } from "jotai";
import {
  type ForwardedRef,
  type MouseEvent as ReactMouseEvent,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
import {
  activeCellAtom,
  columnOrderAtom,
  columnWidthOverridesAtom,
  displayRowOrderAtom,
  hasActiveColumnTotalsAtom,
  selectionAtom,
} from "../stores";

const HEADER_HEIGHT = 30;
const FOOTER_HEIGHT = 30;
const STATUS_COL_WIDTH = 50;

export type SheetHandle = {
  scrollToCell: (rowIndex: number, colIndex: number) => void;
};

export type UseSheetVirtualizerParams = {
  sheetRef?: ForwardedRef<SheetHandle>;
};

export const useSheetVirtualizer = ({
  sheetRef,
}: UseSheetVirtualizerParams = {}) => {
  const parentRef = useRef<HTMLDivElement>(null);
  const columnWidthOverrides = useAtomValue(columnWidthOverridesAtom);
  const displayRowOrder = useAtomValue(displayRowOrderAtom);
  const columnOrder = useAtomValue(columnOrderAtom);
  const hasFooter = useAtomValue(hasActiveColumnTotalsAtom);
  const [activeCell, setActiveCell] = useAtom(activeCellAtom);
  const selection = useAtomValue(selectionAtom);

  const rowVirtualizer = useVirtualizer({
    count: displayRowOrder.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 35,
    overscan: 10,
    getItemKey: (index) => displayRowOrder[index],
  });

  const columnVirtualizer = useVirtualizer({
    count: columnOrder.length,
    horizontal: true,
    getScrollElement: () => parentRef.current,
    estimateSize: (index) => columnWidthOverrides[columnOrder[index]] ?? 100,
    overscan: 5,
    getItemKey: (index) => columnOrder[index],
  });

  // 列幅の上書き設定が更新されたら Virtualizer の計測を再実行
  useEffect(() => {
    if (columnWidthOverrides) {
      columnVirtualizer.measure();
    }
  }, [columnWidthOverrides, columnVirtualizer]);

  const getRowLayout = useCallback(
    (index: number) => {
      if (index < 0 || index >= displayRowOrder.length) return undefined;
      const item = rowVirtualizer.measurementsCache[index];
      if (item) {
        return { start: item.start, size: item.size };
      }
      return { start: index * 35, size: 35 };
    },
    [rowVirtualizer, displayRowOrder.length],
  );

  const getColumnLayout = useCallback(
    (index: number) => {
      if (index < 0 || index >= columnOrder.length) return undefined;
      const item = columnVirtualizer.measurementsCache[index];
      if (item) {
        return { start: item.start, size: item.size };
      }
      let start = 0;
      for (let i = 0; i < index; i++) {
        const colId = columnOrder[i];
        start += (colId ? columnWidthOverrides[colId] : undefined) ?? 100;
      }
      const colId = columnOrder[index];
      const size = (colId ? columnWidthOverrides[colId] : undefined) ?? 100;
      return { start, size };
    },
    [columnVirtualizer, columnOrder, columnWidthOverrides],
  );

  const scrollToCell = useCallback(
    (rowIndex: number, colIndex: number) => {
      const container = parentRef.current;
      if (!container) return;

      const rowLayout = getRowLayout(rowIndex);
      const colLayout = getColumnLayout(colIndex);

      const cellTop = rowLayout?.start ?? rowIndex * 35;
      const cellLeft = colLayout?.start ?? 0;
      const cellWidth = colLayout?.size ?? 100;

      // 該当セルが画面上部（ヘッダー下）に見えるようターゲットY座標を決定
      const targetTop = Math.max(0, cellTop - 20);

      // 横スクロールの計算
      let targetLeft = container.scrollLeft;
      const containerWidth = container.clientWidth;
      if (
        cellLeft < container.scrollLeft ||
        cellLeft + cellWidth > container.scrollLeft + containerWidth - 60
      ) {
        targetLeft = Math.max(0, cellLeft - 60);
      }

      container.scrollTo({
        top: targetTop,
        left: targetLeft,
        behavior: "smooth",
      });
    },
    [getRowLayout, getColumnLayout],
  );

  // 親から命令的にセルスクロールを実行できるように handle を公開
  useImperativeHandle(sheetRef, () => ({ scrollToCell }), [scrollToCell]);

  const ensureCellVisible = useCallback(
    (targetRow: number, targetCol: number) => {
      const container = parentRef.current;
      if (!container) return;

      const rowLayout = getRowLayout(targetRow);
      const colLayout = getColumnLayout(targetCol);
      if (!rowLayout || !colLayout) return;

      const footerHeight = hasFooter ? FOOTER_HEIGHT : 0;
      const visibleHeight = Math.max(
        0,
        container.clientHeight - HEADER_HEIGHT - footerHeight,
      );
      const visibleWidth = Math.max(
        0,
        container.clientWidth - STATUS_COL_WIDTH,
      );

      if (rowLayout.start < container.scrollTop) {
        container.scrollTop = rowLayout.start;
      } else if (
        rowLayout.start + rowLayout.size >
        container.scrollTop + visibleHeight
      ) {
        container.scrollTop = rowLayout.start + rowLayout.size - visibleHeight;
      }

      if (colLayout.start < container.scrollLeft) {
        container.scrollLeft = colLayout.start;
      } else if (
        colLayout.start + colLayout.size >
        container.scrollLeft + visibleWidth
      ) {
        container.scrollLeft = colLayout.start + colLayout.size - visibleWidth;
      }
    },
    [getRowLayout, getColumnLayout, hasFooter],
  );

  const focusSheet = useCallback(() => {
    parentRef.current?.focus({ preventScroll: true });
  }, []);

  const handleMouseDown = useCallback(
    (event: ReactMouseEvent<HTMLDivElement>) => {
      if (event.button !== 0) return;
      const target = event.target as HTMLElement | null;
      const isInteractive = target?.closest(
        "input, textarea, select, [role='menuitem'], [data-radix-collection-item]",
      );
      if (!isInteractive) {
        focusSheet();
      }
    },
    [focusSheet],
  );

  const handleScroll = useCallback(() => {
    if (activeCell !== null) {
      setActiveCell(null);
      focusSheet();
    } else if (document.activeElement === document.body && selection) {
      focusSheet();
    }
  }, [activeCell, setActiveCell, focusSheet, selection]);

  return {
    parentRef,
    rowVirtualizer,
    columnVirtualizer,
    displayRowOrder,
    columnOrder,
    selection,
    activeCell,
    setActiveCell,
    getRowLayout,
    getColumnLayout,
    scrollToCell,
    ensureCellVisible,
    focusSheet,
    handleMouseDown,
    handleScroll,
  };
};
