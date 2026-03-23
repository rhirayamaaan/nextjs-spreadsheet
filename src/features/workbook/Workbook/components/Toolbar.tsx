import type { FC } from "react";

type ToolbarProps = {
  sheetName?: string;
  onExport: () => void;
};

export const Toolbar: FC<ToolbarProps> = ({ sheetName, onExport }) => {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
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
          padding: "6px 12px",
          backgroundColor: "#10b981",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          fontSize: "14px",
          fontWeight: 500,
        }}
      >
        Export {sheetName ? `"${sheetName}"` : "Sheet"} to Excel
      </button>
    </div>
  );
};
