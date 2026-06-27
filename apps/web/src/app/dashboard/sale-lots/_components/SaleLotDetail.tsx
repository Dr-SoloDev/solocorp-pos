"use client";

import type { SaleLotDTO } from "@/lib/api-bridge/types";
import { Button } from "@lekk/ui";
import { cn } from "@lekk/ui";
import {
  ChevronLeft,
  Package,
  Check,
  Banknote,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { StatusBadge } from "./StatusBadge";
import { formatDate, formatWeight, getTotalQuantity } from "./sale-lot-helpers";

// Local type used by this component
type ModalType = "confirm" | "cancel" | "recordRevenue" | "delete" | null;

export function SaleLotDetail({
  lot,
  onClose,
  onAction,
  loading,
}: {
  lot: SaleLotDTO;
  onClose: () => void;
  onAction: (_: ModalType) => void;
  loading: boolean;
}) {
  const totalQty = getTotalQuantity(lot.items);
  const profit = lot.profit ?? (lot.total_amount - (lot.cost_total ?? 0));

  return (
    <div className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 animate-fade-in"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative w-full sm:max-w-lg max-h-[85vh] bg-white rounded-t-xl sm:rounded-xl shadow-modal animate-slide-up overflow-y-auto scrollbar-thin">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-steel-200 px-lg py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={onClose}
              className="min-h-touch min-w-touch flex items-center justify-center -ml-2 text-steel-500 hover:text-steel-700"
              aria-label="ปิด"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <h2 className="text-sm font-semibold text-steel-900 truncate">
                {lot.reference_no}
              </h2>
              <p className="text-caption text-steel-400">
                สร้างเมื่อ {formatDate(lot.created_at)}
              </p>
            </div>
          </div>
          <StatusBadge status={lot.status} />
        </div>

        {/* Content */}
        <div className="p-lg space-y-xl">
          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-lg">
            <div>
              <p className="text-caption text-steel-400 mb-1">ผู้ซื้อ</p>
              <p className="text-sm font-medium text-steel-800">
                {lot.buyer_name}
              </p>
            </div>
            <div>
              <p className="text-caption text-steel-400 mb-1">สาขา</p>
              <p className="text-sm font-medium text-steel-800">
                {lot.branch_name ?? "—"}
              </p>
            </div>
            <div>
              <p className="text-caption text-steel-400 mb-1">วันที่ขาย</p>
              <p className="text-sm font-medium text-steel-800">
                {formatDate(lot.created_at)}
              </p>
            </div>
            <div>
              <p className="text-caption text-steel-400 mb-1">น้ำหนักรวม</p>
              <p className="text-sm font-medium text-steel-800">
                {formatWeight(totalQty)} kg
              </p>
            </div>
          </div>

          {/* Financial Summary */}
          <div className="bg-steel-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-steel-600">ยอดขายรวม</span>
              <span className="font-semibold text-steel-900">
                {formatCurrency(lot.total_amount)}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-steel-600">ต้นทุน (FIFO)</span>
              <span className="font-medium text-steel-700">
                {formatCurrency(lot.cost_total ?? 0)}
              </span>
            </div>
            {lot.actual_revenue !== null && lot.actual_revenue !== undefined && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-steel-600">รายรับจริง</span>
                <span className="font-semibold text-info">{formatCurrency(lot.actual_revenue)}</span>
              </div>
            )}
            <div className="border-t border-steel-200 pt-2 flex justify-between items-center text-sm">
              <span className="font-medium text-steel-700">กำไร</span>
              <span
                className={cn(
                  "font-bold",
                  profit >= 0 ? "text-success" : "text-danger"
                )}
              >
                {profit >= 0 ? "+" : ""}{formatCurrency(profit)}
              </span>
            </div>
          </div>

          {/* Items Section */}
          {lot.items && lot.items.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-steel-800 mb-3 flex items-center gap-2">
                <Package className="w-4 h-4" />
                รายการสินค้า ({lot.items.length})
              </h3>
              <div className="space-y-2">
                {lot.items.map((item, idx) => (
                  <div
                    key={item.id ?? idx}
                    className="flex items-center justify-between bg-white border border-steel-200 rounded-lg p-3 text-sm"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-steel-800 truncate">
                        {item.name ?? "สินค้า"}
                      </p>
                      <p className="text-caption text-steel-400">
                        {item.category_name ?? ""}
                      </p>
                    </div>
                    <div className="text-right shrink-0 ml-3">
                      <p className="font-medium text-steel-800">
                        {formatWeight(item.quantity)} kg
                      </p>
                      <p className="text-caption text-steel-400">
                        {formatCurrency(item.price_per_unit)}/kg
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {lot.notes && (
            <div>
              <h3 className="text-caption font-medium text-steel-400 mb-1">
                หมายเหตุ
              </h3>
              <p className="text-sm text-steel-700 bg-steel-50 rounded-lg p-3">
                {lot.notes}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col gap-2 pt-2 border-t border-steel-200">
            {lot.status === "draft" && (
              <Button
                variant="default"
                size="lg"
                className="w-full"
                onClick={() => onAction("confirm")}
                disabled={loading}
              >
                <Check className="w-4 h-4 mr-2" />
                ยืนยัน Sale Lot (ตัดสต็อก)
              </Button>
            )}
            {lot.status === "confirmed" && (
              <>
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full"
                  onClick={() => onAction("recordRevenue")}
                  disabled={loading}
                >
                  <Banknote className="w-4 h-4 mr-2" />
                  บันทึกรายรับจริง
                </Button>
                <Button
                  variant="destructive"
                  size="lg"
                  className="w-full"
                  onClick={() => onAction("cancel")}
                  disabled={loading}
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  ยกเลิก Sale Lot
                </Button>
              </>
            )}
            {(lot.status === "draft" || lot.status === "cancelled") && (
              <Button
                variant="ghost"
                size="lg"
                className="w-full text-steel-500"
                onClick={() => onAction("delete")}
                disabled={loading}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                ลบ Sale Lot
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
