import { useAtom, useSetAtom } from "jotai";
import { type ComponentProps, useCallback } from "react";
import {
  activeSheetIdAtom,
  pdfPreviewUrlAtom,
  viewModeAtom,
} from "../../stores";
import type { PdfPreview } from "../components"; // Type-only import

export const usePdfPreviewContainer = (): ComponentProps<typeof PdfPreview> => {
  const [pdfUrl, setPdfUrl] = useAtom(pdfPreviewUrlAtom);
  const [activeSheetId] = useAtom(activeSheetIdAtom);
  const setViewMode = useSetAtom(viewModeAtom);

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
    a.download = `${activeSheetId || "workbook"}.pdf`;
    a.click();
  }, [pdfUrl, activeSheetId]);

  return {
    pdfUrl,
    sheetName: activeSheetId ?? undefined,
    onBack: handleBack,
    onDownload: handleDownload,
  };
};
