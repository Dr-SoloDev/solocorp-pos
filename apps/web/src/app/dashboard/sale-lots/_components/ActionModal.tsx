"use client";

import { useState } from "react";
import type { SaleLotDTO } from "@/lib/api-bridge/types";
import { Button } from "@lekk/ui";
import { Input } from "@lekk/ui";
import {
  X,
  Loader2,
  Check,
  Banknote,
  RotateCcw,
  Trash2,
} from "lucide-react";

export type ModalType = "confirm" | "cancel" | "recordRevenue" | "delete" | null;

export function ActionModal({
  type,
  lot,
  onClose,
  onConfirm,
  loading,
}: {
  type: ModalType;
  lot: SaleLotDTO | null;
  onClose: () => void;
  onConfirm: (_payload?: Record<string, unknown>) => void;
  loading: boolean;
}) {
  const [reason, setReason] = useState("");
  const [revenueAmount, setRevenueAmount] = useState(
    lot?.total_amount?.toString() ?? ""
  );
  const [revenueNote, setRevenueNote] = useState("");

  if (!type || !lot) return null;

  const titles: Record<string, string> = {
    confirm: "ยืนยัน Sale Lot",
    cancel: "ยกเลิก Sale Lot",
    recordRevenue: "บันทึกรายรับจริง",
    delete: "ลบ Sale Lot",
  };

  const descriptions: Record<string, string> = {
    confirm: `ยืนยัน Sale Lot ${lot.reference_no}? ระบบจะตัดสต็อกแบบ FIFO โดยอัตโนมัติ`,
    cancel: `ยกเลิก Sale Lot ${lot.reference_no}? ระบบจะคืนสต็อกกลับเข้า inventory`,
    recordRevenue: `บันทึกรายรับจริงสำหรับ ${lot.reference_no}`,
    delete: `ลบ Sale Lot ${lot.reference_no}? การกระทำนี้ไม่สามารถย้อนกลับได้`,
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-lg">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-sm bg-white rounded-xl shadow-modal animate-scale-in p-xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-lg">
          <h3 className="text-base font-semibold text-steel-900">
            {titles[type]}
          </h3>
          <button
            onClick={onClose}
            className="min-h-touch min-w-touch flex items-center justify-center -mr-2 text-steel-400 hover:text-steel-600"
            aria-label="ปิด"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <p className="text-sm text-steel-600 mb-lg">{descriptions[type]}</p>

        {type === "cancel" && (
          <div className="mb-lg">
            <label className="block text-caption font-medium text-steel-500 mb-1">
              เหตุผลที่ยกเลิก (ไม่บังคับ)
            </label>
            <textarea
              className="w-full min-h-[80px] rounded-md border border-steel-200 bg-white px-3 py-2 text-sm placeholder:text-steel-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 resize-none"
              placeholder="ระบุเหตุผล..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
        )}

        {type === "recordRevenue" && (
          <div className="space-y-md mb-lg">
            <div>
              <label className="block text-caption font-medium text-steel-500 mb-1">
                ยอดรายรับจริง (บาท) *
              </label>
              <Input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={revenueAmount}
                onChange={(e) => setRevenueAmount(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-caption font-medium text-steel-500 mb-1">
                หมายเหตุ
              </label>
              <textarea
                className="w-full min-h-[60px] rounded-md border border-steel-200 bg-white px-3 py-2 text-sm placeholder:text-steel-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 resize-none"
                placeholder="บันทึกเพิ่มเติม..."
                value={revenueNote}
                onChange={(e) => setRevenueNote(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            size="lg"
            className="flex-1"
            onClick={onClose}
            disabled={loading}
          >
            ยกเลิก
          </Button>
          <Button
            variant={
              type === "cancel" || type === "delete"
                ? "destructive"
                : "default"
            }
            size="lg"
            className="flex-1"
            onClick={() => {
              const payload: Record<string, unknown> = {};
              if (type === "cancel") payload.reason = reason;
              if (type === "recordRevenue") {
                payload.actual_revenue = parseFloat(revenueAmount) || 0;
                payload.actual_revenue_note = revenueNote;
              }
              onConfirm(payload);
            }}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : type === "recordRevenue" ? (
              <Banknote className="w-4 h-4 mr-2" />
            ) : type === "confirm" ? (
              <Check className="w-4 h-4 mr-2" />
            ) : type === "cancel" ? (
              <RotateCcw className="w-4 h-4 mr-2" />
            ) : (
              <Trash2 className="w-4 h-4 mr-2" />
            )}
            {type === "confirm"
              ? "ยืนยัน"
              : type === "cancel"
              ? "ยกเลิก"
              : type === "recordRevenue"
              ? "บันทึก"
              : "ลบ"}
          </Button>
        </div>
      </div>
    </div>
  );
}
