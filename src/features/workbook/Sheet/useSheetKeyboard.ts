import type { KeyboardEvent as ReactKeyboardEvent, RefObject } from "react";
import { useCallback, useEffect } from "react";
import {
  type ActiveCell,
  type ColumnConfig,
  type ColumnId,
  isSubtotalRowId,
  type RowId,
  type Selection,
  type SheetMode,
} from "../stores";

export type KeyActionTarget = {
  key: string;
  shiftKey: boolean;
  ctrlKey: boolean;
  metaKey: boolean;
  altKey: boolean;
  preventDefault: () => void;
  isComposing?: boolean;
  keyCode?: number;
  nativeEvent?: { isComposing?: boolean };
};

export type UseSheetKeyboardParams = {
  parentRef: RefObject<HTMLDivElement | null>;
  selection: Selection;
  activeCell: ActiveCell;
  setActiveCell: (cell: ActiveCell) => void;
  sheetMode: SheetMode;
  displayRowOrder: RowId[];
  columnOrder: ColumnId[];
  activeColumnConfigs: Record<ColumnId, ColumnConfig>;
  moveSelection: (params: {
    deltaRow: number;
    deltaCol: number;
    extend: boolean;
  }) => void;
  clearSelectedCells: () => void;
  ensureCellVisible: (row: number, col: number) => void;
  focusSheet: () => void;
};

export const useSheetKeyboard = ({
  parentRef,
  selection,
  activeCell,
  setActiveCell,
  sheetMode,
  displayRowOrder,
  columnOrder,
  activeColumnConfigs,
  moveSelection,
  clearSelectedCells,
  ensureCellVisible,
  focusSheet,
}: UseSheetKeyboardParams) => {
  const startEditableCell = useCallback(
    (initialValue: string) => {
      if (!selection || sheetMode === "inquiry") return false;
      const { row, col } = selection.start;
      const rowId = displayRowOrder[row];
      if (!rowId || isSubtotalRowId(rowId)) return false;
      const colId = columnOrder[col];
      if (!colId) return false;
      const config = activeColumnConfigs[colId];
      if (config?.type === "lookup" || config?.readOnly) {
        return false;
      }
      ensureCellVisible(row, col);
      setActiveCell({ row, col, initialValue });
      return true;
    },
    [
      selection,
      sheetMode,
      displayRowOrder,
      columnOrder,
      activeColumnConfigs,
      ensureCellVisible,
      setActiveCell,
    ],
  );

  const moveAndScroll = useCallback(
    (deltaRow: number, deltaCol: number, extend: boolean) => {
      if (!selection) return;
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
    },
    [
      selection,
      displayRowOrder.length,
      columnOrder.length,
      moveSelection,
      ensureCellVisible,
    ],
  );

  const processKeyAction = useCallback(
    (event: KeyActionTarget) => {
      if (!selection) return;

      // セル編集中（input等）からの Enter / Tab / Escape バブリング時は
      // シートコンテナへのフォーカス復帰と移動先スクロールのみ行う
      if (activeCell !== null) {
        const isComposing =
          event.nativeEvent?.isComposing ?? Boolean(event.isComposing);
        if (isComposing) return;

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

      const isComposing =
        event.nativeEvent?.isComposing ?? Boolean(event.isComposing);
      if (isComposing || event.key === "Process" || event.keyCode === 229) {
        startEditableCell("");
        return;
      }

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
      displayRowOrder.length,
      columnOrder.length,
      ensureCellVisible,
      startEditableCell,
      moveAndScroll,
      sheetMode,
      clearSelectedCells,
      parentRef,
    ],
  );

  const handleKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLDivElement>) => {
      processKeyAction(event);
    },
    [processKeyAction],
  );

  // フォーカスが document.body に外れた場合のキーボード操作フォールバック
  useEffect(() => {
    const handleGlobalKeyDown = (event: KeyboardEvent) => {
      if (!selection) return;

      const activeEl = document.activeElement;
      const isFocusedOnOtherControl =
        activeEl instanceof HTMLElement &&
        activeEl !== document.body &&
        activeEl !== parentRef.current &&
        !parentRef.current?.contains(activeEl);

      if (isFocusedOnOtherControl) {
        return;
      }

      if (activeEl === document.body) {
        const isTargetKey =
          [
            "ArrowUp",
            "ArrowDown",
            "ArrowLeft",
            "ArrowRight",
            "Enter",
            "Tab",
            "Delete",
            "Backspace",
            "Escape",
          ].includes(event.key) ||
          (!event.ctrlKey &&
            !event.metaKey &&
            !event.altKey &&
            event.key.length === 1);

        if (isTargetKey) {
          processKeyAction(event);
          focusSheet();
        }
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => {
      window.removeEventListener("keydown", handleGlobalKeyDown);
    };
  }, [selection, processKeyAction, focusSheet, parentRef]);

  return { handleKeyDown };
};
