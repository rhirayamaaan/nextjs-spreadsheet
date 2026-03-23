import {
  type FC,
  memo,
  type ReactNode,
  type Ref,
  useCallback,
  useState,
} from "react";
import type { Selection } from "../../stores";
import styles from "./index.module.css";

export type AxisLayout = {
  id: string | number | bigint;
  index: number;
  start: number;
  size: number;
};

export type RowLayout = AxisLayout & {
  status: ReactNode;
  cells: ReactNode[];
};

const MIN_COLUMN_WIDTH = 30;
const STATUS_COL_WIDTH = 50;
const HEADER_HEIGHT = 30;

const SelectionOverlay = ({
  selection,
  rows,
  columns,
}: {
  selection: Selection;
  rows: AxisLayout[];
  columns: AxisLayout[];
}) => {
  if (!selection) return null;

  const minRow = Math.min(selection.start.row, selection.end.row);
  const maxRow = Math.max(selection.start.row, selection.end.row);
  const minCol = Math.min(selection.start.col, selection.end.col);
  const maxCol = Math.max(selection.start.col, selection.end.col);

  const startRow = rows.find((r) => r.index === minRow);
  const endRow = rows.find((r) => r.index === maxRow);
  const startCol = columns.find((c) => c.index === minCol);
  const endCol = columns.find((c) => c.index === maxCol);

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
  }: {
    rows: RowLayout[];
    columns: AxisLayout[];
    totalWidth: number;
    totalHeight: number;
    selection: Selection;
  }) => {
    return (
      <div
        className={styles.sheet__rowsContainer}
        style={{
          width: `${totalWidth}px`,
          height: `${totalHeight}px`,
        }}
      >
        <SelectionOverlay selection={selection} rows={rows} columns={columns} />
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
  selection: Selection;
};

const SheetBody = memo(
  ({ rows, columns, totalWidth, totalHeight, selection }: BodyProps) => {
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
};

const SheetHeader: FC<HeaderProps> = ({
  columns,
  totalWidth,
  onChangeColumnWidth,
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
        const startX = event.pageX;
        const startWidth = width;

        setResizing({ id, startX, startWidth });
        setCurrentX(startX);

        const onMouseMove = (e: MouseEvent) => {
          const minX = startX - (startWidth - MIN_COLUMN_WIDTH);
          setCurrentX(Math.max(minX, e.pageX));
        };

        const onMouseUp = (e: MouseEvent) => {
          const minX = startX - (startWidth - MIN_COLUMN_WIDTH);
          const finalX = Math.max(minX, e.pageX);
          const diff = finalX - startX;
          onChangeColumnWidth(id, startWidth + diff);
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
          {columns.map((col) => (
            <div
              key={col.id}
              className={styles.sheet__headerCell}
              style={{
                width: `${col.size}px`,
                transform: `translateX(${col.start}px)`,
              }}
            >
              {col.index + 1}
              <hr
                onMouseDown={handleMouseDown(col.id, col.size)}
                aria-orientation="vertical"
                aria-valuemin={MIN_COLUMN_WIDTH}
                aria-valuenow={col.size}
                tabIndex={-1}
                className={`${styles.sheet__headerResizer} ${
                  resizing?.id === col.id
                    ? styles["sheet__headerResizer--active"]
                    : ""
                }`}
              />
            </div>
          ))}
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

type Props = BodyProps &
  Pick<HeaderProps, "onChangeColumnWidth"> & { ref: Ref<HTMLDivElement> };

export const Sheet: FC<Props> = ({
  rows,
  columns,
  totalWidth,
  totalHeight,
  selection,
  onChangeColumnWidth,
  ref,
}) => {
  return (
    <div ref={ref} className={styles.sheet}>
      <div
        className={styles.sheet__inner}
        style={{
          width: `${totalWidth + STATUS_COL_WIDTH}px`,
          height: `${totalHeight + HEADER_HEIGHT}px`,
        }}
      >
        <SheetHeader
          columns={columns}
          totalWidth={totalWidth}
          onChangeColumnWidth={onChangeColumnWidth}
        />
        <SheetBody
          rows={rows}
          columns={columns}
          totalWidth={totalWidth}
          totalHeight={totalHeight}
          selection={selection}
        />
      </div>
    </div>
  );
};
