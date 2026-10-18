import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
} from "@radix-ui/react-icons";
import { Box, Button, Flex, Popover, Select, Text } from "@radix-ui/themes";
import clsx from "clsx";
import {
  type ChangeEvent,
  type FC,
  type KeyboardEvent,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  type ChevronProps,
  DayPicker,
  type DropdownProps,
  getDefaultClassNames,
} from "react-day-picker";
import "react-day-picker/style.css";
import { Temporal } from "temporal-polyfill-lite";
import { useI18n } from "@/i18n/useI18n";
import type { DateTimeFormat, MoveDirection } from "../stores/types";
import styles from "./Cell.module.css";
import { dayPickerLocales, localMessages, MONTH_KEYS } from "./datePickerI18n";
import {
  DATETIME_END_YEAR,
  DATETIME_HOURS,
  DATETIME_MINUTES,
  DATETIME_MONTH_NUMBERS,
  DATETIME_START_YEAR,
  DATETIME_YEARS,
  formatDateTime,
  formatPlainDate,
  formatYearMonth,
  isTimeFormat,
  parsePickerDateTime,
  resolveInitialDateTime,
  toDatePickerMode,
} from "./datePickerUtils";

export type DatePickerEditorPresenterProps = {
  initialValue: string;
  format: DateTimeFormat;
  onCommit: (val: string, move?: MoveDirection) => void;
  onCancel: () => void;
};

const defaultDayPickerClassNames = getDefaultClassNames();

const toDayPickerDate = (date: Temporal.PlainDate): Date =>
  new Date(date.year, date.month - 1, date.day, 12, 0, 0, 0);

const toDayPickerMonthDate = (ym: Temporal.PlainYearMonth): Date =>
  new Date(ym.year, ym.month - 1, 1, 12, 0, 0, 0);

const RadixDayPickerChevron = ({ orientation = "left" }: ChevronProps) => {
  if (orientation === "right")
    return <ChevronRightIcon width={15} height={15} />;
  if (orientation === "down") return <ChevronDownIcon width={15} height={15} />;
  if (orientation === "up") return <ChevronUpIcon width={15} height={15} />;
  return <ChevronLeftIcon width={15} height={15} />;
};

const RadixDayPickerDropdown = ({
  options,
  value,
  onChange,
  "aria-label": ariaLabel,
}: DropdownProps) => (
  <Select.Root
    size="1"
    value={value !== undefined ? String(value) : undefined}
    onValueChange={(newVal) => {
      onChange?.({
        target: { value: newVal },
      } as ChangeEvent<HTMLSelectElement>);
    }}
  >
    <Select.Trigger aria-label={ariaLabel} variant="surface" />
    <Select.Content
      position="popper"
      className={styles.datePicker__selectContent}
    >
      {options?.map((opt) => (
        <Select.Item
          key={opt.value}
          value={String(opt.value)}
          disabled={opt.disabled}
        >
          {opt.label}
        </Select.Item>
      ))}
    </Select.Content>
  </Select.Root>
);

