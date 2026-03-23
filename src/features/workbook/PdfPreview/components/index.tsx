import type { FC } from "react";

type Props = {
  pdfUrl: string;
  sheetName?: string;
  onBack: () => void;
  onDownload: () => void;
};

export const PdfPreviewPresenter: FC<Props> = ({
  pdfUrl,
  sheetName,
  onBack,
  onDownload,
}) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100vh",
        backgroundColor: "#525659",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 16px",
          backgroundColor: "#323639",
          color: "white",
          height: "48px",
          boxSizing: "border-box",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <button
            type="button"
            onClick={onBack}
            style={{
              padding: "6px 12px",
              backgroundColor: "#4b5563",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            ← Back to Editor
          </button>
          <div style={{ fontSize: "14px", fontWeight: 500 }}>
            Print Preview (PDF) {sheetName ? `- ${sheetName}` : ""}
          </div>
        </div>

        <button
          type="button"
          onClick={onDownload}
          style={{
            padding: "6px 16px",
            backgroundColor: "#3b82f6",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: 500,
          }}
        >
          Download PDF
        </button>
      </div>

      <div
        style={{
          flex: 1,
          width: "100%",
          height: "calc(100vh - 48px)",
          overflow: "hidden",
        }}
      >
        <iframe
          src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=1`}
          title="PDF Preview"
          style={{
            width: "100%",
            height: "100%",
            border: "none",
            display: "block",
          }}
        />
      </div>
    </div>
  );
};
