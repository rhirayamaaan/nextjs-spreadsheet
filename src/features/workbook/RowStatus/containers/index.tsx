import { useAtomValue, useSetAtom } from "jotai";
import { type FC, useCallback } from "react";
import {
  deleteRowAtom,
  type InsertPosition,
  insertRowAtom,
  type RowId,
  rowStatusesAtom,
} from "../../stores";
import { RowStatusPresenter } from "../components";

export const RowStatusContainer: FC<{ rowId: RowId }> = ({ rowId }) => {
  const rowStatuses = useAtomValue(rowStatusesAtom);
  const insertRow = useSetAtom(insertRowAtom);
  const deleteRow = useSetAtom(deleteRowAtom);

  const status = rowStatuses[rowId] ?? "none";
  const popoverId = `menu-${rowId}`;

  const handleInsertRow = useCallback(
    (position: InsertPosition) => {
      insertRow({ rowId, position });
    },
    [insertRow, rowId],
  );

  const handleDeleteRow = useCallback(() => {
    deleteRow(rowId);
  }, [deleteRow, rowId]);

  return (
    <RowStatusPresenter
      status={status}
      popoverId={popoverId}
      onInsertRow={handleInsertRow}
      onDeleteRow={handleDeleteRow}
    />
  );
};
