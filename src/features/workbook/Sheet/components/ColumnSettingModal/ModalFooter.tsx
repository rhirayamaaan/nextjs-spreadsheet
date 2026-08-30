import { Button, Flex } from "@radix-ui/themes";
import type { FC } from "react";

export type ModalFooterProps = {
  onSave: () => void;
  onCancel: () => void;
  disableSave?: boolean;
};

export const ModalFooter: FC<ModalFooterProps> = ({
  onSave,
  onCancel,
  disableSave = false,
}) => {
  return (
    <Flex gap="3" justify="end" mt="4">
      <Button variant="soft" color="gray" onClick={onCancel}>
        キャンセル
      </Button>
      <Button disabled={disableSave} onClick={onSave}>
        設定を保存
      </Button>
    </Flex>
  );
};
