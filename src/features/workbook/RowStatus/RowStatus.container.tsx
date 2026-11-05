import { useAtomValue, useSetAtom } from "jotai";
import { type FC, memo, type ReactNode, useCallback } from "react";
import {
  activeSheetModeAtom,
  deleteRowAtom,
  type InsertPosition,
  insertRowAtom,
  isSubtotalRowId,
  type RowId,
  rowStatusesAtom,
} from "../stores";
import type { RowStatusPresenterProps } from "./RowStatus.presenter";

type Props = {
  rowId: RowId;
  children: (props: RowStatusPresenterProps) => ReactNode;
};

export const RowStatusContainer: FC<Props> = memo(({ rowId, children }) => {
  const rowStatuses = useAtomValue(rowStatusesAtom);
  const sheetMode = useAtomValue(activeSheetModeAtom);
  const insertRow = useSetAtom(insertRowAtom);
  const deleteRow = useSetAtom(deleteRowAtom);

  const isSubtotal = isSubtotalRowId(rowId);
  const isReadOnly = sheetMode === "inquiry" || isSubtotal;

  const status = isSubtotal ? "none" : (rowStatuses[rowId] ?? "none");
  const popoverId = `menu-${rowId}`;

  const handleInsertRow = useCallback(
    (position: InsertPosition) => {
      if (isReadOnly) return;
      insertRow({ rowId, position });
    },
    [insertRow, isReadOnly, rowId],
  );

  const handleDeleteRow = useCallback(() => {
    if (isReadOnly) return;
    deleteRow(rowId);
  }, [deleteRow, isReadOnly, rowId]);

  return (
    <>
      {children({
        status,
        popoverId,
        isSubtotal,
        isReadOnly,
        onInsertRow: handleInsertRow,
        onDeleteRow: handleDeleteRow,
      })}
    </>
  );
});

RowStatusContainer.displayName = "RowStatusContainer";
