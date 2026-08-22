"use client";

import dynamic from "next/dynamic";

export const PreviewContainerDynamic = dynamic(
  () => import("./index").then((mod) => mod.PreviewContainer),
  {
    ssr: false,
  },
);
