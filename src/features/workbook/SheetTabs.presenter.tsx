import { Cross2Icon, HamburgerMenuIcon } from "@radix-ui/react-icons";
import { Button, TabNav, Tooltip } from "@radix-ui/themes";
import type { FC } from "react";
import styles from "./SheetTabs.module.css";

export type SheetTabsPresenterProps = {
  activeSheetId: string | null;
  sheets: { id: string; name: string }[];
  onSelectSheet: (id: string) => void;
  onCloseSheet?: (id: string) => void;
  onOpenMenu?: () => void;
};

export const SheetTabsPresenter: FC<SheetTabsPresenterProps> = ({
  activeSheetId,
  sheets,
  onSelectSheet,
  onCloseSheet,
  onOpenMenu,
}) => {
  return (
    <div className={styles.sheetTabsContainer}>
      {onOpenMenu && (
        <Tooltip content="すべてのシート / メニュー">
          <Button
            type="button"
            variant="ghost"
            size="2"
            color="gray"
            className={styles.menuButton}
            onClick={onOpenMenu}
            aria-label="すべてのシートメニューを開く"
          >
            <HamburgerMenuIcon width="16" height="16" />
          </Button>
        </Tooltip>
      )}
      <TabNav.Root size="2" className={styles.sheetTabs}>
        {sheets.map((sheet) => (
          <TabNav.Link
            key={sheet.id}
            active={activeSheetId === sheet.id}
            onClick={() => onSelectSheet(sheet.id)}
          >
            <span className={styles.tabItem}>
              <span className={styles.tabTitle}>{sheet.name}</span>
              {onCloseSheet && (
                <button
                  type="button"
                  className={styles.tabCloseButton}
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    onCloseSheet(sheet.id);
                  }}
                  aria-label={`${sheet.name} を閉じる`}
                >
                  <Cross2Icon width="12" height="12" />
                </button>
              )}
            </span>
          </TabNav.Link>
        ))}
      </TabNav.Root>
    </div>
  );
};
