import { CheckIcon, MagnifyingGlassIcon } from "@radix-ui/react-icons";
import { Box, Flex, Popover, Text, TextField } from "@radix-ui/themes";
import {
  type ChangeEvent,
  type FC,
  type FocusEvent,
  type KeyboardEvent,
  useMemo,
  useRef,
  useState,
} from "react";
import type { MoveDirection, PulldownMode } from "../stores/types";
import styles from "./Cell.module.css";

type Option = {
  key: string;
  label: string;
};

export type PulldownEditorPresenterProps = {
  initialValue: string;
  mode: PulldownMode;
  options: Option[];
  onCommit: (val: string, move?: MoveDirection) => void;
  onCancel: () => void;
};

export const PulldownEditorPresenter: FC<PulldownEditorPresenterProps> = ({
  initialValue,
  mode,
  options,
  onCommit,
  onCancel,
}) => {
  const [inputValue, setInputValue] = useState(initialValue);
  const [search, setSearch] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);
  const isFinishedRef = useRef(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const commitValue = (val: string, move?: MoveDirection) => {
    if (isFinishedRef.current) return;
    isFinishedRef.current = true;
    onCommit(val, move);
  };

  const cancelEdit = () => {
    if (isFinishedRef.current) return;
    isFinishedRef.current = true;
    onCancel();
  };

  const filteredOptions = useMemo(() => {
    if (mode !== "combobox" || !search.trim()) return options;
    const q = search.toLowerCase();
    return options.filter(
      (opt) =>
        opt.key.toLowerCase().includes(q) ||
        opt.label.toLowerCase().includes(q),
    );
  }, [options, search, mode]);

  const moveHighlight = (delta: 1 | -1) => {
    if (filteredOptions.length === 0) {
      setHighlightedIndex(null);
      return;
    }
    const nextIndex =
      highlightedIndex === null
        ? 0
        : Math.max(
            0,
            Math.min(filteredOptions.length - 1, highlightedIndex + delta),
          );
    setHighlightedIndex(nextIndex);
    const el = listRef.current?.children[nextIndex] as HTMLElement | undefined;
    el?.scrollIntoView({ block: "nearest" });
  };

  const handleCellFocus = (e: FocusEvent<HTMLInputElement>) => {
    const len = e.currentTarget.value.length;
    e.currentTarget.setSelectionRange(len, len);
  };

  const handleCellChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleCellKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.nativeEvent.isComposing) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      moveHighlight(1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      moveHighlight(-1);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const move: MoveDirection = {
        deltaRow: e.shiftKey ? -1 : 1,
        deltaCol: 0,
      };
      if (
        highlightedIndex !== null &&
        filteredOptions[highlightedIndex] !== undefined
      ) {
        commitValue(filteredOptions[highlightedIndex].key, move);
      } else {
        commitValue(inputValue, move);
      }
    } else if (e.key === "Tab") {
      e.preventDefault();
      const move: MoveDirection = {
        deltaRow: 0,
        deltaCol: e.shiftKey ? -1 : 1,
      };
      if (
        highlightedIndex !== null &&
        filteredOptions[highlightedIndex] !== undefined
      ) {
        commitValue(filteredOptions[highlightedIndex].key, move);
      } else {
        commitValue(inputValue, move);
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      cancelEdit();
    }
  };

  const handleSearchKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.nativeEvent.isComposing) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      moveHighlight(1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      moveHighlight(-1);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (
        highlightedIndex !== null &&
        filteredOptions[highlightedIndex] !== undefined
      ) {
        commitValue(filteredOptions[highlightedIndex].key, {
          deltaRow: e.shiftKey ? -1 : 1,
          deltaCol: 0,
        });
      }
    } else if (e.key === "Tab") {
      e.preventDefault();
      if (
        highlightedIndex !== null &&
        filteredOptions[highlightedIndex] !== undefined
      ) {
        commitValue(filteredOptions[highlightedIndex].key, {
          deltaRow: 0,
          deltaCol: e.shiftKey ? -1 : 1,
        });
      } else {
        commitValue(inputValue, {
          deltaRow: 0,
          deltaCol: e.shiftKey ? -1 : 1,
        });
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      cancelEdit();
    }
  };

  return (
    <Popover.Root
      open={true}
      onOpenChange={(open) => {
        if (!open) {
          commitValue(inputValue);
        }
      }}
    >
      <Popover.Trigger>
        <input
          type="text"
          // biome-ignore lint/a11y/noAutofocus: 編集モード切替時に即座に入力可能にするため
          autoFocus
          value={inputValue}
          onFocus={handleCellFocus}
          onChange={handleCellChange}
          onKeyDown={handleCellKeyDown}
          className={styles.cell__input}
        />
      </Popover.Trigger>

      <Popover.Content
        size="1"
        onOpenAutoFocus={(e) => {
          e.preventDefault();
        }}
        style={{
          width: 280,
          padding: 6,
          boxShadow: "0 8px 24px rgba(0, 0, 0, 0.15)",
        }}
      >
        {mode === "combobox" && (
          <Box mb="2" style={{ padding: "2px 2px" }}>
            <TextField.Root
              ref={searchInputRef}
              size="1"
              placeholder="コード・名称で検索..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setHighlightedIndex(null);
              }}
              onKeyDown={handleSearchKeyDown}
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
              const isSelected = opt.key === inputValue;
              const isHighlighted = index === highlightedIndex;

              return (
                <button
                  type="button"
                  key={opt.key}
                  onMouseDown={(e) => {
                    // Prevent blur before click fires
                    e.preventDefault();
                  }}
                  onClick={() => {
                    commitValue(opt.key);
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
