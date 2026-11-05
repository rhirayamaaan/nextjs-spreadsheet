import type { locales } from "./common";

type LocaleMessages = Readonly<Record<string, string>>;

export type Messages = Readonly<
  Record<(typeof locales)[number], LocaleMessages>
>;

export type Locale = keyof Messages;

export type I18nString = string | Record<Locale, string>;

export const resolveI18nString = (
  value: I18nString | undefined,
  locale: Locale,
  fallback = "",
): string => {
  if (!value) return fallback;
  if (typeof value === "string") return value;
  return value[locale] ?? value.ja ?? fallback;
};
