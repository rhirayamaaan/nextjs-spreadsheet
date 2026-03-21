import type { FC } from "react";

type SheetTabsProps = {
  activeSheetId: string | null;
  sheets: { id: string; name: string }[];
  onSelectSheet: (id: string) => void;
};

export const SheetTabs: FC<SheetTabsProps> = ({
  activeSheetId,
  sheets,
  onSelectSheet,
}) => {
  return (
    <div
      style={{
        display: "flex",
        backgroundColor: "#f0f0f0",
        borderBottom: "1px solid #ccc",
        padding: "0 10px",
        gap: "4px",
        height: "36px",
        alignItems: "flex-end",
        overflowX: "auto",
        scrollbarWidth: "none", // Firefox
        msOverflowStyle: "none", // IE/Edge
      }}
    >
      {sheets.map((sheet) => (
        <button
          key={sheet.id}
          type="button"
          onClick={() => onSelectSheet(sheet.id)}
          style={{
            padding: "6px 16px",
            border: "1px solid #ccc",
            borderBottom: "none",
            backgroundColor: activeSheetId === sheet.id ? "#fff" : "#e0e0e0",
            borderTopLeftRadius: "4px",
            borderTopRightRadius: "4px",
            cursor: "pointer",
            fontSize: "13px",
            fontWeight: activeSheetId === sheet.id ? "bold" : "normal",
            color: activeSheetId === sheet.id ? "#2196f3" : "#333",
            marginBottom: "-1px",
            zIndex: activeSheetId === sheet.id ? 1 : 0,
            transition: "background-color 0.2s",
            flexShrink: 0,
            whiteSpace: "nowrap",
          }}
        >
          {sheet.name}
        </button>
      ))}
    </div>
  );
};
