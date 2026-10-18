import {
  type FC,
  type KeyboardEvent,
  memo,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
  type Ref,
  useCallback,
  useState,
} from "react";
import type { Selection } from "../stores/types";
import styles from "./Sheet.module.css";

export type AxisLayout = {
  id: string | number | bigint;
  index: number;
  start: number;
  size: number;
  label?: string;
};

export type RowLayout = AxisLayout & {
  status: ReactNode;
  cells: ReactNode[];
};

const MIN_COLUMN_WIDTH = 30;
const STATUS_COL_WIDTH = 50;
const HEADER_HEIGHT = 30;
const FOOTER_HEIGHT = 30;

export type ItemLayout = {
  start: number;
  size: number;
};

const SelectionOverlay = ({
  selection,
  rows,
  columns,
  getRowLayout,
  getColumnLayout,
}: {
  selection?: Selection;
  rows?: AxisLayout[];
  columns?: AxisLayout[];
  getRowLayout?: (index: number) => ItemLayout | undefined;
  getColumnLayout?: (index: number) => ItemLayout | undefined;
}) => {
  if (!selection) return null;

  const minRow = Math.min(selection.start.row, selection.end.row);
  const maxRow = Math.max(selection.start.row, selection.end.row);
  const minCol = Math.min(selection.start.col, selection.end.col);
  const maxCol = Math.max(selection.start.col, selection.end.col);

  const startRow = getRowLayout
    ? getRowLayout(minRow)
    : rows?.find((r) => r.index === minRow);
  const endRow = getRowLayout
    ? getRowLayout(maxRow)
    : rows?.find((r) => r.index === maxRow);
  const startCol = getColumnLayout
    ? getColumnLayout(minCol)
    : columns?.find((c) => c.index === minCol);
  const endCol = getColumnLayout
    ? getColumnLayout(maxCol)
    : columns?.find((c) => c.index === maxCol);

  if (!startRow || !endRow || !startCol || !endCol) return null;

  return (
    <div
      className={styles.sheet__selection}
      style={{
        left: startCol.start,
        top: startRow.start,
        width: endCol.start + endCol.size - startCol.start,
        height: endRow.start + endRow.size - startRow.start,
      }}
    />
  );
};

const SheetCells = memo(
  ({ row, columns }: { row: RowLayout; columns: AxisLayout[] }) => {
    return (
      <div
        className={styles.sheet__cellsLayer}
        style={{
          height: `${row.size}px`,
          transform: `translateY(${row.start}px)`,
        }}
      >
        {columns.map((col, index) => (
          <div
            key={`${row.id}-${col.id}`}
            className={styles.sheet__cellWrapper}
            style={{
              width: `${col.size}px`,
              height: `${row.size}px`,
              transform: `translateX(${col.start}px)`,
            }}
          >
            {row.cells[index]}
          </div>
        ))}
      </div>
    );
  },
);

SheetCells.displayName = "SheetCells";

const SheetRows = memo(
  ({
    rows,
    columns,
    totalWidth,
    totalHeight,
    selection,
    getRowLayout,
    getColumnLayout,
  }: {
    rows: RowLayout[];
    columns: AxisLayout[];
    totalWidth: number;
    totalHeight: number;
    selection?: Selection;
    getRowLayout?: (index: number) => ItemLayout | undefined;
    getColumnLayout?: (index: number) => ItemLayout | undefined;
  }) => {
    return (
      <div
        className={styles.sheet__rowsContainer}
        style={{
          width: `${totalWidth}px`,
          height: `${totalHeight}px`,
        }}
      >
        <SelectionOverlay
          selection={selection}
          rows={rows}
          columns={columns}
          getRowLayout={getRowLayout}
          getColumnLayout={getColumnLayout}
        />
        {rows.map((row) => (
          <SheetCells key={row.id} row={row} columns={columns} />
        ))}
      </div>
    );
  },
);

SheetRows.displayName = "SheetRows";

