import {
  DownloadIcon,
  FileTextIcon,
  MagnifyingGlassIcon,
} from "@radix-ui/react-icons";
import { Button, Flex, TextField } from "@radix-ui/themes";
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
          ? `Exporting ${displayName} to Excel...`
          : `Export ${displayName} to Excel`}
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
          ? `Generating ${displayName} PDF...`
          : `Print Preview ${displayName} (PDF)`}
      </Button>
      <TextField.Root placeholder="検索する">
        {/* <TextField.Slot>
          <MagnifyingGlassIcon height="16" width="16" />
        </TextField.Slot> */}
      </TextField.Root>
    </Flex>
  );
};
