import {
  Badge,
  Box,
  Card,
  Checkbox,
  Flex,
  Text,
  TextField,
} from "@radix-ui/themes";
import type { FC } from "react";
import type { ColumnId } from "../../../stores";
import type { LookupColumnItem } from "./types";

export type LookupColumnSelectorProps = {
  lookupColumns: LookupColumnItem[];
  onToggleLookupCol: (colId: ColumnId, selected: boolean) => void;
  onChangeLookupColName: (colId: ColumnId, name: string) => void;
};

export const LookupColumnSelector: FC<LookupColumnSelectorProps> = ({
  lookupColumns,
  onToggleLookupCol,
  onChangeLookupColName,
}) => {
  return (
    <Box>
      <Flex justify="between" align="center" mb="1">
        <Text as="label" size="2" weight="bold">
          自動追加する参照列（複数選択可）
        </Text>
        <Badge size="1" color="gray" variant="surface">
          編集不可（動的参照）
        </Badge>
      </Flex>
      <Text size="1" color="gray" mb="2" style={{ display: "block" }}>
        キー列の隣に自動追加され、選択されたキーに対応するマスターデータが自動表示されます。
      </Text>

      {lookupColumns.length === 0 ? (
        <Text size="2" color="gray">
          キー列以外の候補列がありません
        </Text>
      ) : (
        <Card
          size="1"
          style={{
            maxHeight: 180,
            overflowY: "auto",
            padding: 8,
            backgroundColor: "var(--gray-2)",
          }}
        >
          <Flex direction="column" gap="2">
            {lookupColumns.map((col) => (
              <Flex
                key={col.colId}
                align="center"
                justify="between"
                gap="2"
                style={{
                  padding: "4px 8px",
                  borderRadius: 4,
                  backgroundColor: col.selected
                    ? "var(--gray-3)"
                    : "transparent",
                }}
              >
                <Flex align="center" gap="2" style={{ flex: 1 }}>
                  <Checkbox
                    checked={col.selected}
                    onCheckedChange={(checked) =>
                      onToggleLookupCol(col.colId, checked === true)
                    }
                  />
                  <Text size="2">{col.name}</Text>
                </Flex>
                {col.selected && (
                  <Box style={{ width: 140 }}>
                    <TextField.Root
                      size="1"
                      placeholder="ヘッダー表示名"
                      value={col.headerName}
                      onChange={(e) =>
                        onChangeLookupColName(col.colId, e.target.value)
                      }
                    />
                  </Box>
                )}
              </Flex>
            ))}
          </Flex>
        </Card>
      )}
    </Box>
  );
};
