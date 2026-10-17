import { enUS, ja } from "react-day-picker/locale";
import type { Locale } from "@/i18n/types";

export const localMessages = {
  ja: {
    selectYear: "年を選択",
    selectMonth: "月を選択",
    yearOption: "{year}年",
    timeLabel: "時刻:",
    month1: "1月",
    month2: "2月",
    month3: "3月",
    month4: "4月",
    month5: "5月",
    month6: "6月",
    month7: "7月",
    month8: "8月",
    month9: "9月",
    month10: "10月",
    month11: "11月",
    month12: "12月",
  },
  en: {
    selectYear: "Select Year",
    selectMonth: "Select Month",
    yearOption: "{year}",
    timeLabel: "Time:",
    month1: "Jan",
    month2: "Feb",
    month3: "Mar",
    month4: "Apr",
    month5: "May",
    month6: "Jun",
    month7: "Jul",
    month8: "Aug",
    month9: "Sep",
    month10: "Oct",
    month11: "Nov",
    month12: "Dec",
  },
} as const;

export const MONTH_KEYS = [
  "month1",
  "month2",
  "month3",
  "month4",
  "month5",
  "month6",
  "month7",
  "month8",
  "month9",
  "month10",
  "month11",
  "month12",
] as const;

export const dayPickerLocales = {
  ja,
  en: enUS,
} as const satisfies Record<Locale, typeof ja>;
