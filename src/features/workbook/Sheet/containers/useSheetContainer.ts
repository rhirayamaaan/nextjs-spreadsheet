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
import { useCallback, useEffect, useRef, useState } from "react";
import {
  activeSheetIdAtom,
  type ColumnId,
  columnNamesAtom,
  columnOrderAtom,
  columnWidthOverridesAtom,
  pasteRowsAtom,
  reorderColumnsWithFollowersAtom,
  sortableColumnOrderAtom,
  visibleRowOrderAtom,
  workbookStatusAtom,
} from "../../stores";

export const useSheetContainer = () => {
  const parentRef = useRef<HTMLDivElement>(null);
  const activeSheetId = useAtomValue(activeSheetIdAtom);
  const [columnWidthOverrides, setColumnWidthOverrides] = useAtom(
    columnWidthOverridesAtom,
  );

  const visibleRowOrder = useAtomValue(visibleRowOrderAtom);
  const columnOrder = useAtomValue(columnOrderAtom);
  const sortableColumnOrder = useAtomValue(sortableColumnOrderAtom);

  const columnNames = useAtomValue(columnNamesAtom);
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

  // Tab switch scroll reset
  // biome-ignore lint/correctness/useExhaustiveDependencies: activeSheetId is used as a trigger for resetting scroll on tab switch
  useEffect(() => {
    if (parentRef.current) {
      parentRef.current.scrollTop = 0;
      parentRef.current.scrollLeft = 0;
    }
  }, [activeSheetId]);

  const rowVirtualizer = useVirtualizer({
    count: visibleRowOrder.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 35,
    overscan: 10,
    getItemKey: (index) => visibleRowOrder[index],
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
  }, [pasteRows]);

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
      if (index < 0 || index >= visibleRowOrder.length) return undefined;
      const item = rowVirtualizer.measurementsCache[index];
      if (item) {
        return { start: item.start, size: item.size };
      }
      return { start: index * 35, size: 35 };
    },
    [rowVirtualizer, visibleRowOrder.length],
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

  return {
    parentRef,
    rowVirtualizer,
    columnVirtualizer,
    columnOrder,
    sortableColumnOrder,
    columnNames,
    activeId,
    sensors,
    handleDragStart,
    handleDragEnd,
    handleChangeColumnWidth,
    getRowLayout,
    getColumnLayout,
  };
};
