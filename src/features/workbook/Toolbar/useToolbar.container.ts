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
  const { exportCurrentSheet, isExporting: isExportingExcel } =
    useExportExcel();
  const { previewCurrentSheetPdf, isExporting: isExportingPdf } =
    useExportPdf();

  return {
    sheetName,
    hasActiveSheet,
    onExport: exportCurrentSheet,
    onPreviewPdf: previewCurrentSheetPdf,
    onSave,
    onOpenMenu,
    isExportingExcel,
    isExportingPdf,
    isSaving,
  };
};
