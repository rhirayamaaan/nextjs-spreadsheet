import { DotsVerticalIcon } from "@radix-ui/react-icons";
import { Box, DropdownMenu, Flex, IconButton } from "@radix-ui/themes";
import clsx from "clsx";
import type { FC } from "react";
import { useI18n } from "@/i18n/useI18n";
import type {
  InsertPosition,
  RowStatus as RowStatusType,
} from "../stores/types";
import { localMessages } from "./i18n";
import styles from "./RowStatus.module.css";

const RowStatusMarker: FC<{ status?: RowStatusType }> = ({
  status = "none",
}) => {
  const { t } = useI18n(localMessages);

  const statusLabel: Record<RowStatusType, string> = {
    added: t("statusAdded"),
    edited: t("statusEdited"),
    deleted: t("statusDeleted"),
    none: t("statusNone"),
  };

  return (
    <Box
      title={statusLabel[status]}
      className={clsx(styles.marker, status !== "none" && styles[status])}
    />
  );
};

const RowActionMenu: FC<{
  onInsertRow: (position: InsertPosition) => void;
  onDeleteRow: () => void;
}> = ({ onInsertRow, onDeleteRow }) => {
  const { t } = useI18n(localMessages);

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        <IconButton
          variant="ghost"
          size="1"
          color="gray"
          aria-label={t("menuAriaLabel")}
        >
          <DotsVerticalIcon />
        </IconButton>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        <DropdownMenu.Item onClick={() => onInsertRow("above")}>
          {t("insertAbove")}
        </DropdownMenu.Item>
        <DropdownMenu.Item onClick={() => onInsertRow("below")}>
          {t("insertBelow")}
        </DropdownMenu.Item>
        <DropdownMenu.Separator />
        <DropdownMenu.Item color="red" onClick={onDeleteRow}>
          {t("deleteRow")}
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
};

export type RowStatusPresenterProps = {
  status: RowStatusType;
  popoverId?: string;
  onInsertRow: (position: InsertPosition) => void;
  onDeleteRow: () => void;
};

export const RowStatusPresenter: FC<RowStatusPresenterProps> = ({
  status,
  onInsertRow,
  onDeleteRow,
}) => {
  return (
    <Flex align="center" width="100%" height="100%">
      <RowStatusMarker status={status} />
      <RowActionMenu onInsertRow={onInsertRow} onDeleteRow={onDeleteRow} />
    </Flex>
  );
};
