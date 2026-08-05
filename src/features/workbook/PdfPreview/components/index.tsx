import type { FC } from "react";
import styles from "./index.module.css";

type Props = {
  pdfUrl: string | null;
  sheetName?: string;
  onBack: () => void;
  onDownload: () => void;
};

export const PdfPreview: FC<Props> = ({
  pdfUrl,
  sheetName,
  onBack,
  onDownload,
}) => {
  if (!pdfUrl) {
    return null;
  }

  return (
    <div className={styles.pdfPreview}>
      <div className={styles.pdfPreview__header}>
        <div className={styles.pdfPreview__headerLeft}>
          <button
            type="button"
            onClick={onBack}
            className={styles.pdfPreview__backButton}
          >
            ← Back to Editor
          </button>
          <div className={styles.pdfPreview__title}>
            Print Preview (PDF) {sheetName ? `- ${sheetName}` : ""}
          </div>
        </div>

        <button
          type="button"
          onClick={onDownload}
          className={styles.pdfPreview__downloadButton}
        >
          Download PDF
        </button>
      </div>

      <div className={styles.pdfPreview__content}>
        <iframe
          src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=1`}
          title="PDF Preview"
          className={styles.pdfPreview__iframe}
        />
      </div>
    </div>
  );
};
