import { Box, Flex } from "@radix-ui/themes";
import type { FC, ReactNode } from "react";

type WorkbookProps = {
  toolbar?: ReactNode;
  tabs: ReactNode;
  sheet: ReactNode;
};

export const Workbook: FC<WorkbookProps> = ({ toolbar, tabs, sheet }) => {
  return (
    <Flex direction="column" width="100vw" height="100vh" overflow="hidden">
      {toolbar}
      {tabs}
      <Box flexGrow="1" overflow="hidden">
        {sheet}
      </Box>
    </Flex>
  );
};
