import type { locales } from "./common";

type LocaleMessages = Readonly<Record<string, string>>;

export type Messages = Readonly<
  Record<(typeof locales)[number], LocaleMessages>
>;

export type Locale = keyof Messages;
