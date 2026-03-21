import type { ChangeEvent, FC, FocusEvent, KeyboardEvent } from "react";

type Props = {
  value: string;
  isEditing: boolean;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onDoubleClick: () => void;
  onBlur: (event: FocusEvent<HTMLInputElement>) => void;
  onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
  onMouseDown: () => void;
  onMouseEnter?: () => void;
};

export const Cell: FC<Props> = ({
  value,
  isEditing,
  onChange,
  onDoubleClick,
  onBlur,
  onKeyDown,
  onMouseDown,
  onMouseEnter,
}) => {
  return (
    <button
      type="button"
      onDoubleClick={onDoubleClick}
      onMouseDown={onMouseDown}
      onMouseEnter={onMouseEnter}
      style={{
        width: "100%",
        height: "100%",
        border: "none",
        appearance: "none",
        borderWidth: "0 1px 1px 0",
        borderStyle: "solid",
        borderColor: "#e0e0e0",
        backgroundColor: "#ffffff",
        display: "flex",
        alignItems: "center",
        padding: "0 8px",
        boxSizing: "border-box",
        fontSize: "0.875rem",
        overflow: "hidden",
        whiteSpace: "nowrap",
        cursor: "cell",
      }}
    >
      {isEditing ? (
        <input
          // biome-ignore lint/a11y/noAutofocus: 編集モード切替時に即座に入力可能にするため
          autoFocus
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          onKeyDown={onKeyDown}
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
      ) : (
        <span style={{ userSelect: "none" }}>{value}</span>
      )}
    </button>
  );
};
