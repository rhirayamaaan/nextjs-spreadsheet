"use client";

import { useRouter } from "next/navigation";
import type React from "react";
import { createContext, useContext, useState, useTransition } from "react";
import type { Locale } from "./types";

type LocaleContextType = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  isPending: boolean;
};

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

export function LocaleProvider({
  children,
  initialLocale,
}: {
  children: React.ReactNode;
  initialLocale: Locale;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const setLocale = (newLocale: Locale) => {
    // 1. Cookie に保存 (有効期限1年)
    document.cookie = `locale=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;

    // 2. 状態の更新とサーバーコンポーネントの再レンダリング
    startTransition(() => {
      setLocaleState(newLocale);
      router.refresh();
    });
  };

  return (
    <LocaleContext.Provider value={{ locale, setLocale, isPending }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useCurrentLocale() {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error("useCurrentLocale must be used within a LocaleProvider");
  }
  return context;
}
