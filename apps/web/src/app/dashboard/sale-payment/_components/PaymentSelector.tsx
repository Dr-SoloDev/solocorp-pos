"use client";

import type { PaymentMethod } from "./types";

export default function PaymentSelector({
  value,
  onChange,
}: {
  value: PaymentMethod;
  onChange: (_: PaymentMethod) => void;
}) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-steel-700">
        วิธีการชำระเงิน
      </label>
      <div className="flex gap-2">
        {[
          { value: "cash" as const, label: "เงินสด", icon: "💵" },
          { value: "bank_transfer" as const, label: "โอน", icon: "🏦" },
        ].map((opt) => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium rounded-lg border transition-colors min-h-touch ${
              value === opt.value
                ? "bg-success text-white border-success"
                : "bg-white text-steel-600 border-steel-200 hover:bg-steel-50"
            }`}
          >
            <span>{opt.icon}</span>
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
