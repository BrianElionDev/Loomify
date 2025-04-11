"use client";

import { ReactNode } from "react";
import { Toaster } from "sonner";

export default function ToastProvider({ children }: { children: ReactNode }) {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "rgba(15, 23, 42, 0.95)",
            color: "white",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            backdropFilter: "blur(8px)",
          },
          className: "border-slate-700 shadow-lg",
          duration: 4000,
        }}
      />
      {children}
    </>
  );
}
