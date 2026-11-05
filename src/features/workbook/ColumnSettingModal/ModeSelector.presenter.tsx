import { Box, Flex, RadioGroup, Text } from "@radix-ui/themes";
import type { FC } from "react";
import { useI18n } from "@/i18n/useI18n";
import type { PulldownMode } from "../stores/types";
import { columnSettingMessages } from "./i18n";

export type ModeSelectorPresenterProps = {
  mode: PulldownMode;
  onChangeMode: (mode: PulldownMode) => void;
};

const isPulldownMode = (val: string): val is PulldownMode => {
  return val === "dropdown" || val === "combobox";
};

export const ModeSelectorPresenter: FC<ModeSelectorPresenterProps> = ({
  mode,
  onChangeMode,
}) => {
  const { t } = useI18n(columnSettingMessages);

  return (
    <Box>
      <Text
        as="label"
        size="2"
        weight="bold"
        mb="1"
        style={{ display: "block" }}
      >
        {t("uiTypeLabel")}
      </Text>
      <RadioGroup.Root
        value={mode}
        onValueChange={(val) => {
          if (isPulldownMode(val)) {
            onChangeMode(val);
          }
        }}
      >
        <Flex gap="4">
          <Flex align="center" gap="2">
            <RadioGroup.Item value="dropdown" id="mode-dropdown" />
            <Text as="label" size="2" htmlFor="mode-dropdown">
              {t("modeDropdown")}
            </Text>
          </Flex>
          <Flex align="center" gap="2">
            <RadioGroup.Item value="combobox" id="mode-combobox" />
            <Text as="label" size="2" htmlFor="mode-combobox">
              {t("modeCombobox")}
            </Text>
          </Flex>
        </Flex>
      </RadioGroup.Root>
    </Box>
  );
};
