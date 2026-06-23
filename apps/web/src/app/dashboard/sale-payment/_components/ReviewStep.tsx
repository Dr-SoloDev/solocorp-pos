"use client";

import { User, Phone, AlertTriangle, Loader2, Receipt } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { SaleItem, PaymentMethod } from "./types";
import StepIndicator from "./StepIndicator";

export default function ReviewStep({
  step,
  buyerName,
  buyerPhone,
  paymentMethod,
  validItems,
  notes,
  grandTotal,
  submitError,
  submitting,
  onEditBuyer,
  onEditItems,
  onSubmit,
}: {
  step: "buyer" | "items" | "review";
  buyerName: string;
  buyerPhone: string;
  paymentMethod: PaymentMethod;
  validItems: SaleItem[];
  notes: string;
  grandTotal: number;
  submitError: string;
  submitting: boolean;
  onEditBuyer: () => void;
  onEditItems: () => void;
  onSubmit: () => void;
}) {
  return (
    <div className="pb-24">
      <StepIndicator current={step} />

      <div className="px-lg pt-4 space-y-4">
        {/* Buyer */}
        <div className="bg-white rounded-lg p-4 shadow-card">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-steel-700">
              ข้อมูลผู้ซื้อ
            </h3>
            <button
              onClick={onEditBuyer}
              className="text-xs text-success font-medium min-h-touch px-2"
            >
              แก้ไข
            </button>
          </div>
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-steel-400" />
            <span className="text-sm text-steel-800">
              {buyerName || "ลูกค้าทั่วไป"}
            </span>
          </div>
          {buyerPhone && (
            <div className="flex items-center gap-2 mt-1">
              <Phone className="w-4 h-4 text-steel-400" />
              <span className="text-sm text-steel-600">{buyerPhone}</span>
            </div>
          )}
        </div>

        {/* Payment Method */}
        <div className="bg-white rounded-lg p-4 shadow-card">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm font-semibold text-steel-700">
              วิธีการชำระเงิน
            </h3>
            <button
              onClick={onEditItems}
              className="text-xs text-success font-medium min-h-touch px-2"
            >
              แก้ไข
            </button>
          </div>
          <p className="text-sm text-steel-800">
            {paymentMethod === "cash" ? "💵 เงินสด" : "🏦 โอน"}
          </p>
        </div>

        {/* Items */}
        <div className="bg-white rounded-lg p-4 shadow-card">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-steel-700">รายการขาย</h3>
            <button
              onClick={onEditItems}
              className="text-xs text-success font-medium min-h-touch px-2"
            >
              แก้ไข
            </button>
          </div>
          <div className="space-y-2">
            {validItems.map((item, i) => (
              <div
                key={item.tempId}
                className="flex items-center justify-between text-sm"
              >
                <div className="min-w-0 flex-1 mr-2">
                  <p className="font-medium text-steel-800 truncate">
                    {i + 1}. {item.name}
                  </p>
                  <p className="text-xs text-steel-400">
                    {item.quantity} × {formatCurrency(item.price)}
                  </p>
                </div>
                <span className="font-semibold text-steel-900 shrink-0">
                  {formatCurrency(item.total)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Notes */}
        {notes && (
          <div className="bg-white rounded-lg p-4 shadow-card">
            <h3 className="text-sm font-semibold text-steel-700 mb-1">
              หมายเหตุ
            </h3>
            <p className="text-sm text-steel-600">{notes}</p>
          </div>
        )}

        {/* Grand Total */}
        <div className="bg-success-light rounded-lg p-4 border border-success/20">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-steel-700">
              ยอดรวมทั้งสิ้น
            </span>
            <span className="text-2xl font-bold text-success">
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
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-success text-white text-sm font-medium rounded-lg disabled:opacity-70 min-h-touch"
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              กำลังบันทึก...
            </>
          ) : (
            <>
              <Receipt className="w-4 h-4" />
              บันทึกการขาย
            </>
          )}
        </button>
      </div>
    </div>
  );
}
