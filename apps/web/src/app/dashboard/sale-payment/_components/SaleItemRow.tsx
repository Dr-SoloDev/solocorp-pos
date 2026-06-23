"use client";

import { Package, Trash2, Hash, DollarSign, Minus, Plus } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { SaleItem } from "./types";

export default function SaleItemRow({
  item,
  index,
  onChange,
  onRemove,
}: {
  item: SaleItem;
  index: number;
  onChange: (_: number, __: Partial<SaleItem>) => void;
  onRemove: (_: number) => void;
}) {
  return (
    <div className="bg-white rounded-lg p-4 shadow-card space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0 flex-1 mr-2">
          <Package className="w-4 h-4 text-primary shrink-0" />
          <div className="min-w-0">
            <p className="text-sm font-medium text-steel-800 truncate">
              {item.name}
            </p>
            <p className="text-xs text-steel-400">{item.category_name}</p>
          </div>
        </div>
        <button
          onClick={() => onRemove(index)}
          className="text-steel-400 hover:text-danger p-1 min-h-touch"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Quantity */}
        <div>
          <label className="block text-xs font-medium text-steel-600 mb-1">
            <Hash className="w-3 h-3 inline mr-1" />
            จำนวน
          </label>
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                const newQty = Math.max(0, item.quantity - 1);
                onChange(index, { quantity: newQty, total: newQty * item.price });
              }}
              className="w-9 h-9 flex items-center justify-center bg-steel-100 rounded-lg text-steel-600 hover:bg-steel-200"
            >
              <Minus className="w-4 h-4" />
            </button>
            <input
              type="number"
              step="0.01"
              min="0"
              max={100000}
              inputMode="decimal"
              value={item.quantity || ""}
              onChange={(e) => {
                const qty = Math.max(0, parseFloat(e.target.value) || 0);
                onChange(index, { quantity: qty, total: qty * item.price });
              }}
              className="flex-1 px-2 py-2 bg-steel-50 border border-steel-200 rounded-lg text-sm text-center font-medium focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary min-h-input"
            />
            <button
              onClick={() => {
                const newQty = Math.min(100000, item.quantity + 1);
                onChange(index, { quantity: newQty, total: newQty * item.price });
              }}
              className="w-9 h-9 flex items-center justify-center bg-steel-100 rounded-lg text-steel-600 hover:bg-steel-200"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Price per unit */}
        <div>
          <label className="block text-xs font-medium text-steel-600 mb-1">
            <DollarSign className="w-3 h-3 inline mr-1" />
            ราคาขาย / หน่วย
          </label>
          <input
            type="number"
            step="0.5"
            min="0"
            inputMode="decimal"
            value={item.price || ""}
            onChange={(e) => {
              const ppu = parseFloat(e.target.value) || 0;
              onChange(index, { price: ppu, total: item.quantity * ppu });
            }}
            placeholder="0.00"
            className="w-full px-3 py-2.5 bg-steel-50 border border-steel-200 rounded-lg text-sm text-right font-medium focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary min-h-input"
          />
        </div>
      </div>

      {/* Total */}
      <div className="flex justify-between items-center pt-1 border-t border-steel-100">
        <span className="text-xs text-steel-500">รวม</span>
        <span className="text-sm font-bold text-success">
          {formatCurrency(item.total)}
        </span>
      </div>
    </div>
  );
}
