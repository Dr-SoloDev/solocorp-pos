"use client";

import { ChevronDown } from "lucide-react";
import { SellerSelector } from "./SellerSelector";

export function SellerStepSection({
  sellerId,
  sellerName,
  onSellerChange,
  onNext,
}: {
  sellerId: number | null;
  sellerName: string;
  onSellerChange: (_: number | null, __: string) => void;
  onNext: () => void;
}) {
  return (
    <div className="px-lg pt-4 space-y-4">
      <h2 className="text-base font-bold text-steel-900">เลือกผู้ขาย</h2>

      <SellerSelector
        sellerId={sellerId}
        sellerName={sellerName}
        onChange={onSellerChange}
      />

      <button
        onClick={onNext}
        disabled={!sellerId}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-white text-sm font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed min-h-touch mt-4"
      >
        ถัดไป
        <ChevronDown className="w-4 h-4 -rotate-90" />
      </button>
    </div>
  );
}
