import { Temporal } from "temporal-polyfill-lite";
import type { DateTimeFormat } from "../stores/types";

export const DATETIME_START_YEAR = 1970;
export const DATETIME_END_YEAR = 2070;

export const DATETIME_DEFAULT_HOUR = "09";
export const DATETIME_DEFAULT_MINUTE = "00";

export const DATETIME_YEARS: readonly number[] = Array.from(
  { length: DATETIME_END_YEAR - DATETIME_START_YEAR + 1 },
  (_, i) => DATETIME_START_YEAR + i,
);

export const DATETIME_MONTH_NUMBERS: readonly string[] = Array.from(
  { length: 12 },
  (_, i) => String(i + 1).padStart(2, "0"),
);

export const DATETIME_HOURS: readonly string[] = Array.from(
  { length: 24 },
  (_, i) => String(i).padStart(2, "0"),
);

export const DATETIME_MINUTES: readonly string[] = Array.from(
  { length: 60 },
  (_, i) => String(i).padStart(2, "0"),
);

export type DatePickerMode =
  | "year"
  | "month"
  | "year-month"
  | "date"
  | "datetime";

export type ResolvedDateTime = {
  year: number;
  month: number;
  day: number;
  hour: string;
  minute: string;
  hasValidValue: boolean;
};

/**
 * フォーマットからピッカーのモード（年、月、年月、日、日時）を導出
 */
export const toDatePickerMode = (format: DateTimeFormat): DatePickerMode => {
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

/**
 * 時刻パート（HH:mm / hh:mm）を含むフォーマットか判定
 */
export const isTimeFormat = (format: DateTimeFormat): boolean =>
  format === "yyyy-MM-dd HH:mm" || format === "yyyy-MM-dd hh:mm";

/**
 * ピッカー入力文字列をパース
 */
export const parsePickerDateTime = (
  val: string,
  format: DateTimeFormat,
): {
  year?: number;
  month?: number;
  day?: number;
  hour?: string;
  minute?: string;
} | null => {
  if (!val) return null;

  try {
    switch (format) {
      case "yyyy-MM-dd": {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(val)) return null;
        const d = Temporal.PlainDate.from(val);
        return { year: d.year, month: d.month, day: d.day };
      }
      case "yyyy-MM-dd HH:mm":
      case "yyyy-MM-dd hh:mm": {
        if (!/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(val)) return null;
        const dt = Temporal.PlainDateTime.from(val.replace(" ", "T"));
        return {
          year: dt.year,
          month: dt.month,
          day: dt.day,
          hour: String(dt.hour).padStart(2, "0"),
          minute: String(dt.minute).padStart(2, "0"),
        };
      }
      case "yyyy-MM": {
        if (!/^\d{4}-\d{2}$/.test(val)) return null;
        const ym = Temporal.PlainYearMonth.from(val);
        return { year: ym.year, month: ym.month, day: 1 };
      }
      case "yyyy": {
        if (!/^\d{4}$/.test(val)) return null;
        const today = Temporal.Now.plainDateISO();
        return { year: Number(val), month: today.month, day: today.day };
      }
      case "MM": {
        if (!/^(0[1-9]|1[0-2])$/.test(val)) return null;
        const today = Temporal.Now.plainDateISO();
        return {
          year: today.year,
          month: Number(val),
          day: today.day,
        };
      }
      default:
        return null;
    }
  } catch {
    return null;
  }
};

/**
 * 初期文字列をパースし、未入力・不正値の場合は現在日付へフォールバックした初期状態を返す
 */
export const resolveInitialDateTime = (
  val: string,
  format: DateTimeFormat,
): ResolvedDateTime => {
  const parsed = parsePickerDateTime(val, format);
  if (parsed?.year && parsed.month && parsed.day) {
    return {
      year: parsed.year,
      month: parsed.month,
      day: parsed.day,
      hour: parsed.hour ?? DATETIME_DEFAULT_HOUR,
      minute: parsed.minute ?? DATETIME_DEFAULT_MINUTE,
      hasValidValue: true,
    };
  }

  const today = Temporal.Now.plainDateISO();
  return {
    year: today.year,
    month: today.month,
    day: today.day,
    hour: DATETIME_DEFAULT_HOUR,
    minute: DATETIME_DEFAULT_MINUTE,
    hasValidValue: false,
  };
};

/**
 * Temporal.PlainDate を yyyy-MM-dd 形式へフォーマット
 */
export const formatPlainDate = (date: Temporal.PlainDate): string =>
  date.toString();

/**
 * Temporal.PlainDate と時・分を yyyy-MM-dd HH:mm 形式へフォーマット
 */
export const formatDateTime = (
  date: Temporal.PlainDate,
  hour: string,
  minute: string,
): string => `${date.toString()} ${hour}:${minute}`;

/**
 * 年と月（1〜12）を yyyy-MM 形式へフォーマット
 */
export const formatYearMonth = (year: number, month: number): string =>
  new Temporal.PlainYearMonth(year, month).toString();
