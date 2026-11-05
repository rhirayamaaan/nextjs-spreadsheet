import {
  type DragEndEvent,
  type DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import {
  type ForwardedRef,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import {
  activeCellAtom,
  activeColumnConfigsAtom,
  activeSheetIdAtom,
  activeSheetModeAtom,
  type ColumnId,
  clearSelectedCellsAtom,
  columnNamesAtom,
  columnOrderAtom,
  columnWidthOverridesAtom,
  displayRowOrderAtom,
  hasActiveColumnTotalsAtom,
  isSubtotalRowId,
  moveSelectionAtom,
  pasteRowsAtom,
  reorderColumnsWithFollowersAtom,
  selectionAtom,
  sortableColumnOrderAtom,
  workbookStatusAtom,
} from "../stores";

const HEADER_HEIGHT = 30;
const FOOTER_HEIGHT = 30;
const STATUS_COL_WIDTH = 50;

export type SheetHandle = {
  scrollToCell: (rowIndex: number, colIndex: number) => void;
};

export const useSheetContainer = (ref?: ForwardedRef<SheetHandle>) => {
  const parentRef = useRef<HTMLDivElement>(null);
  const activeSheetId = useAtomValue(activeSheetIdAtom);
  const [columnWidthOverrides, setColumnWidthOverrides] = useAtom(
    columnWidthOverridesAtom,
  );

  const displayRowOrder = useAtomValue(displayRowOrderAtom);
  const sheetMode = useAtomValue(activeSheetModeAtom);
  const columnOrder = useAtomValue(columnOrderAtom);
  const sortableColumnOrder = useAtomValue(sortableColumnOrderAtom);

  const columnNames = useAtomValue(columnNamesAtom);
  const activeColumnConfigs = useAtomValue(activeColumnConfigsAtom);
  const hasFooter = useAtomValue(hasActiveColumnTotalsAtom);
  const [activeCell, setActiveCell] = useAtom(activeCellAtom);
  const selection = useAtomValue(selectionAtom);
  const moveSelection = useSetAtom(moveSelectionAtom);
  const clearSelectedCells = useSetAtom(clearSelectedCellsAtom);
  const setStatus = useSetAtom(workbookStatusAtom);

  const [activeId, setActiveId] = useState<string | number | bigint | null>(
    null,
  );

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // Tab switch scroll reset: activeSheetId が変化した際にスクロール位置を原点にリセット
  const prevActiveSheetIdRef = useRef(activeSheetId);
  useEffect(() => {
    if (prevActiveSheetIdRef.current !== activeSheetId) {
      prevActiveSheetIdRef.current = activeSheetId;
      if (parentRef.current) {
        parentRef.current.scrollTop = 0;
        parentRef.current.scrollLeft = 0;
      }
    }
  }, [activeSheetId]);

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

  const reorderColumns = useSetAtom(reorderColumnsWithFollowersAtom);

  const handleReorderColumn = useCallback(
    (activeColId: ColumnId, overColId: ColumnId) => {
      reorderColumns({ activeColId, overColId });
    },
    [reorderColumns],
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id);
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (over && active.id !== over.id) {
        handleReorderColumn(active.id as ColumnId, over.id as ColumnId);
      }
      setActiveId(null);
    },
    [handleReorderColumn],
  );

  const handleChangeColumnWidth = useCallback(
    (id: string | number | bigint, width: number) => {
      setColumnWidthOverrides((prev) => ({ ...prev, [id as ColumnId]: width }));
    },
    [setColumnWidthOverrides],
  );

  const pasteRows = useSetAtom(pasteRowsAtom);

  useEffect(() => {
    const handlePaste = (event: ClipboardEvent) => {
      if (sheetMode === "inquiry") return;

      const activeElement = document.activeElement;
      const isInput =
        activeElement instanceof HTMLElement &&
        (activeElement.tagName === "INPUT" ||
          activeElement.tagName === "TEXTAREA" ||
          activeElement.isContentEditable);

      if (isInput) return;

      const text = event.clipboardData?.getData("text/plain");
      if (!text) return;

      const rowsData = text
        .split(/\r?\n/)
        .filter((row) => row.length > 0)
        .map((row) => row.split("\t"));

      if (rowsData.length > 0) {
        pasteRows(rowsData);
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => {
      window.removeEventListener("paste", handlePaste);
    };
  }, [pasteRows, sheetMode]);

  useEffect(() => {
    const handleMouseUp = () => {
      setStatus((prev) => (prev === "selecting" ? "idle" : prev));
    };
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [setStatus]);

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
  useImperativeHandle(ref, () => ({ scrollToCell }), [scrollToCell]);

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
      if (event.target === event.currentTarget && event.button === 0) {
        focusSheet();
      }
    },
    [focusSheet],
  );

  const handleKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLDivElement>) => {
      if (!selection) return;

      // セル編集中（input等）からの Enter / Tab / Escape バブリング時は
      // シートコンテナへのフォーカス復帰と移動先スクロールのみ行う
      if (activeCell !== null) {
        if (event.nativeEvent.isComposing) return;
        if (event.key === "Enter" || event.key === "Tab") {
          event.preventDefault();
          const deltaRow =
            event.key === "Enter" ? (event.shiftKey ? -1 : 1) : 0;
          const deltaCol = event.key === "Tab" ? (event.shiftKey ? -1 : 1) : 0;
          const nextRow = Math.max(
            0,
            Math.min(
              displayRowOrder.length - 1,
              selection.start.row + deltaRow,
            ),
          );
          const nextCol = Math.max(
            0,
            Math.min(columnOrder.length - 1, selection.start.col + deltaCol),
          );
          ensureCellVisible(nextRow, nextCol);
          queueMicrotask(() => {
            parentRef.current?.focus({ preventScroll: true });
          });
        } else if (event.key === "Escape") {
          event.preventDefault();
          queueMicrotask(() => {
            parentRef.current?.focus({ preventScroll: true });
          });
        }
        return;
      }

      const startEditableCell = (initialValue: string) => {
        if (sheetMode === "inquiry") return false;
        const { row, col } = selection.start;
        const rowId = displayRowOrder[row];
        if (!rowId || isSubtotalRowId(rowId)) return false;
        const colId = columnOrder[col];
        if (!colId) return false;
        const config = activeColumnConfigs[colId];
        if (config?.type === "lookup" || config?.readOnly) {
          return false;
        }
        setActiveCell({ row, col, initialValue });
        return true;
      };

      if (
        event.nativeEvent.isComposing ||
        event.key === "Process" ||
        event.keyCode === 229
      ) {
        startEditableCell("");
        return;
      }

      const moveAndScroll = (
        deltaRow: number,
        deltaCol: number,
        extend: boolean,
      ) => {
        const base = extend ? selection.end : selection.start;
        const nextRow = Math.max(
          0,
          Math.min(displayRowOrder.length - 1, base.row + deltaRow),
        );
        const nextCol = Math.max(
          0,
          Math.min(columnOrder.length - 1, base.col + deltaCol),
        );
        moveSelection({ deltaRow, deltaCol, extend });
        ensureCellVisible(nextRow, nextCol);
      };

      switch (event.key) {
        case "ArrowUp":
          event.preventDefault();
          moveAndScroll(-1, 0, event.shiftKey);
          return;
        case "ArrowDown":
          event.preventDefault();
          moveAndScroll(1, 0, event.shiftKey);
          return;
        case "ArrowLeft":
          event.preventDefault();
          moveAndScroll(0, -1, event.shiftKey);
          return;
        case "ArrowRight":
          event.preventDefault();
          moveAndScroll(0, 1, event.shiftKey);
          return;
        case "Enter":
          event.preventDefault();
          moveAndScroll(event.shiftKey ? -1 : 1, 0, false);
          return;
        case "Tab":
          event.preventDefault();
          moveAndScroll(0, event.shiftKey ? -1 : 1, false);
          return;
        case "Delete":
        case "Backspace":
          if (sheetMode === "inquiry") return;
          event.preventDefault();
          clearSelectedCells();
          return;
        default:
          break;
      }

      // 単一印字文字の入力（Ctrl / Cmd / Alt 併用時は除外）
      if (
        !event.ctrlKey &&
        !event.metaKey &&
        !event.altKey &&
        event.key.length === 1
      ) {
        if (startEditableCell(event.key)) {
          event.preventDefault();
        }
      }
    },
    [
      activeCell,
      selection,
      displayRowOrder,
      columnOrder,
      activeColumnConfigs,
      sheetMode,
      setActiveCell,
      moveSelection,
      clearSelectedCells,
      ensureCellVisible,
    ],
  );

  return {
    parentRef,
    rowVirtualizer,
    columnVirtualizer,
    columnOrder,
    sortableColumnOrder,
    columnNames,
    selection,
    activeId,
    sensors,
    handleDragStart,
    handleDragEnd,
    handleChangeColumnWidth,
    handleMouseDown,
    handleKeyDown,
    focusSheet,
    getRowLayout,
    getColumnLayout,
  };
};
