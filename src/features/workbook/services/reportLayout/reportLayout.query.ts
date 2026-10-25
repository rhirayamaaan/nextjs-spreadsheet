import { createQueryFamily } from "@/lib/query";
import { fetchReportLayout } from "./reportLayout.api";
import type { ReportLayout } from "./reportLayout.types";

export const reportLayoutQuery = createQueryFamily<string, ReportLayout | null>(
  fetchReportLayout,
  null,
);
