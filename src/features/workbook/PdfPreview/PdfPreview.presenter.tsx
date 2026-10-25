import { ArrowLeftIcon, DownloadIcon } from "@radix-ui/react-icons";
import { Button, Flex, RadioGroup, Text } from "@radix-ui/themes";
import type { FC } from "react";
import { useI18n } from "@/i18n/useI18n";
import { localMessages } from "./i18n";
import styles from "./PdfPreview.module.css";

export type ReportOutputMode = "all" | "summary" | "details";

export type PdfPreviewPresenterProps = {
  pdfUrl: string | null;
  sheetName?: string;
  hasReportLayout?: boolean;
  outputMode?: ReportOutputMode;
  isUpdating?: boolean;
  onBack: () => void;
  onDownload: () => void;
  onOutputModeChange?: (mode: ReportOutputMode) => void;
};

export const PdfPreviewPresenter: FC<PdfPreviewPresenterProps> = ({
  pdfUrl,
  sheetName,
  hasReportLayout = false,
  outputMode = "all",
  isUpdating = false,
  onBack,
  onDownload,
  onOutputModeChange,
}) => {
  const { t } = useI18n(localMessages);

  if (!pdfUrl) {
    return null;
  }

  return (
    <div className={styles.pdfPreview}>
      <div className={styles.pdfPreview__header}>
        <div className={styles.pdfPreview__headerLeft}>
          <Button type="button" onClick={onBack} variant="soft" color="gray">
            <ArrowLeftIcon />
            {t("backToEditor")}
          </Button>
          <div className={styles.pdfPreview__title}>
            {t("printPreview")}
            {sheetName ? ` - ${sheetName}` : ""}
          </div>
        </div>

        {hasReportLayout && (
          <div className={styles.pdfPreview__headerCenter}>
            <RadioGroup.Root
              value={outputMode}
              onValueChange={(val) =>
                onOutputModeChange?.(val as ReportOutputMode)
              }
              disabled={isUpdating}
            >
              <Flex gap="4" align="center">
                <Text as="label" size="2">
                  <Flex gap="2" align="center">
                    <RadioGroup.Item value="all" />
                    {t("outputModeAll")}
                  </Flex>
                </Text>
                <Text as="label" size="2">
                  <Flex gap="2" align="center">
                    <RadioGroup.Item value="summary" />
                    {t("outputModeSummary")}
                  </Flex>
                </Text>
                <Text as="label" size="2">
                  <Flex gap="2" align="center">
                    <RadioGroup.Item value="details" />
                    {t("outputModeDetails")}
                  </Flex>
                </Text>
              </Flex>
            </RadioGroup.Root>
          </div>
        )}

        <div className={styles.pdfPreview__headerRight}>
          <Button
            type="button"
            onClick={onDownload}
            disabled={isUpdating}
            loading={isUpdating}
            color="red"
            variant="solid"
          >
            <DownloadIcon />
            {t("downloadPdf")}
          </Button>
        </div>
      </div>

      <div className={styles.pdfPreview__content}>
        <iframe
          src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=1`}
          title={t("pdfPreviewIframeTitle")}
          className={styles.pdfPreview__iframe}
        />
        {isUpdating && (
          <div className={styles.pdfPreview__loadingOverlay}>
            {t("updatingPreview")}
          </div>
        )}
      </div>
    </div>
  );
};
