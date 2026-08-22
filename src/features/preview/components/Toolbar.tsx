import { FileIcon, UploadIcon } from "@radix-ui/react-icons";
import { Box, Button, Card, Flex, Text } from "@radix-ui/themes";
import { type ChangeEvent, type FC, useRef } from "react";

interface ToolbarProps {
  fileName: string | null;
  fileSize: number | null;
  selectedCellAddress: string | null;
  selectedCellValue: string | null;
  onFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
  isLoading: boolean;
}

export const Toolbar: FC<ToolbarProps> = ({
  fileName,
  fileSize,
  selectedCellAddress,
  selectedCellValue,
  onFileChange,
  isLoading,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
  };

  return (
    <Flex
      align="center"
      justify="between"
      gap="4"
      px="4"
      py="3"
      style={{
        borderBottom: "1px solid var(--gray-4)",
        background: "var(--color-background)",
      }}
    >
      <Flex align="center" gap="3">
        <input
          type="file"
          accept=".xlsx"
          ref={fileInputRef}
          onChange={onFileChange}
          style={{ display: "none" }}
        />
        <Button
          type="button"
          onClick={handleUploadClick}
          loading={isLoading}
          disabled={isLoading}
          variant="solid"
          color="blue"
          style={{ cursor: "pointer" }}
        >
          <UploadIcon />
          Excelファイルをアップロード
        </Button>

        {fileName && (
          <Flex align="center" gap="2" style={{ color: "var(--gray-11)" }}>
            <FileIcon />
            <Text size="2" weight="medium">
              {fileName}
            </Text>
            {fileSize !== null && (
              <Text size="1" color="gray">
                ({formatBytes(fileSize)})
              </Text>
            )}
          </Flex>
        )}
      </Flex>

      {fileName && (
        <Card size="1" style={{ padding: "4px 12px", minWidth: "300px" }}>
          <Flex align="center" justify="between" gap="4">
            <Box>
              <Text size="1" color="gray" as="p">
                選択中のセル
              </Text>
              <Text size="2" weight="bold" color="blue">
                {selectedCellAddress ? selectedCellAddress : "未選択"}
              </Text>
            </Box>
            <Box
              style={{
                flexGrow: 1,
                borderLeft: "1px solid var(--gray-4)",
                paddingLeft: "12px",
              }}
            >
              <Text size="1" color="gray" as="p">
                セルの値
              </Text>
              <Text
                size="2"
                style={{
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  maxWidth: "200px",
                  display: "block",
                }}
              >
                {selectedCellAddress
                  ? selectedCellValue || "(空)"
                  : "セルを選択してください"}
              </Text>
            </Box>
          </Flex>
        </Card>
      )}
    </Flex>
  );
};
