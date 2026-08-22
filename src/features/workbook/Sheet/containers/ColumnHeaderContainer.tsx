import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { FC, ReactNode } from "react";
import type { AxisLayout } from "../components";

export type ColumnHeaderPresenterProps = {
  col: AxisLayout;
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
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: col.id as string });

  const dndStyle = {
    transform: transform ? CSS.Transform.toString(transform) : undefined,
    transition,
  };

  const isResizing = resizingId === col.id;

  return children({
    col,
    setNodeRef,
    dndStyle,
    attributes,
    listeners,
    isDragging,
    isResizing,
    onMouseDownResizer: onMouseDownResizer(col.id, col.size),
  });
};
