import { createQueryFamily } from "@/lib/query";
import { fetchReportLayout } from "./reportLayout.api";
import type { ReportLayoutRaw } from "./reportLayout.types";

export const reportLayoutQuery = createQueryFamily<
  string,
  ReportLayoutRaw | null
>(fetchReportLayout, null);
