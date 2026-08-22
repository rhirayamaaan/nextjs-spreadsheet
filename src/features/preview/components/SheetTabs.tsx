import { Button, Flex } from "@radix-ui/themes";
import type { FC } from "react";

interface SheetTabsProps {
  sheetNames: string[];
  activeSheetIndex: number;
  onSelectSheet: (index: number) => void;
}

export const SheetTabs: FC<SheetTabsProps> = ({
  sheetNames,
  activeSheetIndex,
  onSelectSheet,
}) => {
  if (sheetNames.length <= 1) return null;

  return (
    <Flex
      gap="1"
      px="4"
      py="2"
      style={{
        borderTop: "1px solid var(--gray-4)",
        background: "var(--gray-3)",
      }}
    >
      {sheetNames.map((name, index) => {
        const isActive = index === activeSheetIndex;
        return (
          <Button
            key={name}
            type="button"
            variant={isActive ? "solid" : "ghost"}
            color="gray"
            highContrast={isActive}
            onClick={() => onSelectSheet(index)}
            style={{
              cursor: "pointer",
              borderRadius: "4px 4px 0 0",
              height: "28px",
              padding: "0 16px",
            }}
          >
            {name}
          </Button>
        );
      })}
    </Flex>
  );
};
