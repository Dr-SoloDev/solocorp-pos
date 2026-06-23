"use client";

import { cn } from "@solocorp/ui";
import type { SaleLotDTO } from "@/lib/api-bridge/types";
import { formatCurrency } from "@/lib/utils";

export function SummaryStats({ lots }: { lots: SaleLotDTO[] }) {
  const totalAmount = lots.reduce((sum, l) => sum + (l.total_amount ?? 0), 0);
  const totalProfit = lots.reduce(
    (sum, l) => sum + (l.profit ?? (l.total_amount - (l.cost_total ?? 0))),
    0
  );
  const confirmedCount = lots.filter((l) => l.status === "confirmed").length;
  const draftCount = lots.filter((l) => l.status === "draft").length;

  return (
    <div className="grid grid-cols-3 gap-2">
      <div className="bg-white border border-steel-200 rounded-lg p-3 text-center">
        <p className="text-caption text-steel-400">รวมยอด</p>
        <p className="text-sm font-bold text-steel-900 mt-0.5">
          {formatCurrency(totalAmount)}
        </p>
      </div>
      <div className="bg-white border border-steel-200 rounded-lg p-3 text-center">
        <p className="text-caption text-steel-400">กำไร</p>
        <p
          className={cn(
            "text-sm font-bold mt-0.5",
            totalProfit >= 0 ? "text-success" : "text-danger"
          )}
        >
          {formatCurrency(totalProfit)}
        </p>
      </div>
      <div className="bg-white border border-steel-200 rounded-lg p-3 text-center">
        <p className="text-caption text-steel-400">สถานะ</p>
        <p className="text-sm font-medium text-steel-700 mt-0.5">
          {confirmedCount} ยืนยัน / {draftCount} ร่าง
        </p>
      </div>
    </div>
  );
}
