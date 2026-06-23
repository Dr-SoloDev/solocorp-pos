"use client";

import { User, Building2, Package, Scale } from "lucide-react";
import type { SaleLotDTO } from "@/lib/api-bridge/types";
import { StatusBadge } from "./StatusBadge";
import { formatDate, formatWeight, getTotalQuantity } from "./sale-lot-helpers";
import { formatCurrency } from "@/lib/utils";

export function SaleLotCard({
  lot,
  onSelect,
}: {
  lot: SaleLotDTO;
  onSelect: (_: SaleLotDTO) => void;
}) {
  const totalQty = getTotalQuantity(lot.items);
  const itemCount = lot.items?.length ?? 1;
  const productName =
    lot.items && lot.items.length > 0
      ? lot.items[0]?.name ?? "สินค้า"
      : "สินค้า";

  return (
    <button
      onClick={() => onSelect(lot)}
      className="w-full text-left bg-white rounded-lg border border-steel-200 shadow-card p-4 hover:shadow-card-hover transition-shadow active:scale-[0.99] animate-fade-in"
    >
      {/* Row 1: Reference + Status */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="font-mono text-sm font-semibold text-steel-900">
          {lot.reference_no}
        </span>
        <StatusBadge status={lot.status} />
      </div>

      {/* Row 2: Buyer + Branch */}
      <div className="flex items-center gap-3 text-caption text-steel-500 mb-3">
        <span className="flex items-center gap-1">
          <User className="w-3.5 h-3.5" />
          {lot.buyer_name}
        </span>
        {lot.branch_name && (
          <span className="flex items-center gap-1">
            <Building2 className="w-3.5 h-3.5" />
            {lot.branch_name}
          </span>
        )}
      </div>

      {/* Row 3: Product + Qty */}
      <div className="flex items-center gap-3 text-caption text-steel-600 mb-2">
        <span className="flex items-center gap-1 truncate flex-1">
          <Package className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">
            {productName}
            {itemCount > 1 && ` +${itemCount - 1}`}
          </span>
        </span>
        <span className="flex items-center gap-1 shrink-0">
          <Scale className="w-3.5 h-3.5" />
          {formatWeight(totalQty)} kg
        </span>
      </div>

      {/* Row 4: Amount + Date */}
      <div className="flex items-center justify-between text-caption">
        <span className="font-semibold text-primary">
          {formatCurrency(lot.total_amount)}
        </span>
        <span className="text-steel-400">{formatDate(lot.created_at)}</span>
      </div>
    </button>
  );
}
