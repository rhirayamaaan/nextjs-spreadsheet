import {
  type DragEndEvent,
  type DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useAtom, useAtomValue } from "jotai";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  activeSheetIdAtom,
  type ColumnId,
  columnNamesAtom,
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
  const [columnOrder, setColumnOrder] = useAtom(columnOrderAtom);
  const columnNames = useAtomValue(columnNamesAtom);
  const [status, setStatus] = useAtom(workbookStatusAtom);
  const selection = useAtomValue(selectionAtom);

  const [activeId, setActiveId] = useState<string | number | bigint | null>(
    null,
  );

  const sensors = useSensors(
    useSensor(PointerSensor),
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

  const handleReorderColumn = useCallback(
    (activeColId: ColumnId, overColId: ColumnId) => {
      setColumnOrder((prev) => {
        const oldIndex = prev.indexOf(activeColId);
        const newIndex = prev.indexOf(overColId);
        if (oldIndex !== -1 && newIndex !== -1) {
          return arrayMove(prev, oldIndex, newIndex);
        }
        return prev;
      });
    },
    [setColumnOrder],
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
    columnOrder,
    columnNames,
    activeId,
    sensors,
    handleDragStart,
    handleDragEnd,
    handleChangeColumnWidth,
  };
};
