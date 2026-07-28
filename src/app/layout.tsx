import clsx from "clsx";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "./Providers";
import "@radix-ui/themes/styles.css";
import "./globals.css";
import { Suspense } from "react";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body className={clsx(geistSans.variable, geistMono.variable)}>
        <Providers>
          <Suspense fallback={<div>Loading Pages...</div>}>{children}</Suspense>
        </Providers>
      </body>
    </html>
  );
}
