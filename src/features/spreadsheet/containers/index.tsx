"use client";

import { useVirtualizer } from "@tanstack/react-virtual";
import { type FC, useRef } from "react";
import { CellContainer } from "../Cell/containers";
import { SpreadsheetPresenter } from "../components";

export const SpreadsheetContainer: FC = () => {
  const parentRef = useRef<HTMLDivElement>(null);

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
    estimateSize: () => 100,
    overscan: 5,
  });

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
    />
  );
};
