import { useVirtualizer } from "@tanstack/react-virtual";
import { useAtom, useAtomValue } from "jotai";
import { useCallback, useEffect, useRef } from "react";
import {
  activeSheetIdAtom,
  type ColumnId,
  columnOrderAtom,
  columnWidthOverridesAtom,
  rowOrderAtom,
  selectionAtom,
  workbookStatusAtom,
} from "../../stores";

export const useSheetContainer = () => {
  const parentRef = useRef<HTMLDivElement>(null);
  const activeSheetId = useAtomValue(activeSheetIdAtom);
  const [columnWidthOverrides, setColumnWidthOverrides] = useAtom(
    columnWidthOverridesAtom,
  );

  const [rowOrder] = useAtom(rowOrderAtom);
  const [columnOrder] = useAtom(columnOrderAtom);
  const [status, setStatus] = useAtom(workbookStatusAtom);
  const selection = useAtomValue(selectionAtom);

  // Tab switch scroll reset
  // biome-ignore lint/correctness/useExhaustiveDependencies: activeSheetId is used as a trigger for resetting scroll on tab switch
  useEffect(() => {
    if (parentRef.current) {
      parentRef.current.scrollTop = 0;
      parentRef.current.scrollLeft = 0;
    }
  }, [activeSheetId]);

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
    if (status !== "selecting") return;
    window.addEventListener("mouseup", handleStopSelection);
    return () => {
      window.removeEventListener("mouseup", handleStopSelection);
    };
  }, [status, handleStopSelection]);

  return {
    parentRef,
    rowVirtualizer,
    columnVirtualizer,
    selection,
    handleChangeColumnWidth,
  };
};
