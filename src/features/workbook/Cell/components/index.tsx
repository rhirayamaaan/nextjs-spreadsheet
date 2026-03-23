import type { ChangeEvent, FC, FocusEvent, KeyboardEvent } from "react";
import styles from "./index.module.css";

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
      className={styles.cell}
    >
      {isEditing ? (
        <input
          type="text"
          // biome-ignore lint/a11y/noAutofocus: 編集モード切替時に即座に入力可能にするため
          autoFocus
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          onKeyDown={onKeyDown}
          className={styles.cell__input}
        />
      ) : (
        <span className={styles.cell__content}>{value}</span>
      )}
    </button>
  );
};
