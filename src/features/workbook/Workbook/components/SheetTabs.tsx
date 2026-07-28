import { TabNav } from "@radix-ui/themes";
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
    <TabNav.Root size="2" className={styles.sheetTabs}>
      {sheets.map((sheet) => (
        <TabNav.Link
          key={sheet.id}
          active={activeSheetId === sheet.id}
          onClick={() => onSelectSheet(sheet.id)}
        >
          {sheet.name}
        </TabNav.Link>
      ))}
    </TabNav.Root>
  );
};
