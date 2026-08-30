import { CaretDownIcon } from "@radix-ui/react-icons";
import clsx from "clsx";
import type {
  ChangeEvent,
  FC,
  FocusEvent,
  KeyboardEvent,
  MouseEvent,
} from "react";
import type { PulldownMode } from "../../stores";
import styles from "./index.module.css";
import { PulldownEditor } from "./PulldownEditor";

type Option = {
  key: string;
  label: string;
};

type Props = {
  value: string;
  isEditing: boolean;
  isLookup?: boolean;
  isPulldown?: boolean;
  pulldownMode?: PulldownMode;
  pulldownOptions?: Option[];
  onSelectPulldown?: (val: string) => void;
  onClosePulldown?: () => void;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onDoubleClick: () => void;
  onBlur: (event: FocusEvent<HTMLInputElement>) => void;
  onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
  onMouseDown: (event: MouseEvent<HTMLButtonElement>) => void;
  onMouseEnter?: (event: MouseEvent<HTMLButtonElement>) => void;
};

export const Cell: FC<Props> = ({
  value,
  isEditing,
  isLookup,
  isPulldown,
  pulldownMode,
  pulldownOptions,
  onSelectPulldown,
  onClosePulldown,
  onChange,
  onDoubleClick,
  onBlur,
  onKeyDown,
  onMouseDown,
  onMouseEnter,
}) => {
  const handleDoubleClick = isLookup ? undefined : onDoubleClick;

  return (
    <button
      type="button"
      onDoubleClick={handleDoubleClick}
      onMouseDown={onMouseDown}
      onMouseEnter={onMouseEnter}
      className={clsx(
        styles.cell,
        isLookup && styles["cell--lookup"],
        isPulldown && styles["cell--pulldown"],
      )}
    >
      {isEditing &&
      isPulldown &&
      pulldownMode &&
      pulldownOptions &&
      onSelectPulldown ? (
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
          }}
        >
          <span className={styles.cell__content}>{value}</span>
          <PulldownEditor
            value={value}
            mode={pulldownMode}
            options={pulldownOptions}
            onSelect={onSelectPulldown}
            onClose={onClosePulldown ?? (() => {})}
          />
        </div>
      ) : isEditing && !isLookup ? (
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
        <>
          <span className={styles.cell__content}>{value}</span>
          {isPulldown && (
            <span className={styles.cell__pulldownIndicator}>
              <CaretDownIcon width={12} height={12} />
            </span>
          )}
        </>
      )}
    </button>
  );
};
