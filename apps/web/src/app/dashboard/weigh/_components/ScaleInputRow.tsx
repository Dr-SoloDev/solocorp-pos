"use client";

import { useMemo } from "react";
import { formatCurrency } from "@/lib/utils";
import type { WeighItem } from "./types";
import { Weight, Percent, DollarSign, Tag, Trash2 } from "lucide-react";

export function ScaleInputRow({
  item,
  index,
  onChange,
  onRemove,
}: {
  item: WeighItem;
  index: number;
  onChange: (_: number, __: Partial<Omit<WeighItem, "tempId">>) => void;
  onRemove: (_: number) => void;
}) {
  const deductionWeight = useMemo(
    () => (item.weight * item.deduction_pct) / 100,
    [item.weight, item.deduction_pct]
  );
  const netWeight = useMemo(
    () => Math.max(0, item.weight - deductionWeight),
    [item.weight, deductionWeight]
  );
  const total = useMemo(
    () => netWeight * item.price_per_unit,
    [netWeight, item.price_per_unit]
  );

  return (
    <div className="bg-white rounded-lg p-4 shadow-card space-y-3">
      {/* Header: item name + remove */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0 flex-1 mr-2">
          <Tag className="w-4 h-4 text-primary shrink-0" />
          <span className="font-medium text-steel-800 text-sm truncate">
            {item.name || "เลือกสินค้า"}
          </span>
        </div>
        <button
          onClick={() => onRemove(index)}
          className="text-steel-400 hover:text-danger p-1 min-h-touch min-w-touch flex items-center justify-center"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Weight (kg) */}
        <div>
          <label className="block text-xs font-medium text-steel-600 mb-1">
            <Weight className="w-3 h-3 inline mr-1" />
            น้ำหนัก (กก.)
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            inputMode="decimal"
            value={item.weight || ""}
            onChange={(e) =>
              onChange(index, { weight: parseFloat(e.target.value) || 0 })
            }
            placeholder="0.00"
            className="w-full px-3 py-2.5 bg-steel-50 border border-steel-200 rounded-lg text-sm text-right font-medium focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary min-h-input"
          />
        </div>

        {/* Deduction % */}
        <div>
          <label className="block text-xs font-medium text-steel-600 mb-1">
            <Percent className="w-3 h-3 inline mr-1" />
            ส่วนลดน้ำหนัก (%)
          </label>
          <div className="relative">
            <input
              type="number"
              step="0.5"
              min="0"
              max="100"
              value={item.deduction_pct || ""}
              onChange={(e) => {
                const val = Math.min(100, Math.max(0, parseFloat(e.target.value) || 0));
                onChange(index, { deduction_pct: val });
              }}
              placeholder="0"
              className="w-full px-3 py-2.5 bg-steel-50 border border-steel-200 rounded-lg text-sm text-right font-medium focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary min-h-input pr-7"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-steel-400 text-xs">
              %
            </span>
          </div>
        </div>

        {/* Price per unit */}
        <div>
          <label className="block text-xs font-medium text-steel-600 mb-1">
            <DollarSign className="w-3 h-3 inline mr-1" />
            ราคา (บาท/กก.)
          </label>
          <input
            type="number"
            step="0.5"
            min="0"
            inputMode="decimal"
            value={item.price_per_unit || ""}
            onChange={(e) =>
              onChange(index, { price_per_unit: parseFloat(e.target.value) || 0 })
            }
            placeholder="0.00"
            className="w-full px-3 py-2.5 bg-steel-50 border border-steel-200 rounded-lg text-sm text-right font-medium focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary min-h-input"
          />
        </div>

        {/* Condition / Tier */}
        <div>
          <label className="block text-xs font-medium text-steel-600 mb-1">
            <Tag className="w-3 h-3 inline mr-1" />
            เกรด
          </label>
          <select
            value={`${item.condition_id}|${item.tier_label}`}
            onChange={(e) => {
              const value = e.target.value;
              const sep = value.indexOf("|");
              const [cid, tier] = sep >= 0
                ? [value.slice(0, sep), value.slice(sep + 1)]
                : [value, ""];
              onChange(index, {
                condition_id: parseInt(cid!) || 1,
                tier_label: tier || "",
              });
            }}
            className="w-full px-3 py-2.5 bg-steel-50 border border-steel-200 rounded-lg text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary min-h-input"
          >
            <option value="1|ปกติ">ปกติ</option>
            <option value="1|บิล 1">บิล 1</option>
            <option value="2|บิล 2">บิล 2</option>
            <option value="3|บิล 3">บิล 3</option>
          </select>
        </div>
      </div>

      {/* Calculation Breakdown */}
      <div className="bg-steel-50 rounded-lg p-3 space-y-1 text-xs">
        <div className="flex justify-between text-steel-500">
          <span>น้ำหนักรวม</span>
          <span className="font-medium">{item.weight.toFixed(2)} กก.</span>
        </div>
        {item.deduction_pct > 0 && (
          <div className="flex justify-between text-warning">
            <span>หักน้ำหนัก ({item.deduction_pct}%)</span>
            <span className="font-medium">-{deductionWeight.toFixed(2)} กก.</span>
          </div>
        )}
        <div className="flex justify-between text-steel-600">
          <span>น้ำหนักสุทธิ</span>
          <span className="font-semibold">{netWeight.toFixed(2)} กก.</span>
        </div>
        <div className="border-t border-steel-200 pt-1 flex justify-between text-sm font-bold text-primary">
          <span>รวมเป็นเงิน</span>
          <span>{formatCurrency(total)}</span>
        </div>
      </div>
    </div>
  );
}
