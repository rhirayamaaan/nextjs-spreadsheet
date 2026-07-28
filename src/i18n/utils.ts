import { locales } from "./common";
import type { Locale } from "./types";

export const isLocale = (locale: string | undefined): locale is Locale =>
  locales.some((value) => value === locale);
