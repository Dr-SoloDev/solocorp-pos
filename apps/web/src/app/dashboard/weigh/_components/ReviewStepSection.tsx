"use client";

import { User, AlertTriangle, Loader2, Receipt } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { StepIndicator } from "./StepIndicator";
import type { WeighItem, Step } from "./types";

export function ReviewStepSection({
  step,
  sellerName,
  items,
  paymentMethod,
  notes,
  grandTotal,
  submitError,
  submitting,
  onEditSeller,
  onEditItems,
  onSubmit,
}: {
  step: Step;
  sellerName: string;
  items: WeighItem[];
  paymentMethod: "cash" | "bank_transfer";
  notes: string;
  grandTotal: number;
  submitError: string;
  submitting: boolean;
  onEditSeller: () => void;
  onEditItems: () => void;
  onSubmit: () => void;
}) {
  return (
    <div className="pb-24">
      <StepIndicator step={step} />
      <div className="px-lg pt-4 space-y-4">
        {/* Seller */}
        <div className="bg-white rounded-lg p-4 shadow-card">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-steel-700">
              ข้อมูลผู้ขาย
            </h3>
            <button
              onClick={onEditSeller}
              className="text-xs text-primary font-medium min-h-touch px-2"
            >
              แก้ไข
            </button>
          </div>
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-steel-400" />
            <span className="text-sm text-steel-800">{sellerName}</span>
          </div>
        </div>

        {/* Items Summary */}
        <div className="bg-white rounded-lg p-4 shadow-card">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-steel-700">
              รายการชั่งน้ำหนัก
            </h3>
            <button
              onClick={onEditItems}
              className="text-xs text-primary font-medium min-h-touch px-2"
            >
              แก้ไข
            </button>
          </div>

          <div className="space-y-2">
            {items.map((item, i) => (
              <div
                key={item.tempId}
                className="flex items-center justify-between text-sm"
              >
                <div className="min-w-0 flex-1 mr-2">
                  <p className="font-medium text-steel-800 truncate">
                    {i + 1}. {item.name}
                  </p>
                  <p className="text-xs text-steel-400">
                    {item.net_weight.toFixed(2)} กก. × {formatCurrency(item.price_per_unit)}
                    {item.deduction_pct > 0 &&
                      ` (หัด ${item.deduction_pct}%)`}
                  </p>
                </div>
                <span className="font-semibold text-steel-900 shrink-0">
                  {formatCurrency(item.total)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Payment */}
        <div className="bg-white rounded-lg p-4 shadow-card space-y-2">
          <h3 className="text-sm font-semibold text-steel-700">
            วิธีการชำระเงิน
          </h3>
          <p className="text-sm text-steel-800">
            {paymentMethod === "cash" ? "💵 เงินสด" : "🏦 โอน"}
          </p>
          {notes && (
            <>
              <h3 className="text-sm font-semibold text-steel-700 mt-3">
                หมายเหตุ
              </h3>
              <p className="text-sm text-steel-600">{notes}</p>
            </>
          )}
        </div>

        {/* Grand Total */}
        <div className="bg-primary-50 rounded-lg p-4 border border-primary/20">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-steel-700">
              ยอดรวมทั้งสิ้น
            </span>
            <span className="text-2xl font-bold text-primary">
              {formatCurrency(grandTotal)}
            </span>
          </div>
        </div>

        {/* Error */}
        {submitError && (
          <div className="flex items-start gap-2 p-3 bg-danger-light rounded-lg text-sm text-danger">
            <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{submitError}</span>
          </div>
        )}

        {/* Submit */}
        <button
          onClick={onSubmit}
          disabled={submitting}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-white text-sm font-medium rounded-lg disabled:opacity-70 min-h-touch"
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              กำลังสร้าง...
            </>
          ) : (
            <>
              <Receipt className="w-4 h-4" />
              สร้างใบรับซื้อ
            </>
          )}
        </button>
      </div>
    </div>
  );
}
