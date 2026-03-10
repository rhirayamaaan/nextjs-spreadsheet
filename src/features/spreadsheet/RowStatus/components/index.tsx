import type { FC } from "react";
import type { InsertPosition, RowStatus } from "../../stores";

const STATUS_LABEL = {
  added: "追加",
  edited: "変更",
  deleted: "削除",
  none: "",
} as const satisfies Record<RowStatus, string>;

const STATUS_COLOR = {
  added: "#4caf50", // Green
  edited: "#2196f3", // Blue
  deleted: "#f44336", // Red
  none: "transparent",
} as const satisfies Record<RowStatus, string>;

const RowStatusMarker: FC<{ status?: RowStatus }> = ({ status = "none" }) => {
  if (status === "none") return <div style={{ width: 10, height: 10 }} />;

  return (
    <div
      title={STATUS_LABEL[status]}
      style={{
        width: 10,
        height: 10,
        borderRadius: "50%",
        backgroundColor: STATUS_COLOR[status],
      }}
    />
  );
};

const RowActionMenu: FC<{
  popoverId: string;
  onInsertRow: (position: InsertPosition) => void;
  onDeleteRow: () => void;
}> = ({ popoverId, onInsertRow, onDeleteRow }) => {
  const handleToggle = (event: React.ToggleEvent<HTMLDivElement>) => {
    if ((event.nativeEvent as any).newState === "open") {
      const popover = event.currentTarget;
      const trigger = document.querySelector(`[popovertarget="${popoverId}"]`);

      if (trigger && popover) {
        const rect = trigger.getBoundingClientRect();
        popover.style.position = "fixed";
        popover.style.top = `${rect.bottom}px`;
        popover.style.left = `${rect.left}px`;
        popover.style.margin = "0";
      }
    }
  };

  return (
    <div style={{ position: "relative" }}>
      <button
        type="button"
        popoverTarget={popoverId}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: "4px",
          fontSize: "1rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#666",
        }}
      >
        ⋮
      </button>
      <div
        id={popoverId}
        popover="auto"
        onToggle={handleToggle}
        style={{
          margin: 0,
          padding: "4px 0",
          backgroundColor: "white",
          border: "1px solid #e0e0e0",
          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
          minWidth: "120px",
          borderRadius: "4px",
          inset: "auto",
        }}
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
            style={{
              background: "none",
              border: "none",
              padding: "8px 12px",
              textAlign: "left",
              cursor: "pointer",
              fontSize: "0.75rem",
              width: "100%",
              display: "block",
            }}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export const RowStatusPresenter: FC<{
  status: RowStatus;
  popoverId: string;
  onInsertRow: (position: InsertPosition) => void;
  onDeleteRow: () => void;
}> = ({ status, popoverId, onInsertRow, onDeleteRow }) => {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-around",
      }}
    >
      <RowStatusMarker status={status} />
      <RowActionMenu
        popoverId={popoverId}
        onInsertRow={onInsertRow}
        onDeleteRow={onDeleteRow}
      />
    </div>
  );
};
