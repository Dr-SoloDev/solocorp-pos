"use client";

import { CheckCircle, Ban, Clock } from "lucide-react";

// ─── Status Config ──────────────────────────────────────────────────────────

const statusConfig: Record<
  string,
  { label: string; bg: string; text: string; dot: string; icon: React.ReactNode }
> = {
  active: {
    label: "ดำเนินการ",
    bg: "bg-success-light",
    text: "text-success",
    dot: "bg-success",
    icon: <CheckCircle className="w-3.5 h-3.5" />,
  },
  cancelled: {
    label: "ยกเลิก",
    bg: "bg-danger-light",
    text: "text-danger",
    dot: "bg-danger",
    icon: <Ban className="w-3.5 h-3.5" />,
  },
};

export function StatusBadge({ status }: { status: string }) {
  const cfg = statusConfig[status] || {
    label: status,
    bg: "bg-steel-100",
    text: "text-steel-600",
    dot: "bg-steel-400",
    icon: <Clock className="w-3.5 h-3.5" />,
  };
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text}`}
    >
      {cfg.icon}
      {cfg.label}
    </span>
  );
}
