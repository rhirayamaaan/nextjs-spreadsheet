import { Box, Flex, RadioGroup, Text } from "@radix-ui/themes";
import type { FC } from "react";
import type { PulldownMode } from "../../../stores";

export type ModeSelectorProps = {
  mode: PulldownMode;
  onChangeMode: (mode: PulldownMode) => void;
};

const isPulldownMode = (val: string): val is PulldownMode => {
  return val === "dropdown" || val === "combobox";
};

export const ModeSelector: FC<ModeSelectorProps> = ({ mode, onChangeMode }) => {
  return (
    <Box>
      <Text
        as="label"
        size="2"
        weight="bold"
        mb="1"
        style={{ display: "block" }}
      >
        セルの選択UIタイプ
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
              ドロップダウン（一覧から選択）
            </Text>
          </Flex>
          <Flex align="center" gap="2">
            <RadioGroup.Item value="combobox" id="mode-combobox" />
            <Text as="label" size="2" htmlFor="mode-combobox">
              コンボボックス（検索入力付き）
            </Text>
          </Flex>
        </Flex>
      </RadioGroup.Root>
    </Box>
  );
};
