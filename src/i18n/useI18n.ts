import { useCallback } from "react";
import { commonMessages } from "./common";
import { useCurrentLocale } from "./context";
import type { Locale, Messages } from "./types";

type CommonKey = keyof (typeof commonMessages)[Locale];

type Params = Record<string, string | number>;

const replaceParams = (
  template: string,
  params: Params | undefined,
): string => {
  if (!params) {
    return template;
  }

  return Object.entries(params).reduce((acc, [k, v]) => {
    return acc.replace(new RegExp(`{${k}}`, "g"), String(v));
  }, template);
};

const isCommonKey = (key: string, locale: Locale): key is CommonKey => {
  return key in commonMessages[locale];
};

export function useI18n<L extends Messages | undefined = undefined>(
  localMessages?: L,
) {
  const { locale } = useCurrentLocale();

  const t = useCallback(
    (
      key: L extends undefined
        ? CommonKey
        : L extends Messages
          ? Extract<keyof L[Locale], string> | CommonKey
          : never,
      params?: Params,
    ): string => {
      if (localMessages !== undefined) {
        const localeMsgs: Readonly<Record<string, string>> =
          localMessages[locale];
        if (key in localeMsgs) {
          return replaceParams(localeMsgs[key], params);
        }
      }

      const commonMsgs: Readonly<Record<string, string>> =
        commonMessages[locale];
      if (isCommonKey(key, locale)) {
        return replaceParams(commonMsgs[key], params);
      }

      throw new Error(`${key} is an unexpected value`);
    },
    [locale, localMessages],
  );

  return { t, locale };
}
