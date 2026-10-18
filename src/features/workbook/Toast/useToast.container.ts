import { useCallback, useState } from "react";
import type { ToastMessage, ToastPresenterProps } from "./Toast.presenter";

export type UseToastReturn = {
  toastProps: ToastPresenterProps;
  showToast: (message: ToastMessage) => void;
};

export const useToast = (): UseToastReturn => {
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const onClose = useCallback(() => {
    setToast(null);
  }, []);

  const showToast = useCallback((message: ToastMessage) => {
    setToast({
      ...message,
      id: message.id ?? `${Date.now()}-${Math.random()}`,
    });
  }, []);

  return {
    toastProps: {
      toast,
      onClose,
    },
    showToast,
  };
};
