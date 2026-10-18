import { TableIcon } from "@radix-ui/react-icons";
import { Button, Flex, Text } from "@radix-ui/themes";
import type { FC } from "react";
import { useI18n } from "@/i18n/useI18n";
import styles from "./EmptySheet.module.css";
import { localMessages } from "./i18n";

export type EmptySheetPresenterProps = {
  onOpenMenu?: () => void;
};

export const EmptySheetPresenter: FC<EmptySheetPresenterProps> = ({
  onOpenMenu,
}) => {
  const { t } = useI18n(localMessages);

  return (
    <Flex
      direction="column"
      align="center"
      justify="center"
      className={styles.container}
    >
      <div className={styles.iconWrapper}>
        <TableIcon width="36" height="36" />
      </div>
      <Text size="3" className={styles.message}>
        {t("noOpenSheets")}
      </Text>
      {onOpenMenu && (
        <Button
          variant="soft"
          size="2"
          onClick={onOpenMenu}
          className={styles.openMenuButton}
        >
          {t("openSheetMenu")}
        </Button>
      )}
    </Flex>
  );
};
