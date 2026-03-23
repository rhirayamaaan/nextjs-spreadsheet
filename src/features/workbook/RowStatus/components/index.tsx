import type { FC } from "react";
import type { InsertPosition, RowStatus as RowStatusType } from "../../stores";
import styles from "./index.module.css";

const STATUS_LABEL = {
  added: "追加",
  edited: "変更",
  deleted: "削除",
  none: "",
} as const satisfies Record<RowStatusType, string>;

const RowStatusMarker: FC<{ status?: RowStatusType }> = ({
  status = "none",
}) => {
  if (status === "none") return <div className={styles.rowStatus__marker} />;

  return (
    <div
      title={STATUS_LABEL[status]}
      className={`${styles.rowStatus__marker} ${styles[`rowStatus__marker--${status}`]}`}
    />
  );
};

const RowActionMenu: FC<{
  popoverId: string;
  onInsertRow: (position: InsertPosition) => void;
  onDeleteRow: () => void;
}> = ({ popoverId, onInsertRow, onDeleteRow }) => {
  const handleToggle = (event: React.ToggleEvent<HTMLDivElement>) => {
    const nativeEvent = event.nativeEvent;
    if (
      !(nativeEvent instanceof ToggleEvent) ||
      nativeEvent.newState !== "open"
    ) {
      return;
    }

    const popover = event.currentTarget;
    const trigger = document.querySelector(`[popovertarget="${popoverId}"]`);

    if (!trigger || !popover) {
      return;
    }

    const rect = trigger.getBoundingClientRect();
    popover.style.position = "fixed";
    popover.style.top = `${rect.bottom}px`;
    popover.style.left = `${rect.left}px`;
    popover.style.margin = "0";
  };

  return (
    <div className={styles.rowStatus__actionMenu}>
      <button
        type="button"
        popoverTarget={popoverId}
        className={styles.rowStatus__actionMenuTrigger}
      >
        ⋮
      </button>
      <div
        id={popoverId}
        popover="auto"
        onToggle={handleToggle}
        className={styles.rowStatus__actionMenuPopover}
      >
        {[
          { label: "上に行を挿入", onClick: () => onInsertRow("above") },
          { label: "下に行を挿入", onClick: () => onInsertRow("below") },
          { label: "行を削除", onClick: () => onDeleteRow() },
        ].map((item) => (
          <button
            key={item.label}
            type="button"
            onClick={(event) => {
              item.onClick();
              if (!(event.target instanceof HTMLElement)) {
                return;
              }

              const element = event.target.closest("[popover]");
              if (!element) {
                return;
              }

              if (
                !(
                  "hidePopover" in element &&
                  typeof element.hidePopover === "function"
                )
              ) {
                return;
              }

              element.hidePopover();
            }}
            className={styles.rowStatus__actionMenuItem}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export const RowStatus: FC<{
  status: RowStatusType;
  popoverId: string;
  onInsertRow: (position: InsertPosition) => void;
  onDeleteRow: () => void;
}> = ({ status, popoverId, onInsertRow, onDeleteRow }) => {
  return (
    <div className={styles.rowStatus}>
      <RowStatusMarker status={status} />
      <RowActionMenu
        popoverId={popoverId}
        onInsertRow={onInsertRow}
        onDeleteRow={onDeleteRow}
      />
    </div>
  );
};
