import { Button, Flex } from "@radix-ui/themes";
import type { FC } from "react";
import { useI18n } from "@/i18n/useI18n";
import { columnSettingMessages } from "./i18n";

export type ModalFooterPresenterProps = {
  onSave: () => void;
  onCancel: () => void;
  disableSave?: boolean;
};

export const ModalFooterPresenter: FC<ModalFooterPresenterProps> = ({
  onSave,
  onCancel,
  disableSave = false,
}) => {
  const { t } = useI18n(columnSettingMessages);

  return (
    <Flex gap="3" justify="end" mt="4">
      <Button variant="soft" color="gray" onClick={onCancel}>
        {t("cancel")}
      </Button>
      <Button disabled={disableSave} onClick={onSave}>
        {t("save")}
      </Button>
    </Flex>
  );
};
