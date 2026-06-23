"use client";

import { ChevronDown } from "lucide-react";
import BuyerForm from "./BuyerForm";

export default function BuyerStep({
  buyerName,
  buyerPhone,
  onBuyerNameChange,
  onBuyerPhoneChange,
  onNext,
}: {
  buyerName: string;
  buyerPhone: string;
  onBuyerNameChange: (_: string) => void;
  onBuyerPhoneChange: (_: string) => void;
  onNext: () => void;
}) {
  return (
    <div className="px-lg pt-4 space-y-4">
      <h2 className="text-base font-bold text-steel-900">ข้อมูลผู้ซื้อ</h2>

      <BuyerForm
        buyerName={buyerName}
        buyerPhone={buyerPhone}
        onChange={(name, phone) => {
          onBuyerNameChange(name);
          onBuyerPhoneChange(phone);
        }}
      />

      <button
        onClick={onNext}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-success text-white text-sm font-medium rounded-lg min-h-touch mt-4"
      >
        ถัดไป
        <ChevronDown className="w-4 h-4 -rotate-90" />
      </button>
    </div>
  );
}
