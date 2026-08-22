import { Box, Flex } from "@radix-ui/themes";
import type { FC, ReactNode } from "react";

export interface WorkbookProps {
  toolbar?: ReactNode;
  tabs?: ReactNode;
  sheet?: ReactNode;
}

export const Workbook: FC<WorkbookProps> = ({ toolbar, tabs, sheet }) => {
  return (
    <Flex
      direction="column"
      width="100vw"
      height="100vh"
      overflow="hidden"
      style={{ background: "var(--gray-2)" }}
    >
      {toolbar}
      <Box flexGrow="1" overflow="hidden" style={{ position: "relative" }}>
        {sheet}
      </Box>
      {tabs}
    </Flex>
  );
};
