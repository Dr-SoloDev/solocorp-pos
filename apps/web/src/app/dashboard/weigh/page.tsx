"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { apiBridge, BridgeApiError } from "@/lib/api-bridge";
import DashboardShell from "@/lib/components/shell/DashboardShell";
import { formatCurrency } from "@/lib/utils";
import type {
  SellerDTO,
  CatalogItemDTO,
  ItemConditionDTO,
  TierPriceDTO,
} from "@/lib/api-bridge/types";
import {
  Scale,
  Plus,
  Minus,
  Trash2,
  ChevronDown,
  Search,
  X,
  User,
  Tag,
  FileText,
  CheckCircle,
  ArrowLeft,
  AlertTriangle,
  RefreshCw,
  Package,
  Hash,
  DollarSign,
  Weight,
  Percent,
  Receipt,
  Loader2,
} from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────────────────

interface WeighItem {
  tempId: string;
  catalog_item_id: number;
  name: string;
  category_id: number;
  condition_id: number;
  condition_name: string;
  tier_label: string;
  weight: number; // kg — raw scale weight
  deduction_pct: number; // deduction percentage (0–100)
  deduction_weight: number; // calculated deduction in kg
  net_weight: number; // weight - deduction_weight
  price_per_unit: number; // per kg after tier
  total: number; // net_weight × price_per_unit
  unit: string;
}

type Step = "seller" | "items" | "review";

// ─── Seller Selector ────────────────────────────────────────────────────────

