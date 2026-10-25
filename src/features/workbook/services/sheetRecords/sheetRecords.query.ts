import { createQueryFamily } from "@/lib/query";
import { fetchSheetRecords } from "./sheetRecords.api";

export const sheetRecordsQuery = createQueryFamily<
  string,
  Record<string, string>[]
>(fetchSheetRecords, []);
