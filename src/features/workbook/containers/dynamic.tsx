"use client";

import dynamic from "next/dynamic";

export const WorkbookContainerDynamic = dynamic(
  () => import("../Workbook/containers").then((mod) => mod.WorkbookContainer),
  {
    ssr: false,
  },
);
