import { Theme } from "@radix-ui/themes";
import clsx from "clsx";
import { type FC, memo, type ReactNode, useCallback, useState } from "react";
import type { ParsedSheet } from "../../types";
import { ExcelSelectionOverlay } from "./ExcelSelectionOverlay";
import styles from "./index.module.css";

interface ExcelRow {
  id: string | number;
  cells: ReactNode[];
}

interface SheetProps {
  columnCount: number;
  columnWidths: number[];
  rows: ExcelRow[];
  selectedCellAddress: string | null;
  activeSheet?: ParsedSheet;
  onChangeColumnWidth: (colIndex: number, width: number) => void;
}

export function getColumnLabel(index: number): string {
  let label = "";
  let temp = index;
  while (temp >= 0) {
    label = String.fromCharCode((temp % 26) + 65) + label;
    temp = Math.floor(temp / 26) - 1;
  }
  return label;
}

interface SheetTableProps {
  columnCount: number;
  columnWidths: number[];
  rows: ExcelRow[];
  onMouseDownResizer: (
    index: number,
    width: number,
  ) => (event: React.MouseEvent) => void;
  resizingIndex: number | null;
}

const SheetTable: FC<SheetTableProps> = memo(
  ({ columnCount, columnWidths, rows, onMouseDownResizer, resizingIndex }) => {
    const totalTableWidth = columnWidths.reduce((sum, w) => sum + w, 0) + 45;

    return (
      <table
        className={styles.excelTable}
        style={{ width: `${totalTableWidth}px` }}
      >
        <colgroup>
          <col style={{ width: "45px" }} />
          {columnWidths.map((w, idx) => (
            <col
              key={`col-width-${getColumnLabel(idx)}`}
              style={{ width: `${w}px` }}
            />
          ))}
        </colgroup>
        <thead>
          <tr>
            <th className={styles.headerCorner}>&nbsp;</th>
            {Array.from({ length: columnCount }).map((_, idx) => {
              const label = getColumnLabel(idx);
              const width = columnWidths[idx] || 80;
              return (
                <th key={`col-${label}`} className={styles.columnHeader}>
                  {label}
                  {/* biome-ignore lint/a11y/noStaticElementInteractions: Drag resizer handle */}
                  <div
                    onMouseDown={onMouseDownResizer(idx, width)}
                    className={clsx(
                      styles.headerResizer,
                      resizingIndex === idx && styles["headerResizer--active"],
                    )}
                  />
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rIdx) => (
            <tr key={`row-tr-${row.id}`}>
              <td className={styles.rowHeader}>{rIdx + 1}</td>
              {row.cells.map((cellNode) => {
                if (cellNode === null) return null;
                return cellNode;
              })}
            </tr>
          ))}
        </tbody>
      </table>
    );
  },
);

SheetTable.displayName = "SheetTable";

export const Sheet: FC<SheetProps> = memo(
  ({
    columnCount,
    columnWidths,
    rows,
    selectedCellAddress,
    onChangeColumnWidth,
  }) => {
    const [resizing, setResizing] = useState<{
      index: number;
      startX: number;
      startWidth: number;
    } | null>(null);
    const [indicatorLeft, setIndicatorLeft] = useState(0);

    const handleMouseDownResizer = useCallback(
      (index: number, width: number) => (event: React.MouseEvent) => {
        event.stopPropagation();
        event.preventDefault();

        const startX = event.pageX;
        const startWidth = width;

        const resizerElement = event.currentTarget as HTMLElement;
        const wrapperElement = resizerElement.closest(
          `.${styles.sheetWrapper}`,
        ) as HTMLElement | null;

        if (!wrapperElement) return;

        const wrapperRect = wrapperElement.getBoundingClientRect();
        const resizerRect = resizerElement.getBoundingClientRect();

        const initialLeft =
          resizerRect.left +
          resizerRect.width / 2 -
          wrapperRect.left +
          wrapperElement.scrollLeft;

        setResizing({ index, startX, startWidth });
        setIndicatorLeft(initialLeft);

        const onMouseMove = (e: MouseEvent) => {
          const diff = e.pageX - startX;
          const newWidth = Math.max(30, startWidth + diff);
          const actualDiff = newWidth - startWidth;
          setIndicatorLeft(initialLeft + actualDiff);
        };

        const onMouseUp = (e: MouseEvent) => {
          const diff = e.pageX - startX;
          const finalWidth = Math.max(30, startWidth + diff);
          onChangeColumnWidth(index, finalWidth);
          setResizing(null);

          window.removeEventListener("mousemove", onMouseMove);
          window.removeEventListener("mouseup", onMouseUp);
        };

        window.addEventListener("mousemove", onMouseMove);
        window.addEventListener("mouseup", onMouseUp);
      },
      [onChangeColumnWidth],
    );

    return (
      <Theme
        appearance="light"
        hasBackground
        style={{ width: "100%", height: "100%", overflow: "hidden" }}
      >
        <div className={styles.sheetWrapper}>
          <SheetTable
            columnCount={columnCount}
            columnWidths={columnWidths}
            rows={rows}
            onMouseDownResizer={handleMouseDownResizer}
            resizingIndex={resizing?.index ?? null}
          />

          <ExcelSelectionOverlay
            selectedCellAddress={selectedCellAddress}
            columnWidths={columnWidths}
          />

          {resizing && (
            <div
              className={styles.resizerIndicator}
              style={{ left: `${indicatorLeft}px` }}
            />
          )}
        </div>
      </Theme>
    );
  },
);

Sheet.displayName = "Sheet";
export default Sheet;
