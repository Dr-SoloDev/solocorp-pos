"use client";

import { User } from "lucide-react";
import type { SaleLotDTO } from "@/lib/api-bridge/types";
import { StatusBadge } from "./StatusBadge";
import { formatDate, formatWeight, getTotalQuantity } from "./sale-lot-helpers";
import { formatCurrency } from "@/lib/utils";

export function SaleLotTableRow({
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
    <tr
      onClick={() => onSelect(lot)}
      className="border-b border-steel-100 hover:bg-steel-50 cursor-pointer transition-colors"
    >
      <td className="py-3 px-4">
        <span className="font-mono text-sm font-semibold text-steel-900">
          {lot.reference_no}
        </span>
      </td>
      <td className="py-3 px-4">
        <span className="flex items-center gap-1 text-steel-700">
          <User className="w-3.5 h-3.5 text-steel-400" />
          {lot.buyer_name}
        </span>
      </td>
      <td className="py-3 px-4 text-steel-600 text-sm">
        <span className="truncate max-w-[160px] inline-block">
          {productName}
          {itemCount > 1 && (
            <span className="text-steel-400 ml-1">+{itemCount - 1}</span>
          )}
        </span>
      </td>
      <td className="py-3 px-4 text-steel-600 text-sm">
        {formatWeight(totalQty)} kg
      </td>
      <td className="py-3 px-4 text-sm font-semibold">
        {formatCurrency(lot.total_amount)}
      </td>
      <td className="py-3 px-4">
        <StatusBadge status={lot.status} />
      </td>
      <td className="py-3 px-4 text-caption text-steel-400">
        {formatDate(lot.created_at)}
      </td>
    </tr>
  );
}
