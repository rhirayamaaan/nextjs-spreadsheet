"use client";

import dynamic from "next/dynamic";

/**
 * 仮想スクロール等のブラウザ API への依存を解決するために、Server Component（page.tsx）から利用される。
 */
export const SpreadsheetContainerDynamic = dynamic(
  () => import("./index").then((mod) => mod.SpreadsheetContainer),
  { ssr: false },
);
