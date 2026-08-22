import { type FC, memo } from "react";
import type { ParsedCell } from "../../types";
import styles from "./index.module.css";

interface CellProps {
  cell: ParsedCell;
  onClick?: (cell: ParsedCell) => void;
  rowSpan?: number;
  colSpan?: number;
}

export const Cell: FC<CellProps> = memo(
  ({ cell, onClick, rowSpan, colSpan }) => {
    const { style, value } = cell;

    const cellStyle: React.CSSProperties = {
      backgroundColor: style.backgroundColor,
      color: style.color,
      fontWeight: style.fontWeight,
      fontStyle: style.fontStyle,
      textAlign: style.textAlign,
      verticalAlign: style.verticalAlign,
      borderTop: style.borderTop
        ? `${style.borderTop.style} ${style.borderTop.color}`
        : undefined,
      borderBottom: style.borderBottom
        ? `${style.borderBottom.style} ${style.borderBottom.color}`
        : undefined,
      borderLeft: style.borderLeft
        ? `${style.borderLeft.style} ${style.borderLeft.color}`
        : undefined,
      borderRight: style.borderRight
        ? `${style.borderRight.style} ${style.borderRight.color}`
        : undefined,
    };

    return (
      // biome-ignore lint/a11y/useKeyWithClickEvents: Click selection for preview cells
      <td
        data-address={cell.address}
        className={styles.excelCell}
        style={cellStyle}
        rowSpan={rowSpan}
        colSpan={colSpan}
        onClick={() => onClick?.(cell)}
      >
        {value}
      </td>
    );
  },
);

Cell.displayName = "Cell";
export default Cell;
