"use client";

import { Receipt } from "lucide-react";

export function EmptyState({ hasFilters }: { hasFilters: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <Receipt className="w-12 h-12 text-steel-300 mb-4" />
      <h3 className="text-base font-semibold text-steel-700 mb-1">
        {hasFilters ? "ไม่พบ Sale Lot" : "ยังไม่มี Sale Lot"}
      </h3>
      <p className="text-sm text-steel-400 max-w-xs">
        {hasFilters
          ? "ลองปรับเปลี่ยนตัวกรองหรือคำค้นหา"
          : "สร้าง Sale Lot ใหม่เพื่อบันทึกการขายแบบยก Lot"}
      </p>
    </div>
  );
}
