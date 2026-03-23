"use client";

import { useAtom, useSetAtom } from "jotai";
import { type FC, useCallback } from "react";
import {
  activeSheetIdAtom,
  pdfPreviewUrlAtom,
  viewModeAtom,
} from "../../stores";
import { PdfPreview } from "../components";

export const PdfPreviewContainer: FC = () => {
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

  if (!pdfUrl) {
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "#666" }}>
        <p>Generating PDF preview...</p>
        <button
          type="button"
          onClick={handleBack}
          style={{ marginTop: "10px", padding: "8px 16px", cursor: "pointer" }}
        >
          Back to Editor
        </button>
      </div>
    );
  }

  return (
    <PdfPreview
      pdfUrl={pdfUrl}
      sheetName={activeSheetId ?? undefined}
      onBack={handleBack}
      onDownload={handleDownload}
    />
  );
};
