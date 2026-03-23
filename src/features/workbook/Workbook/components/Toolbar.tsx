import type { FC } from "react";

type ToolbarProps = {
  sheetName?: string;
  onExport: () => void;
  onPreviewPdf: () => void;
  isExportingPdf?: boolean;
};

export const Toolbar: FC<ToolbarProps> = ({
  sheetName,
  onExport,
  onPreviewPdf,
  isExportingPdf,
}) => {
  const buttonStyle: React.CSSProperties = {
    height: "32px",
    padding: "0 16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: 500,
    color: "white",
  };

  const displayName = sheetName ? `"${sheetName}"` : "Sheet";

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "8px 16px",
        backgroundColor: "#f3f4f6",
        borderBottom: "1px solid #e5e7eb",
        height: "48px",
        boxSizing: "border-box",
      }}
    >
      <button
        type="button"
        onClick={onExport}
        style={{
          ...buttonStyle,
          backgroundColor: "#10b981",
        }}
      >
        Export {displayName} to Excel
      </button>
      <button
        type="button"
        onClick={onPreviewPdf}
        disabled={isExportingPdf}
        style={{
          ...buttonStyle,
          backgroundColor: "#3b82f6",
          cursor: isExportingPdf ? "wait" : "pointer",
          opacity: isExportingPdf ? 0.7 : 1,
        }}
      >
        {isExportingPdf
          ? `Generating ${displayName} PDF...`
          : `Print Preview ${displayName} (PDF)`}
      </button>
    </div>
  );
};
