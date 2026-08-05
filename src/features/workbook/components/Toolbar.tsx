import { DownloadIcon, FileTextIcon } from "@radix-ui/react-icons";
import { Button, Flex, Select, TextField } from "@radix-ui/themes";
import { type FC, useCallback } from "react";
import { useCurrentLocale } from "@/i18n/context";
import { useI18n } from "@/i18n/useI18n";
import { isLocale } from "@/i18n/utils";
import { localMessages } from "./i18n";
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
  const { t } = useI18n(localMessages);
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
      <Select.Root
        value={locale}
        disabled={isPending}
        onValueChange={handleChangeLocale}
      >
        <Select.Trigger style={{ marginLeft: "auto", cursor: "pointer" }} />
        <Select.Content>
          <Select.Item value="ja">日本語</Select.Item>
          <Select.Item value="en">English</Select.Item>
        </Select.Content>
      </Select.Root>
    </Flex>
  );
};
