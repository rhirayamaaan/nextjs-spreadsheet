import {
  CheckIcon,
  DownloadIcon,
  FileTextIcon,
  HamburgerMenuIcon,
} from "@radix-ui/react-icons";
import { Button, Flex, Select, TextField } from "@radix-ui/themes";
import { type FC, useCallback } from "react";
import { useCurrentLocale } from "@/i18n/context";
import { useI18n } from "@/i18n/useI18n";
import { isLocale } from "@/i18n/utils";
import { toolbarMessages } from "./i18n";
import styles from "./Toolbar.module.css";

export type ToolbarPresenterProps = {
  sheetName?: string;
  hasActiveSheet?: boolean;
  onExport: () => void | Promise<void>;
  onPreviewPdf: () => void | Promise<void>;
  onSave?: () => void | Promise<void>;
  onOpenMenu?: () => void;
  isExportingExcel?: boolean;
  isExportingPdf?: boolean;
  isSaving?: boolean;
};

export const ToolbarPresenter: FC<ToolbarPresenterProps> = ({
  sheetName,
  hasActiveSheet,
  onExport,
  onPreviewPdf,
  onSave,
  onOpenMenu,
  isExportingExcel,
  isExportingPdf,
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

  const displayName = sheetName || t("defaultSheetName");

  return (
    <Flex align="center" gap="2" px="4" py="2" className={styles.toolbar}>
      {onOpenMenu && (
        <Button
          type="button"
          onClick={onOpenMenu}
          variant="soft"
          color="gray"
          aria-label={t("sheetMenu")}
        >
          <HamburgerMenuIcon />
          {t("sheetMenu")}
        </Button>
      )}
      <Button
        type="button"
        onClick={onExport}
        disabled={isExportingExcel}
        loading={isExportingExcel}
        color="green"
        variant="solid"
      >
        <DownloadIcon />
        {isExportingExcel
          ? t("exportingExcel", { sheetName: displayName })
          : t("exportToExcel", { sheetName: displayName })}
      </Button>
      <Button
        type="button"
        onClick={onPreviewPdf}
        disabled={isExportingPdf}
        loading={isExportingPdf}
        color="red"
        variant="solid"
      >
        <FileTextIcon />
        {isExportingPdf
          ? t("generatingPdf", { sheetName: displayName })
          : t("printPreview", { sheetName: displayName })}
      </Button>
      <TextField.Root placeholder={t("search")}></TextField.Root>
      <Flex align="center" gap="2" style={{ marginLeft: "auto" }}>
        <Select.Root
          value={locale}
          disabled={isPending}
          onValueChange={handleChangeLocale}
        >
          <Select.Trigger style={{ cursor: "pointer" }} />
          <Select.Content>
            <Select.Item value="ja">日本語</Select.Item>
            <Select.Item value="en">English</Select.Item>
          </Select.Content>
        </Select.Root>
        {onSave && (
          <Button
            type="button"
            onClick={onSave}
            disabled={isSaving || !hasActiveSheet}
            variant="solid"
          >
            <CheckIcon />
            {t("save")}
          </Button>
        )}
      </Flex>
    </Flex>
  );
};
