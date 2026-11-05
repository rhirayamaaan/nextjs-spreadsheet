import { DotsVerticalIcon, MixerHorizontalIcon } from "@radix-ui/react-icons";
import { Badge, DropdownMenu, IconButton } from "@radix-ui/themes";
import clsx from "clsx";
import type { FC } from "react";
import { useI18n } from "@/i18n/useI18n";
import type { ColumnConfig, ColumnId } from "../stores/types";
import { sheetMessages } from "./i18n";
import styles from "./Sheet.module.css";
import type { AxisLayout } from "./Sheet.presenter";

const MIN_COLUMN_WIDTH = 30;

export type ColumnHeaderPresenterProps = {
  col: AxisLayout;
  colId: ColumnId | null;
  config?: ColumnConfig;
  isFiltered: boolean;
  hasTotal: boolean;
  setNodeRef: (node: HTMLElement | null) => void;
  dndStyle: {
    transform?: string;
    transition?: string;
  };
  attributes?: React.HTMLAttributes<HTMLDivElement>;
  listeners?: React.DOMAttributes<HTMLDivElement>;
  isDragging: boolean;
  isResizing: boolean;
  onMouseDownResizer: (event: React.MouseEvent) => void;
  onOpenSettingModal?: (colId: ColumnId) => void;
  onRemoveBinding?: (colId: ColumnId) => void;
  onOpenFilterModal?: (colId: ColumnId) => void;
  onClearFilter?: (colId: ColumnId) => void;
  onToggleTotal?: (colId: ColumnId) => void;
};

export const ColumnHeaderPresenter: FC<ColumnHeaderPresenterProps> = ({
  col,
  colId,
  config,
  isFiltered,
  hasTotal,
  setNodeRef,
  dndStyle,
  attributes,
  listeners,
  isDragging,
  isResizing,
  onMouseDownResizer,
  onOpenSettingModal,
  onRemoveBinding,
  onOpenFilterModal,
  onClearFilter,
  onToggleTotal,
}) => {
  const { t } = useI18n(sheetMessages);
  const isLookup = config?.type === "lookup";

  return (
    <div
      className={styles.sheet__headerCellWrapper}
      style={{
        width: `${col.size}px`,
        transform: `translateX(${col.start}px)`,
      }}
    >
      <div
        ref={setNodeRef}
        style={dndStyle}
        className={clsx(
          styles.sheet__headerCell,
          isDragging && styles["sheet__headerCell--dragging"],
          isLookup && styles["sheet__headerCell--lookup"],
        )}
        {...attributes}
        {...(isLookup ? {} : listeners)}
      >
        <span className={styles.sheet__headerCellTitle}>
          {col.label ?? col.index + 1}
        </span>

        {isLookup && (
          <Badge
            size="1"
            color="blue"
            variant="soft"
            style={{ fontSize: "0.6rem", padding: "0 3px", marginRight: 2 }}
          >
            {t("lookupBadge")}
          </Badge>
        )}

        {hasTotal && (
          <Badge
            size="1"
            color="green"
            variant="soft"
            style={{ fontSize: "0.6rem", padding: "0 3px", marginRight: 2 }}
          >
            {t("totalBadge")}
          </Badge>
        )}

        {isFiltered && (
          <IconButton
            size="1"
            variant="soft"
            color="blue"
            aria-label={t("filterSettingsAria")}
            onClick={(e) => {
              e.stopPropagation();
              if (colId) onOpenFilterModal?.(colId);
            }}
            onPointerDown={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            style={{ marginRight: 2, cursor: "pointer" }}
          >
            <MixerHorizontalIcon width={12} height={12} />
          </IconButton>
        )}

        <div className={styles.sheet__headerCellMenuTrigger}>
          <DropdownMenu.Root>
            <DropdownMenu.Trigger>
              <IconButton
                size="1"
                variant="ghost"
                color={isFiltered || hasTotal ? "blue" : "gray"}
                aria-label={t("columnMenuAria")}
                onPointerDown={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
              >
                <DotsVerticalIcon width={12} height={12} />
              </IconButton>
            </DropdownMenu.Trigger>

            <DropdownMenu.Content size="1">
              <DropdownMenu.Item
                onSelect={() => colId && onToggleTotal?.(colId)}
              >
                {hasTotal ? t("hideTotalRow") : t("showTotalRow")}
              </DropdownMenu.Item>
              <DropdownMenu.Separator />

              {!isLookup && (
                <>
                  <DropdownMenu.Item
                    onSelect={() => colId && onOpenFilterModal?.(colId)}
                  >
                    <MixerHorizontalIcon
                      width={12}
                      height={12}
                      style={{ marginRight: 6 }}
                    />
                    {t("setFilter")}
                  </DropdownMenu.Item>
                  {isFiltered && (
                    <DropdownMenu.Item
                      color="red"
                      onSelect={() => colId && onClearFilter?.(colId)}
                    >
                      {t("clearFilter")}
                    </DropdownMenu.Item>
                  )}
                  <DropdownMenu.Separator />
                </>
              )}

              {config?.type === "pulldown" ? (
                <>
                  <DropdownMenu.Item
                    onSelect={() => colId && onOpenSettingModal?.(colId)}
                  >
                    {t("editPulldown")}
                  </DropdownMenu.Item>
                  <DropdownMenu.Separator />
                  <DropdownMenu.Item
                    color="red"
                    onSelect={() => colId && onRemoveBinding?.(colId)}
                  >
                    {t("removePulldown")}
                  </DropdownMenu.Item>
                </>
              ) : config?.type === "lookup" ? (
                <DropdownMenu.Item
                  onSelect={() =>
                    onOpenSettingModal?.(config.lookup.parentColId)
                  }
                >
                  {t("editParentColumn")}
                </DropdownMenu.Item>
              ) : (
                <DropdownMenu.Item
                  onSelect={() => colId && onOpenSettingModal?.(colId)}
                >
                  {t("addPulldown")}
                </DropdownMenu.Item>
              )}
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        </div>

        <hr
          onMouseDown={onMouseDownResizer}
          onPointerDown={(e) => e.stopPropagation()}
          aria-orientation="vertical"
          aria-valuemin={MIN_COLUMN_WIDTH}
          aria-valuenow={col.size}
          tabIndex={-1}
          className={clsx(
            styles.sheet__headerResizer,
            isResizing && styles["sheet__headerResizer--active"],
          )}
        />
      </div>
    </div>
  );
};
