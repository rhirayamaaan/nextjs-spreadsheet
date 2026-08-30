import { Box, Flex, Select, Text, TextField } from "@radix-ui/themes";
import type { FC } from "react";
import type { ColumnId } from "../../../stores";
import type { CandidateColumn } from "./types";

export type KeyColumnSelectorProps = {
  candidateColumns: CandidateColumn[];
  selectedKeyColId: ColumnId | "";
  onSelectKeyCol: (colId: ColumnId) => void;
  keyColName: string;
  onChangeKeyColName: (name: string) => void;
};

export const KeyColumnSelector: FC<KeyColumnSelectorProps> = ({
  candidateColumns,
  selectedKeyColId,
  onSelectKeyCol,
  keyColName,
  onChangeKeyColName,
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
        キー列（プルダウンで選択する値の列）
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
            placeholder="列の表示名"
            value={keyColName}
            onChange={(e) => onChangeKeyColName(e.target.value)}
          />
        </Box>
      </Flex>
    </Box>
  );
};
