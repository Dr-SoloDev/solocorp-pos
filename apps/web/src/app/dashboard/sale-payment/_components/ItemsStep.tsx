"use client";

import { Plus, ChevronDown, FileText } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { SaleItem, PaymentMethod } from "./types";
import StepIndicator from "./StepIndicator";
import EmptySaleState from "./EmptySaleState";
import SaleItemRow from "./SaleItemRow";
import PaymentSelector from "./PaymentSelector";

export default function ItemsStep({
  step,
  items,
  paymentMethod,
  onPaymentMethodChange,
  notes,
  onNotesChange,
  grandTotal,
  validItems,
  onAddItem,
  onNext,
  onUpdateItem,
  onRemoveItem,
}: {
  step: "buyer" | "items" | "review";
  items: SaleItem[];
  paymentMethod: PaymentMethod;
  onPaymentMethodChange: (_: PaymentMethod) => void;
  notes: string;
  onNotesChange: (_: string) => void;
  grandTotal: number;
  validItems: SaleItem[];
  onAddItem: () => void;
  onNext: () => void;
  onUpdateItem: (_: number, __: Partial<SaleItem>) => void;
  onRemoveItem: (_: number) => void;
}) {
  return (
    <div className="pb-24">
      <StepIndicator current={step} />

      <div className="px-lg pt-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-steel-900">รายการขาย</h2>
          {items.length > 0 && (
            <span className="text-xs text-steel-400 bg-steel-100 px-2 py-0.5 rounded-full">
              {items.length} รายการ
            </span>
          )}
        </div>

        {items.length === 0 ? (
          <EmptySaleState onAdd={onAddItem} />
        ) : (
          <>
            <div className="space-y-3">
              {items.map((item, index) => (
                <SaleItemRow
                  key={item.tempId}
                  item={item}
                  index={index}
                  onChange={onUpdateItem}
                  onRemove={onRemoveItem}
                />
              ))}
            </div>

            <button
              onClick={onAddItem}
              className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-success/30 rounded-lg text-sm text-success hover:bg-success/5 transition-colors min-h-touch"
            >
              <Plus className="w-4 h-4" />
              เพิ่มสินค้า
            </button>

            {/* Grand Total */}
            <div className="bg-white rounded-lg p-4 shadow-card">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-steel-600">
                  รวมทั้งสิ้น
                </span>
                <span className="text-xl font-bold text-success">
                  {formatCurrency(grandTotal)}
                </span>
              </div>
            </div>

            {/* Payment Method */}
            <PaymentSelector
              value={paymentMethod}
              onChange={onPaymentMethodChange}
            />

            {/* Notes */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-steel-600">
                <FileText className="w-3 h-3 inline mr-1" />
                หมายเหตุ
              </label>
              <textarea
                value={notes}
                onChange={(e) => onNotesChange(e.target.value)}
                placeholder="บันทึกเพิ่มเติม..."
                rows={2}
                className="w-full px-3 py-2.5 bg-white border border-steel-200 rounded-lg text-sm placeholder:text-steel-400 focus:border-success focus:outline-none focus:ring-1 focus:ring-success resize-none"
              />
            </div>

            {/* Next */}
            <button
              onClick={onNext}
              disabled={validItems.length === 0}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-success text-white text-sm font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed min-h-touch"
            >
              ตรวจสอบและยืนยัน
              <ChevronDown className="w-4 h-4 -rotate-90" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
