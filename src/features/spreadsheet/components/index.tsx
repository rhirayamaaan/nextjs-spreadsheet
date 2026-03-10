import {
  type ComponentType,
  type FC,
  memo,
  type Ref,
  useCallback,
  useState,
} from "react";
import type { RowId, Selection } from "../stores";

export type AxisLayout = {
  id: string | number | bigint;
  index: number;
  start: number;
  size: number;
};

const MIN_COLUMN_WIDTH = 30;
const STATUS_COL_WIDTH = 50;

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
      style={{
        position: "absolute",
        left: startCol.start,
        top: startRow.start,
        width: endCol.start + endCol.size - startCol.start,
        height: endRow.start + endRow.size - startRow.start,
        border: "2px solid #2196f3",
        backgroundColor: "rgba(33, 150, 243, 0.1)",
        pointerEvents: "none",
        zIndex: 5,
      }}
    />
  );
};

const SpreadsheetCells = memo(
  ({
    row,
    columns,
    CellComponent,
  }: {
    row: AxisLayout;
    columns: AxisLayout[];
    CellComponent: ComponentType<{ row: number; col: number }>;
  }) => {
    return (
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: `${row.size}px`,
          transform: `translateY(${row.start}px)`,
          willChange: "transform",
        }}
      >
        {columns.map((col) => (
          <div
            key={`${row.id}-${col.id}`}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: `${col.size}px`,
              height: `${row.size}px`,
              transform: `translateX(${col.start}px)`,
            }}
          >
            <CellComponent row={row.index} col={col.index} />
          </div>
        ))}
      </div>
    );
  },
);

SpreadsheetCells.displayName = "SpreadsheetCells";

const SpreadsheetRows = memo(
  ({
    rows,
    columns,
    totalWidth,
    totalHeight,
    selection,
    CellComponent,
  }: {
    rows: AxisLayout[];
    columns: AxisLayout[];
    totalWidth: number;
    totalHeight: number;
    selection: Selection;
    CellComponent: ComponentType<{ row: number; col: number }>;
  }) => {
    return (
      <div
        style={{
          width: `${totalWidth}px`,
          height: `${totalHeight}px`,
          position: "relative",
        }}
      >
        <SelectionOverlay selection={selection} rows={rows} columns={columns} />
        {rows.map((row) => (
          <SpreadsheetCells
            key={row.id}
            row={row}
            columns={columns}
            CellComponent={CellComponent}
          />
        ))}
      </div>
    );
  },
);

SpreadsheetRows.displayName = "SpreadsheetRows";

const StatusColumn = memo(
  ({
    rows,
    scrollTop,
    RowStatusComponent,
  }: {
    rows: AxisLayout[];
    scrollTop: number;
    RowStatusComponent: ComponentType<{ rowId: RowId }>;
  }) => {
    return (
      <div
        style={{
          position: "relative",
          width: `${STATUS_COL_WIDTH}px`,
          height: "100%",
          overflow: "hidden",
          backgroundColor: "#f5f5f5",
          borderRight: "1px solid #e0e0e0",
          flexShrink: 0,
          zIndex: 20,
        }}
      >
        <div
          style={{
            transform: `translateY(-${scrollTop}px)`,
            willChange: "transform",
          }}
        >
          {rows.map((row) => (
            <div
              key={row.id}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: `${STATUS_COL_WIDTH}px`,
                height: `${row.size}px`,
                backgroundColor: "#ffffff",
                borderBottom: "1px solid #e0e0e0",
                boxSizing: "border-box",
                transform: `translateY(${row.start}px)`,
              }}
            >
              <RowStatusComponent rowId={row.id as RowId} />
            </div>
          ))}
        </div>
      </div>
    );
  },
);

StatusColumn.displayName = "StatusColumn";

type BodyProps = {
  rows: AxisLayout[];
  columns: AxisLayout[];
  totalWidth: number;
  totalHeight: number;
  selection: Selection;
  onScroll: (event: React.UIEvent<HTMLDivElement>) => void;
  ref: Ref<HTMLDivElement>;
  CellComponent: ComponentType<{ row: number; col: number }>;
  RowStatusComponent: ComponentType<{ rowId: RowId }>;
};

