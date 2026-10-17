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
  type RefObject,
  useCallback,
  useMemo,
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
import {
  type DatePickerEditorProps,
  useDatePickerEditorContainer,
} from "../containers/useDatePickerEditorContainer";
import { dayPickerLocales, localMessages, MONTH_KEYS } from "./i18n";
import styles from "./index.module.css";

export type DatePickerMode =
  | "year"
  | "month"
  | "year-month"
  | "date"
  | "datetime";

export type DatePickerEditorPresenterProps = {
  mode: DatePickerMode;
  inputRef: RefObject<HTMLInputElement | null>;
  inputValue: string;
  selectedDate: Temporal.PlainDate | undefined;
  displayMonth: Temporal.PlainYearMonth;
  viewYear: number;
  selectedMonthOnly: string;
  selectedHour: string;
  selectedMinute: string;
  canPrevYear: boolean;
  canNextYear: boolean;
  years: readonly number[];
  monthNumbers: readonly string[];
  hours: readonly string[];
  minutes: readonly string[];
  startYear: number;
  endYear: number;
  isYearMonthSelected: (month: number) => boolean;
  onInputChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onCellKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void;
  onPopoverOpenChange: (open: boolean) => void;
  onSelectYear: (yearStr: string) => void;
  onSelectMonthOnly: (monthStr: string) => void;
  onPrevYear: () => void;
  onNextYear: () => void;
  onChangeViewYear: (yearStr: string) => void;
  onSelectYearMonth: (month: number) => void;
  onSelectDay: (date: Temporal.PlainDate | undefined) => void;
  onDisplayMonthChange: (month: Temporal.PlainYearMonth) => void;
  onChangeHour: (hour: string) => void;
  onChangeMinute: (minute: string) => void;
  onCommitCurrentInput: () => void;
};

const defaultDayPickerClassNames = getDefaultClassNames();

/**
 * Temporal.PlainDate -> react-day-picker 用の Date 変換（正午基準で DST 境界のズレを回避）
 */
const toDayPickerDate = (date: Temporal.PlainDate): Date =>
  new Date(date.year, date.month - 1, date.day, 12, 0, 0, 0);

/**
 * Temporal.PlainYearMonth -> react-day-picker 用の月初 Date 変換
 */
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
  mode,
  inputRef,
  inputValue,
  selectedDate,
  displayMonth,
  viewYear,
  selectedMonthOnly,
  selectedHour,
  selectedMinute,
  canPrevYear,
  canNextYear,
  years,
  monthNumbers,
  hours,
  minutes,
  startYear,
  endYear,
  isYearMonthSelected,
  onInputChange,
  onCellKeyDown,
  onPopoverOpenChange,
  onSelectYear,
  onSelectMonthOnly,
  onPrevYear,
  onNextYear,
  onChangeViewYear,
  onSelectYearMonth,
  onSelectDay,
  onDisplayMonthChange,
  onChangeHour,
  onChangeMinute,
  onCommitCurrentInput,
}) => {
  const { t, locale } = useI18n(localMessages);
  const dayPickerLocale = dayPickerLocales[locale];

  const dayPickerSelected = useMemo(
    () => (selectedDate ? toDayPickerDate(selectedDate) : undefined),
    [selectedDate],
  );
  const dayPickerMonth = useMemo(
    () => toDayPickerMonthDate(displayMonth),
    [displayMonth],
  );
  const dayPickerStartMonth = useMemo(
    () => new Date(startYear, 0, 1, 12, 0, 0, 0),
    [startYear],
  );
  const dayPickerEndMonth = useMemo(
    () => new Date(endYear, 11, 1, 12, 0, 0, 0),
    [endYear],
  );

  const handleDaySelect = useCallback(
    (date: Date | undefined) => {
      if (!date) {
        onSelectDay(undefined);
        return;
      }
      onSelectDay(
        new Temporal.PlainDate(
          date.getFullYear(),
          date.getMonth() + 1,
          date.getDate(),
        ),
      );
    },
    [onSelectDay],
  );

  const handleMonthChange = useCallback(
    (monthDate: Date) => {
      onDisplayMonthChange(
        new Temporal.PlainYearMonth(
          monthDate.getFullYear(),
          monthDate.getMonth() + 1,
        ),
      );
    },
    [onDisplayMonthChange],
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
    <Popover.Root open={true} onOpenChange={onPopoverOpenChange}>
      <Popover.Trigger>
        <input
          ref={inputRef}
          type="text"
          // biome-ignore lint/a11y/noAutofocus: 編集モード切替時に即座に入力可能にするため
          autoFocus
          value={inputValue}
          onChange={onInputChange}
          onKeyDown={onCellKeyDown}
          className={styles.cell__input}
        />
      </Popover.Trigger>

      <Popover.Content
        size="1"
        onOpenAutoFocus={(e) => {
          e.preventDefault();
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
              onValueChange={onSelectYear}
            >
              <Select.Trigger variant="surface" />
              <Select.Content
                position="popper"
                className={styles.datePicker__selectContent}
              >
                {years.map((y) => (
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
              onValueChange={onSelectMonthOnly}
            >
              <Select.Trigger variant="surface" />
              <Select.Content
                position="popper"
                className={styles.datePicker__selectContent}
              >
                {monthNumbers.map((m, idx) => (
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
                disabled={!canPrevYear}
                onClick={onPrevYear}
              >
                <ChevronLeftIcon />
              </Button>

              <Select.Root
                size="1"
                value={String(viewYear)}
                onValueChange={onChangeViewYear}
              >
                <Select.Trigger variant="surface" />
                <Select.Content
                  position="popper"
                  className={styles.datePicker__selectContent}
                >
                  {years.map((y) => (
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
                disabled={!canNextYear}
                onClick={onNextYear}
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
                    onClick={() => onSelectYearMonth(monthNumber)}
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
                    onValueChange={onChangeHour}
                  >
                    <Select.Trigger variant="surface" />
                    <Select.Content
                      position="popper"
                      className={styles.datePicker__timeSelectContent}
                    >
                      {hours.map((h) => (
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
                    onValueChange={onChangeMinute}
                  >
                    <Select.Trigger variant="surface" />
                    <Select.Content
                      position="popper"
                      className={styles.datePicker__timeSelectContent}
                    >
                      {minutes.map((m) => (
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
                  onClick={onCommitCurrentInput}
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

export const DatePickerEditor: FC<DatePickerEditorProps> & {
  Presenter: typeof DatePickerEditorPresenter;
} = (props) => {
  const presenterProps = useDatePickerEditorContainer(props);
  return <DatePickerEditorPresenter {...presenterProps} />;
};

DatePickerEditor.Presenter = DatePickerEditorPresenter;
