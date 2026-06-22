"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { apiBridge, BridgeApiError } from "@/lib/api-bridge";
import DashboardShell from "@/lib/components/shell/DashboardShell";
import { formatCurrency } from "@/lib/utils";
import type {
  InventoryItemDTO,
  BranchDTO,
} from "@/lib/api-bridge/types";
import {
  DollarSign,
  Plus,
  Trash2,
  Search,
  X,
  User,
  Package,
  CheckCircle,
  ArrowLeft,
  AlertTriangle,
  Receipt,
  Minus,
  Loader2,
  Building2,
  Phone,
  FileText,
  ChevronDown,
  ShoppingBag,
  Hash,
} from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────────────────

interface SaleItem {
  tempId: string;
  purchase_order_item_id: number;
  catalog_item_name: string;
  category_name: string;
  available_qty: number;
  quantity: number;
  price_per_unit: number;
  total: number;
}

type Step = "buyer" | "items" | "review";

// ─── Buyer Info Form ────────────────────────────────────────────────────────

function BuyerForm({
  buyerName,
  buyerPhone,
  onChange,
}: {
  buyerName: string;
  buyerPhone: string;
  onChange: (name: string, phone: string) => void;
}) {
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-steel-700 mb-1">
          ชื่อผู้ซื้อ / ลูกค้า <span className="text-danger">*</span>
        </label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-steel-400" />
          <input
            type="text"
            value={buyerName}
            onChange={(e) => onChange(e.target.value, buyerPhone)}
            placeholder="ชื่อผู้ซื้อ"
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

// ─── Inventory Item Picker ──────────────────────────────────────────────────

function InventoryItemPicker({
  onSelect,
  onClose,
}: {
  onSelect: (item: InventoryItemDTO) => void;
  onClose: () => void;
}) {
  const [items, setItems] = useState<InventoryItemDTO[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    apiBridge.inventory
      .getAll({ limit: 200 })
      .then((res) => setItems(res.data))
      .catch(() => setError("ไม่สามารถโหลดสต็อกได้"))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(
    () =>
      search
        ? items.filter(
            (i) =>
              (i.catalog_item_name || "")
                .toLowerCase()
                .includes(search.toLowerCase()) ||
              (i.category_name || "")
                .toLowerCase()
                .includes(search.toLowerCase())
          )
        : items,
    [items, search]
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex items-end sm:items-center sm:justify-center">
      <div className="bg-white w-full sm:max-w-md sm:rounded-xl rounded-t-xl max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-steel-200">
          <h3 className="text-sm font-semibold text-steel-800">
            เลือกสินค้าจากคลัง
          </h3>
          <button
            onClick={onClose}
            className="text-steel-400 hover:text-steel-600 p-1 min-h-touch"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-3 border-b border-steel-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-steel-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ค้นหาสินค้าในคลัง..."
              className="w-full pl-9 pr-3 py-2 text-sm bg-steel-50 border border-steel-200 rounded-lg focus:border-primary focus:outline-none"
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-8 text-center text-sm text-steel-400">
              กำลังโหลด...
            </div>
          ) : error ? (
            <div className="p-8 text-center text-sm text-danger">{error}</div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-sm text-steel-400">
              ไม่พบสินค้าในคลัง
            </div>
          ) : (
            <div className="divide-y divide-steel-50">
              {filtered.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelect(item);
                    onClose();
                  }}
                  disabled={item.available_qty <= 0}
                  className="w-full text-left px-4 py-3.5 hover:bg-steel-50 active:bg-steel-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1 mr-2">
                      <p className="text-sm font-medium text-steel-800 truncate">
                        {item.catalog_item_name}
                      </p>
                      <p className="text-xs text-steel-400 mt-0.5">
                        {item.category_name || "ทั่วไป"}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p
                        className={`text-sm font-semibold ${
                          item.available_qty > 0
                            ? "text-primary"
                            : "text-steel-400"
                        }`}
                      >
                        คงเหลือ {item.available_qto} {item.unit}
                      </p>
                      {item.available_qty <= 0 && (
                        <p className="text-[10px] text-danger mt-0.5">
                          สินค้าหมด
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Sale Item Row ──────────────────────────────────────────────────────────

function SaleItemRow({
  item,
  index,
  onChange,
  onRemove,
}: {
  item: SaleItem;
  index: number;
  onChange: (i: number, updates: Partial<SaleItem>) => void;
  onRemove: (i: number) => void;
}) {
  return (
    <div className="bg-white rounded-lg p-4 shadow-card space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0 flex-1 mr-2">
          <Package className="w-4 h-4 text-primary shrink-0" />
          <div className="min-w-0">
            <p className="text-sm font-medium text-steel-800 truncate">
              {item.catalog_item_name}
            </p>
            <p className="text-xs text-steel-400">
              {item.category_name} · คงเหลือ {item.available_qty}
            </p>
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
                onChange(index, {
                  quantity: newQty,
                  total: newQty * item.price_per_unit,
                });
              }}
              className="w-9 h-9 flex items-center justify-center bg-steel-100 rounded-lg text-steel-600 hover:bg-steel-200"
            >
              <Minus className="w-4 h-4" />
            </button>
            <input
              type="number"
              step="0.01"
              min="0"
              max={item.available_qty}
              inputMode="decimal"
              value={item.quantity || ""}
              onChange={(e) => {
                const qty = Math.min(
                  item.available_qty,
                  Math.max(0, parseFloat(e.target.value) || 0)
                );
                onChange(index, {
                  quantity: qty,
                  total: qty * item.price_per_unit,
                });
              }}
              className="flex-1 px-2 py-2 bg-steel-50 border border-steel-200 rounded-lg text-sm text-center font-medium focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary min-h-input"
            />
            <button
              onClick={() => {
                const newQty = Math.min(
                  item.available_qty,
                  item.quantity + 1
                );
                onChange(index, {
                  quantity: newQty,
                  total: newQty * item.price_per_unit,
                });
              }}
              disabled={item.quantity >= item.available_qty}
              className="w-9 h-9 flex items-center justify-center bg-steel-100 rounded-lg text-steel-600 hover:bg-steel-200 disabled:opacity-50"
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
            value={item.price_per_unit || ""}
            onChange={(e) => {
              const ppu = parseFloat(e.target.value) || 0;
              onChange(index, {
                price_per_unit: ppu,
                total: item.quantity * ppu,
              });
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

// ─── Empty Sale State ───────────────────────────────────────────────────────

function EmptySaleState({ onAdd }: { onAdd: () => void }) {
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

// ─── Main Payment Screen ────────────────────────────────────────────────────

let _tempIdCounter = 0;
function newTempId(): string {
  return `sale_${++_tempIdCounter}_${Date.now()}`;
}

export default function PaymentScreen() {
  // ── State ──────────────────────────────────────────
  const [step, setStep] = useState<Step>("buyer");
  const [buyerName, setBuyerName] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [items, setItems] = useState<SaleItem[]>([]);
  const [notes, setNotes] = useState("");
  const [showInventory, setShowInventory] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [success, setSuccess] = useState<{ ref: string; amount: number } | null>(
    null
  );

  // ── Computed ───────────────────────────────────────
  const grandTotal = useMemo(
    () => items.reduce((sum, i) => sum + i.total, 0),
    [items]
  );

  const validItems = useMemo(
    () => items.filter((i) => i.quantity > 0 && i.total > 0),
    [items]
  );

  // ── Handlers ───────────────────────────────────────
  const handleSelectInventoryItem = useCallback(
    (inv: InventoryItemDTO) => {
      setItems((prev) => [
        ...prev,
        {
          tempId: newTempId(),
          purchase_order_item_id: inv.purchase_order_item_id,
          catalog_item_name: inv.catalog_item_name,
          category_name: inv.category_name || "",
          available_qty: inv.available_qty,
          quantity: 0,
          price_per_unit: 0,
          total: 0,
        },
      ]);
    },
    []
  );

  const handleUpdateItem = useCallback(
    (index: number, updates: Partial<SaleItem>) => {
      setItems((prev) => {
        const next = [...prev];
        next[index] = { ...next[index], ...updates };
        return next;
      });
    },
    []
  );

  const handleRemoveItem = useCallback((index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }, []);

  // ── Submit ─────────────────────────────────────────
  const handleSubmit = async () => {
    if (!buyerName.trim() || validItems.length === 0) return;
    setSubmitting(true);
    setSubmitError("");

    try {
      const result = await apiBridge.sales.create({
        branch_id: 1,
        buyer_name: buyerName.trim(),
        buyer_phone: buyerPhone.trim() || undefined,
        notes: notes.trim() || undefined,
        items: validItems.map((i) => ({
          purchase_order_item_id: i.purchase_order_item_id,
          quantity: i.quantity,
          price_per_unit: i.price_per_unit,
          total: i.total,
        })),
      });

      setSuccess({
        ref: result.data.reference_no,
        amount: result.data.total_amount,
      });
    } catch (err) {
      setSubmitError(
        err instanceof BridgeApiError
          ? err.userMessage
          : "ไม่สามารถสร้างใบขายได้ กรุณาลองใหม่"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setStep("buyer");
    setBuyerName("");
    setBuyerPhone("");
    setItems([]);
    setNotes("");
    setSubmitError("");
    setSuccess(null);
  };

  // ── Success View ────────────────────────────────────
  if (success) {
    return (
      <DashboardShell>
        <div className="flex flex-col items-center justify-center py-20 px-lg text-center">
          <div className="w-16 h-16 rounded-full bg-success-light flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-success" />
          </div>
          <h2 className="text-lg font-bold text-steel-900 mb-1">
            บันทึกการขายสำเร็จ
          </h2>
          <p className="text-steel-500 text-sm mb-2">
            เลขที่ {success.ref}
          </p>
          <p className="text-2xl font-bold text-success mb-6">
            {formatCurrency(success.amount)}
          </p>
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-success text-white text-sm font-medium rounded-md min-h-touch"
          >
            <Plus className="w-4 h-4" />
            ขายรายการใหม่
          </button>
        </div>
      </DashboardShell>
    );
  }

  // ── Step Indicator ────────────────────────────────
  const renderStepIndicator = () => {
    const stepIndex = ["buyer", "items", "review"].indexOf(step);
    const stepLabels: Record<Step, string> = {
      buyer: "ผู้ซื้อ",
      items: "สินค้า",
      review: "ยืนยัน",
    };

    return (
      <div className="flex items-center gap-1 px-lg pt-3 pb-1">
        {(["buyer", "items", "review"] as Step[]).map((s, i) => (
          <div key={s} className="flex items-center gap-1 flex-1">
            <div
              className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                i <= stepIndex
                  ? "bg-success text-white"
                  : "bg-steel-200 text-steel-400"
              }`}
            >
              {i + 1}
            </div>
            <span
              className={`text-xs ${
                i <= stepIndex ? "text-success font-medium" : "text-steel-400"
              }`}
            >
              {stepLabels[s]}
            </span>
            {i < 2 && <div className="flex-1 h-0.5 bg-steel-200 ml-1" />}
          </div>
        ))}
      </div>
    );
  };

  // ── Buyer Step ──────────────────────────────────
  const renderBuyerStep = () => (
    <div className="px-lg pt-4 space-y-4">
      <h2 className="text-base font-bold text-steel-900">
        ข้อมูลผู้ซื้อ
      </h2>

      <BuyerForm
        buyerName={buyerName}
        buyerPhone={buyerPhone}
        onChange={(name, phone) => {
          setBuyerName(name);
          setBuyerPhone(phone);
        }}
      />

      <button
        onClick={() => setStep("items")}
        disabled={!buyerName.trim()}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-success text-white text-sm font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed min-h-touch mt-4"
      >
        ถัดไป
        <ChevronDown className="w-4 h-4 -rotate-90" />
      </button>
    </div>
  );

  // ── Items Step ───────────────────────────────────
  const renderItemsStep = () => (
    <div className="pb-24">
      {renderStepIndicator()}

      <div className="px-lg pt-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-steel-900">
            รายการขาย
          </h2>
          {items.length > 0 && (
            <span className="text-xs text-steel-400 bg-steel-100 px-2 py-0.5 rounded-full">
              {items.length} รายการ
            </span>
          )}
        </div>

        {items.length === 0 ? (
          <EmptySaleState onAdd={() => setShowInventory(true)} />
        ) : (
          <>
            <div className="space-y-3">
              {items.map((item, index) => (
                <SaleItemRow
                  key={item.tempId}
                  item={item}
                  index={index}
                  onChange={handleUpdateItem}
                  onRemove={handleRemoveItem}
                />
              ))}
            </div>

            <button
              onClick={() => setShowInventory(true)}
              className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-success/30 rounded-lg text-sm text-success hover:bg-success/5 transition-colors min-h-touch"
            >
              <Plus className="w-4 h-4" />
              เพิ่มสินค้า
            </button>

            {/* Grand Total */}
            <div className="bg-white rounded-lg p-4 shadow-card">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-steel-600">
                  รวมทั้งสิ้น
                </span>
                <span className="text-xl font-bold text-success">
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
                onChange={(e) => setNotes(e.target.value)}
                placeholder="บันทึกเพิ่มเติม..."
                rows={2}
                className="w-full px-3 py-2.5 bg-white border border-steel-200 rounded-lg text-sm placeholder:text-steel-400 focus:border-success focus:outline-none focus:ring-1 focus:ring-success resize-none"
              />
            </div>

            {/* Next */}
            <button
              onClick={() => setStep("review")}
              disabled={validItems.length === 0}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-success text-white text-sm font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed min-h-touch"
            >
              ตรวจสอบและยืนยัน
              <ChevronDown className="w-4 h-4 -rotate-90" />
            </button>
          </>
        )}
      </div>
    </div>
  );

  // ── Review Step ──────────────────────────────────
  const renderReviewStep = () => (
    <div className="pb-24">
      {renderStepIndicator()}

      <div className="px-lg pt-4 space-y-4">
        {/* Buyer */}
        <div className="bg-white rounded-lg p-4 shadow-card">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-steel-700">
              ข้อมูลผู้ซื้อ
            </h3>
            <button
              onClick={() => setStep("buyer")}
              className="text-xs text-success font-medium min-h-touch px-2"
            >
              แก้ไข
            </button>
          </div>
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-steel-400" />
            <span className="text-sm text-steel-800">{buyerName}</span>
          </div>
          {buyerPhone && (
            <div className="flex items-center gap-2 mt-1">
              <Phone className="w-4 h-4 text-steel-400" />
              <span className="text-sm text-steel-600">{buyerPhone}</span>
            </div>
          )}
        </div>

        {/* Items */}
        <div className="bg-white rounded-lg p-4 shadow-card">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-steel-700">
              รายการขาย
            </h3>
            <button
              onClick={() => setStep("items")}
              className="text-xs text-success font-medium min-h-touch px-2"
            >
              แก้ไข
            </button>
          </div>

          <div className="space-y-2">
            {validItems.map((item, i) => (
              <div
                key={item.tempId}
                className="flex items-center justify-between text-sm"
              >
                <div className="min-w-0 flex-1 mr-2">
                  <p className="font-medium text-steel-800 truncate">
                    {i + 1}. {item.catalog_item_name}
                  </p>
                  <p className="text-xs text-steel-400">
                    {item.quantity} × {formatCurrency(item.price_per_unit)}
                  </p>
                </div>
                <span className="font-semibold text-steel-900 shrink-0">
                  {formatCurrency(item.total)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Notes */}
        {notes && (
          <div className="bg-white rounded-lg p-4 shadow-card">
            <h3 className="text-sm font-semibold text-steel-700 mb-1">
              หมายเหตุ
            </h3>
            <p className="text-sm text-steel-600">{notes}</p>
          </div>
        )}

        {/* Grand Total */}
        <div className="bg-success-light rounded-lg p-4 border border-success/20">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-steel-700">
              ยอดรวมทั้งสิ้น
            </span>
            <span className="text-2xl font-bold text-success">
              {formatCurrency(grandTotal)}
            </span>
          </div>
        </div>

        {/* Error */}
        {submitError && (
          <div className="flex items-start gap-2 p-3 bg-danger-light rounded-lg text-sm text-danger">
            <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{submitError}</span>
          </div>
        )}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-success text-white text-sm font-medium rounded-lg disabled:opacity-70 min-h-touch"
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              กำลังบันทึก...
            </>
          ) : (
            <>
              <Receipt className="w-4 h-4" />
              บันทึกการขาย
            </>
          )}
        </button>
      </div>
    </div>
  );

  // ── Main Render ──────────────────────────────────
  return (
    <DashboardShell>
      {/* Inventory Picker Overlay */}
      {showInventory && (
        <InventoryItemPicker
          onSelect={(item) => {
            handleSelectInventoryItem(item);
            setShowInventory(false);
          }}
          onClose={() => setShowInventory(false)}
        />
      )}

      {/* Header */}
      <div className="sticky top-0 z-20 bg-steel-50 border-b border-steel-200">
        <div className="flex items-center h-12 px-lg">
          {step !== "buyer" ? (
            <button
              onClick={() => {
                if (step === "review") setStep("items");
                else setStep("buyer");
              }}
              className="inline-flex items-center gap-1 text-sm text-steel-600 font-medium min-h-touch"
            >
              <ArrowLeft className="w-4 h-4" />
              กลับ
            </button>
          ) : (
            <h1 className="text-base font-bold text-steel-900 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-success" />
              ขาย / ชำระเงิน
            </h1>
          )}
        </div>
      </div>

      {step === "buyer" && renderBuyerStep()}
      {step === "items" && renderItemsStep()}
      {step === "review" && renderReviewStep()}
    </DashboardShell>
  );
}
