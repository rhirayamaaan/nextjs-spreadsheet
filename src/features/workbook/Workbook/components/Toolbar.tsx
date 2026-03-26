import type { FC } from "react";
import styles from "./Toolbar.module.css";

type ToolbarProps = {
  sheetName?: string;
  onExport: () => void | Promise<void>;
  onPreviewPdf: () => void | Promise<void>;
  isExportingExcel?: boolean;
  isExportingPdf?: boolean;
};

export const Toolbar: FC<ToolbarProps> = ({
  sheetName,
  onExport,
  onPreviewPdf,
  isExportingExcel,
  isExportingPdf,
}) => {
  const displayName = sheetName ? `"${sheetName}"` : "Sheet";

  return (
    <div className={styles.toolbar}>
      <button
        type="button"
        onClick={onExport}
        disabled={isExportingExcel}
        className={`${styles.toolbar__button} ${styles["toolbar__button--excel"]} ${
          isExportingExcel ? styles["toolbar__button--disabled"] : ""
        }`}
      >
        {isExportingExcel
          ? `Exporting ${displayName} to Excel...`
          : `Export ${displayName} to Excel`}
      </button>
      <button
        type="button"
        onClick={onPreviewPdf}
        disabled={isExportingPdf}
        className={`${styles.toolbar__button} ${styles["toolbar__button--preview"]} ${
          isExportingPdf ? styles["toolbar__button--disabled"] : ""
        }`}
      >
        {isExportingPdf
          ? `Generating ${displayName} PDF...`
          : `Print Preview ${displayName} (PDF)`}
      </button>
    </div>
  );
};
