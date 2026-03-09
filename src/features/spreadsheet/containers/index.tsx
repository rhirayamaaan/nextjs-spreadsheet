"use client";

import { useVirtualizer } from "@tanstack/react-virtual";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { type FC, useCallback, useEffect, useRef } from "react";
import { CellContainer } from "../Cell/containers";
import { SpreadsheetPresenter } from "../components";
import {
  type ColumnId,
  columnOrderAtom,
  columnWidthOverridesAtom,
  createColumnId,
  createRowId,
  initialCellValuesAtom,
  rowOrderAtom,
  rowStatusesAtom,
  selectionAtom,
  spreadsheetStatusAtom,
} from "../stores";

export const SpreadsheetContainer: FC = () => {
  const parentRef = useRef<HTMLDivElement>(null);
  const [columnWidthOverrides, setColumnWidthOverrides] = useAtom(
    columnWidthOverridesAtom,
  );
  const [rowOrder, setRowOrder] = useAtom(rowOrderAtom);
  const rowStatuses = useAtomValue(rowStatusesAtom);
  const [columnOrder, setColumnOrder] = useAtom(columnOrderAtom);
  const setInitialValues = useSetAtom(initialCellValuesAtom);
  const [status, setStatus] = useAtom(spreadsheetStatusAtom);
  const selection = useAtomValue(selectionAtom);

  // Note: 初期値生成。APIに置き換え予定
  useEffect(() => {
    if (rowOrder.length === 0 && columnOrder.length === 0) {
      const rows = Array.from({ length: 10000 }, () => createRowId());
      const cols = Array.from({ length: 26 }, () => createColumnId());
      const initialValues: Record<string, string> = {};

      for (let r = 0; r < rows.length; r++) {
        for (let c = 0; c < cols.length; c++) {
          initialValues[`${rows[r]}-${cols[c]}`] = `${c + 1}:${r + 1}`;
        }
      }

      setInitialValues(initialValues);
      setRowOrder(rows);
      setColumnOrder(cols);
    }
  }, [
    rowOrder.length,
    columnOrder.length,
    setInitialValues,
    setRowOrder,
    setColumnOrder,
  ]);

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

  const rows = rowVirtualizer.getVirtualItems().map((item) => ({
    id: item.key,
    index: item.index,
    start: item.start,
    size: item.size,
  }));

  const columns = columnVirtualizer.getVirtualItems().map((item) => ({
    id: item.key,
    index: item.index,
    start: item.start,
    size: item.size,
  }));

  return (
    <SpreadsheetPresenter
      ref={parentRef}
      rows={rows}
      columns={columns}
      rowStatuses={rowStatuses}
      totalWidth={columnVirtualizer.getTotalSize()}
      totalHeight={rowVirtualizer.getTotalSize()}
      selection={selection}
      CellComponent={CellContainer}
      onChangeColumnWidth={handleChangeColumnWidth}
    />
  );
};
