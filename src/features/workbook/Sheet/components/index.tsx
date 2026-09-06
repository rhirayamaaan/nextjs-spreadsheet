import { DotsVerticalIcon, MixerHorizontalIcon } from "@radix-ui/react-icons";
import { Badge, DropdownMenu, IconButton } from "@radix-ui/themes";
import clsx from "clsx";
import { useAtomValue } from "jotai";
import {
  type FC,
  memo,
  type ReactNode,
  type Ref,
  useCallback,
  useState,
} from "react";
import { type ColumnId, type Selection, selectionAtom } from "../../stores";

import type { ColumnHeaderPresenterProps } from "../containers/ColumnHeaderContainer";
import styles from "./index.module.css";

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

export type ItemLayout = {
  start: number;
  size: number;
};

const SelectionOverlay = ({
  selection: propSelection,
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
  const atomSelection = useAtomValue(selectionAtom);
  const selection = propSelection !== undefined ? propSelection : atomSelection;
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

export const HeaderCell: FC<
  ColumnHeaderPresenterProps & {
    onOpenSettingModal?: (colId: ColumnId) => void;
    onRemoveBinding?: (colId: ColumnId) => void;
    onOpenFilterModal?: (colId: ColumnId) => void;
    onClearFilter?: (colId: ColumnId) => void;
  }
> = ({
  col,
  colId,
  config,
  isFiltered,
  setNodeRef,
  dndStyle,
  attributes,
  listeners,
  isDragging,
  isResizing,
  onMouseDownResizer,
  onOpenSettingModal,
  onRemoveBinding,
  onOpenFilterModal,
  onClearFilter,
}) => {
  const isLookup = config?.type === "lookup";

  return (
    <div
      className={styles.sheet__headerCellWrapper}
      style={{
        width: `${col.size}px`,
        transform: `translateX(${col.start}px)`,
      }}
    >
      <div
        ref={setNodeRef}
        style={dndStyle}
        className={clsx(
          styles.sheet__headerCell,
          isDragging && styles["sheet__headerCell--dragging"],
          isLookup && styles["sheet__headerCell--lookup"],
        )}
        {...attributes}
        {...(isLookup ? {} : listeners)}
      >
        <span className={styles.sheet__headerCellTitle}>
          {col.label ?? col.index + 1}
        </span>

        {isLookup && (
          <Badge
            size="1"
            color="blue"
            variant="soft"
            style={{ fontSize: "0.6rem", padding: "0 3px", marginRight: 2 }}
          >
            参照
          </Badge>
        )}

        {isFiltered && (
          <IconButton
            size="1"
            variant="soft"
            color="blue"
            aria-label="フィルター設定"
            onClick={(e) => {
              e.stopPropagation();
              if (colId) onOpenFilterModal?.(colId);
            }}
            onPointerDown={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            style={{ marginRight: 2, cursor: "pointer" }}
          >
            <MixerHorizontalIcon width={12} height={12} />
          </IconButton>
        )}

        <div className={styles.sheet__headerCellMenuTrigger}>
          <DropdownMenu.Root>
            <DropdownMenu.Trigger>
              <IconButton
                size="1"
                variant="ghost"
                color={isFiltered ? "blue" : "gray"}
                aria-label="列操作メニュー"
                onPointerDown={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
              >
                <DotsVerticalIcon width={12} height={12} />
              </IconButton>
            </DropdownMenu.Trigger>

            <DropdownMenu.Content size="1">
              {!isLookup && (
                <>
                  <DropdownMenu.Item
                    onSelect={() => colId && onOpenFilterModal?.(colId)}
                  >
                    <MixerHorizontalIcon
                      width={12}
                      height={12}
                      style={{ marginRight: 6 }}
                    />
                    フィルターを設定...
                  </DropdownMenu.Item>
                  {isFiltered && (
                    <DropdownMenu.Item
                      color="red"
                      onSelect={() => colId && onClearFilter?.(colId)}
                    >
                      フィルターを解除
                    </DropdownMenu.Item>
                  )}
                  <DropdownMenu.Separator />
                </>
              )}

              {config?.type === "pulldown" ? (
                <>
                  <DropdownMenu.Item
                    onSelect={() => colId && onOpenSettingModal?.(colId)}
                  >
                    プルダウン設定を編集
                  </DropdownMenu.Item>
                  <DropdownMenu.Separator />
                  <DropdownMenu.Item
                    color="red"
                    onSelect={() => colId && onRemoveBinding?.(colId)}
                  >
                    プルダウン設定を解除
                  </DropdownMenu.Item>
                </>
              ) : config?.type === "lookup" ? (
                <DropdownMenu.Item
                  onSelect={() =>
                    onOpenSettingModal?.(config.lookup.parentColId)
                  }
                >
                  親列の設定を編集
                </DropdownMenu.Item>
              ) : (
                <DropdownMenu.Item
                  onSelect={() => colId && onOpenSettingModal?.(colId)}
                >
                  プルダウン設定を追加...
                </DropdownMenu.Item>
              )}
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        </div>

        <hr
          onMouseDown={onMouseDownResizer}
          onPointerDown={(e) => e.stopPropagation()}
          aria-orientation="vertical"
          aria-valuemin={MIN_COLUMN_WIDTH}
          aria-valuenow={col.size}
          tabIndex={-1}
          className={clsx(
            styles.sheet__headerResizer,
            isResizing && styles["sheet__headerResizer--active"],
          )}
        />
      </div>
    </div>
  );
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

type Props = BodyProps &
  Pick<HeaderProps, "onChangeColumnWidth" | "renderHeaderCell"> & {
    ref: Ref<HTMLDivElement>;
  };

export const Sheet: FC<Props> = ({
  rows,
  columns,
  totalWidth,
  totalHeight,
  selection,
  getRowLayout,
  getColumnLayout,
  onChangeColumnWidth,
  renderHeaderCell,
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
      </div>
    </div>
  );
};
