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
import { useI18n } from "@/i18n/useI18n";
import type { ColumnId } from "../stores/types";
import type { LookupColumnItem } from "./ColumnSettingModal.presenter";
import { columnSettingMessages } from "./i18n";

export type LookupColumnSelectorPresenterProps = {
  lookupColumns: LookupColumnItem[];
  onToggleLookupCol: (colId: ColumnId, selected: boolean) => void;
  onChangeLookupColName: (colId: ColumnId, name: string) => void;
};

export const LookupColumnSelectorPresenter: FC<
  LookupColumnSelectorPresenterProps
> = ({ lookupColumns, onToggleLookupCol, onChangeLookupColName }) => {
  const { t } = useI18n(columnSettingMessages);

  return (
    <Box>
      <Flex justify="between" align="center" mb="1">
        <Text as="label" size="2" weight="bold">
          {t("lookupColsLabel")}
        </Text>
        <Badge size="1" color="gray" variant="surface">
          {t("lookupReadOnlyBadge")}
        </Badge>
      </Flex>
      <Text size="1" color="gray" mb="2" style={{ display: "block" }}>
        {t("lookupDescription")}
      </Text>

      {lookupColumns.length === 0 ? (
        <Text size="2" color="gray">
          {t("noCandidateColumns")}
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
                      placeholder={t("headerNamePlaceholder")}
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
