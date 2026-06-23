"use client";

import { FileText, Plus, ChevronDown } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { EmptyWeighState } from "./EmptyWeighState";
import { ScaleInputRow } from "./ScaleInputRow";
import { PaymentSelector } from "./PaymentSelector";
import { StepIndicator } from "./StepIndicator";
import type { WeighItem, Step } from "./types";

export function ItemsStepSection({
  step,
  items,
  onAddItem,
  onUpdateItem,
  onRemoveItem,
  notes,
  onNotesChange,
  paymentMethod,
  onPaymentChange,
  grandTotal,
  onNext,
}: {
  step: Step;
  items: WeighItem[];
  onAddItem: () => void;
  onUpdateItem: (_: number, __: Partial<Omit<WeighItem, "tempId">>) => void;
  onRemoveItem: (_: number) => void;
  notes: string;
  onNotesChange: (_: string) => void;
  paymentMethod: "cash" | "bank_transfer";
  onPaymentChange: (_: "cash" | "bank_transfer") => void;
  grandTotal: number;
  onNext: () => void;
}) {
  return (
    <div className="pb-24">
      <StepIndicator step={step} />
      <div className="px-lg pt-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-steel-900">
            รายการชั่งน้ำหนัก
          </h2>
          {items.length > 0 && (
            <span className="text-xs text-steel-400 bg-steel-100 px-2 py-0.5 rounded-full">
              {items.length} รายการ
            </span>
          )}
        </div>

        {items.length === 0 ? (
          <EmptyWeighState onAdd={onAddItem} />
        ) : (
          <>
            <div className="space-y-3">
              {items.map((item, index) => (
                <ScaleInputRow
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
              className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-steel-300 rounded-lg text-sm text-steel-500 hover:text-primary hover:border-primary transition-colors min-h-touch"
            >
              <Plus className="w-4 h-4" />
              เพิ่มรายการ
            </button>

            {/* Grand Total */}
            <div className="bg-white rounded-lg p-4 shadow-card">
              <div className="flex items-center justify-between">
                <span className="text-sm text-steel-600 font-medium">
                  รวมทั้งหมด
                </span>
                <span className="text-xl font-bold text-primary">
                  {formatCurrency(grandTotal)}
                </span>
              </div>
            </div>

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
                className="w-full px-3 py-2.5 bg-white border border-steel-200 rounded-lg text-sm placeholder:text-steel-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none"
              />
            </div>

            {/* Payment Method */}
            <PaymentSelector
              value={paymentMethod}
              onChange={onPaymentChange}
            />

            {/* Next */}
            <button
              onClick={onNext}
              disabled={items.filter((i) => i.weight > 0 && i.total > 0).length === 0}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-white text-sm font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed min-h-touch"
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
