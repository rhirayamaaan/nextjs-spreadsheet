import { useAtom, useAtomValue, useSetAtom } from "jotai";
import {
  type ChangeEvent,
  type ComponentProps,
  type FC,
  type KeyboardEvent,
  memo,
  type ReactNode,
  useCallback,
  useMemo,
} from "react";
import {
  activeCellAtom,
  activeColumnConfigFamily,
  type ColumnId,
  cellEditsAtom,
  cellFamily,
  columnOrderAtom,
  type RowId,
  referencedSheetsDataAtom,
  rowOrderAtom,
  selectionAtom,
  workbookStatusAtom,
} from "../../stores";
import type { Cell } from "../components"; // Type-only import

type CellProps = ComponentProps<typeof Cell>;

type InnerProps = {
  row: number;
  col: number;
  rowId: RowId;
  colId: ColumnId;
  children: (props: CellProps) => ReactNode;
};

const CellInner: FC<InnerProps> = memo(
  ({ row, col, rowId, colId, children }) => {
    const [value, setValue] = useAtom(
      useMemo(() => cellFamily({ rowId, colId }), [rowId, colId]),
    );
    const [activeCell, setEditingCell] = useAtom(activeCellAtom);
    const [workbookStatus, setWorkbookStatus] = useAtom(workbookStatusAtom);
    const setSelection = useSetAtom(selectionAtom);

    const config = useAtomValue(
      useMemo(() => activeColumnConfigFamily(colId), [colId]),
    );
    const referencedSheets = useAtomValue(referencedSheetsDataAtom);
    const cellEdits = useAtomValue(cellEditsAtom);

    const isLookup = config.type === "lookup";
    const isPulldown = config.type === "pulldown";
    const pulldownMode = isPulldown ? config.pulldown.mode : undefined;

    const pulldownOptions = useMemo(() => {
      if (!isPulldown) return undefined;
      const { sourceSheetId, sourceKeyColId, lookupColumns } = config.pulldown;
      const masterSheet = referencedSheets[sourceSheetId];
      if (!masterSheet) return [];

      return masterSheet.rows.map((rId) => {
        const key = `${rId}-${sourceKeyColId}`;
        const keyVal =
          key in cellEdits ? cellEdits[key] : (masterSheet.values[key] ?? "");
        const labels = lookupColumns
          .map((l) => {
            const lKey = `${rId}-${l.sourceColId}`;
            return lKey in cellEdits
              ? cellEdits[lKey]
              : (masterSheet.values[lKey] ?? "");
          })
          .filter(Boolean)
          .join(" - ");

        return {
          key: keyVal,
          label: labels ? `${keyVal} (${labels})` : keyVal,
        };
      });
    }, [isPulldown, config, referencedSheets, cellEdits]);

    const isEditing = activeCell?.row === row && activeCell?.col === col;

    const handleDoubleClick = useCallback(() => {
      if (isLookup) return;
      setEditingCell({ row, col });
    }, [isLookup, row, col, setEditingCell]);

    const handleBlur = useCallback(() => {
      setEditingCell(null);
    }, [setEditingCell]);

    const handleKeyDown = useCallback(
      (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter") {
          setEditingCell(null);
        }
      },
      [setEditingCell],
    );

    const handleChange = useCallback(
      (event: ChangeEvent<HTMLInputElement>) => {
        setValue(event.target.value);
      },
      [setValue],
    );

    const handleSelectPulldown = useCallback(
      (newVal: string) => {
        setValue(newVal);
      },
      [setValue],
    );

    const handleClosePulldown = useCallback(() => {
      setEditingCell(null);
    }, [setEditingCell]);

    const handleSelectionStart = useCallback(() => {
      setWorkbookStatus("selecting");
      setSelection({
        start: { row, col },
        end: { row, col },
      });
    }, [setSelection, setWorkbookStatus, row, col]);

    const handleSelectionMove = useMemo(() => {
      if (workbookStatus !== "selecting") {
        return undefined;
      }

      return () => {
        setSelection((prev) => {
          if (!prev) {
            throw new Error("Invalid selection state");
          }
          return {
            start: prev.start,
            end: { row, col },
          };
        });
      };
    }, [setSelection, row, col, workbookStatus]);

    return (
      <>
        {children({
          value,
          isEditing,
          isLookup,
          isPulldown,
          pulldownMode,
          pulldownOptions,
          onSelectPulldown: handleSelectPulldown,
          onClosePulldown: handleClosePulldown,
          onChange: handleChange,
          onDoubleClick: handleDoubleClick,
          onBlur: handleBlur,
          onKeyDown: handleKeyDown,
          onMouseDown: handleSelectionStart,
          onMouseEnter: handleSelectionMove,
        })}
      </>
    );
  },
);

CellInner.displayName = "CellInner";

type Props = {
  row: number;
  col: number;
  children: (props: CellProps) => ReactNode;
};

export const CellContainer: FC<Props> = memo(({ row, col, children }) => {
  const rowOrder = useAtomValue(rowOrderAtom);
  const columnOrder = useAtomValue(columnOrderAtom);
  const rowId = rowOrder[row];
  const colId = columnOrder[col];

  if (!rowId || !colId) {
    return null;
  }

  return (
    <CellInner rowId={rowId} colId={colId} row={row} col={col}>
      {children}
    </CellInner>
  );
});

CellContainer.displayName = "CellContainer";
