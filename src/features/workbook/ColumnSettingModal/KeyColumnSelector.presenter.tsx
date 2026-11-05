import { Box, Flex, Select, Text, TextField } from "@radix-ui/themes";
import type { FC } from "react";
import { useI18n } from "@/i18n/useI18n";
import type { ColumnId } from "../stores/types";
import type { CandidateColumn } from "./ColumnSettingModal.presenter";
import { columnSettingMessages } from "./i18n";

export type KeyColumnSelectorPresenterProps = {
  candidateColumns: CandidateColumn[];
  selectedKeyColId: ColumnId | "";
  onSelectKeyCol: (colId: ColumnId) => void;
  keyColName: string;
  onChangeKeyColName: (name: string) => void;
};

export const KeyColumnSelectorPresenter: FC<
  KeyColumnSelectorPresenterProps
> = ({
  candidateColumns,
  selectedKeyColId,
  onSelectKeyCol,
  keyColName,
  onChangeKeyColName,
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
        {t("keyColLabel")}
      </Text>
      <Flex gap="2">
        <Box style={{ flex: 1 }}>
          <Select.Root
            value={selectedKeyColId}
            onValueChange={(val) => {
              const matched = candidateColumns.find((c) => c.id === val);
              if (matched) {
                onSelectKeyCol(matched.id);
              }
            }}
          >
            <Select.Trigger style={{ width: "100%" }} />
            <Select.Content>
              {candidateColumns.map((c) => (
                <Select.Item key={c.id} value={c.id}>
                  {c.name}
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Root>
        </Box>
        <Box style={{ width: 140 }}>
          <TextField.Root
            size="2"
            placeholder={t("keyColPlaceholder")}
            value={keyColName}
            onChange={(e) => onChangeKeyColName(e.target.value)}
          />
        </Box>
      </Flex>
    </Box>
  );
};
