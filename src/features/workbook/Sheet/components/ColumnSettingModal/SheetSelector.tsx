import { Box, Select, Text } from "@radix-ui/themes";
import type { FC } from "react";
import type { CandidateSheet } from "./types";

export type SheetSelectorProps = {
  candidateSheets: CandidateSheet[];
  selectedSheetId: string;
  onSelectSheet: (sheetId: string) => void;
};

export const SheetSelector: FC<SheetSelectorProps> = ({
  candidateSheets,
  selectedSheetId,
  onSelectSheet,
}) => {
  return (
    <Box>
      <Text
        as="label"
        size="2"
        weight="bold"
        mb="1"
        style={{ display: "block" }}
      >
        参照先マスターシート
      </Text>
      <Select.Root value={selectedSheetId} onValueChange={onSelectSheet}>
        <Select.Trigger style={{ width: "100%" }} />
        <Select.Content>
          {candidateSheets.map((s) => (
            <Select.Item key={s.id} value={s.id}>
              {s.name} ({s.id})
            </Select.Item>
          ))}
        </Select.Content>
      </Select.Root>
    </Box>
  );
};
