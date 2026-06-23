"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";

export function ErrorView({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-lg text-center">
      <div className="w-12 h-12 rounded-full bg-danger-light flex items-center justify-center mb-4">
        <AlertTriangle className="w-6 h-6 text-danger" />
      </div>
      <p className="text-steel-700 font-medium mb-1">เกิดข้อผิดพลาด</p>
      <p className="text-sm text-steel-500 mb-4">{message}</p>
      <button
        onClick={onRetry}
        className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-medium rounded-md min-h-touch"
      >
        <RefreshCw className="w-4 h-4" />
        ลองใหม่
      </button>
    </div>
  );
}
