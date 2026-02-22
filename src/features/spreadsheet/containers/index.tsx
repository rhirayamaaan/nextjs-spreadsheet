"use client";

import { useVirtualizer } from "@tanstack/react-virtual";
import { useAtom } from "jotai";
import { type FC, useCallback, useEffect, useRef } from "react";
import { CellContainer } from "../Cell/containers";
import { SpreadsheetPresenter } from "../components";
import { columnWidthOverridesAtom } from "../stores";

export const SpreadsheetContainer: FC = () => {
  const parentRef = useRef<HTMLDivElement>(null);
  const [columnWidthOverrides, setColumnWidthOverrides] = useAtom(
    columnWidthOverridesAtom,
  );

  const rowVirtualizer = useVirtualizer({
    count: 10000,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 35,
    overscan: 10,
  });

  const columnVirtualizer = useVirtualizer({
    count: 26,
    horizontal: true,
    getScrollElement: () => parentRef.current,
    estimateSize: (index) => columnWidthOverrides[index] ?? 100,
    overscan: 5,
  });

  // 列幅のカスタマイズが更新されたら、Virtualizer に再計算を促す
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    columnVirtualizer.measure();
  }, [columnWidthOverrides, columnVirtualizer]);

  const handleChangeColumnWidth = useCallback(
    (index: number, width: number) => {
      setColumnWidthOverrides((prev) => ({ ...prev, [index]: width }));
    },
    [setColumnWidthOverrides],
  );

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
      totalWidth={columnVirtualizer.getTotalSize()}
      totalHeight={rowVirtualizer.getTotalSize()}
      CellComponent={CellContainer}
      onChangeColumnWidth={handleChangeColumnWidth}
    />
  );
};
