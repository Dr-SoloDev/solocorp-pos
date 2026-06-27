"use client";

import type { SaleLotStatus } from "@/lib/api-bridge/types";
import { cn } from "@lekk/ui";

const STATUS_CONFIG: Record<
  SaleLotStatus,
  { label: string; bg: string; text: string; dot: string }
> = {
  draft: {
    label: "ร่าง",
    bg: "bg-steel-100",
    text: "text-steel-700",
    dot: "bg-steel-400",
  },
  confirmed: {
    label: "ยืนยันแล้ว",
    bg: "bg-success-light",
    text: "text-success-dark",
    dot: "bg-success",
  },
  cancelled: {
    label: "ยกเลิก",
    bg: "bg-danger-light",
    text: "text-danger-dark",
    dot: "bg-danger",
  },
};

export function StatusBadge({ status }: { status: SaleLotStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-caption font-medium whitespace-nowrap",
        cfg.bg,
        cfg.text,
      )}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full", cfg.dot)} />
      {cfg.label}
    </span>
  );
}