function SellerSelector({
  sellerId,
  sellerName,
  onChange,
}: {
  sellerId: number | null;
  sellerName: string;
  onChange: (id: number | null, name: string) => void;
}) {
  const [sellers, setSellers] = useState<SellerDTO[]>([]);
  const [search, setSearch] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!show) return;
    setLoading(true);
    apiBridge.sellers
      .getAll({ limit: 100 })
      .then((res) => setSellers(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [show]);

  const filtered = useMemo(
    () =>
      search
        ? sellers.filter(
            (s) =>
              s.full_name.toLowerCase().includes(search.toLowerCase()) ||
              s.phone.includes(search)
          )
        : sellers,
    [sellers, search]
  );

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-steel-700">
        ผู้ขาย / ลูกค้า
      </label>

      {sellerId ? (
        <div className="flex items-center justify-between bg-white rounded-lg p-3 shadow-card">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-primary" />
            <span className="font-medium text-steel-800">{sellerName}</span>
          </div>
          <button
            onClick={() => onChange(null, "")}
            className="text-sm text-steel-400 hover:text-danger min-h-touch px-2"
          >
            เปลี่ยน
          </button>
        </div>
      ) : (
        <div className="relative">
          <button
            onClick={() => setShow(!show)}
            className="w-full flex items-center justify-between bg-white border border-steel-200 rounded-lg px-4 py-3 text-left text-steel-400 min-h-touch"
          >
            <span>เลือกผู้ขาย</span>
            <ChevronDown className="w-4 h-4" />
          </button>

          {show && (
            <div className="absolute top-full left-0 right-0 z-40 mt-1 bg-white border border-steel-200 rounded-lg shadow-lg max-h-64 overflow-hidden">
              {/* search */}
              <div className="sticky top-0 bg-white border-b border-steel-100 p-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-steel-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="ค้นหาชื่อหรือเบอร์โทร..."
                    className="w-full pl-9 pr-3 py-2 text-sm bg-steel-50 border border-steel-200 rounded-md focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div className="overflow-y-auto max-h-48">
                {loading ? (
                  <div className="p-4 text-center text-sm text-steel-400">
                    กำลังโหลด...
                  </div>
                ) : filtered.length === 0 ? (
                  <div className="p-4 text-center text-sm text-steel-400">
                    ไม่พบผู้ขาย
                  </div>
                ) : (
                  filtered.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => {
                        onChange(s.id, s.full_name);
                        setShow(false);
                        setSearch("");
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-steel-50 border-b border-steel-50 last:border-0"
                    >
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-steel-400 shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-steel-800 truncate">
                            {s.full_name}
                          </p>
                          <p className="text-xs text-steel-400">
                            {s.phone}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Scale Input Row ────────────────────────────────────────────────────────

function ScaleInputRow({
  item,
  index,
  onChange,
  onRemove,
}: {
  item: WeighItem;
  index: number;
  onChange: (i: number, updates: Partial<WeighItem>) => void;
  onRemove: (i: number) => void;
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
              const [cid, tier] = e.target.value.split("|");
              onChange(index, {
                condition_id: parseInt(cid),
                tier_label: tier,
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

// ─── Catalog Item Picker ────────────────────────────────────────────────────

function CatalogItemPicker({
  onSelect,
  onClose,
}: {
  onSelect: (item: CatalogItemDTO) => void;
  onClose: () => void;
}) {
  const [catalog, setCatalog] = useState<CatalogItemDTO[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    apiBridge.catalog
      .getAllItems({ limit: 200 })
      .then((res) => setCatalog(res.data))
      .catch(() => setError("ไม่สามารถโหลดรายการสินค้าได้"))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(
    () =>
      search
        ? catalog.filter(
            (c) =>
              c.name.toLowerCase().includes(search.toLowerCase()) ||
              c.code.toLowerCase().includes(search.toLowerCase())
          )
        : catalog,
    [catalog, search]
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex items-end sm:items-center sm:justify-center">
      <div className="bg-white w-full sm:max-w-md sm:rounded-xl rounded-t-xl max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-steel-200">
          <h3 className="text-sm font-semibold text-steel-800">เลือกสินค้า</h3>
          <button
            onClick={onClose}
            className="text-steel-400 hover:text-steel-600 p-1 min-h-touch min-w-touch flex items-center justify-center"
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
              placeholder="ค้นหาสินค้า..."
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
              ไม่พบสินค้า
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
                  className="w-full text-left px-4 py-3.5 hover:bg-steel-50 active:bg-steel-100 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1 mr-2">
                      <p className="text-sm font-medium text-steel-800 truncate">
                        {item.name}
                      </p>
                      <p className="text-xs text-steel-400 mt-0.5">
                        {item.category_name || "ทั่วไป"} · {item.default_unit}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-semibold text-primary">
                        {formatCurrency(item.default_price)}
                      </p>
                      <p className="text-[10px] text-steel-400">/{item.default_unit}</p>
                    </div>
                  </div>

                  {/* Tier prices */}
                  {item.tier_prices && item.tier_prices.length > 0 && (
                    <div className="flex gap-1.5 mt-2 flex-wrap">
                      {item.tier_prices.map((tier: TierPriceDTO) => (
                        <span
                          key={tier.label}
                          className="text-[10px] px-1.5 py-0.5 bg-steel-100 text-steel-500 rounded"
                        >
                          {tier.label}: {formatCurrency(tier.price)}
                        </span>
                      ))}
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Empty Items State ──────────────────────────────────────────────────────

function EmptyWeighState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-lg text-center">
      <div className="w-14 h-14 rounded-full bg-primary-50 flex items-center justify-center mb-4">
        <Scale className="w-7 h-7 text-primary" />
      </div>
      <p className="text-steel-700 font-medium mb-1">ยังไม่มีรายการชั่ง</p>
      <p className="text-sm text-steel-500 mb-4 max-w-xs">
        เพิ่มสินค้าที่ต้องการชั่งน้ำหนัก ก่อนสร้างใบรับซื้อ
      </p>
      <button
        onClick={onAdd}
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-sm font-medium rounded-md shadow-button min-h-touch"
      >
        <Plus className="w-4 h-4" />
        เพิ่มรายการชั่ง
      </button>
    </div>
  );
}

// ─── Payment Method Selector ────────────────────────────────────────────────

function PaymentSelector({
  value,
  onChange,
}: {
  value: "cash" | "bank_transfer";
  onChange: (v: "cash" | "bank_transfer") => void;
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
                ? "bg-primary text-white border-primary"
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

// ─── Main Weigh Screen ──────────────────────────────────────────────────────

let _tempIdCounter = 0;
function newTempId(): string {
  return `item_${++_tempIdCounter}_${Date.now()}`;
}

export default function WeighScreen() {
  // ── State ──────────────────────────────────────────
  const [step, setStep] = useState<Step>("seller");
  const [sellerId, setSellerId] = useState<number | null>(null);
  const [sellerName, setSellerName] = useState("");
  const [items, setItems] = useState<WeighItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "bank_transfer">("cash");
  const [notes, setNotes] = useState("");
  const [showCatalog, setShowCatalog] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [success, setSuccess] = useState<{ ref: string; amount: number } | null>(null);

  // Default values from first catalog item (or base defaults)
  const getNewItem = useCallback(
    (catalogItem: CatalogItemDTO): WeighItem => {
      const defaultPrice =
        catalogItem.tier_prices?.[0]?.price || catalogItem.default_price;
      return {
        tempId: newTempId(),
        catalog_item_id: catalogItem.id,
        name: catalogItem.name,
        category_id: catalogItem.category_id,
        condition_id: 1,
        condition_name: "ปกติ",
        tier_label: "ปกติ",
        weight: 0,
        deduction_pct: 0,
        deduction_weight: 0,
        net_weight: 0,
        price_per_unit: defaultPrice,
        total: 0,
        unit: catalogItem.default_unit || "กก.",
      };
    },
    []
  );

  // ── Handlers ───────────────────────────────────────
  const handleAddItem = useCallback(
    (catalogItem: CatalogItemDTO) => {
      setItems((prev) => [...prev, getNewItem(catalogItem)]);
    },
    [getNewItem]
  );

  const handleUpdateItem = useCallback(
    (index: number, updates: Partial<WeighItem>) => {
      setItems((prev) => {
        const next = [...prev];
        const updated = { ...next[index], ...updates };
        // Recalculate
        const deductionWeight =
          (updated.weight * updated.deduction_pct) / 100;
        updated.deduction_weight = deductionWeight;
        updated.net_weight = Math.max(0, updated.weight - deductionWeight);
        updated.total = updated.net_weight * updated.price_per_unit;
        next[index] = updated;
        return next;
      });
    },
    []
  );

  const handleRemoveItem = useCallback((index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const grandTotal = useMemo(
    () => items.reduce((sum, item) => sum + item.total, 0),
    [items]
  );

  // ── Submit ─────────────────────────────────────────
  const handleSubmit = async () => {
    if (!sellerId || items.length === 0) return;
    setSubmitting(true);
    setSubmitError("");

    try {
      const result = await apiBridge.purchase.create({
        seller_id: sellerId,
        branch_id: 1, // Default branch (HQ)
        payment_method: paymentMethod,
        notes: notes || undefined,
        items: items.map((item) => ({
          catalog_item_id: item.catalog_item_id,
          name: item.name,
          category_id: item.category_id,
          condition_id: item.condition_id,
          quantity: item.net_weight, // Use net weight as effective qty
          unit: item.unit,
          price_per_unit: item.price_per_unit,
          tier_label: item.tier_label,
          total: item.total,
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
          : "ไม่สามารถสร้างใบรับซื้อได้ กรุณาลองใหม่"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setStep("seller");
    setSellerId(null);
    setSellerName("");
    setItems([]);
    setPaymentMethod("cash");
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
            สร้างใบรับซื้อสำเร็จ
          </h2>
          <p className="text-steel-500 text-sm mb-2">
            เลขที่ {success.ref}
          </p>
          <p className="text-2xl font-bold text-primary mb-6">
            {formatCurrency(success.amount)}
          </p>
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-white text-sm font-medium rounded-md min-h-touch"
          >
            <Plus className="w-4 h-4" />
            สร้างรายการใหม่
          </button>
        </div>
      </DashboardShell>
    );
  }

  // ── Progress Steps ────────────────────────────────
  const renderStepIndicator = () => (
    <div className="flex items-center gap-1 px-lg pt-3 pb-1">
      {(["seller", "items", "review"] as Step[]).map((s, i) => {
        const idx = ["seller", "items", "review"].indexOf(step);
        const isActive = i <= idx;
        const labels: Record<Step, string> = {
          seller: "ผู้ขาย",
          items: "ชั่งน้ำหนัก",
          review: "ยืนยัน",
        };
        return (
          <div key={s} className="flex items-center gap-1 flex-1">
            <div
              className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                isActive
                  ? "bg-primary text-white"
                  : "bg-steel-200 text-steel-400"
              }`}
            >
              {i + 1}
            </div>
            <span
              className={`text-xs ${
                isActive ? "text-primary font-medium" : "text-steel-400"
              }`}
            >
              {labels[s]}
            </span>
            {i < 2 && <div className="flex-1 h-0.5 bg-steel-200 ml-1" />}
          </div>
        );
      })}
    </div>
  );

  // ── Seller Step ──────────────────────────────────
  const renderSellerStep = () => (
    <div className="px-lg pt-4 space-y-4">
      <h2 className="text-base font-bold text-steel-900">เลือกผู้ขาย</h2>

      <SellerSelector
        sellerId={sellerId}
        sellerName={sellerName}
        onChange={(id, name) => {
          setSellerId(id);
          setSellerName(name);
        }}
      />

      <button
        onClick={() => setStep("items")}
        disabled={!sellerId}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-white text-sm font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed min-h-touch mt-4"
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
            รายการชั่งน้ำหนัก
          </h2>
          {items.length > 0 && (
            <span className="text-xs text-steel-400 bg-steel-100 px-2 py-0.5 rounded-full">
              {items.length} รายการ
            </span>
          )}
        </div>

        {items.length === 0 ? (
          <EmptyWeighState onAdd={() => setShowCatalog(true)} />
        ) : (
          <>
            <div className="space-y-3">
              {items.map((item, index) => (
                <ScaleInputRow
                  key={item.tempId}
                  item={item}
                  index={index}
                  onChange={handleUpdateItem}
                  onRemove={handleRemoveItem}
                />
              ))}
            </div>

            <button
              onClick={() => setShowCatalog(true)}
              className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-steel-300 rounded-lg text-sm text-steel-500 hover:text-primary hover:border-primary transition-colors min-h-touch"
            >
              <Plus className="w-4 h-4" />
              เพิ่มรายการ
            </button>

            {/* Grand Total */}

            <div className="bg-white rounded-lg p-4 shadow-card">
              <div className="flex items-center justify-between">
                <span className="text-sm text-steel-600 font-medium">
                  รวมทั้งหมด
                </span>
                <span className="text-xl font-bold text-primary">
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
                className="w-full px-3 py-2.5 bg-white border border-steel-200 rounded-lg text-sm placeholder:text-steel-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none"
              />
            </div>

            {/* Payment Method */}
            <PaymentSelector
              value={paymentMethod}
              onChange={setPaymentMethod}
            />

            {/* Next */}
            <button
              onClick={() => setStep("review")}
              disabled={items.filter((i) => i.weight > 0 && i.total > 0).length === 0}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-white text-sm font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed min-h-touch"
            >
              ตรวจสอบและยืนยัน
              <ChevronDown className="w-4 h-4 -rotate-90" />
            </button>
          </>
        )}
      </div>
    </div>
  );

  // ── Review Step ───────────────────────────────────
  const renderReviewStep = () => (
    <div className="pb-24">
      {renderStepIndicator()}

      <div className="px-lg pt-4 space-y-4">
        {/* Seller */}
        <div className="bg-white rounded-lg p-4 shadow-card">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-steel-700">
              ข้อมูลผู้ขาย
            </h3>
            <button
              onClick={() => setStep("seller")}
              className="text-xs text-primary font-medium min-h-touch px-2"
            >
              แก้ไข
            </button>
          </div>
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-steel-400" />
            <span className="text-sm text-steel-800">{sellerName}</span>
          </div>
        </div>

        {/* Items Summary */}
        <div className="bg-white rounded-lg p-4 shadow-card">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-steel-700">
              รายการชั่งน้ำหนัก
            </h3>
            <button
              onClick={() => setStep("items")}
              className="text-xs text-primary font-medium min-h-touch px-2"
            >
              แก้ไข
            </button>
          </div>

          <div className="space-y-2">
            {items.map((item, i) => (
              <div
                key={item.tempId}
                className="flex items-center justify-between text-sm"
              >
                <div className="min-w-0 flex-1 mr-2">
                  <p className="font-medium text-steel-800 truncate">
                    {i + 1}. {item.name}
                  </p>
                  <p className="text-xs text-steel-400">
                    {item.net_weight.toFixed(2)} กก. × {formatCurrency(item.price_per_unit)}
                    {item.deduction_pct > 0 &&
                      ` (หัด ${item.deduction_pct}%)`}
                  </p>
                </div>
                <span className="font-semibold text-steel-900 shrink-0">
                  {formatCurrency(item.total)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Payment */}
        <div className="bg-white rounded-lg p-4 shadow-card space-y-2">
          <h3 className="text-sm font-semibold text-steel-700">
            วิธีการชำระเงิน
          </h3>
          <p className="text-sm text-steel-800">
            {paymentMethod === "cash" ? "💵 เงินสด" : "🏦 โอน"}
          </p>
          {notes && (
            <>
              <h3 className="text-sm font-semibold text-steel-700 mt-3">
                หมายเหตุ
              </h3>
              <p className="text-sm text-steel-600">{notes}</p>
            </>
          )}
        </div>

        {/* Grand Total */}
        <div className="bg-primary-50 rounded-lg p-4 border border-primary/20">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-steel-700">
              ยอดรวมทั้งสิ้น
            </span>
            <span className="text-2xl font-bold text-primary">
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
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-white text-sm font-medium rounded-lg disabled:opacity-70 min-h-touch"
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              กำลังสร้าง...
            </>
          ) : (
            <>
              <Receipt className="w-4 h-4" />
              สร้างใบรับซื้อ
            </>
          )}
        </button>
      </div>
    </div>
  );

  // ── Main Render ──────────────────────────────────
  return (
    <DashboardShell>
      {/* Catalog Picker Overlay */}
      {showCatalog && (
        <CatalogItemPicker
          onSelect={(item) => {
            handleAddItem(item);
            setShowCatalog(false);
          }}
          onClose={() => setShowCatalog(false)}
        />
      )}

      {/* Header */}
      <div className="sticky top-0 z-20 bg-steel-50 border-b border-steel-200">
        <div className="flex items-center h-12 px-lg">
          {step !== "seller" ? (
            <button
              onClick={() => {
                if (step === "review") setStep("items");
                else if (step === "items") {
                  if (items.length === 0) setStep("seller");
                  else setStep("seller");
                }
              }}
              className="inline-flex items-center gap-1 text-sm text-steel-600 font-medium min-h-touch"
            >
              <ArrowLeft className="w-4 h-4" />
              กลับ
            </button>
          ) : (
            <h1 className="text-base font-bold text-steel-900 flex items-center gap-2">
              <Scale className="w-5 h-5 text-primary" />
              ชั่งน้ำหนัก
            </h1>
          )}
        </div>
      </div>

      {step === "seller" && renderSellerStep()}
      {step === "items" && renderItemsStep()}
      {step === "review" && renderReviewStep()}
    </DashboardShell>
  );
}
