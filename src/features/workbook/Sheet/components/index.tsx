import {
  type FC,
  memo,
  type ReactNode,
  type Ref,
  useCallback,
  useState,
} from "react";
import type { Selection } from "../../stores";

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

const SheetCells = memo(
  ({ row, columns }: { row: RowLayout; columns: AxisLayout[] }) => {
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
        {columns.map((col, index) => (
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
        style={{
          width: `${totalWidth}px`,
          height: `${totalHeight}px`,
          position: "relative",
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
        style={{
          position: "sticky",
          left: 0,
          width: `${STATUS_COL_WIDTH}px`,
          height: `${totalHeight}px`,
          flexShrink: 0,
          zIndex: 10,
          boxSizing: "border-box",
        }}
      >
        <div style={{ position: "relative", width: "100%", height: "100%" }}>
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
                borderRight: "1px solid #e0e0e0",
                borderBottom: "1px solid #e0e0e0",
                boxSizing: "border-box",
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
          style={{
            position: "absolute",
            top: HEADER_HEIGHT,
            left: STATUS_COL_WIDTH,
            width: `${totalWidth}px`,
            height: `${totalHeight}px`,
            zIndex: 1,
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
        style={{
          position: "sticky",
          top: 0,
          zIndex: 20,
          display: "flex",
          width: "100%",
          height: `${HEADER_HEIGHT}px`,
          backgroundColor: "#f5f5f5",
        }}
      >
        <div
          style={{
            position: "sticky",
            left: 0,
            zIndex: 30,
            width: `${STATUS_COL_WIDTH}px`,
            height: "100%",
            backgroundColor: "inherit",
            borderRight: "1px solid #e0e0e0",
            borderBottom: "1px solid #e0e0e0",
            boxSizing: "border-box",
            flexShrink: 0,
          }}
        />
        <div
          style={{
            position: "relative",
            width: `${totalWidth}px`,
            height: "100%",
            display: "flex",
            alignItems: "center",
            borderBottom: "1px solid #e0e0e0",
            boxSizing: "border-box",
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
                height: "100%",
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

type Props = BodyProps &
  Pick<HeaderProps, "onChangeColumnWidth"> & { ref: Ref<HTMLDivElement> };

export const SheetPresenter: FC<Props> = ({
  rows,
  columns,
  totalWidth,
  totalHeight,
  selection,
  onChangeColumnWidth,
  ref,
}) => {
  return (
    <div
      ref={ref}
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: "#ffffff",
        overflow: "auto",
        position: "relative",
      }}
    >
      <div
        style={{
          width: `${totalWidth + STATUS_COL_WIDTH}px`,
          height: `${totalHeight + HEADER_HEIGHT}px`,
          position: "relative",
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
