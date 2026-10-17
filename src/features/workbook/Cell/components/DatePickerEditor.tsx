import { ChevronLeftIcon, ChevronRightIcon } from "@radix-ui/react-icons";
import { Box, Button, Flex, Popover, Text } from "@radix-ui/themes";
import {
  type ChangeEvent,
  type FC,
  type KeyboardEvent,
  useMemo,
  useRef,
  useState,
} from "react";
import { Temporal } from "temporal-polyfill-lite";
import type { DateTimeFormat } from "../../stores/types";
import styles from "./index.module.css";

type Props = {
  initialValue: string;
  format: DateTimeFormat;
  onCommit: (val: string) => void;
  onCancel: () => void;
};

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];
const MONTHS = [
  "1月",
  "2月",
  "3月",
  "4月",
  "5月",
  "6月",
  "7月",
  "8月",
  "9月",
  "10月",
  "11月",
  "12月",
];

export const DatePickerEditor: FC<Props> = ({
  initialValue,
  format,
  onCommit,
  onCancel,
}) => {
  const [inputValue, setInputValue] = useState(initialValue);
  const isFinishedRef = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // 初期日付の解決
  const initialTemporal = useMemo(() => {
    try {
      if (format === "yyyy-MM") {
        return Temporal.PlainYearMonth.from(initialValue);
      }
      if (format.includes("hh:mm") || format.includes("HH:mm")) {
        return Temporal.PlainDateTime.from(initialValue.replace(" ", "T"));
      }
      return Temporal.PlainDate.from(initialValue);
    } catch {
      return Temporal.Now.plainDateISO();
    }
  }, [initialValue, format]);

  const [viewYear, setViewYear] = useState(initialTemporal.year);
  const [viewMonth, setViewMonth] = useState(initialTemporal.month);
  const [selectedTime, setSelectedTime] = useState(() => {
    if (format.includes("hh:mm") || format.includes("HH:mm")) {
      const match = initialValue.match(/(\d{2}):(\d{2})$/);
      if (match) return `${match[1]}:${match[2]}`;
      return "09:00";
    }
    return "";
  });

  const commitValue = (val: string) => {
    if (isFinishedRef.current) return;
    isFinishedRef.current = true;
    onCommit(val);
  };

  const cancelEdit = () => {
    if (isFinishedRef.current) return;
    isFinishedRef.current = true;
    onCancel();
  };

  const handlePrevMonth = () => {
    if (viewMonth === 1) {
      setViewYear((prev) => prev - 1);
      setViewMonth(12);
    } else {
      setViewMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 12) {
      setViewYear((prev) => prev + 1);
      setViewMonth(1);
    } else {
      setViewMonth((prev) => prev + 1);
    }
  };

  const handlePrevYear = () => {
    setViewYear((prev) => prev - 1);
  };

  const handleNextYear = () => {
    setViewYear((prev) => prev + 1);
  };

  // 月カレンダーグリッドの日付リスト
  const calendarDays = useMemo(() => {
    const firstDay = Temporal.PlainDate.from({
      year: viewYear,
      month: viewMonth,
      day: 1,
    });
    const daysInMonth = firstDay.daysInMonth;
    // Temporal の dayOfWeek は 1(月)〜7(日)。日曜始まりなら % 7 で 0(日)〜6(土) になる
    const startWeekday = firstDay.dayOfWeek % 7;

    const days: { key: string; day: number | null }[] = [];
    for (let i = 0; i < startWeekday; i++) {
      days.push({ key: `empty-${viewYear}-${viewMonth}-${i}`, day: null });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      days.push({ key: `day-${viewYear}-${viewMonth}-${d}`, day: d });
    }
    return days;
  }, [viewYear, viewMonth]);

  const handleSelectDay = (day: number) => {
    const yStr = String(viewYear).padStart(4, "0");
    const mStr = String(viewMonth).padStart(2, "0");
    const dStr = String(day).padStart(2, "0");
    const dateStr = `${yStr}-${mStr}-${dStr}`;

    if (format.includes("hh:mm") || format.includes("HH:mm")) {
      const fullDateTime = `${dateStr} ${selectedTime || "00:00"}`;
      setInputValue(fullDateTime);
      commitValue(fullDateTime);
    } else {
      setInputValue(dateStr);
      commitValue(dateStr);
    }
  };

  const handleSelectMonth = (monthIndex: number) => {
    const yStr = String(viewYear).padStart(4, "0");
    const mStr = String(monthIndex + 1).padStart(2, "0");
    const ymStr = `${yStr}-${mStr}`;
    setInputValue(ymStr);
    commitValue(ymStr);
  };

  const handleCellKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.nativeEvent.isComposing) return;

    if (e.key === "Enter") {
      e.preventDefault();
      commitValue(inputValue);
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
          ref={inputRef}
          type="text"
          // biome-ignore lint/a11y/noAutofocus: 編集モード切替時に即座に入力可能にするため
          autoFocus
          value={inputValue}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setInputValue(e.target.value)
          }
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
          padding: 12,
          boxShadow: "0 8px 24px rgba(0, 0, 0, 0.15)",
        }}
      >
        {/* ヘッダー: 年月ナビゲーション */}
        <Flex justify="between" align="center" mb="3">
          <Button
            variant="ghost"
            size="1"
            type="button"
            onClick={format === "yyyy-MM" ? handlePrevYear : handlePrevMonth}
          >
            <ChevronLeftIcon />
          </Button>

          <Text size="2" weight="bold">
            {format === "yyyy-MM"
              ? `${viewYear}年`
              : `${viewYear}年 ${viewMonth}月`}
          </Text>

          <Button
            variant="ghost"
            size="1"
            type="button"
            onClick={format === "yyyy-MM" ? handleNextYear : handleNextMonth}
          >
            <ChevronRightIcon />
          </Button>
        </Flex>

        {/* yyyy-MM: 月選択グリッド */}
        {format === "yyyy-MM" ? (
          <Box
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 6,
            }}
          >
            {MONTHS.map((name, idx) => {
              const isSelected =
                initialTemporal.year === viewYear &&
                initialTemporal.month === idx + 1;
              return (
                <Button
                  key={name}
                  size="1"
                  variant={isSelected ? "solid" : "soft"}
                  type="button"
                  onClick={() => handleSelectMonth(idx)}
                >
                  {name}
                </Button>
              );
            })}
          </Box>
        ) : (
          /* 日付カレンダーグリッド */
          <>
            <Box
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(7, 1fr)",
                gap: 2,
                textAlign: "center",
                marginBottom: 6,
              }}
            >
              {WEEKDAYS.map((w, i) => (
                <Text
                  key={w}
                  size="1"
                  color={i === 0 ? "red" : i === 6 ? "blue" : "gray"}
                  weight="bold"
                >
                  {w}
                </Text>
              ))}
            </Box>

            <Box
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(7, 1fr)",
                gap: 2,
              }}
            >
              {calendarDays.map((item) => {
                if (item.day === null) {
                  return <Box key={item.key} />;
                }
                const isSelected =
                  initialTemporal.year === viewYear &&
                  initialTemporal.month === viewMonth &&
                  "day" in initialTemporal &&
                  initialTemporal.day === item.day;

                return (
                  <button
                    type="button"
                    key={item.key}
                    onClick={() => handleSelectDay(item.day as number)}
                    style={{
                      padding: "4px 0",
                      borderRadius: 4,
                      border: "none",
                      background: isSelected
                        ? "var(--accent-9)"
                        : "transparent",
                      color: isSelected ? "white" : "inherit",
                      cursor: "pointer",
                      fontSize: 12,
                      fontWeight: isSelected ? "bold" : "normal",
                    }}
                  >
                    {item.day}
                  </button>
                );
              })}
            </Box>

            {/* yyyy-MM-dd hh:mm の場合の時刻選択 */}
            {(format.includes("hh:mm") || format.includes("HH:mm")) && (
              <Flex
                align="center"
                gap="2"
                mt="3"
                pt="2"
                style={{ borderTop: "1px solid var(--gray-a4)" }}
              >
                <Text size="1" color="gray">
                  時刻:
                </Text>
                <input
                  type="time"
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  style={{
                    padding: "2px 6px",
                    borderRadius: 4,
                    border: "1px solid var(--gray-a6)",
                    fontSize: 12,
                  }}
                />
              </Flex>
            )}
          </>
        )}
      </Popover.Content>
    </Popover.Root>
  );
};
