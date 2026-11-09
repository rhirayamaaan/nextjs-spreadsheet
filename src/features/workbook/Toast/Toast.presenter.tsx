import {
  CheckCircledIcon,
  ExclamationTriangleIcon,
  InfoCircledIcon,
} from "@radix-ui/react-icons";
import * as ToastPrimitive from "@radix-ui/react-toast";
import { Button, Callout, Flex, Text } from "@radix-ui/themes";
import { type FC, useRef } from "react";
import { useI18n } from "@/i18n/useI18n";
import { localMessages } from "../i18n";
import styles from "./Toast.module.css";

export type ToastType = "success" | "error" | "info";

export type ToastMessageKey = keyof (typeof localMessages)["ja"];

export type ToastMessage = {
  id?: string;
  type: ToastType;
  title?: string;
  titleKey?: ToastMessageKey;
  message?: string;
  messageKey?: ToastMessageKey;
  params?: Record<string, string | number>;
  duration?: number;
  requiresConfirm?: boolean;
  onClose?: () => void;
};

export type ToastPresenterProps = {
  toast: ToastMessage | null;
  onClose: () => void;
};

export const ToastPresenter: FC<ToastPresenterProps> = ({ toast, onClose }) => {
  const { t } = useI18n(localMessages);
  const lastToastRef = useRef(toast);
  if (toast) {
    lastToastRef.current = toast;
  }
  const currentToast = toast ?? lastToastRef.current;

  const displayTitle = currentToast?.titleKey
    ? t(currentToast.titleKey, currentToast.params)
    : currentToast?.title;
  const displayMessage = currentToast?.messageKey
    ? t(currentToast.messageKey, currentToast.params)
    : currentToast?.message;

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
              currentToast?.onClose?.();
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
                {displayTitle && (
                  <ToastPrimitive.Title asChild>
                    <Text size="2" weight="bold">
                      {displayTitle}
                    </Text>
                  </ToastPrimitive.Title>
                )}
                {displayMessage && (
                  <ToastPrimitive.Description asChild>
                    <Callout.Text size="2">{displayMessage}</Callout.Text>
                  </ToastPrimitive.Description>
                )}
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
                      {t("ok")}
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
