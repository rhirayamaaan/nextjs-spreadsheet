import {
  type ComponentType,
  memo,
  type Ref,
  useCallback,
  useState,
} from "react";

/**
 * スプレッドシートの行または列のレイアウト情報
 */
export type AxisLayout = {
  id: string | number | bigint;
  index: number;
  start: number;
  size: number;
};

const MIN_COLUMN_WIDTH = 30;

type BodyProps = {
  rows: AxisLayout[];
  columns: AxisLayout[];
  totalWidth: number;
  totalHeight: number;
  CellComponent: ComponentType<{ row: number; col: number }>;
};

const SpreadsheetBody = memo(
  ({ rows, columns, totalWidth, totalHeight, CellComponent }: BodyProps) => {
    return (
      <div
        style={{
          width: `${totalWidth}px`,
          height: `${totalHeight}px`,
          position: "relative",
        }}
      >
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
    );
  },
);

SpreadsheetBody.displayName = "SpreadsheetBody";

type HeaderProps = {
  columns: AxisLayout[];
  scrollLeft: number;
  resizingIndex: number | null;
  onMouseDown: (
    index: number,
    width: number,
  ) => (event: React.MouseEvent) => void;
};

const SpreadsheetHeader = ({
  columns,
  scrollLeft,
  resizingIndex,
  onMouseDown,
}: HeaderProps) => {
  return (
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
              onMouseDown={onMouseDown(col.index, col.size)}
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
                zIndex: 1,
                border: "none",
                margin: 0,
                backgroundColor:
                  resizingIndex === col.index ? "#2196f3" : "transparent",
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

SpreadsheetHeader.displayName = "SpreadsheetHeader";

type Props = BodyProps & {
  onChangeColumnWidth: (index: number, width: number) => void;
  ref?: Ref<HTMLDivElement>;
};

export const SpreadsheetPresenter = ({
  rows,
  columns,
  totalWidth,
  totalHeight,
  CellComponent,
  onChangeColumnWidth,
  ref,
}: Props) => {
  const [scrollLeft, setScrollLeft] = useState(0);
  const [resizing, setResizing] = useState<{
    index: number;
    startX: number;
    startWidth: number;
  } | null>(null);
  const [currentX, setCurrentX] = useState(0);

  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    setScrollLeft(event.currentTarget.scrollLeft);
  }, []);

  const handleMouseDown = useCallback(
    (index: number, width: number) => (event: React.MouseEvent) => {
      event.stopPropagation();
      const startX = event.pageX;
      const startWidth = width;

      setResizing({ index, startX, startWidth });
      setCurrentX(startX);

      const onMouseMove = (e: MouseEvent) => {
        // 最小幅（MIN_COLUMN_WIDTH）に達する座標を計算
        // 現在の幅 = startWidth + (e.pageX - startX)
        // 最小幅制限をかけると e.pageX は startX - (startWidth - MIN_COLUMN_WIDTH) 以上である必要がある
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
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100vw",
        height: "100vh",
        backgroundColor: "#ffffff",
        overflow: "hidden",
        position: "relative",
        userSelect: resizing ? "none" : "auto",
      }}
    >
      <SpreadsheetHeader
        columns={columns}
        scrollLeft={scrollLeft}
        resizingIndex={resizing?.index ?? null}
        onMouseDown={handleMouseDown}
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
        <SpreadsheetBody
          rows={rows}
          columns={columns}
          totalWidth={totalWidth}
          totalHeight={totalHeight}
          CellComponent={CellComponent}
        />
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
    </div>
  );
};
