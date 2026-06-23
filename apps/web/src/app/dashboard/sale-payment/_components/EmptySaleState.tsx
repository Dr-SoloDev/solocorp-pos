"use client";

import { ShoppingBag, Plus } from "lucide-react";

export default function EmptySaleState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-lg text-center">
      <div className="w-14 h-14 rounded-full bg-success-light flex items-center justify-center mb-4">
        <ShoppingBag className="w-7 h-7 text-success" />
      </div>
      <p className="text-steel-700 font-medium mb-1">ยังไม่มีรายการขาย</p>
      <p className="text-sm text-steel-500 mb-4 max-w-xs">
        เลือกสินค้าจากคลังเพื่อเริ่มรายการขาย
      </p>
      <button
        onClick={onAdd}
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-success text-white text-sm font-medium rounded-md shadow-button min-h-touch"
      >
        <Plus className="w-4 h-4" />
        เพิ่มรายการขาย
      </button>
    </div>
  );
}
