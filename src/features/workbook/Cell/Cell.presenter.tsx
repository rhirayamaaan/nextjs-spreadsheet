import {
  CalendarIcon,
  CaretDownIcon,
  ExclamationTriangleIcon,
} from "@radix-ui/react-icons";
import { Tooltip } from "@radix-ui/themes";
import clsx from "clsx";
import type { FC, MouseEvent } from "react";
import { useI18n } from "@/i18n/useI18n";
import { localMessages } from "../i18n";
import type {
  CellStatus,
  DateTimeFormat,
  MoveDirection,
  PulldownMode,
  ValidationErrorInfo,
  ValidationErrorKey,
} from "../stores/types";
import styles from "./Cell.module.css";
import { CellInputEditorPresenter } from "./CellInputEditor.presenter";
import { DatePickerEditorPresenter } from "./DatePickerEditor.presenter";
import { PulldownEditorPresenter } from "./PulldownEditor.presenter";

type Option = {
  key: string;
  label: string;
};

export type CellPresenterProps = {
  value: string;
  editingInitialValue?: string;
  status?: CellStatus;
  statusMessage?: string;
  errorInfo?: ValidationErrorInfo;
  isEditing: boolean;
  isLookup?: boolean;
  isReadOnly?: boolean;
  isSubtotal?: boolean;
  isPulldown?: boolean;
  isDatetime?: boolean;
  datetimeFormat?: DateTimeFormat;
  pulldownMode?: PulldownMode;
  pulldownOptions?: Option[];
  onCommit?: (val: string, move?: MoveDirection) => void;
  onCancel?: () => void;
  onDoubleClick: () => void;
  onMouseDown: (event: MouseEvent<HTMLButtonElement>) => void;
  onMouseEnter?: (event: MouseEvent<HTMLButtonElement>) => void;
};

const validationMessageKeyMap = {
  required: "validationRequired",
  number: "validationNumber",
  string: "validationString",
  alphanumeric: "validationAlphanumeric",
  alpha: "validationAlpha",
  numeric: "validationNumeric",
  maxLength: "validationMaxLength",
  minLength: "validationMinLength",
  reference: "validationReference",
  referenceRelation: "validationReferenceRelation",
  datetime: "validationDatetime",
  invalid: "validationInvalid",
} as const satisfies Record<ValidationErrorKey, string>;

export const CellPresenter: FC<CellPresenterProps> = ({
  value,
  editingInitialValue,
  status = "none",
  statusMessage,
  errorInfo,
  isEditing,
  isLookup,
  isReadOnly,
  isSubtotal,
  isPulldown,
  isDatetime,
  datetimeFormat,
  pulldownMode,
  pulldownOptions,
  onCommit,
  onCancel,
  onDoubleClick,
  onMouseDown,
  onMouseEnter,
}) => {
  const { t } = useI18n(localMessages);
  const handleDoubleClick =
    isLookup || isReadOnly || isSubtotal ? undefined : onDoubleClick;

  const resolvedErrorMessage = errorInfo
    ? t(validationMessageKeyMap[errorInfo.key], errorInfo.params)
    : statusMessage;

  const isSubtotalLabel =
    isSubtotal &&
    (value === "（計）" ||
      value === "(Total)" ||
      value === "(Subtotal)" ||
      value === "subtotal");
  const displayValue = isSubtotalLabel ? t("subtotal") : value;

  const editorInitialValue = editingInitialValue ?? value;

  return (
    <button
      type="button"
      tabIndex={-1}
      onDoubleClick={handleDoubleClick}
      onMouseDown={onMouseDown}
      onMouseEnter={onMouseEnter}
      className={clsx(
        styles.cell,
        status === "edited" && styles["cell--edited"],
        status === "error" && styles["cell--error"],
        isLookup && styles["cell--lookup"],
        isSubtotal && styles["cell--subtotal"],
        isReadOnly && !isSubtotal && !isLookup && styles["cell--readonly"],
        isPulldown && !isReadOnly && !isSubtotal && styles["cell--pulldown"],
      )}
    >
      {isEditing &&
      isPulldown &&
      pulldownMode &&
      pulldownOptions &&
      onCommit ? (
        <PulldownEditorPresenter
          key={`${editorInitialValue}`}
          initialValue={editorInitialValue}
          mode={pulldownMode}
          options={pulldownOptions}
          onCommit={onCommit}
          onCancel={onCancel ?? (() => {})}
        />
      ) : isEditing && isDatetime && datetimeFormat && onCommit ? (
        <DatePickerEditorPresenter
          key={`${editorInitialValue}`}
          initialValue={editorInitialValue}
          format={datetimeFormat}
          onCommit={onCommit}
          onCancel={onCancel ?? (() => {})}
        />
      ) : isEditing && !isLookup && !isReadOnly && onCommit ? (
        <CellInputEditorPresenter
          key={`${editorInitialValue}`}
          initialValue={editorInitialValue}
          onCommit={onCommit}
          onCancel={onCancel ?? (() => {})}
        />
      ) : (
        <>
          <span
            className={clsx(
              styles.cell__content,
              isSubtotalLabel && styles["cell__content--center"],
            )}
          >
            {displayValue}
          </span>
          {status === "error" && resolvedErrorMessage && (
            <Tooltip content={resolvedErrorMessage}>
              <span className={styles.cell__errorIndicator}>
                <ExclamationTriangleIcon width={14} height={14} />
              </span>
            </Tooltip>
          )}
          {isPulldown && !isReadOnly && !isSubtotal && (
            <span className={styles.cell__pulldownIndicator}>
              <CaretDownIcon width={12} height={12} />
            </span>
          )}
          {isDatetime && !isReadOnly && !isSubtotal && (
            <span className={styles.cell__pulldownIndicator}>
              <CalendarIcon width={12} height={12} />
            </span>
          )}
        </>
      )}
    </button>
  );
};
