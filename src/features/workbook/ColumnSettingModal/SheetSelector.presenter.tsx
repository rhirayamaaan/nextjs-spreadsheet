import { Box, Select, Text } from "@radix-ui/themes";
import type { FC } from "react";
import { useI18n } from "@/i18n/useI18n";
import type { CandidateSheet } from "./ColumnSettingModal.presenter";
import { columnSettingMessages } from "./i18n";

export type SheetSelectorPresenterProps = {
  candidateSheets: CandidateSheet[];
  selectedSheetId: string;
  onSelectSheet: (sheetId: string) => void;
};

export const SheetSelectorPresenter: FC<SheetSelectorPresenterProps> = ({
  candidateSheets,
  selectedSheetId,
  onSelectSheet,
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
        {t("sheetSelectorLabel")}
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
