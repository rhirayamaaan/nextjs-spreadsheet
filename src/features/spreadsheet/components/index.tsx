import type { ComponentType, FC, Ref } from "react";

export type AxisLayout = {
  id: string | number | bigint;
  index: number;
  start: number;
  size: number;
};

type Props = {
  rows: AxisLayout[];
  columns: AxisLayout[];
  totalWidth: number;
  totalHeight: number;
  CellComponent: ComponentType<{ row: number; col: number }>;
  ref?: Ref<HTMLDivElement>;
};

export const SpreadsheetPresenter: FC<Props> = ({
  rows,
  columns,
  totalWidth,
  totalHeight,
  CellComponent,
  ref,
}) => {
  return (
    <div
      ref={ref}
      style={{
        width: "100vw",
        height: "100vh",
        overflow: "auto",
        position: "relative",
        backgroundColor: "#ffffff",
      }}
    >
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
                transform: `translate(${col.start}px, ${row.start}px)`,
              }}
            >
              <CellComponent row={row.index} col={col.index} />
            </div>
          )),
        )}
      </div>
    </div>
  );
};
