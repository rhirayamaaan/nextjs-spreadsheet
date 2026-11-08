import {
  type DragEndEvent,
  type DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useCallback, useState } from "react";
import {
  activeColumnConfigsAtom,
  type ColumnId,
  columnNamesAtom,
  columnOrderAtom,
  columnWidthOverridesAtom,
  reorderColumnsWithFollowersAtom,
  sortableColumnOrderAtom,
} from "../stores";

export const useSheetColumns = () => {
  const columnOrder = useAtomValue(columnOrderAtom);
  const sortableColumnOrder = useAtomValue(sortableColumnOrderAtom);
  const columnNames = useAtomValue(columnNamesAtom);
  const activeColumnConfigs = useAtomValue(activeColumnConfigsAtom);
  const [, setColumnWidthOverrides] = useAtom(columnWidthOverridesAtom);
  const reorderColumns = useSetAtom(reorderColumnsWithFollowersAtom);

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

  return {
    columnOrder,
    sortableColumnOrder,
    columnNames,
    activeColumnConfigs,
    activeId,
    sensors,
    handleDragStart,
    handleDragEnd,
    handleChangeColumnWidth,
  };
};
