import { Dialog, Flex, Spinner, Text, VisuallyHidden } from "@radix-ui/themes";
import type { FC } from "react";

export type LoadingOverlayPresenterProps = {
  open: boolean;
  message?: string;
};

export const LoadingOverlayPresenter: FC<LoadingOverlayPresenterProps> = ({
  open,
  message,
}) => {
  return (
    <Dialog.Root open={open}>
      <Dialog.Content
        maxWidth="240px"
        onEscapeKeyDown={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <VisuallyHidden>
          <Dialog.Title>{message ?? "Loading"}</Dialog.Title>
        </VisuallyHidden>
        <Flex direction="column" align="center" justify="center" gap="3" py="2">
          <Spinner size="3" />
          {message && (
            <Text size="2" weight="medium">
              {message}
            </Text>
          )}
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
};
