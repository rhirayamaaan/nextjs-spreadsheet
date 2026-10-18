import type { ChangeEvent, FC, FocusEvent, KeyboardEvent } from "react";
import { useRef, useState } from "react";
import type { MoveDirection } from "../stores/types";
import styles from "./Cell.module.css";

export type CellInputEditorPresenterProps = {
  initialValue: string;
  onCommit: (value: string, move?: MoveDirection) => void;
  onCancel: () => void;
};

export const CellInputEditorPresenter: FC<CellInputEditorPresenterProps> = ({
  initialValue,
  onCommit,
  onCancel,
}) => {
  // コンポーネントのマウント時に initialValue でローカル state を初期化 (key によるリセット設計)
  const [value, setValue] = useState(initialValue);
  const isFinishedRef = useRef(false);

  const commitValue = (val: string, move?: MoveDirection) => {
    if (isFinishedRef.current) return;
    isFinishedRef.current = true;
    onCommit(val, move);
  };

  const cancelEdit = () => {
    if (isFinishedRef.current) return;
    isFinishedRef.current = true;
    onCancel();
  };

  const handleFocus = (event: FocusEvent<HTMLInputElement>) => {
    const len = event.currentTarget.value.length;
    event.currentTarget.setSelectionRange(len, len);
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value);
  };

  const handleBlur = () => {
    commitValue(value);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.nativeEvent.isComposing) return;

    if (event.key === "Enter") {
      event.preventDefault();
      commitValue(value, { deltaRow: event.shiftKey ? -1 : 1, deltaCol: 0 });
    } else if (event.key === "Tab") {
      event.preventDefault();
      commitValue(value, { deltaRow: 0, deltaCol: event.shiftKey ? -1 : 1 });
    } else if (event.key === "Escape") {
      event.preventDefault();
      cancelEdit();
    }
  };

  return (
    <input
      type="text"
      // biome-ignore lint/a11y/noAutofocus: 編集モード切替時に即座に入力可能にするため
      autoFocus
      value={value}
      onFocus={handleFocus}
      onChange={handleChange}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      className={styles.cell__input}
    />
  );
};
