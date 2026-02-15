import type { ChangeEvent, FC } from "react";

type Props = {
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
};

export const Cell: FC<Props> = ({ value, onChange }) => {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        borderRight: "1px solid #e0e0e0",
        borderBottom: "1px solid #e0e0e0",
        backgroundColor: "#ffffff",
        display: "flex",
        alignItems: "center",
        padding: "0 8px",
        boxSizing: "border-box",
        fontSize: "0.875rem",
        overflow: "hidden",
        whiteSpace: "nowrap",
      }}
    >
      <input
        value={value}
        onChange={onChange}
        style={{
          width: "100%",
          height: "100%",
          border: "none",
          outline: "none",
          background: "transparent",
          fontFamily: "inherit",
          fontSize: "inherit",
        }}
      />
    </div>
  );
};
