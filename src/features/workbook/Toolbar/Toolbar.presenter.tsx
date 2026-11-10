import {
  CheckIcon,
  ChevronDownIcon,
  DownloadIcon,
  EyeOpenIcon,
  FileTextIcon,
  ReaderIcon,
} from "@radix-ui/react-icons";
import {
  Badge,
  Button,
  DropdownMenu,
  Flex,
  SegmentedControl,
  Select,
  Tooltip,
} from "@radix-ui/themes";
import { type FC, useCallback } from "react";
import { useCurrentLocale } from "@/i18n/context";
import { useI18n } from "@/i18n/useI18n";
import { isLocale } from "@/i18n/utils";
import type { SheetMode } from "../stores/types";
import { toolbarMessages } from "./i18n";
import styles from "./Toolbar.module.css";

export type ToolbarPresenterProps = {
  sheetName?: string;
  hasActiveSheet?: boolean;
  sheetMode?: SheetMode;
  onModeChange?: (mode: SheetMode) => void;
  onExport: () => void | Promise<void>;
  onPreviewPdf: () => void | Promise<void>;
  onPreviewReportPdf?: () => void | Promise<void>;
  onSave?: () => void | Promise<void>;
  onOpenMenu?: () => void;
  isExportingExcel?: boolean;
  isExportingPdf?: boolean;
  isExportingReportPdf?: boolean;
  isReportPdfDisabled?: boolean;
  reportPdfDisabledReason?: string;
  isSaving?: boolean;
};

export const ToolbarPresenter: FC<ToolbarPresenterProps> = ({
  hasActiveSheet,
  sheetMode = "edit",
  onModeChange,
  onExport,
  onPreviewPdf,
  onPreviewReportPdf,
  onSave,
  isExportingExcel,
  isExportingPdf,
  isExportingReportPdf,
  isReportPdfDisabled,
  reportPdfDisabledReason,
  isSaving,
}) => {
  const { t } = useI18n(toolbarMessages);
  const { locale, setLocale, isPending } = useCurrentLocale();

  const handleChangeLocale = useCallback(
    (value: string) => {
      if (!isLocale(value)) {
        return;
      }

      setLocale(value);
    },
    [setLocale],
  );

  const isExporting =
    isExportingExcel || isExportingPdf || isExportingReportPdf;

  const isSaveDisabled = !hasActiveSheet || isSaving || sheetMode === "inquiry";

  const saveDisabledReason = !hasActiveSheet
    ? t("saveDisabledNoSheet")
    : sheetMode === "inquiry"
      ? t("saveDisabledInquiryMode")
      : undefined;

  return (
    <div className={styles.toolbar}>
      <Flex align="center" gap="3">
        {/* 出力ドロップダウン (Secondary action: variant="surface") */}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger>
            <Button
              type="button"
              variant="surface"
              disabled={!hasActiveSheet}
              loading={isExporting}
              className={styles.exportDropdownTrigger}
            >
              <DownloadIcon />
              {t("export")}
              <ChevronDownIcon />
            </Button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content
            size="2"
            style={{ minWidth: 240, maxWidth: 320 }}
          >
            <DropdownMenu.Item onClick={onExport} disabled={isExportingExcel}>
              <DownloadIcon />
              {t("exportExcel")}
            </DropdownMenu.Item>
            <DropdownMenu.Item onClick={onPreviewPdf} disabled={isExportingPdf}>
              <FileTextIcon />
              {t("printPreview")}
            </DropdownMenu.Item>
            {onPreviewReportPdf && (
              <DropdownMenu.Item
                onClick={onPreviewReportPdf}
                disabled={isExportingReportPdf || isReportPdfDisabled}
                style={
                  isReportPdfDisabled && reportPdfDisabledReason
                    ? {
                        height: "auto",
                        minHeight: 36,
                        paddingTop: 8,
                        paddingBottom: 8,
                        alignItems: "flex-start",
                      }
                    : undefined
                }
                title={
                  isReportPdfDisabled ? reportPdfDisabledReason : undefined
                }
              >
                <div className={styles.reportMenuItemContent}>
                  <div className={styles.reportMenuItemTitle}>
                    <ReaderIcon />
                    {t("reportPreview")}
                  </div>
                  {isReportPdfDisabled && reportPdfDisabledReason && (
                    <span className={styles.reportMenuItemHint}>
                      {reportPdfDisabledReason}
                    </span>
                  )}
                </div>
              </DropdownMenu.Item>
            )}
          </DropdownMenu.Content>
        </DropdownMenu.Root>

        {/* 編集・照会モード切替（左寄せ配置） */}
        {onModeChange && (
          <Flex align="center" gap="2">
            <SegmentedControl.Root
              value={sheetMode}
              onValueChange={(val) => onModeChange(val as SheetMode)}
              size="2"
              disabled={!hasActiveSheet}
            >
              <SegmentedControl.Item value="edit" title={t("modeEditTooltip")}>
                {t("modeEdit")}
              </SegmentedControl.Item>
              <SegmentedControl.Item
                value="inquiry"
                title={t("modeInquiryTooltip")}
              >
                {t("modeInquiry")}
              </SegmentedControl.Item>
            </SegmentedControl.Root>
            {sheetMode === "inquiry" && hasActiveSheet && (
              <Badge
                color="gray"
                variant="soft"
                size="2"
                className={styles.readOnlyBadge}
              >
                <EyeOpenIcon />
                {t("readOnlyBadge")}
              </Badge>
            )}
          </Flex>
        )}
      </Flex>

      {/* 右側のアクショングループ（言語切替・保存ボタン） */}
      <div className={styles.actionGroup}>
        <Select.Root
          value={locale}
          disabled={isPending}
          onValueChange={handleChangeLocale}
        >
          <Select.Trigger />
          <Select.Content>
            <Select.Item value="ja">日本語</Select.Item>
            <Select.Item value="en">English</Select.Item>
          </Select.Content>
        </Select.Root>

        {/* 保存ボタン (Primary action: variant="solid") */}
        {onSave && (
          <Tooltip content={saveDisabledReason ?? t("saveTooltip")}>
            <span style={{ display: "inline-flex" }}>
              <Button
                type="button"
                onClick={onSave}
                disabled={isSaveDisabled}
                loading={isSaving}
                variant="solid"
              >
                <CheckIcon />
                {isSaving ? t("saving") : t("save")}
              </Button>
            </span>
          </Tooltip>
        )}
      </div>
    </div>
  );
};
