import {
  CalendarIcon,
  CaretDownIcon,
  ExclamationTriangleIcon,
} from "@radix-ui/react-icons";
import { Tooltip } from "@radix-ui/themes";
import clsx from "clsx";
import type { FC, MouseEvent } from "react";
import { useI18n } from "@/i18n/useI18n";
import type {
  CellStatus,
  DateTimeFormat,
  MoveDirection,
  PulldownMode,
  ValidationErrorInfo,
  ValidationErrorKey,
} from "../../stores";
import { CellInputEditor } from "./CellInputEditor";
import { DatePickerEditor } from "./DatePickerEditor";
import styles from "./index.module.css";
import { PulldownEditor } from "./PulldownEditor";

type Option = {
  key: string;
  label: string;
};

type Props = {
  value: string;
  editingInitialValue?: string;
  status?: CellStatus;
  statusMessage?: string;
  errorInfo?: ValidationErrorInfo;
  isEditing: boolean;
  isLookup?: boolean;
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

export const Cell: FC<Props> = ({
  value,
  editingInitialValue,
  status = "none",
  statusMessage,
  errorInfo,
  isEditing,
  isLookup,
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
  const { t } = useI18n();
  const handleDoubleClick = isLookup ? undefined : onDoubleClick;

  const resolvedErrorMessage = errorInfo
    ? t(validationMessageKeyMap[errorInfo.key], errorInfo.params)
    : statusMessage;

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
        isPulldown && styles["cell--pulldown"],
      )}
    >
      {isEditing &&
      isPulldown &&
      pulldownMode &&
      pulldownOptions &&
      onCommit ? (
        <PulldownEditor
          key={`${editorInitialValue}`}
          initialValue={editorInitialValue}
          mode={pulldownMode}
          options={pulldownOptions}
          onCommit={onCommit}
          onCancel={onCancel ?? (() => {})}
        />
      ) : isEditing && isDatetime && datetimeFormat && onCommit ? (
        <DatePickerEditor
          key={`${editorInitialValue}`}
          initialValue={editorInitialValue}
          format={datetimeFormat}
          onCommit={onCommit}
          onCancel={onCancel ?? (() => {})}
        />
      ) : isEditing && !isLookup && onCommit ? (
        <CellInputEditor
          key={`${editorInitialValue}`}
          initialValue={editorInitialValue}
          onCommit={onCommit}
          onCancel={onCancel ?? (() => {})}
        />
      ) : (
        <>
          <span className={styles.cell__content}>{value}</span>
          {status === "error" && resolvedErrorMessage && (
            <Tooltip content={resolvedErrorMessage}>
              <span className={styles.cell__errorIndicator}>
                <ExclamationTriangleIcon width={14} height={14} />
              </span>
            </Tooltip>
          )}
          {isPulldown && (
            <span className={styles.cell__pulldownIndicator}>
              <CaretDownIcon width={12} height={12} />
            </span>
          )}
          {isDatetime && (
            <span className={styles.cell__pulldownIndicator}>
              <CalendarIcon width={12} height={12} />
            </span>
          )}
        </>
      )}
    </button>
  );
};
