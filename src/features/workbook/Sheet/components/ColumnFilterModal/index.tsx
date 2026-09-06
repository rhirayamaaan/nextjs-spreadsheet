import { MagnifyingGlassIcon } from "@radix-ui/react-icons";
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  Flex,
  ScrollArea,
  Text,
  TextField,
} from "@radix-ui/themes";
import type { FC } from "react";
import { useMemo } from "react";
import { useColumnFilterModalContainer } from "../../containers/useColumnFilterModalContainer";
import type {
  ColumnFilterModalPresenterProps,
  ColumnFilterModalProps,
} from "./types";

export const ColumnFilterModalPresenter: FC<
  ColumnFilterModalPresenterProps
> = ({
  open,
  onOpenChange,
  columnName,
  options,
  selectedValues,
  searchQuery,
  onChangeSearchQuery,
  onToggleValue,
  onSelectAll,
  onDeselectAll,
  onApply,
  onClearFilter,
  onCancel,
  isFilterActive,
}) => {
  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return options;
    const q = searchQuery.toLowerCase();
    return options.filter((opt) => opt.label.toLowerCase().includes(q));
  }, [options, searchQuery]);

  const allFilteredSelected = useMemo(() => {
    if (filteredOptions.length === 0) return false;
    return filteredOptions.every((opt) => selectedValues.includes(opt.value));
  }, [filteredOptions, selectedValues]);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content style={{ maxWidth: 420, padding: 20 }}>
        <Dialog.Title size="4" mb="1">
          フィルター: {columnName || "列"}
        </Dialog.Title>
        <Dialog.Description size="2" mb="3" color="gray">
          表示する値を選択してください
        </Dialog.Description>

        <Flex direction="column" gap="3">
          <TextField.Root
            placeholder="値を検索..."
            value={searchQuery}
            onChange={(e) => onChangeSearchQuery(e.target.value)}
            size="2"
          >
            <TextField.Slot>
              <MagnifyingGlassIcon height="16" width="16" />
            </TextField.Slot>
          </TextField.Root>

          <Flex justify="between" align="center">
            <Text size="1" color="gray">
              {selectedValues.length} / {options.length} 選択中
            </Text>
            <Flex gap="2">
              <Button
                type="button"
                size="1"
                variant="ghost"
                onClick={onSelectAll}
                disabled={allFilteredSelected}
              >
                すべて選択
              </Button>
              <Button
                type="button"
                size="1"
                variant="ghost"
                onClick={onDeselectAll}
                disabled={selectedValues.length === 0}
              >
                すべて解除
              </Button>
            </Flex>
          </Flex>

          <Box
            style={{
              border: "1px solid var(--gray-a6)",
              borderRadius: "var(--radius-2)",
              backgroundColor: "var(--color-background)",
            }}
          >
            <ScrollArea
              type="auto"
              scrollbars="vertical"
              style={{ maxHeight: 240, padding: "8px 12px" }}
            >
              {filteredOptions.length === 0 ? (
                <Text
                  size="2"
                  color="gray"
                  style={{
                    display: "block",
                    textAlign: "center",
                    padding: "16px 0",
                  }}
                >
                  該当する値がありません
                </Text>
              ) : (
                <Flex direction="column" gap="2">
                  {filteredOptions.map((opt) => {
                    const isChecked = selectedValues.includes(opt.value);
                    const isBlank = opt.value === "";
                    return (
                      <Text
                        as="label"
                        size="2"
                        key={opt.value || "__blank__"}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          cursor: "pointer",
                          userSelect: "none",
                        }}
                      >
                        <Checkbox
                          checked={isChecked}
                          onCheckedChange={() => onToggleValue(opt.value)}
                        />
                        {isBlank ? (
                          <Text color="gray" style={{ fontStyle: "italic" }}>
                            (空白)
                          </Text>
                        ) : (
                          <Flex
                            align="center"
                            gap="1"
                            style={{
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            <Text weight="medium">{opt.value}</Text>
                            {opt.detail && (
                              <Text size="1" color="gray">
                                ({opt.detail})
                              </Text>
                            )}
                          </Flex>
                        )}
                      </Text>
                    );
                  })}
                </Flex>
              )}
            </ScrollArea>
          </Box>
        </Flex>

        <Flex justify="between" align="center" mt="4">
          {isFilterActive ? (
            <Button
              type="button"
              variant="soft"
              color="red"
              size="2"
              onClick={onClearFilter}
            >
              フィルター解除
            </Button>
          ) : (
            <Box />
          )}
          <Flex gap="2">
            <Button
              type="button"
              variant="soft"
              color="gray"
              size="2"
              onClick={onCancel}
            >
              キャンセル
            </Button>
            <Button
              type="button"
              variant="solid"
              color="blue"
              size="2"
              onClick={onApply}
            >
              適用
            </Button>
          </Flex>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
};

export const ColumnFilterModal: FC<ColumnFilterModalProps> & {
  Presenter: typeof ColumnFilterModalPresenter;
} = (props) => {
  const presenterProps = useColumnFilterModalContainer(props);
  return <ColumnFilterModalPresenter {...presenterProps} />;
};

ColumnFilterModal.Presenter = ColumnFilterModalPresenter;

export * from "./types";