export const DatePickerEditorPresenter: FC<DatePickerEditorPresenterProps> = ({
  initialValue,
  format,
  onCommit,
  onCancel,
}) => {
  const { t, locale } = useI18n(localMessages);
  const dayPickerLocale = dayPickerLocales[locale];

  const mode = useMemo(() => toDatePickerMode(format), [format]);
  const isTimeMode = useMemo(() => isTimeFormat(format), [format]);

  const [inputValue, setInputValue] = useState(initialValue);
  const isFinishedRef = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const initialParsed = useMemo(
    () => resolveInitialDateTime(initialValue, format),
    [initialValue, format],
  );

  const [selectedDate, setSelectedDate] = useState<
    Temporal.PlainDate | undefined
  >(() =>
    initialParsed.hasValidValue
      ? new Temporal.PlainDate(
          initialParsed.year,
          initialParsed.month,
          initialParsed.day,
        )
      : undefined,
  );
  const [displayMonth, setDisplayMonth] = useState<Temporal.PlainYearMonth>(
    () => new Temporal.PlainYearMonth(initialParsed.year, initialParsed.month),
  );
  const [viewYear, setViewYear] = useState<number>(initialParsed.year);
  const [selectedMonthOnly, setSelectedMonthOnly] = useState<string>(() =>
    String(initialParsed.month).padStart(2, "0"),
  );
  const [selectedHour, setSelectedHour] = useState<string>(initialParsed.hour);
  const [selectedMinute, setSelectedMinute] = useState<string>(
    initialParsed.minute,
  );

  const commitValue = useCallback(
    (val: string, move?: MoveDirection) => {
      if (isFinishedRef.current) return;
      isFinishedRef.current = true;
      onCommit(val, move);
    },
    [onCommit],
  );

  const cancelEdit = useCallback(() => {
    if (isFinishedRef.current) return;
    isFinishedRef.current = true;
    onCancel();
  }, [onCancel]);

  const handleInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setInputValue(val);

      const parsed = parsePickerDateTime(val, format);
      if (!parsed) return;

      if (format === "yyyy" && parsed.year) {
        setViewYear(parsed.year);
      } else if (format === "MM") {
        setSelectedMonthOnly(val);
      } else if (format === "yyyy-MM" && parsed.year) {
        setViewYear(parsed.year);
      } else if (parsed.year && parsed.month && parsed.day) {
        const nextDate = new Temporal.PlainDate(
          parsed.year,
          parsed.month,
          parsed.day,
        );
        setSelectedDate(nextDate);
        setDisplayMonth(new Temporal.PlainYearMonth(parsed.year, parsed.month));
        if (isTimeMode && parsed.hour && parsed.minute) {
          setSelectedHour(parsed.hour);
          setSelectedMinute(parsed.minute);
        }
      }
    },
    [format, isTimeMode],
  );

  const handleCellKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.nativeEvent.isComposing) return;

      if (e.key === "Enter") {
        e.preventDefault();
        commitValue(inputValue, {
          deltaRow: e.shiftKey ? -1 : 1,
          deltaCol: 0,
        });
      } else if (e.key === "Tab") {
        e.preventDefault();
        commitValue(inputValue, {
          deltaRow: 0,
          deltaCol: e.shiftKey ? -1 : 1,
        });
      } else if (e.key === "Escape") {
        e.preventDefault();
        cancelEdit();
      }
    },
    [commitValue, cancelEdit, inputValue],
  );

  const handlePopoverOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        commitValue(inputValue);
      }
    },
    [commitValue, inputValue],
  );

  const handleSelectYear = useCallback(
    (yearStr: string) => {
      setViewYear(Number(yearStr));
      setInputValue(yearStr);
      commitValue(yearStr);
    },
    [commitValue],
  );

  const handleSelectMonthOnly = useCallback(
    (monthStr: string) => {
      setSelectedMonthOnly(monthStr);
      setInputValue(monthStr);
      commitValue(monthStr);
    },
    [commitValue],
  );

  const handlePrevYear = useCallback(() => {
    setViewYear((prev) => Math.max(DATETIME_START_YEAR, prev - 1));
  }, []);

  const handleNextYear = useCallback(() => {
    setViewYear((prev) => Math.min(DATETIME_END_YEAR, prev + 1));
  }, []);

  const handleChangeViewYear = useCallback(
    (yearStr: string) => {
      const nextYear = Number(yearStr);
      setViewYear(nextYear);
      const parsed = parsePickerDateTime(inputValue, "yyyy-MM");
      if (parsed?.month) {
        setInputValue(formatYearMonth(nextYear, parsed.month));
      }
    },
    [inputValue],
  );

  const handleSelectYearMonth = useCallback(
    (month: number) => {
      const ymStr = formatYearMonth(viewYear, month);
      setInputValue(ymStr);
      commitValue(ymStr);
    },
    [viewYear, commitValue],
  );

  const isYearMonthSelected = useCallback(
    (month: number) => inputValue === formatYearMonth(viewYear, month),
    [inputValue, viewYear],
  );

  const handleDaySelect = useCallback(
    (date: Date | undefined) => {
      if (!date) return;
      const plainDate = new Temporal.PlainDate(
        date.getFullYear(),
        date.getMonth() + 1,
        date.getDate(),
      );
      setSelectedDate(plainDate);

      if (isTimeMode) {
        const fullDateTime = formatDateTime(
          plainDate,
          selectedHour,
          selectedMinute,
        );
        setInputValue(fullDateTime);
        commitValue(fullDateTime);
      } else {
        const dateStr = formatPlainDate(plainDate);
        setInputValue(dateStr);
        commitValue(dateStr);
      }
    },
    [isTimeMode, selectedHour, selectedMinute, commitValue],
  );

  const handleMonthChange = useCallback((monthDate: Date) => {
    setDisplayMonth(
      new Temporal.PlainYearMonth(
        monthDate.getFullYear(),
        monthDate.getMonth() + 1,
      ),
    );
  }, []);

  const updateTime = useCallback(
    (nextHour: string, nextMinute: string) => {
      setSelectedHour(nextHour);
      setSelectedMinute(nextMinute);
      const baseDate =
        selectedDate ??
        displayMonth.toPlainDate({
          day: Math.min(initialParsed.day, displayMonth.daysInMonth),
        });
      setSelectedDate(baseDate);
      setInputValue(formatDateTime(baseDate, nextHour, nextMinute));
    },
    [selectedDate, displayMonth, initialParsed.day],
  );

  const handleChangeHour = useCallback(
    (hour: string) => {
      updateTime(hour, selectedMinute);
    },
    [updateTime, selectedMinute],
  );

  const handleChangeMinute = useCallback(
    (minute: string) => {
      updateTime(selectedHour, minute);
    },
    [updateTime, selectedHour],
  );

  const handleCommitCurrentInput = useCallback(() => {
    commitValue(inputValue);
  }, [commitValue, inputValue]);

  const dayPickerSelected = useMemo(
    () => (selectedDate ? toDayPickerDate(selectedDate) : undefined),
    [selectedDate],
  );
  const dayPickerMonth = useMemo(
    () => toDayPickerMonthDate(displayMonth),
    [displayMonth],
  );
  const dayPickerStartMonth = useMemo(
    () => new Date(DATETIME_START_YEAR, 0, 1, 12, 0, 0, 0),
    [],
  );
  const dayPickerEndMonth = useMemo(
    () => new Date(DATETIME_END_YEAR, 11, 1, 12, 0, 0, 0),
    [],
  );

  const dayPickerClassNames = useMemo(
    () => ({
      weekday: clsx(
        defaultDayPickerClassNames.weekday,
        styles.datePicker__weekday,
      ),
      day_button: clsx(
        defaultDayPickerClassNames.day_button,
        styles.datePicker__dayButton,
      ),
      selected: clsx(
        defaultDayPickerClassNames.selected,
        styles.datePicker__selected,
      ),
      today: clsx(defaultDayPickerClassNames.today, styles.datePicker__today),
      outside: clsx(
        defaultDayPickerClassNames.outside,
        styles.datePicker__outside,
      ),
      button_previous: clsx(
        defaultDayPickerClassNames.button_previous,
        styles.datePicker__navButton,
      ),
      button_next: clsx(
        defaultDayPickerClassNames.button_next,
        styles.datePicker__navButton,
      ),
      month_caption: clsx(
        defaultDayPickerClassNames.month_caption,
        styles.datePicker__monthCaption,
      ),
    }),
    [],
  );

  return (
    <Popover.Root open={true} onOpenChange={handlePopoverOpenChange}>
      <Popover.Trigger>
        <input
          ref={inputRef}
          type="text"
          // biome-ignore lint/a11y/noAutofocus: 編集モード切替時に即座に入力可能にするため
          autoFocus
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleCellKeyDown}
          className={styles.cell__input}
        />
      </Popover.Trigger>

      <Popover.Content
        size="1"
        onOpenAutoFocus={(e) => {
          e.preventDefault();
        }}
        onCloseAutoFocus={(e) => {
          e.preventDefault();
        }}
        onKeyDown={(e) => {
          if (e.key === "Tab") {
            e.preventDefault();
            commitValue(inputValue, {
              deltaRow: 0,
              deltaCol: e.shiftKey ? -1 : 1,
            });
          } else if (e.key === "Escape") {
            e.preventDefault();
            cancelEdit();
          }
        }}
        className={clsx(
          styles.datePickerPopover,
          (mode === "year" || mode === "month") &&
            styles["datePickerPopover--compact"],
          mode === "year-month" && styles["datePickerPopover--monthGrid"],
        )}
      >
        {/* 1. year: 年のみ選択 */}
        {mode === "year" && (
          <Flex direction="column" gap="2">
            <Text size="1" color="gray" weight="medium">
              {t("selectYear")}
            </Text>
            <Select.Root
              size="2"
              value={String(viewYear)}
              onValueChange={handleSelectYear}
            >
              <Select.Trigger variant="surface" />
              <Select.Content
                position="popper"
                className={styles.datePicker__selectContent}
              >
                {DATETIME_YEARS.map((y) => (
                  <Select.Item key={y} value={String(y)}>
                    {t("yearOption", { year: y })}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Root>
          </Flex>
        )}

        {/* 2. month: 月のみ選択 */}
        {mode === "month" && (
          <Flex direction="column" gap="2">
            <Text size="1" color="gray" weight="medium">
              {t("selectMonth")}
            </Text>
            <Select.Root
              size="2"
              value={selectedMonthOnly}
              onValueChange={handleSelectMonthOnly}
            >
              <Select.Trigger variant="surface" />
              <Select.Content
                position="popper"
                className={styles.datePicker__selectContent}
              >
                {DATETIME_MONTH_NUMBERS.map((m, idx) => (
                  <Select.Item key={m} value={m}>
                    {`${m} (${t(MONTH_KEYS[idx])})`}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Root>
          </Flex>
        )}

        {/* 3. year-month: 年 Select + 3×4 月ボタングリッド */}
        {mode === "year-month" && (
          <Box>
            <Flex justify="between" align="center" mb="3" gap="2">
              <Button
                variant="ghost"
                size="1"
                type="button"
                disabled={viewYear <= DATETIME_START_YEAR}
                onClick={handlePrevYear}
              >
                <ChevronLeftIcon />
              </Button>

              <Select.Root
                size="1"
                value={String(viewYear)}
                onValueChange={handleChangeViewYear}
              >
                <Select.Trigger variant="surface" />
                <Select.Content
                  position="popper"
                  className={styles.datePicker__selectContent}
                >
                  {DATETIME_YEARS.map((y) => (
                    <Select.Item key={y} value={String(y)}>
                      {t("yearOption", { year: y })}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>

              <Button
                variant="ghost"
                size="1"
                type="button"
                disabled={viewYear >= DATETIME_END_YEAR}
                onClick={handleNextYear}
              >
                <ChevronRightIcon />
              </Button>
            </Flex>

            <Box className={styles.datePicker__monthButtonsGrid}>
              {MONTH_KEYS.map((monthKey, idx) => {
                const monthNumber = idx + 1;
                const isSelected = isYearMonthSelected(monthNumber);
                return (
                  <Button
                    key={monthKey}
                    size="1"
                    variant={isSelected ? "solid" : "soft"}
                    type="button"
                    onClick={() => handleSelectYearMonth(monthNumber)}
                  >
                    {t(monthKey)}
                  </Button>
                );
              })}
            </Box>
          </Box>
        )}

        {/* 4. date / datetime: react-day-picker + 時刻 Select */}
        {(mode === "date" || mode === "datetime") && (
          <Box>
            <DayPicker
              mode="single"
              captionLayout="dropdown"
              navLayout="around"
              showOutsideDays
              fixedWeeks
              month={dayPickerMonth}
              onMonthChange={handleMonthChange}
              selected={dayPickerSelected}
              onSelect={handleDaySelect}
              startMonth={dayPickerStartMonth}
              endMonth={dayPickerEndMonth}
              locale={dayPickerLocale}
              components={{
                Chevron: RadixDayPickerChevron,
                Dropdown: RadixDayPickerDropdown,
              }}
              className={styles.datePicker}
              classNames={dayPickerClassNames}
            />

            {mode === "datetime" && (
              <Flex
                align="center"
                justify="between"
                gap="2"
                mt="2"
                pt="2"
                className={styles.datePicker__timeFooter}
              >
                <Flex align="center" gap="1">
                  <Text size="1" color="gray" mr="1">
                    {t("timeLabel")}
                  </Text>
                  <Select.Root
                    size="1"
                    value={selectedHour}
                    onValueChange={handleChangeHour}
                  >
                    <Select.Trigger variant="surface" />
                    <Select.Content
                      position="popper"
                      className={styles.datePicker__timeSelectContent}
                    >
                      {DATETIME_HOURS.map((h) => (
                        <Select.Item key={h} value={h}>
                          {h}
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select.Root>
                  <Text size="1" weight="bold">
                    :
                  </Text>
                  <Select.Root
                    size="1"
                    value={selectedMinute}
                    onValueChange={handleChangeMinute}
                  >
                    <Select.Trigger variant="surface" />
                    <Select.Content
                      position="popper"
                      className={styles.datePicker__timeSelectContent}
                    >
                      {DATETIME_MINUTES.map((m) => (
                        <Select.Item key={m} value={m}>
                          {m}
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select.Root>
                </Flex>

                <Button
                  size="1"
                  variant="solid"
                  type="button"
                  onClick={handleCommitCurrentInput}
                >
                  {t("ok")}
                </Button>
              </Flex>
            )}
          </Box>
        )}
      </Popover.Content>
    </Popover.Root>
  );
};
