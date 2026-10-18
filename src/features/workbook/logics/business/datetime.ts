import { Temporal } from "temporal-polyfill-lite";
import type { DateTimeFormat } from "../../stores/types";

export type ParsedDateTime = {
  year: number;
  month: number;
  day: number;
  hour?: number;
  minute?: number;
};

/**
 * Temporal API を用いた日時文字列の厳密バリデーション・パース
 * 指定フォーマットに合致しない場合は null を返す
 */
export const parseDateTimeString = (
  val: string,
  format: DateTimeFormat,
): ParsedDateTime | null => {
  if (!val) return null;

  try {
    switch (format) {
      case "yyyy-MM-dd": {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(val)) return null;
        const d = Temporal.PlainDate.from(val);
        return {
          year: d.year,
          month: d.month,
          day: d.day,
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
          hour: dt.hour,
          minute: dt.minute,
        };
      }
      case "yyyy-MM": {
        if (!/^\d{4}-\d{2}$/.test(val)) return null;
        const ym = Temporal.PlainYearMonth.from(val);
        return {
          year: ym.year,
          month: ym.month,
          day: 1,
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
          month: 1,
          day: 1,
        };
      }
      case "MM": {
        if (!/^(0[1-9]|1[0-2])$/.test(val)) return null;
        return {
          year: 2000,
          month: Number(val),
          day: 1,
        };
      }
      default:
        return null;
    }
  } catch {
    return null;
  }
};
