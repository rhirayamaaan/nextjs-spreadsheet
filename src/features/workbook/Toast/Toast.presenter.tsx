import {
  CheckCircledIcon,
  ExclamationTriangleIcon,
  InfoCircledIcon,
} from "@radix-ui/react-icons";
import * as ToastPrimitive from "@radix-ui/react-toast";
import { Button, Callout, Flex, Text } from "@radix-ui/themes";
import { type FC, useRef } from "react";
import styles from "./Toast.module.css";

export type ToastType = "success" | "error" | "info";

export type ToastMessage = {
  id?: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
  requiresConfirm?: boolean;
};

export type ToastPresenterProps = {
  toast: ToastMessage | null;
  onClose: () => void;
};

export const ToastPresenter: FC<ToastPresenterProps> = ({ toast, onClose }) => {
  const lastToastRef = useRef(toast);
  if (toast) {
    lastToastRef.current = toast;
  }
  const currentToast = toast ?? lastToastRef.current;

  const color =
    currentToast?.type === "error"
      ? "red"
      : currentToast?.type === "success"
        ? "green"
        : "blue";

  return (
    <ToastPrimitive.Provider swipeDirection="right">
      {currentToast && (
        <ToastPrimitive.Root
          key={currentToast.id}
          className={styles.root}
          open={Boolean(toast)}
          onOpenChange={(open) => {
            if (!open) {
              onClose();
            }
          }}
          duration={
            currentToast.requiresConfirm
              ? Number.POSITIVE_INFINITY
              : (currentToast.duration ?? 3500)
          }
        >
          <Callout.Root color={color} size="2" highContrast variant="surface">
            <Callout.Icon>
              {currentToast.type === "error" ? (
                <ExclamationTriangleIcon width="18" height="18" />
              ) : currentToast.type === "success" ? (
                <CheckCircledIcon width="18" height="18" />
              ) : (
                <InfoCircledIcon width="18" height="18" />
              )}
            </Callout.Icon>
            <Flex direction="column" gap="2" width="100%">
              <Flex direction="column" gap="1">
                {currentToast.title && (
                  <ToastPrimitive.Title asChild>
                    <Text size="2" weight="bold">
                      {currentToast.title}
                    </Text>
                  </ToastPrimitive.Title>
                )}
                <ToastPrimitive.Description asChild>
                  <Callout.Text size="2">{currentToast.message}</Callout.Text>
                </ToastPrimitive.Description>
              </Flex>
              {currentToast.requiresConfirm && (
                <Flex justify="end" pt="1">
                  <ToastPrimitive.Close asChild>
                    <Button
                      size="1"
                      color={color}
                      variant="solid"
                      className={styles.actionButton}
                    >
                      OK
                    </Button>
                  </ToastPrimitive.Close>
                </Flex>
              )}
            </Flex>
          </Callout.Root>
        </ToastPrimitive.Root>
      )}
      <ToastPrimitive.Viewport className={styles.viewport} />
    </ToastPrimitive.Provider>
  );
};
