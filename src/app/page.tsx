import { Suspense } from "react";
import { WorkbookContainerDynamic } from "@/features/workbook/containers/dynamic";

export default function Home() {
  return (
    <Suspense fallback={<div>Loading Spreadsheet...</div>}>
      <WorkbookContainerDynamic />
    </Suspense>
  );
}
