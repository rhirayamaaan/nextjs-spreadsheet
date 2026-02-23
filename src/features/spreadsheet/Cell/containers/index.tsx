import { useAtom, useSetAtom } from "jotai";
import type { ChangeEvent, FC, KeyboardEvent } from "react";
import { memo, useCallback, useMemo } from "react";
import {
  activeCellAtom,
  cellFamily,
  selectionAtom,
  spreadsheetStatusAtom,
} from "../../stores";
import { Cell as CellPresenter } from "../components";

type Props = {
  row: number;
  col: number;
};

export const CellContainer: FC<Props> = memo(({ row, col }) => {
  const [value, setValue] = useAtom(cellFamily({ row, col }));
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
      console.log("handleSelectionMove");
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

CellContainer.displayName = "CellContainer";
