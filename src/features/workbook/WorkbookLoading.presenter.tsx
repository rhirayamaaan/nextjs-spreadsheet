"use client";

import { Flex, Spinner, Text } from "@radix-ui/themes";
import type { FC } from "react";
import { useI18n } from "@/i18n/useI18n";
import { localMessages } from "./i18n";

export type WorkbookLoadingPresenterProps = {
  message?: string;
};

export const WorkbookLoadingPresenter: FC<WorkbookLoadingPresenterProps> = ({
  message,
}) => {
  const { t } = useI18n(localMessages);

  return (
    <Flex
      direction="column"
      align="center"
      justify="center"
      width="100vw"
      height="100vh"
      gap="3"
    >
      <Spinner size="3" />
      <Text size="2" color="gray" weight="medium">
        {message ?? t("loadingWorkbook")}
      </Text>
    </Flex>
  );
};
