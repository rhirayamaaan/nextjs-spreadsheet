"use client";

import dynamic from "next/dynamic";

export const WorkbookContainerDynamic = dynamic(
  () => import("./index").then((mod) => mod.WorkbookContainer),
  {
    ssr: false,
  },
);
