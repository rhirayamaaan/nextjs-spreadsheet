import {
  type ComponentType,
  type FC,
  memo,
  type Ref,
  useCallback,
  useState,
} from "react";
import type { Selection } from "../stores";

export type AxisLayout = {
  id: string | number | bigint;
  index: number;
  start: number;
  size: number;
};

const MIN_COLUMN_WIDTH = 30;

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

type BodyProps = {
  rows: AxisLayout[];
  columns: AxisLayout[];
  totalWidth: number;
  totalHeight: number;
  selection: Selection;
  onScroll: (event: React.UIEvent<HTMLDivElement>) => void;
  ref: Ref<HTMLDivElement>;
  CellComponent: ComponentType<{ row: number; col: number }>;
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
  }: BodyProps) => {
    return (
      <div
        ref={ref}
        onScroll={onScroll}
        style={{
          flex: 1,
          overflow: "auto",
          position: "relative",
        }}
      >
        <div
          style={{
            width: `${totalWidth}px`,
            height: `${totalHeight}px`,
            position: "relative",
          }}
          onScroll={onScroll}
        >
          <SelectionOverlay
            selection={selection}
            rows={rows}
            columns={columns}
          />
          {rows.flatMap((row) =>
            columns.map((col) => (
              <div
                key={`${row.id}-${col.id}`}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: `${col.size}px`,
                  height: `${row.size}px`,
                  transform: `translateX(${col.start}px) translateY(${row.start}px)`,
                }}
              >
                <CellComponent row={row.index} col={col.index} />
              </div>
            )),
          )}
        </div>
      </div>
    );
  },
);

SpreadsheetBody.displayName = "SpreadsheetBody";

type HeaderProps = {
  columns: AxisLayout[];
  scrollLeft: number;
  onChangeColumnWidth: (index: number, width: number) => void;
};

const SpreadsheetHeader: FC<HeaderProps> = ({
  columns,
  scrollLeft,
  onChangeColumnWidth,
}) => {
  const [resizing, setResizing] = useState<{
    index: number;
    startX: number;
    startWidth: number;
  } | null>(null);
  const [currentX, setCurrentX] = useState(0);
  const handleMouseDown = useCallback(
    (index: number, width: number) => (event: React.MouseEvent) => {
      event.stopPropagation();
      const startX = event.pageX;
      const startWidth = width;

      setResizing({ index, startX, startWidth });
      setCurrentX(startX);

      const onMouseMove = (e: MouseEvent) => {
        const minX = startX - (startWidth - MIN_COLUMN_WIDTH);
        setCurrentX(Math.max(minX, e.pageX));
      };

      const onMouseUp = (e: MouseEvent) => {
        const minX = startX - (startWidth - MIN_COLUMN_WIDTH);
        const finalX = Math.max(minX, e.pageX);
        const diff = finalX - startX;
        onChangeColumnWidth(index, startWidth + diff);
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
          height: "30px",
          width: "100%",
          position: "relative",
          backgroundColor: "#f5f5f5",
          borderBottom: "1px solid #e0e0e0",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            transform: `translateX(-${scrollLeft}px)`,
            height: "inherit",
            willChange: "transform",
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
                onMouseDown={handleMouseDown(col.index, col.size)}
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
                    resizing?.index === col.index ? "#2196f3" : "transparent",
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
      />
    </div>
  );
};
