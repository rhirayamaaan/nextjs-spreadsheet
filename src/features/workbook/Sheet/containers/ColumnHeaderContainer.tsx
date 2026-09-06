import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useAtomValue } from "jotai";
import type { FC, ReactNode } from "react";
import {
  activeColumnConfigsAtom,
  activeColumnFiltersAtom,
  type ColumnConfig,
  type ColumnId,
  isColumnId,
} from "../../stores";
import type { AxisLayout } from "../components";

export type ColumnHeaderPresenterProps = {
  col: AxisLayout;
  colId: ColumnId | null;
  config?: ColumnConfig;
  isFiltered: boolean;
  setNodeRef: (node: HTMLElement | null) => void;
  dndStyle: {
    transform?: string;
    transition?: string;
  };
  attributes: ReturnType<typeof useSortable>["attributes"];
  listeners: ReturnType<typeof useSortable>["listeners"];
  isDragging: boolean;
  isResizing: boolean;
  onMouseDownResizer: (event: React.MouseEvent) => void;
};

type Props = {
  col: AxisLayout;
  resizingId: string | number | bigint | null;
  onMouseDownResizer: (
    id: string | number | bigint,
    width: number,
  ) => (event: React.MouseEvent) => void;
  children: (props: ColumnHeaderPresenterProps) => ReactNode;
};

export const ColumnHeaderContainer: FC<Props> = ({
  col,
  resizingId,
  onMouseDownResizer,
  children,
}) => {
  const configs = useAtomValue(activeColumnConfigsAtom);
  const filters = useAtomValue(activeColumnFiltersAtom);
  const colId = isColumnId(col.id) ? col.id : null;
  const config = colId ? configs[colId] : undefined;
  const isLookup = config?.type === "lookup";

  const isFiltered = Boolean(colId && filters[colId]);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: String(col.id),
    disabled: isLookup,
  });

  const dndStyle = {
    transform: transform ? CSS.Transform.toString(transform) : undefined,
    transition,
  };

  const isResizing = resizingId === col.id;

  return (
    <>
      {children({
        col,
        colId,
        config,
        isFiltered,
        setNodeRef,
        dndStyle,
        attributes,
        listeners,
        isDragging,
        isResizing,
        onMouseDownResizer: onMouseDownResizer(col.id, col.size),
      })}
    </>
  );
};

ColumnHeaderContainer.displayName = "ColumnHeaderContainer";
