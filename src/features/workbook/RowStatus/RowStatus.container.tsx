import { useAtomValue, useSetAtom } from "jotai";
import { type FC, memo, type ReactNode, useCallback } from "react";
import {
  deleteRowAtom,
  type InsertPosition,
  insertRowAtom,
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
    <>
      {children({
        status,
        popoverId,
        onInsertRow: handleInsertRow,
        onDeleteRow: handleDeleteRow,
      })}
    </>
  );
});

RowStatusContainer.displayName = "RowStatusContainer";
