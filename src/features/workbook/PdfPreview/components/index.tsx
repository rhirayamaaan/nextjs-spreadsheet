import type { FC } from "react";
import { useI18n } from "@/i18n/useI18n";
import { localMessages } from "./i18n";
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
  const { t } = useI18n(localMessages);

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
            {t("backToEditor")}
          </button>
          <div className={styles.pdfPreview__title}>
            {t("printPreview")}
            {sheetName ? ` - ${sheetName}` : ""}
          </div>
        </div>

        <button
          type="button"
          onClick={onDownload}
          className={styles.pdfPreview__downloadButton}
        >
          {t("downloadPdf")}
        </button>
      </div>

      <div className={styles.pdfPreview__content}>
        <iframe
          src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=1`}
          title={t("pdfPreviewIframeTitle")}
          className={styles.pdfPreview__iframe}
        />
      </div>
    </div>
  );
};
