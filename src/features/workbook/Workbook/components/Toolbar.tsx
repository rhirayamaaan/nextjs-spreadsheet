import type { FC } from "react";
import styles from "./Toolbar.module.css";

type ToolbarProps = {
  sheetName?: string;
  onExport: () => void;
  onPreviewPdf: () => void;
  isExportingPdf?: boolean;
};

export const Toolbar: FC<ToolbarProps> = ({
  sheetName,
  onExport,
  onPreviewPdf,
  isExportingPdf,
}) => {
  const displayName = sheetName ? `"${sheetName}"` : "Sheet";

  return (
    <div className={styles.toolbar}>
      <button
        type="button"
        onClick={onExport}
        className={`${styles.toolbar__button} ${styles["toolbar__button--excel"]}`}
      >
        Export {displayName} to Excel
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
