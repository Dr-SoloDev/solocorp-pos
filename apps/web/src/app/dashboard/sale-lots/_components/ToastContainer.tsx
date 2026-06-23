"use client";

import { X, Check, AlertCircle, FileText } from "lucide-react";
import { cn } from "@solocorp/ui";
import type { ToastMessage } from "./types";

export function ToastContainer({
  toasts,
  onDismiss,
}: {
  toasts: ToastMessage[];
  onDismiss: (_: string) => void;
}) {
  if (toasts.length === 0) return null;
  return (
    <div className="fixed top-4 right-4 left-4 z-[100] flex flex-col gap-2 max-w-sm mx-auto pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            "pointer-events-auto flex items-start gap-3 p-3 rounded-lg shadow-modal animate-slide-down text-sm",
            toast.type === "success" &&
              "bg-success-light text-success-dark border border-success/20",
            toast.type === "error" &&
              "bg-danger-light text-danger-dark border border-danger/20",
            toast.type === "info" &&
              "bg-info-light text-info-dark border border-info/20",
          )}
        >
          {toast.type === "success" && (
            <Check className="w-4 h-4 mt-0.5 shrink-0 text-success" />
          )}
          {toast.type === "error" && (
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-danger" />
          )}
          {toast.type === "info" && (
            <FileText className="w-4 h-4 mt-0.5 shrink-0 text-info" />
          )}
          <span className="flex-1">{toast.message}</span>
          <button
            onClick={() => onDismiss(toast.id)}
            className="text-current opacity-50 hover:opacity-100 transition-opacity min-h-touch min-w-touch flex items-center justify-center -m-2"
            aria-label="ปิด"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
