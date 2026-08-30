import { CheckIcon, MagnifyingGlassIcon } from "@radix-ui/react-icons";
import { Box, Flex, Popover, Text, TextField } from "@radix-ui/themes";
import { type FC, type KeyboardEvent, useMemo, useRef, useState } from "react";
import type { PulldownMode } from "../../stores";

type Option = {
  key: string;
  label: string;
};

type Props = {
  value: string;
  mode: PulldownMode;
  options: Option[];
  onSelect: (val: string) => void;
  onClose: () => void;
};

export const PulldownEditor: FC<Props> = ({
  value,
  mode,
  options,
  onSelect,
  onClose,
}) => {
  const [search, setSearch] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  const filteredOptions = useMemo(() => {
    if (!search.trim()) return options;
    const q = search.toLowerCase();
    return options.filter(
      (opt) =>
        opt.key.toLowerCase().includes(q) ||
        opt.label.toLowerCase().includes(q),
    );
  }, [options, search]);

  const handleSearchChange = (val: string) => {
    setSearch(val);
    setHighlightedIndex(0);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev < filteredOptions.length - 1 ? prev + 1 : prev,
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const selected = filteredOptions[highlightedIndex];
      if (selected) {
        onSelect(selected.key);
      }
      onClose();
    } else if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    }
  };

  return (
    <Popover.Root open={true} onOpenChange={(open) => !open && onClose()}>
      <Popover.Trigger>
        <button
          type="button"
          tabIndex={-1}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            opacity: 0,
            pointerEvents: "none",
          }}
        />
      </Popover.Trigger>

      <Popover.Content
        size="1"
        style={{
          width: 280,
          padding: 6,
          boxShadow: "0 8px 24px rgba(0, 0, 0, 0.15)",
        }}
        onKeyDown={handleKeyDown}
      >
        {mode === "combobox" && (
          <Box mb="2" style={{ padding: "2px 2px" }}>
            <TextField.Root
              size="1"
              autoFocus
              placeholder="コード・名称で検索..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
            >
              <TextField.Slot>
                <MagnifyingGlassIcon height={14} width={14} />
              </TextField.Slot>
            </TextField.Root>
          </Box>
        )}

        <div
          ref={listRef}
          style={{
            maxHeight: 220,
            overflowY: "auto",
            display: "flex",
            direction: "ltr",
            flexDirection: "column",
            gap: 2,
          }}
        >
          {filteredOptions.length === 0 ? (
            <Box p="3" style={{ textAlign: "center" }}>
              <Text size="1" color="gray">
                一致するデータがありません
              </Text>
            </Box>
          ) : (
            filteredOptions.map((opt, index) => {
              const isSelected = opt.key === value;
              const isHighlighted = index === highlightedIndex;

              return (
                <button
                  type="button"
                  key={opt.key}
                  onClick={() => {
                    onSelect(opt.key);
                    onClose();
                  }}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "6px 8px",
                    borderRadius: 4,
                    border: "none",
                    background: isHighlighted
                      ? "var(--accent-a3)"
                      : isSelected
                        ? "var(--gray-a3)"
                        : "transparent",
                    cursor: "pointer",
                    textAlign: "left",
                    width: "100%",
                  }}
                >
                  <Flex direction="column" style={{ minWidth: 0, flex: 1 }}>
                    <Text
                      size="2"
                      weight="bold"
                      style={{
                        color: isHighlighted
                          ? "var(--accent-11)"
                          : "var(--gray-12)",
                      }}
                    >
                      {opt.key}
                    </Text>
                    {opt.label !== opt.key && (
                      <Text
                        size="1"
                        color="gray"
                        style={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {opt.label}
                      </Text>
                    )}
                  </Flex>
                  {isSelected && (
                    <CheckIcon width={14} height={14} color="var(--accent-9)" />
                  )}
                </button>
              );
            })
          )}
        </div>
      </Popover.Content>
    </Popover.Root>
  );
};
