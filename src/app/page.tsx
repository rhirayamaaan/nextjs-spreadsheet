import { Suspense } from "react";
import { SpreadsheetContainerDynamic } from "@/features/spreadsheet/containers/dynamic";

export default function Home() {
  return (
    <Suspense fallback={<div>Loading Spreadsheet...</div>}>
      <SpreadsheetContainerDynamic />
    </Suspense>
  );
}