const StatusColumn = memo(
  ({ rows, totalHeight }: { rows: RowLayout[]; totalHeight: number }) => {
    return (
      <div
        className={styles.sheet__statusColumn}
        style={{
          width: `${STATUS_COL_WIDTH}px`,
          height: `${totalHeight}px`,
        }}
      >
        <div className={styles.sheet__statusColumnInner}>
          {rows.map((row) => (
            <div
              key={row.id}
              className={styles.sheet__statusColumnCell}
              style={{
                width: `${STATUS_COL_WIDTH}px`,
                height: `${row.size}px`,
                transform: `translateY(${row.start}px)`,
              }}
            >
              {row.status}
            </div>
          ))}
        </div>
      </div>
    );
  },
);

StatusColumn.displayName = "StatusColumn";

type BodyProps = {
  rows: RowLayout[];
  columns: AxisLayout[];
  totalWidth: number;
  totalHeight: number;
  selection?: Selection;
  getRowLayout?: (index: number) => ItemLayout | undefined;
  getColumnLayout?: (index: number) => ItemLayout | undefined;
};

const SheetBody = memo(
  ({
    rows,
    columns,
    totalWidth,
    totalHeight,
    selection,
    getRowLayout,
    getColumnLayout,
  }: BodyProps) => {
    return (
      <>
        <StatusColumn rows={rows} totalHeight={totalHeight} />
        <div
          className={styles.sheet__bodyContainer}
          style={{
            top: HEADER_HEIGHT,
            left: STATUS_COL_WIDTH,
            width: `${totalWidth}px`,
            height: `${totalHeight}px`,
          }}
        >
          <SheetRows
            rows={rows}
            columns={columns}
            totalWidth={totalWidth}
            totalHeight={totalHeight}
            selection={selection}
            getRowLayout={getRowLayout}
            getColumnLayout={getColumnLayout}
          />
        </div>
      </>
    );
  },
);

SheetBody.displayName = "SheetBody";

type HeaderProps = {
  columns: AxisLayout[];
  totalWidth: number;
  onChangeColumnWidth: (id: string | number | bigint, width: number) => void;
  renderHeaderCell: (
    col: AxisLayout,
    resizingId: string | number | bigint | null,
    handleMouseDown: (
      id: string | number | bigint,
      width: number,
    ) => (event: React.MouseEvent) => void,
  ) => ReactNode;
};

