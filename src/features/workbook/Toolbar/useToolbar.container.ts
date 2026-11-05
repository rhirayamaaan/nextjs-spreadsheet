import { useAtom } from "jotai";
import { useI18n } from "@/i18n/useI18n";
import { activeSheetModeAtom } from "../stores";
import { toolbarMessages } from "./i18n";
import type { ToolbarPresenterProps } from "./Toolbar.presenter";
import { useExportExcel } from "./useExportExcel.container";
import { useExportPdf } from "./useExportPdf.container";

export type UseToolbarParams = {
  sheetName?: string;
  hasActiveSheet?: boolean;
  onOpenMenu?: () => void;
  onSave?: () => void | Promise<void>;
  isSaving?: boolean;
};

export const useToolbar = ({
  sheetName,
  hasActiveSheet,
  onOpenMenu,
  onSave,
  isSaving,
}: UseToolbarParams): ToolbarPresenterProps => {
  const { t } = useI18n(toolbarMessages);
  const [sheetMode, setSheetMode] = useAtom(activeSheetModeAtom);
  const { exportCurrentSheet, isExporting: isExportingExcel } =
    useExportExcel();
  const {
    previewCurrentSheetPdf,
    previewCurrentSheetReportPdf,
    isExportingPdf,
    isExportingReportPdf,
    hasReportLayout,
    isPreconditionSatisfied,
    unfulfilledFilterLabels,
    isReportPdfDisabled,
  } = useExportPdf();

  const reportPdfDisabledReason = !hasReportLayout
    ? undefined
    : !isPreconditionSatisfied
      ? unfulfilledFilterLabels && unfulfilledFilterLabels.length > 0
        ? t("reportPdfRequiresSpecificFilter", {
            fields: unfulfilledFilterLabels.join("・"),
          })
        : t("reportPdfRequiresFilter")
      : undefined;

  return {
    sheetName,
    hasActiveSheet,
    sheetMode,
    onModeChange: setSheetMode,
    onExport: exportCurrentSheet,
    onPreviewPdf: previewCurrentSheetPdf,
    onPreviewReportPdf: previewCurrentSheetReportPdf,
    onSave,
    onOpenMenu,
    isExportingExcel,
    isExportingPdf,
    isExportingReportPdf,
    isReportPdfDisabled,
    reportPdfDisabledReason,
    isSaving,
  };
};
