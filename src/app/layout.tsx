import clsx from "clsx";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "./Providers";
import "@radix-ui/themes/styles.css";
import "./globals.css";
import { cookies } from "next/headers";
import { Suspense } from "react";
import { LocaleProvider } from "@/i18n/context";
import { isLocale } from "@/i18n/utils";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Next.js Spreadsheet",
  description:
    "A simple and powerful spreadsheet application built with Next.js",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get("locale")?.value;
  const locale = isLocale(cookieLocale) ? cookieLocale : "ja";

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={clsx(geistSans.variable, geistMono.variable)}>
        <LocaleProvider initialLocale={locale}>
          <Providers>
            <Suspense fallback={<div>Loading Pages...</div>}>
              {children}
            </Suspense>
          </Providers>
        </LocaleProvider>
      </body>
    </html>
  );
}
