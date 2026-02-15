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

type Props = BodyProps & {
  ref?: Ref<HTMLDivElement>;
};

export const SpreadsheetPresenter = ({
  rows,
  columns,
  totalWidth,
  totalHeight,
  CellComponent,
  ref,
}: Props) => {
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
      }}
    >
      {/* 1. 列ヘッダー領域 */}
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
              {/* index + 1 を暫定ラベルとして表示 */}
              {col.index + 1}
            </div>
          ))}
        </div>
      </div>

      {/* 2. ボディ領域 */}
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
    </div>
  );
};
