import {
  type ChangeEvent,
  type KeyboardEvent,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
import { Temporal } from "temporal-polyfill-lite";
import type { DateTimeFormat, MoveDirection } from "../../stores/types";
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
  parseDateTimeString,
  resolveInitialDateTime,
} from "../../utils/datetime";
import type {
  DatePickerEditorPresenterProps,
  DatePickerMode,
} from "../components/DatePickerEditor";

export type DatePickerEditorProps = {
  initialValue: string;
  format: DateTimeFormat;
  onCommit: (val: string, move?: MoveDirection) => void;
  onCancel: () => void;
};

const toDatePickerMode = (format: DateTimeFormat): DatePickerMode => {
  switch (format) {
    case "yyyy":
      return "year";
    case "MM":
      return "month";
    case "yyyy-MM":
      return "year-month";
    case "yyyy-MM-dd":
      return "date";
    case "yyyy-MM-dd HH:mm":
    case "yyyy-MM-dd hh:mm":
      return "datetime";
  }
};

export const useDatePickerEditorContainer = ({
  initialValue,
  format,
  onCommit,
  onCancel,
}: DatePickerEditorProps): DatePickerEditorPresenterProps => {
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

  const mode = toDatePickerMode(format);
  const isTimeMode = isTimeFormat(format);

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

      const parsed = parseDateTimeString(val, format);
      if (!parsed) return;

      if (format === "yyyy") {
        setViewYear(parsed.year);
      } else if (format === "MM") {
        setSelectedMonthOnly(val);
      } else if (format === "yyyy-MM") {
        setViewYear(parsed.year);
      } else {
        const nextDate = new Temporal.PlainDate(
          parsed.year,
          parsed.month,
          parsed.day,
        );
        setSelectedDate(nextDate);
        setDisplayMonth(new Temporal.PlainYearMonth(parsed.year, parsed.month));
        if (isTimeMode) {
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
      const parsed = parseDateTimeString(inputValue, "yyyy-MM");
      if (parsed) {
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

  const handleSelectDay = useCallback(
    (date: Temporal.PlainDate | undefined) => {
      if (!date) return;
      setSelectedDate(date);

      if (isTimeMode) {
        const fullDateTime = formatDateTime(date, selectedHour, selectedMinute);
        setInputValue(fullDateTime);
        commitValue(fullDateTime);
      } else {
        const dateStr = formatPlainDate(date);
        setInputValue(dateStr);
        commitValue(dateStr);
      }
    },
    [isTimeMode, selectedHour, selectedMinute, commitValue],
  );

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

  return {
    mode,
    inputRef,
    inputValue,
    selectedDate,
    displayMonth,
    viewYear,
    selectedMonthOnly,
    selectedHour,
    selectedMinute,
    canPrevYear: viewYear > DATETIME_START_YEAR,
    canNextYear: viewYear < DATETIME_END_YEAR,
    years: DATETIME_YEARS,
    monthNumbers: DATETIME_MONTH_NUMBERS,
    hours: DATETIME_HOURS,
    minutes: DATETIME_MINUTES,
    startYear: DATETIME_START_YEAR,
    endYear: DATETIME_END_YEAR,
    isYearMonthSelected,
    onInputChange: handleInputChange,
    onCellKeyDown: handleCellKeyDown,
    onPopoverOpenChange: handlePopoverOpenChange,
    onSelectYear: handleSelectYear,
    onSelectMonthOnly: handleSelectMonthOnly,
    onPrevYear: handlePrevYear,
    onNextYear: handleNextYear,
    onChangeViewYear: handleChangeViewYear,
    onSelectYearMonth: handleSelectYearMonth,
    onSelectDay: handleSelectDay,
    onDisplayMonthChange: setDisplayMonth,
    onChangeHour: handleChangeHour,
    onChangeMinute: handleChangeMinute,
    onCommitCurrentInput: handleCommitCurrentInput,
  };
};
