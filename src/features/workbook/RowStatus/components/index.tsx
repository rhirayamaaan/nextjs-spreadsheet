import { DotsVerticalIcon } from "@radix-ui/react-icons";
import { Box, DropdownMenu, Flex, IconButton } from "@radix-ui/themes";
import clsx from "clsx";
import type { FC } from "react";
import type { InsertPosition, RowStatus as RowStatusType } from "../../stores";
import styles from "./index.module.css";

const STATUS_LABEL = {
  added: "追加",
  edited: "変更",
  deleted: "削除",
  none: "",
} as const satisfies Record<RowStatusType, string>;

const RowStatusMarker: FC<{ status?: RowStatusType }> = ({
  status = "none",
}) => {
  return (
    <Box
      title={STATUS_LABEL[status]}
      className={clsx(styles.marker, status !== "none" && styles[status])}
    />
  );
};

const RowActionMenu: FC<{
  onInsertRow: (position: InsertPosition) => void;
  onDeleteRow: () => void;
}> = ({ onInsertRow, onDeleteRow }) => {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        <IconButton
          size="1"
          variant="ghost"
          color="gray"
          aria-label="行操作メニュー"
        >
          <DotsVerticalIcon />
        </IconButton>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content size="1">
        <DropdownMenu.Item onClick={() => onInsertRow("above")}>
          上に行を挿入
        </DropdownMenu.Item>
        <DropdownMenu.Item onClick={() => onInsertRow("below")}>
          下に行を挿入
        </DropdownMenu.Item>
        <DropdownMenu.Separator />
        <DropdownMenu.Item color="red" onClick={onDeleteRow}>
          行を削除
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
};

export const RowStatus: FC<{
  status: RowStatusType;
  popoverId?: string;
  onInsertRow: (position: InsertPosition) => void;
  onDeleteRow: () => void;
}> = ({ status, onInsertRow, onDeleteRow }) => {
  return (
    <Flex align="center" width="100%" height="100%">
      <RowStatusMarker status={status} />
      <RowActionMenu onInsertRow={onInsertRow} onDeleteRow={onDeleteRow} />
    </Flex>
  );
};
