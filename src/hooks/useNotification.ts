"use client";

import { toast } from "sonner";

interface NotificationOptions {
  duration?: number;
  id?: string;
}

interface PromiseOptions {
  loading: string;
  success: string;
  error: string;
}

export function useNotification() {
  const success = (message: string, options?: NotificationOptions) => {
    toast.success(message, options);
  };

  const error = (message: string, options?: NotificationOptions) => {
    toast.error(message, options);
  };

  const info = (message: string, options?: NotificationOptions) => {
    toast(message, options);
  };

  const loading = <T>(
    message: string,
    promise: Promise<T>,
    options?: PromiseOptions
  ) => {
    return toast.promise(promise, {
      loading: options?.loading || message,
      success: options?.success || "Success!",
      error: options?.error || "Something went wrong",
    });
  };

  return {
    success,
    error,
    info,
    loading,
  };
}