const SpreadsheetBody = memo(
  ({
    rows,
    columns,
    totalWidth,
    totalHeight,
    selection,
    onScroll,
    ref,
    CellComponent,
    RowStatusComponent,
  }: BodyProps) => {
    const [scrollTop, setScrollTop] = useState(0);

    const handleScroll = useCallback(
      (event: React.UIEvent<HTMLDivElement>) => {
        setScrollTop(event.currentTarget.scrollTop);
        onScroll(event);
      },
      [onScroll],
    );

    return (
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <StatusColumn
          rows={rows}
          scrollTop={scrollTop}
          RowStatusComponent={RowStatusComponent}
        />
        <div
          ref={ref}
          onScroll={handleScroll}
          style={{
            flex: 1,
            overflow: "auto",
            position: "relative",
          }}
        >
          <SpreadsheetRows
            rows={rows}
            columns={columns}
            totalWidth={totalWidth}
            totalHeight={totalHeight}
            selection={selection}
            CellComponent={CellComponent}
          />
        </div>
      </div>
    );
  },
);

SpreadsheetBody.displayName = "SpreadsheetBody";

type HeaderProps = {
  columns: AxisLayout[];
  scrollLeft: number;
  onChangeColumnWidth: (id: string | number | bigint, width: number) => void;
};

const SpreadsheetHeader: FC<HeaderProps> = ({
  columns,
  scrollLeft,
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
        style={{
          width: "100%",
          height: "30px",
          position: "relative",
          backgroundColor: "#f5f5f5",
          borderBottom: "1px solid #e0e0e0",
          overflow: "hidden",
          display: "flex",
        }}
      >
        <div
          style={{
            position: "relative",
            width: `${STATUS_COL_WIDTH}px`,
            height: "inherit",
            backgroundColor: "inherit",
            borderRight: "1px solid #e0e0e0",
            zIndex: "20",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 0,
            left: STATUS_COL_WIDTH,
            transform: `translateX(-${scrollLeft}px)`,
            height: "inherit",
            willChange: "transform",
            display: "flex",
            alignItems: "center",
          }}
        >
          {columns.map((col) => (
            <div
              key={col.id}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: `${col.size}px`,
                height: "inherit",
                transform: `translateX(${col.start}px)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.75rem",
                fontWeight: "bold",
                color: "#666666",
                borderRight: "1px solid #e0e0e0",
                boxSizing: "border-box",
              }}
            >
              {col.index + 1}
              <hr
                onMouseDown={handleMouseDown(col.id, col.size)}
                aria-orientation="vertical"
                aria-valuemin={MIN_COLUMN_WIDTH}
                aria-valuenow={col.size}
                tabIndex={-1}
                style={{
                  position: "absolute",
                  right: -2,
                  top: 0,
                  width: "5px",
                  height: "100%",
                  cursor: "col-resize",
                  zIndex: 10,
                  border: "none",
                  margin: 0,
                  backgroundColor:
                    resizing?.id === col.id ? "#2196f3" : "transparent",
                }}
              />
            </div>
          ))}
        </div>
      </div>
      {resizing && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: currentX,
            width: "2px",
            height: "100%",
            backgroundColor: "#2196f3",
            zIndex: 100,
            pointerEvents: "none",
          }}
        />
      )}
    </>
  );
};

type Props = Omit<BodyProps, "onScroll"> &
  Pick<HeaderProps, "onChangeColumnWidth">;

export const SpreadsheetPresenter: FC<Props> = ({
  rows,
  columns,
  totalWidth,
  totalHeight,
  selection,
  CellComponent,
  RowStatusComponent,
  onChangeColumnWidth,
  ref,
}) => {
  const [scrollLeft, setScrollLeft] = useState(0);
  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    setScrollLeft(event.currentTarget.scrollLeft);
  }, []);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100vw",
        height: "100vh",
        backgroundColor: "#ffffff",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <SpreadsheetHeader
        columns={columns}
        scrollLeft={scrollLeft}
        onChangeColumnWidth={onChangeColumnWidth}
      />
      <SpreadsheetBody
        rows={rows}
        columns={columns}
        totalWidth={totalWidth}
        totalHeight={totalHeight}
        selection={selection}
        onScroll={handleScroll}
        ref={ref}
        CellComponent={CellComponent}
        RowStatusComponent={RowStatusComponent}
      />
    </div>
  );
};
