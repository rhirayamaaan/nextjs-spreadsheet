import { ExclamationTriangleIcon, UploadIcon } from "@radix-ui/react-icons";
import {
  Box,
  Button,
  Card,
  Container,
  Flex,
  Heading,
  Text,
} from "@radix-ui/themes";
import type { ChangeEvent, FC } from "react";

interface FileUploadProps {
  onFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
  isLoading: boolean;
  error: string | null;
}

export const FileUpload: FC<FileUploadProps> = ({
  onFileChange,
  isLoading,
  error,
}) => {
  return (
    <Container size="1" style={{ marginTop: "15vh" }}>
      <Card size="3" style={{ padding: "40px" }}>
        <Flex direction="column" align="center" gap="4">
          <Box
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "50%",
              background: "var(--blue-3)",
              color: "var(--blue-9)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <UploadIcon width="32" height="32" />
          </Box>

          <Flex direction="column" align="center" gap="1">
            <Heading size="4" align="center">
              Excelプレビュー
            </Heading>
            <Text size="2" color="gray" align="center">
              .xlsxファイルをアップロードしてWeb上で内容を表示します
            </Text>
          </Flex>

          {error && (
            <Flex
              align="center"
              gap="2"
              p="2"
              style={{
                background: "var(--red-3)",
                color: "var(--red-11)",
                borderRadius: "6px",
                border: "1px solid var(--red-5)",
                width: "100%",
              }}
            >
              <ExclamationTriangleIcon />
              <Text size="1">{error}</Text>
            </Flex>
          )}

          <Box style={{ width: "100%", textAlign: "center" }}>
            <input
              type="file"
              accept=".xlsx"
              id="initial-excel-upload"
              onChange={onFileChange}
              style={{ display: "none" }}
            />
            <Button
              type="button"
              loading={isLoading}
              disabled={isLoading}
              onClick={() =>
                document.getElementById("initial-excel-upload")?.click()
              }
              size="3"
              variant="solid"
              color="blue"
              style={{ width: "100%", cursor: "pointer" }}
            >
              ファイルを選択する
            </Button>
          </Box>
        </Flex>
      </Card>
    </Container>
  );
};
