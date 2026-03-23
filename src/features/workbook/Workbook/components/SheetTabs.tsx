import type { FC } from "react";
import styles from "./SheetTabs.module.css";

type SheetTabsProps = {
  activeSheetId: string | null;
  sheets: { id: string; name: string }[];
  onSelectSheet: (id: string) => void;
};

export const SheetTabs: FC<SheetTabsProps> = ({
  activeSheetId,
  sheets,
  onSelectSheet,
}) => {
  return (
    <div className={styles.sheetTabs}>
      {sheets.map((sheet) => (
        <button
          key={sheet.id}
          type="button"
          onClick={() => onSelectSheet(sheet.id)}
          className={`${styles.sheetTabs__tab} ${
            activeSheetId === sheet.id ? styles["sheetTabs__tab--active"] : ""
          }`}
        >
          {sheet.name}
        </button>
      ))}
    </div>
  );
};
