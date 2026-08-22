import { type ComponentProps, type FC, memo, type ReactNode } from "react";
import type { ParsedCell } from "../../types";
import { Cell } from "../components";

type CellProps = ComponentProps<typeof Cell>;

interface CellContainerProps {
  cell: ParsedCell;
  onClick?: (cell: ParsedCell) => void;
  children?: (props: CellProps) => ReactNode;
}

export const CellContainer: FC<CellContainerProps> = memo(
  ({ cell, onClick, children }) => {
    const { merge } = cell;

    // If it's a merged cell and NOT the top-left (main) cell, skip rendering
    if (merge && !merge.isTopLeft) {
      return null;
    }

    const cellProps: CellProps = {
      cell,
      onClick,
      rowSpan: merge?.rowSpan,
      colSpan: merge?.colSpan,
    };

    return <>{children ? children(cellProps) : <Cell {...cellProps} />}</>;
  },
);

CellContainer.displayName = "CellContainer";
export default CellContainer;