const SheetHeader: FC<HeaderProps> = ({
  columns,
  totalWidth,
  onChangeColumnWidth,
  renderHeaderCell,
}) => {
  const [resizing, setResizing] = useState<{
    id: string | number | bigint;
    startX: number;
    startWidth: number;
  } | null>(null);
  const [currentX, setCurrentX] = useState(0);

  const handleMouseDown = useCallback(
    (id: string | number | bigint, width: number) =>
      (event: React.MouseEvent) => {
        event.stopPropagation();
        event.preventDefault();
        const startX = event.pageX;
        const startWidth = width;

        const resizerElement = event.currentTarget as HTMLElement;
        const innerElement = resizerElement.closest(
          `.${styles.sheet__inner}`,
        ) as HTMLElement | null;

        if (!innerElement) return;

        const resizerRect = resizerElement.getBoundingClientRect();
        const innerRect = innerElement.getBoundingClientRect();

        const initialLeft =
          resizerRect.left + resizerRect.width / 2 - innerRect.left;

        setResizing({ id, startX, startWidth });
        setCurrentX(initialLeft);

        const onMouseMove = (e: MouseEvent) => {
          const diff = e.pageX - startX;
          const newWidth = Math.max(MIN_COLUMN_WIDTH, startWidth + diff);
          const actualDiff = newWidth - startWidth;
          setCurrentX(initialLeft + actualDiff);
        };

        const onMouseUp = (e: MouseEvent) => {
          const diff = e.pageX - startX;
          const finalWidth = Math.max(MIN_COLUMN_WIDTH, startWidth + diff);
          onChangeColumnWidth(id, finalWidth);
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
    <>
      <div
        className={styles.sheet__header}
        style={{ height: `${HEADER_HEIGHT}px` }}
      >
        <div
          className={styles.sheet__headerStatusCorner}
          style={{ width: `${STATUS_COL_WIDTH}px` }}
        />
        <div
          className={styles.sheet__headerColumns}
          style={{ width: `${totalWidth}px` }}
        >
          {columns.map((col) =>
            renderHeaderCell(col, resizing?.id ?? null, handleMouseDown),
          )}
        </div>
      </div>
      {resizing && (
        <div
          className={styles.sheet__resizerIndicator}
          style={{ left: currentX }}
        />
      )}
    </>
  );
};

type FooterProps = {
  columns: AxisLayout[];
  totalWidth: number;
  renderFooterCell?: (col: AxisLayout) => ReactNode;
};

export const FooterCell: FC<{ value?: string }> = ({ value }) => {
  return <div className={styles.sheet__footerCell}>{value}</div>;
};

const SheetFooter: FC<FooterProps> = ({
  columns,
  totalWidth,
  renderFooterCell,
}) => {
  return (
    <div
      className={styles.sheet__footer}
      style={{ height: `${FOOTER_HEIGHT}px` }}
    >
      <div
        className={styles.sheet__footerStatusCorner}
        style={{ width: `${STATUS_COL_WIDTH}px` }}
      >
        <span className={styles.sheet__footerCornerLabel}>合計</span>
      </div>
      <div
        className={styles.sheet__footerColumns}
        style={{ width: `${totalWidth}px` }}
      >
        {columns.map((col) => (
          <div
            key={`footer-${col.id}`}
            className={styles.sheet__footerCellWrapper}
            style={{
              width: `${col.size}px`,
              transform: `translateX(${col.start}px)`,
            }}
          >
            {renderFooterCell ? renderFooterCell(col) : <FooterCell />}
          </div>
        ))}
      </div>
    </div>
  );
};

export type SheetPresenterProps = BodyProps &
  Pick<HeaderProps, "onChangeColumnWidth" | "renderHeaderCell"> & {
    ref: Ref<HTMLDivElement>;
    hasFooter?: boolean;
    renderFooterCell?: (col: AxisLayout) => ReactNode;
    onKeyDown?: (event: KeyboardEvent<HTMLDivElement>) => void;
    onMouseDown?: (event: ReactMouseEvent<HTMLDivElement>) => void;
  };

export const SheetPresenter: FC<SheetPresenterProps> = ({
  rows,
  columns,
  totalWidth,
  totalHeight,
  selection,
  getRowLayout,
  getColumnLayout,
  onChangeColumnWidth,
  renderHeaderCell,
  hasFooter,
  renderFooterCell,
  onKeyDown,
  onMouseDown,
  ref,
}) => {
  const footerHeight = hasFooter ? FOOTER_HEIGHT : 0;

  return (
    <div
      ref={ref}
      role="application"
      tabIndex={-1}
      onKeyDown={onKeyDown}
      onMouseDown={onMouseDown}
      className={styles.sheet}
    >
      <div
        className={styles.sheet__inner}
        style={{
          width: `${totalWidth + STATUS_COL_WIDTH}px`,
          height: `${totalHeight + HEADER_HEIGHT + footerHeight}px`,
        }}
      >
        <SheetHeader
          columns={columns}
          totalWidth={totalWidth}
          onChangeColumnWidth={onChangeColumnWidth}
          renderHeaderCell={renderHeaderCell}
        />
        <SheetBody
          rows={rows}
          columns={columns}
          totalWidth={totalWidth}
          totalHeight={totalHeight}
          selection={selection}
          getRowLayout={getRowLayout}
          getColumnLayout={getColumnLayout}
        />
        {hasFooter && (
          <SheetFooter
            columns={columns}
            totalWidth={totalWidth}
            renderFooterCell={renderFooterCell}
          />
        )}
      </div>
    </div>
  );
};
