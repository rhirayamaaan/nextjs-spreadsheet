import { Suspense } from "react";
import { Workbook } from "@/features/workbook";

export default function Home() {
  return (
    <Suspense fallback={<div>Loading Spreadsheet...</div>}>
      <Workbook />
    </Suspense>
  );
}
