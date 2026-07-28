"use client";

import { Theme } from "@radix-ui/themes";
import { ThemeProvider as NextThemeProvider } from "next-themes";
import type { FC, ReactNode } from "react";
import styles from "./Providers.module.css";

type Props = {
  children: ReactNode;
};

export const Providers: FC<Props> = ({ children }) => {
  return (
    <NextThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <Theme
        accentColor="brown"
        grayColor="gray"
        radius="large"
        className={styles.theme}
      >
        {children}
      </Theme>
    </NextThemeProvider>
  );
};
