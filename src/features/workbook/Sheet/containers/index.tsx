"use client";

import { useVirtualizer } from "@tanstack/react-virtual";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { type FC, useCallback, useEffect, useRef } from "react";
import { CellContainer } from "../../Cell/containers";
import { RowStatusContainer } from "../../RowStatus/containers";
import {
  activeSheetIdAtom,
  type ColumnId,
  columnOrderAtom,
  columnWidthOverridesAtom,
  pasteRowsAtom,
  type RowId,
  rowOrderAtom,
  selectionAtom,
  workbookStatusAtom,
} from "../../stores";
import { SheetPresenter } from "../components";

export const SheetContainer: FC = () => {
  const parentRef = useRef<HTMLDivElement>(null);
  const activeSheetId = useAtomValue(activeSheetIdAtom);
  const [columnWidthOverrides, setColumnWidthOverrides] = useAtom(
    columnWidthOverridesAtom,
  );

  const [rowOrder] = useAtom(rowOrderAtom);
  const [columnOrder] = useAtom(columnOrderAtom);
  const [status, setStatus] = useAtom(workbookStatusAtom);
  const selection = useAtomValue(selectionAtom);
  const pasteRows = useSetAtom(pasteRowsAtom);

  // Tab switch scroll reset
  // biome-ignore lint/correctness/useExhaustiveDependencies: activeSheetId is used as a trigger for resetting scroll on tab switch
  useEffect(() => {
    if (parentRef.current) {
      parentRef.current.scrollTop = 0;
      parentRef.current.scrollLeft = 0;
    }
  }, [activeSheetId]);

  useEffect(() => {
    const handlePaste = (event: ClipboardEvent) => {
      const activeElement = document.activeElement;
      const isInput =
        activeElement &&
        (activeElement.tagName === "INPUT" ||
          activeElement.tagName === "TEXTAREA" ||
          (activeElement as HTMLElement).isContentEditable);

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
  }, [pasteRows]);

  const rowVirtualizer = useVirtualizer({
    count: rowOrder.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 35,
    overscan: 10,
    getItemKey: (index) => rowOrder[index],
  });

  const columnVirtualizer = useVirtualizer({
    count: columnOrder.length,
    horizontal: true,
    getScrollElement: () => parentRef.current,
    estimateSize: (index) => columnWidthOverrides[columnOrder[index]] ?? 100,
    overscan: 5,
    getItemKey: (index) => columnOrder[index],
  });

  // biome-ignore lint/correctness/useExhaustiveDependencies: 列幅のカスタマイズが更新されたら、Virtualizer に再計算を促す
  useEffect(() => {
    columnVirtualizer.measure();
  }, [columnWidthOverrides, columnVirtualizer]);

  const handleChangeColumnWidth = useCallback(
    (id: string | number | bigint, width: number) => {
      setColumnWidthOverrides((prev) => ({ ...prev, [id as ColumnId]: width }));
    },
    [setColumnWidthOverrides],
  );

  const handleStopSelection = useCallback(() => {
    setStatus((prev) => (prev === "selecting" ? "idle" : prev));
  }, [setStatus]);

  useEffect(() => {
    if (status !== "selecting") {
      return;
    }

    window.addEventListener("mouseup", handleStopSelection);

    return () => {
      window.removeEventListener("mouseup", handleStopSelection);
    };
  }, [status, handleStopSelection]);

  const columns = columnVirtualizer.getVirtualItems().map((item) => ({
    id: item.key,
    index: item.index,
    start: item.start,
    size: item.size,
  }));

  const rows = rowVirtualizer.getVirtualItems().map((item) => ({
    id: item.key,
    index: item.index,
    start: item.start,
    size: item.size,
    status: <RowStatusContainer key={item.key} rowId={item.key as RowId} />,
    cells: columns.map((col) => (
      <CellContainer
        key={`${item.key}-${col.id}`}
        row={item.index}
        col={col.index}
      />
    )),
  }));

  return (
    <SheetPresenter
      ref={parentRef}
      rows={rows}
      columns={columns}
      totalWidth={columnVirtualizer.getTotalSize()}
      totalHeight={rowVirtualizer.getTotalSize()}
      selection={selection}
      onChangeColumnWidth={handleChangeColumnWidth}
    />
  );
};
