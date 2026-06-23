"use client";

import { User, Phone } from "lucide-react";

export default function BuyerForm({
  buyerName,
  buyerPhone,
  onChange,
}: {
  buyerName: string;
  buyerPhone: string;
  onChange: (_: string, __: string) => void;
}) {
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-steel-700 mb-1">
          ชื่อผู้ซื้อ / ลูกค้า
        </label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-steel-400" />
          <input
            type="text"
            value={buyerName}
            onChange={(e) => onChange(e.target.value, buyerPhone)}
            placeholder="ชื่อผู้ซื้อ (ไม่บังคับ)"
            className="w-full pl-9 pr-3 py-2.5 bg-white border border-steel-200 rounded-lg text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary min-h-input"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-steel-700 mb-1">
          เบอร์โทรศัพท์
        </label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-steel-400" />
          <input
            type="tel"
            value={buyerPhone}
            onChange={(e) => onChange(buyerName, e.target.value)}
            placeholder="เบอร์โทร (ไม่บังคับ)"
            className="w-full pl-9 pr-3 py-2.5 bg-white border border-steel-200 rounded-lg text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary min-h-input"
          />
        </div>
      </div>
    </div>
  );
}
