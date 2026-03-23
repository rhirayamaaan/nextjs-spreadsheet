import type { FC, ReactNode } from "react";
import styles from "./index.module.css";

type WorkbookProps = {
  toolbar?: ReactNode;
  tabs: ReactNode;
  sheet: ReactNode;
};

export const Workbook: FC<WorkbookProps> = ({ toolbar, tabs, sheet }) => {
  return (
    <div className={styles.workbook}>
      {toolbar}
      {tabs}
      <div className={styles.workbook__content}>{sheet}</div>
    </div>
  );
};
