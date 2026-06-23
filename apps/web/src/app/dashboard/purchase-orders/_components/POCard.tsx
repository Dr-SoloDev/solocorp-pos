"use client";

import { Hash, User, Calendar } from "lucide-react";
import { formatThaiDateTime, formatCurrency } from "@/lib/utils";
import type { PurchaseOrderDTO } from "@/lib/api-bridge/types";
import { StatusBadge } from "./StatusBadge";

export function POCard({
  po,
  onClick,
}: {
  po: PurchaseOrderDTO;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white rounded-lg p-4 shadow-card hover:shadow-card-hover transition-shadow active:scale-[0.99]"
    >
      {/* Top Row */}
      <div className="flex items-start justify-between mb-2">
        <div className="min-w-0 flex-1 mr-2">
          <div className="flex items-center gap-2">
            <Hash className="w-3.5 h-3.5 text-steel-400 shrink-0" />
            <span className="text-sm font-semibold text-steel-900 truncate">
              {po.reference_no}
            </span>
          </div>
        </div>
        <StatusBadge status={po.status} />
      </div>

      {/* Info Rows */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-2 text-xs text-steel-500">
          <User className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">{po.seller_name || "ไม่ระบุผู้ขาย"}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-steel-500">
          <Calendar className="w-3.5 h-3.5 shrink-0" />
          <span>{formatThaiDateTime(po.created_at)}</span>
        </div>
      </div>

      {/* Amount */}
      <div className="mt-3 pt-3 border-t border-steel-100 flex items-center justify-between">
        <span className="text-xs text-steel-500">ยอดรวม</span>
        <span className="text-base font-bold text-primary">
          {formatCurrency(po.total_amount)}
        </span>
      </div>
    </button>
  );
}
