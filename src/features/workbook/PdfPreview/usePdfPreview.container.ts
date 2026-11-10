import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useCallback, useMemo, useState } from "react";
import { useCurrentLocale } from "@/i18n/context";
import { reportLayoutQuery } from "../services/reportLayout/reportLayout.query";
import { localizeReportLayout } from "../services/reportLayout/reportLayout.types";
import {
  activeSheetIdAtom,
  pdfPreviewTypeAtom,
  pdfPreviewUrlAtom,
  viewModeAtom,
  visibleRecordsAtom,
} from "../stores";
import type {
  PdfPreviewPresenterProps,
  ReportOutputMode,
} from "./PdfPreview.presenter";
import { generateReportPdf } from "./reportPdfGenerator";

export const usePdfPreview = (): PdfPreviewPresenterProps => {
  const [pdfUrl, setPdfUrl] = useAtom(pdfPreviewUrlAtom);
  const [pdfPreviewType] = useAtom(pdfPreviewTypeAtom);
  const [activeSheetId] = useAtom(activeSheetIdAtom);
  const setViewMode = useSetAtom(viewModeAtom);

  const [outputMode, setOutputMode] = useState<ReportOutputMode>("all");
  const [isUpdating, setIsUpdating] = useState(false);

  const { locale } = useCurrentLocale();
  const reportLayout = useAtomValue(
    reportLayoutQuery.sync(activeSheetId ?? ""),
  );
  const [records] = useAtom(visibleRecordsAtom);

  const localizedReportLayout = useMemo(() => {
    return reportLayout ? localizeReportLayout(reportLayout, locale) : null;
  }, [reportLayout, locale]);

  const isReportPreview =
    pdfPreviewType === "report" && Boolean(localizedReportLayout);

  const handleBack = useCallback(() => {
    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
      setPdfUrl(null);
    }
    setViewMode("editor");
  }, [pdfUrl, setPdfUrl, setViewMode]);

  const handleDownload = useCallback(() => {
    if (!pdfUrl) return;
    const a = document.createElement("a");
    a.href = pdfUrl;
    const prefix = isReportPreview ? "report_" : "sheet_";
    a.download = `${prefix}${activeSheetId || "workbook"}.pdf`;
    a.click();
  }, [pdfUrl, isReportPreview, activeSheetId]);

  const regeneratePdf = useCallback(
    async (mode: ReportOutputMode) => {
      if (!localizedReportLayout || !records || records.length === 0) return;
      setIsUpdating(true);
      try {
        const includeSummary = mode === "all" || mode === "summary";
        const includeDetails = mode === "all" || mode === "details";

        const { doc } = await generateReportPdf(
          localizedReportLayout,
          records,
          {
            includeSummary,
            includeDetails,
          },
        );
        const blob = doc.output("blob");
        const nextUrl = URL.createObjectURL(blob);
        if (pdfUrl) {
          URL.revokeObjectURL(pdfUrl);
        }
        setPdfUrl(nextUrl);
      } catch (error) {
        console.error("Failed to regenerate report PDF:", error);
      } finally {
        setIsUpdating(false);
      }
    },
    [localizedReportLayout, records, pdfUrl, setPdfUrl],
  );

  const handleOutputModeChange = useCallback(
    (mode: ReportOutputMode) => {
      setOutputMode(mode);
      void regeneratePdf(mode);
    },
    [regeneratePdf],
  );

  const displayName = isReportPreview
    ? (localizedReportLayout?.name ?? activeSheetId ?? undefined)
    : (activeSheetId ?? undefined);

  return {
    pdfUrl,
    sheetName: displayName,
    hasReportLayout: isReportPreview,
    outputMode,
    isUpdating,
    onBack: handleBack,
    onDownload: handleDownload,
    onOutputModeChange: handleOutputModeChange,
  };
};
