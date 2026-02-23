import { useAtom, useAtomValue, useSetAtom } from "jotai";
import type { ChangeEvent, FC, KeyboardEvent } from "react";
import { memo, useCallback, useMemo } from "react";
import {
  activeCellAtom,
  type ColumnId,
  cellFamily,
  columnOrderAtom,
  type RowId,
  rowOrderAtom,
  selectionAtom,
  spreadsheetStatusAtom,
} from "../../stores";
import { Cell as CellPresenter } from "../components";

type InnerProps = Props & {
  rowId: RowId;
  colId: ColumnId;
};

const CellInner: FC<InnerProps> = memo(({ row, col, rowId, colId }) => {
  const [value, setValue] = useAtom(
    useMemo(() => cellFamily({ rowId, colId }), [rowId, colId]),
  );
  const [activeCell, setEditingCell] = useAtom(activeCellAtom);
  const [spreadsheetStatus, setSpreadsheetStatus] = useAtom(
    spreadsheetStatusAtom,
  );
  const setSelection = useSetAtom(selectionAtom);

  const isEditing = activeCell?.row === row && activeCell?.col === col;

  const handleDoubleClick = useCallback(() => {
    setEditingCell({ row, col });
  }, [row, col, setEditingCell]);

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

  const handleSelectionStart = useCallback(() => {
    setSpreadsheetStatus("selecting");

    setSelection({
      start: { row, col },
      end: { row, col },
    });
  }, [setSelection, setSpreadsheetStatus, row, col]);

  const handleSelectionMove = useMemo(() => {
    if (spreadsheetStatus !== "selecting") {
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
  }, [setSelection, row, col, spreadsheetStatus]);

  return (
    <CellPresenter
      value={value}
      isEditing={isEditing}
      onChange={handleChange}
      onDoubleClick={handleDoubleClick}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      onMouseDown={handleSelectionStart}
      onMouseEnter={handleSelectionMove}
    />
  );
});

CellInner.displayName = "CellInner";

type Props = {
  row: number;
  col: number;
};

export const CellContainer: FC<Props> = memo(({ row, col }) => {
  const rowOrder = useAtomValue(rowOrderAtom);
  const columnOrder = useAtomValue(columnOrderAtom);
  const rowId = rowOrder[row];
  const colId = columnOrder[col];

  if (!rowId || !colId) {
    return null;
  }

  return <CellInner rowId={rowId} colId={colId} row={row} col={col} />;
});

CellContainer.displayName = "CellContainer";
