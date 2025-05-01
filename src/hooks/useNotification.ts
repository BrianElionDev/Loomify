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
    toast(message, {
      ...options,
      style: {
        background: "rgba(59, 130, 246, 0.2)",
        borderLeft: "3px solid #3b82f6",
        color: "white",
      },
      icon: "ℹ️",
    });
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
