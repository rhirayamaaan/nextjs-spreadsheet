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

export type ParsedDateTime = {
  year: number;
  month: number;
  day: number;
  hour: string;
  minute: string;
};

export type ResolvedDateTime = ParsedDateTime & {
  hasValidValue: boolean;
};

/**
 * 時刻パート（HH:mm / hh:mm）を含むフォーマットか判定する
 */
export const isTimeFormat = (format: DateTimeFormat): boolean =>
  format === "yyyy-MM-dd HH:mm" || format === "yyyy-MM-dd hh:mm";

/**
 * Temporal API を用いた日時文字列の厳密パース（不正な場合は null を返す）
 */
export const parseDateTimeString = (
  val: string,
  format: DateTimeFormat,
): ParsedDateTime | null => {
  if (!val) return null;

  const today = Temporal.Now.plainDateISO();

  try {
    switch (format) {
      case "yyyy-MM-dd": {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(val)) return null;
        const d = Temporal.PlainDate.from(val);
        return {
          year: d.year,
          month: d.month,
          day: d.day,
          hour: DATETIME_DEFAULT_HOUR,
          minute: DATETIME_DEFAULT_MINUTE,
        };
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
        return {
          year: ym.year,
          month: ym.month,
          day: 1,
          hour: DATETIME_DEFAULT_HOUR,
          minute: DATETIME_DEFAULT_MINUTE,
        };
      }
      case "yyyy": {
        if (!/^\d{4}$/.test(val)) return null;
        const ym = Temporal.PlainYearMonth.from({
          year: Number(val),
          month: 1,
        });
        return {
          year: ym.year,
          month: today.month,
          day: today.day,
          hour: DATETIME_DEFAULT_HOUR,
          minute: DATETIME_DEFAULT_MINUTE,
        };
      }
      case "MM": {
        if (!/^(0[1-9]|1[0-2])$/.test(val)) return null;
        return {
          year: today.year,
          month: Number(val),
          day: today.day,
          hour: DATETIME_DEFAULT_HOUR,
          minute: DATETIME_DEFAULT_MINUTE,
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
  const parsed = parseDateTimeString(val, format);
  if (parsed) {
    return {
      ...parsed,
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
