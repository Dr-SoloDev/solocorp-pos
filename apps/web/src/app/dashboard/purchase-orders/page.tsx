"use client";

import { useState, useEffect, useCallback } from "react";
import { apiBridge, BridgeApiError } from "@/lib/api-bridge";
import DashboardShell from "@/lib/components/shell/DashboardShell";
import { formatThaiDateTime, formatCurrency } from "@/lib/utils";
import type {
  PurchaseOrderDTO,
  PurchaseOrderItemDTO,
  CatalogItemDTO,
  SellerDTO,
  ItemConditionDTO,
  PaginationMeta,
} from "@/lib/api-bridge/types";
import {
  Search,
  Plus,
  X,
  Filter,
  ChevronDown,
  Package,
  User,
  Calendar,
  FileText,
  AlertTriangle,
  RefreshCw,
  CheckCircle,
  Ban,
  Clock,
  ArrowLeft,
  Layers,
  Hash,
  DollarSign,
  Scale,
  Tag,
  Barcode,
} from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────────────────

type POStatus = "active" | "cancelled";
type ViewMode = "list" | "create" | "detail";

// ─── Status Config ──────────────────────────────────────────────────────────

const statusConfig: Record<
  string,
  { label: string; bg: string; text: string; dot: string; icon: React.ReactNode }
> = {
  active: {
    label: "ดำเนินการ",
    bg: "bg-success-light",
    text: "text-success",
    dot: "bg-success",
    icon: <CheckCircle className="w-3.5 h-3.5" />,
  },
  cancelled: {
    label: "ยกเลิก",
    bg: "bg-danger-light",
    text: "text-danger",
    dot: "bg-danger",
    icon: <Ban className="w-3.5 h-3.5" />,
  },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = statusConfig[status] || {
    label: status,
    bg: "bg-steel-100",
    text: "text-steel-600",
    dot: "bg-steel-400",
    icon: <Clock className="w-3.5 h-3.5" />,
  };
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text}`}
    >
      {cfg.icon}
      {cfg.label}
    </span>
  );
}

// ─── Loading Skeleton ───────────────────────────────────────────────────────

function POSkeleton() {
  return (
    <div className="space-y-3 px-lg pt-lg animate-pulse">
      <div className="h-10 bg-steel-200 rounded-lg w-full" />
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="bg-white rounded-lg p-4 shadow-card space-y-2">
          <div className="h-4 bg-steel-200 rounded w-1/3" />
          <div className="h-3 bg-steel-100 rounded w-1/2" />
          <div className="flex justify-between">
            <div className="h-3 bg-steel-100 rounded w-1/4" />
            <div className="h-5 bg-steel-200 rounded w-16" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Error View ─────────────────────────────────────────────────────────────

function ErrorView({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-lg text-center">
      <div className="w-12 h-12 rounded-full bg-danger-light flex items-center justify-center mb-4">
        <AlertTriangle className="w-6 h-6 text-danger" />
      </div>
      <p className="text-steel-700 font-medium mb-1">เกิดข้อผิดพลาด</p>
      <p className="text-sm text-steel-500 mb-4">{message}</p>
      <button
        onClick={onRetry}
        className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-medium rounded-md min-h-touch"
      >
        <RefreshCw className="w-4 h-4" />
        ลองใหม่
      </button>
    </div>
  );
}

// ─── Empty State ────────────────────────────────────────────────────────────

function EmptyState({ onNewPO }: { onNewPO: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-lg text-center">
      <div className="w-14 h-14 rounded-full bg-primary-50 flex items-center justify-center mb-4">
        <Package className="w-7 h-7 text-primary" />
      </div>
      <p className="text-steel-700 font-medium mb-1">ยังไม่มีรายการรับซื้อ</p>
      <p className="text-sm text-steel-500 mb-4">
        กดปุ่มด้านล่างเพื่อเริ่มรายการรับซื้อแรก
      </p>
      <button
        onClick={onNewPO}
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-sm font-medium rounded-md shadow-button min-h-touch"
      >
        <Plus className="w-4 h-4" />
        สร้างใบรับซื้อ
      </button>
    </div>
  );
}

// ─── Search & Filter Bar ────────────────────────────────────────────────────

function SearchFilterBar({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
}: {
  searchQuery: string;
  onSearchChange: (v: string) => void;
  statusFilter: string;
  onStatusChange: (v: string) => void;
}) {
  const [showFilter, setShowFilter] = useState(false);

  return (
    <div className="sticky top-12 z-30 bg-steel-50 pt-3 pb-2 px-lg space-y-2">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-steel-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="ค้นหาเลขที่ใบรับซื้อ, ผู้ขาย..."
          className="w-full pl-9 pr-9 py-2.5 bg-white border border-steel-200 rounded-lg text-sm placeholder:text-steel-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary min-h-input"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 min-h-touch min-w-touch flex items-center justify-center"
          >
            <X className="w-4 h-4 text-steel-400" />
          </button>
        )}
      </div>

      {/* Filter Row */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setShowFilter(!showFilter)}
          className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-md border transition-colors min-h-touch ${
            statusFilter
              ? "bg-primary-50 border-primary text-primary"
              : "bg-white border-steel-200 text-steel-600 hover:bg-steel-50"
          }`}
        >
          <Filter className="w-3.5 h-3.5" />
          ตัวกรอง
          {statusFilter && <span className="ml-1 w-1.5 h-1.5 rounded-full bg-primary" />}
        </button>

        <div className="flex gap-1.5 flex-wrap">
          {["", "active", "cancelled"].map((s) => {
            const label =
              s === "" ? "ทั้งหมด" : s === "active" ? "ดำเนินการ" : "ยกเลิก";
            const isActive = statusFilter === s;
            return (
              <button
                key={s}
                onClick={() => onStatusChange(s)}
                className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors min-h-touch ${
                  isActive
                    ? "bg-primary text-white border-primary"
                    : "bg-white border-steel-200 text-steel-600 hover:bg-steel-50"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── PO Card ────────────────────────────────────────────────────────────────

function POCard({
  po,
  onClick,
}: {
  po: PurchaseOrderDTO;
  onClick: () => void;
}) {
  const cfg = statusConfig[po.status] || statusConfig.active;
  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white rounded-lg p-4 shadow-card hover:shadow-card-hover transition-shadow active:scale-[0.99]"
    >
      {/* Top Row */}
      <div className="flex items-start justify-between mb-2">
        <div className="min-w-0 flex-1 mr-2">
          <div className="flex items-center gap-2">
            <Hash className="w-3.5 h-3.5 text-steel-400 shrink-0" />
            <span className="text-sm font-semibold text-steel-900 truncate">
              {po.reference_no}
            </span>
          </div>
        </div>
        <StatusBadge status={po.status} />
      </div>

      {/* Info Rows */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-2 text-xs text-steel-500">
          <User className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">{po.seller_name || "ไม่ระบุผู้ขาย"}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-steel-500">
          <Calendar className="w-3.5 h-3.5 shrink-0" />
          <span>{formatThaiDateTime(po.created_at)}</span>
        </div>
      </div>

      {/* Amount */}
      <div className="mt-3 pt-3 border-t border-steel-100 flex items-center justify-between">
        <span className="text-xs text-steel-500">ยอดรวม</span>
        <span className="text-base font-bold text-primary">
          {formatCurrency(po.total_amount)}
        </span>
      </div>
    </button>
  );
}

// ─── PO Detail View ─────────────────────────────────────────────────────────

function PODetail({
  poId,
  onBack,
}: {
  poId: number;
  onBack: () => void;
}) {
  const [po, setPo] = useState<PurchaseOrderDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDetail = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await apiBridge.purchase.getById(poId);
      setPo(res.data);
    } catch (err) {
      setError(
        err instanceof BridgeApiError
          ? err.userMessage
          : "ไม่สามารถโหลดข้อมูลได้"
      );
    } finally {
      setLoading(false);
    }
  }, [poId]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  if (loading) {
    return (
      <div className="px-lg pt-lg animate-pulse space-y-3">
        <div className="h-8 bg-steel-200 rounded w-1/2" />
        <div className="h-6 bg-steel-100 rounded w-1/3" />
        <div className="h-40 bg-steel-100 rounded-lg" />
        <div className="h-20 bg-steel-100 rounded-lg" />
      </div>
    );
  }

  if (error || !po) {
    return (
      <div className="px-lg pt-lg">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1 text-sm text-primary font-medium mb-4 min-h-touch"
        >
          <ArrowLeft className="w-4 h-4" />
          กลับ
        </button>
        <ErrorView message={error || "ไม่พบข้อมูล"} onRetry={fetchDetail} />
      </div>
    );
  }

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white border-b border-steel-200 px-lg">
        <div className="flex items-center h-12">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1 text-sm text-steel-600 font-medium min-h-touch"
          >
            <ArrowLeft className="w-4 h-4" />
            กลับ
          </button>
        </div>
      </div>

      <div className="px-lg pt-4 space-y-4">
        {/* Order Info Card */}
        <div className="bg-white rounded-lg p-4 shadow-card space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-steel-900">
              {po.reference_no}
            </h2>
            <StatusBadge status={po.status} />
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-steel-500 text-xs">ผู้ขาย</span>
              <p className="font-medium text-steel-800">
                {po.seller_name || "ไม่ระบุ"}
              </p>
            </div>
            <div>
              <span className="text-steel-500 text-xs">สาขา</span>
              <p className="font-medium text-steel-800">
                {po.branch_name || "ไม่ระบุ"}
              </p>
            </div>
            <div>
              <span className="text-steel-500 text-xs">วันที่สร้าง</span>
              <p className="font-medium text-steel-800">
                {formatThaiDateTime(po.created_at)}
              </p>
            </div>
            <div>
              <span className="text-steel-500 text-xs">ชำระเงิน</span>
              <p className="font-medium text-steel-800">
                {po.payment_method === "cash" ? "เงินสด" : "โอน"}
              </p>
            </div>
          </div>

          {po.notes && (
            <div className="text-sm">
              <span className="text-steel-500 text-xs">หมายเหตุ</span>
              <p className="text-steel-700">{po.notes}</p>
            </div>
          )}
        </div>

        {/* Items */}
        <div>
          <h3 className="text-sm font-semibold text-steel-700 mb-2 flex items-center gap-1.5">
            <Layers className="w-4 h-4" />
            รายการสินค้า ({po.items?.length || 0})
          </h3>
          <div className="space-y-2">
            {po.items?.map((item: PurchaseOrderItemDTO) => (
              <div
                key={item.id}
                className="bg-white rounded-lg p-3 shadow-card"
              >
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1 mr-2">
                    <p className="text-sm font-medium text-steel-900 truncate">
                      {item.name}
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-steel-500">
                      <Tag className="w-3 h-3" />
                      <span>{item.condition_name || "ปกติ"}</span>
                      <Scale className="w-3 h-3 ml-1" />
                      <span>
                        {item.quantity} {item.unit}
                      </span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold text-steel-900">
                      {formatCurrency(item.total)}
                    </p>
                    <p className="text-xs text-steel-500">
                      @ {formatCurrency(item.price_per_unit)}/{item.unit}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="bg-white rounded-lg p-4 shadow-card">
          <div className="flex items-center justify-between text-sm">
            <span className="text-steel-600">รวมทั้งสิ้น</span>
            <span className="text-lg font-bold text-primary">
              {formatCurrency(po.total_amount)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Create PO Form ─────────────────────────────────────────────────────────

const defaultNewItem = {
  catalog_item_id: 0,
  name: "",
  category_id: 0,
  condition_id: 1,
  quantity: 1,
  unit: "กก.",
  price_per_unit: 0,
  tier_label: "ปกติ",
  total: 0,
};

function CreatePOForm({ onCancel }: { onCancel: () => void }) {
  const [step, setStep] = useState<"items" | "confirm">("items");
  const [items, setItems] = useState<(typeof defaultNewItem)[]>([{ ...defaultNewItem }]);
  const [sellers, setSellers] = useState<SellerDTO[]>([]);
  const [catalog, setCatalog] = useState<CatalogItemDTO[]>([]);
  const [conditions, setConditions] = useState<ItemConditionDTO[]>([]);
  const [sellerId, setSellerId] = useState<number | "">("");
  const [sellerSearch, setSellerSearch] = useState("");
  const [showSellerPicker, setShowSellerPicker] = useState(false);
  const [showCatalogPicker, setShowCatalogPicker] = useState<number | null>(null);
  const [catalogSearch, setCatalogSearch] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "bank_transfer">("cash");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [createdRef, setCreatedRef] = useState("");

  // Load data
  useEffect(() => {
    const load = async () => {
      try {
        const [sellerRes, catalogRes, condRes] = await Promise.all([
          apiBridge.sellers.getAll({ limit: 100 }),
          apiBridge.catalog.getAllItems({ limit: 200 }),
          apiBridge.catalog.getItemConditions(),
        ]);
        setSellers(sellerRes.data);
        setCatalog(catalogRes.data);
        setConditions(condRes.data);
      } catch {
        setError("ไม่สามารถโหลดข้อมูลได้");
      }
    };
    load();
  }, []);

  const totalAmount = items.reduce((sum, i) => sum + i.quantity * i.price_per_unit, 0);

  const addItem = () => {
    setItems([...items, { ...defaultNewItem }]);
  };

  const removeItem = (idx: number) => {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== idx));
  };

  const updateItem = (idx: number, field: string, value: unknown) => {
    const updated = items.map((item, i) => {
      if (i !== idx) return item;
      const next = { ...item, [field]: value };
      if (field === "quantity" || field === "price_per_unit") {
        next.total = next.quantity * next.price_per_unit;
      }
      return next;
    });
    setItems(updated);
  };

  const selectCatalogItem = (idx: number, ci: CatalogItemDTO) => {
    const price = ci.tier_prices?.[0]?.price || ci.default_price || 0;
    updateItem(idx, "catalog_item_id", ci.id);
    updateItem(idx, "name", ci.name);
    updateItem(idx, "category_id", ci.category_id);
    updateItem(idx, "unit", ci.default_unit || "กก.");
    updateItem(idx, "price_per_unit", price);
    updateItem(idx, "tier_label", ci.tier_prices?.[0]?.label || "ปกติ");
    updateItem(idx, "total", 1 * price);
    setShowCatalogPicker(null);
  };

  const handleSubmit = async () => {
    if (!sellerId) {
      setError("กรุณาเลือกผู้ขาย");
      return;
    }
    if (items.length === 0 || items.every((i) => !i.catalog_item_id)) {
      setError("กรุณาเพิ่มรายการสินค้าอย่างน้อย 1 รายการ");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await apiBridge.purchase.create({
        seller_id: Number(sellerId),
        branch_id: 1, // Default branch
        payment_method: paymentMethod,
        notes: notes || undefined,
        items: items.map((i) => ({
          catalog_item_id: i.catalog_item_id,
          name: i.name,
          category_id: i.category_id,
          condition_id: i.condition_id,
          quantity: i.quantity,
          unit: i.unit,
          price_per_unit: i.price_per_unit,
          tier_label: i.tier_label,
          total: i.total,
        })),
      });
      setCreatedRef(res.data.reference_no);
      setSuccess(true);
    } catch (err) {
      setError(
        err instanceof BridgeApiError
          ? err.userMessage
          : "เกิดข้อผิดพลาดในการสร้างใบรับซื้อ"
      );
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="px-lg pt-lg">
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-success-light flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-success" />
          </div>
          <h2 className="text-lg font-bold text-steel-900 mb-1">
            สร้างใบรับซื้อสำเร็จ
          </h2>
          <p className="text-sm text-steel-500 mb-1">เลขที่: {createdRef}</p>
          <button
            onClick={onCancel}
            className="mt-4 px-5 py-2.5 bg-primary text-white text-sm font-medium rounded-md min-h-touch"
          >
            กลับไปหน้ารายการ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-28">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white border-b border-steel-200 px-lg">
        <div className="flex items-center h-12">
          <button
            onClick={onCancel}
            className="inline-flex items-center gap-1 text-sm text-steel-600 font-medium min-h-touch"
          >
            <ArrowLeft className="w-4 h-4" />
            ยกเลิก
          </button>
          <div className="flex-1 text-center">
            <span className="text-sm font-semibold text-steel-800">
              ใบรับซื้อใหม่
            </span>
          </div>
          <div className="w-14" />
        </div>
      </div>

      <div className="px-lg pt-4 space-y-4">
        {/* Error */}
        {error && (
          <div className="flex items-start gap-2 p-3 bg-danger-light rounded-md text-sm text-danger">
            <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Seller Selection */}
        <div className="bg-white rounded-lg p-4 shadow-card">
          <label className="text-sm font-medium text-steel-700 mb-2 block">
            ผู้ขาย <span className="text-danger">*</span>
          </label>
          {showSellerPicker ? (
            <div className="space-y-2">
              <input
                type="text"
                value={sellerSearch}
                onChange={(e) => setSellerSearch(e.target.value)}
                placeholder="ค้นหาผู้ขาย..."
                className="w-full px-3 py-2 border border-steel-200 rounded-md text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary min-h-input"
                autoFocus
              />
              <div className="max-h-40 overflow-y-auto space-y-1">
                {sellers
                  .filter(
                    (s) =>
                      !sellerSearch ||
                      s.full_name
                        .toLowerCase()
                        .includes(sellerSearch.toLowerCase()) ||
                      s.phone.includes(sellerSearch)
                  )
                  .map((s) => (
                    <button
                      key={s.id}
                      onClick={() => {
                        setSellerId(s.id);
                        setSellerSearch(s.full_name);
                        setShowSellerPicker(false);
                      }}
                      className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-primary-50 transition-colors min-h-touch"
                    >
                      <span className="font-medium text-steel-800">
                        {s.full_name}
                      </span>
                      <span className="text-steel-500 ml-2">{s.phone}</span>
                    </button>
                  ))}
                {sellers.filter(
                  (s) =>
                    !sellerSearch ||
                    s.full_name
                      .toLowerCase()
                      .includes(sellerSearch.toLowerCase()) ||
                    s.phone.includes(sellerSearch)
                ).length === 0 && (
                  <p className="text-sm text-steel-400 py-2 text-center">
                    ไม่พบผู้ขาย
                  </p>
                )}
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowSellerPicker(true)}
              className="w-full flex items-center justify-between px-3 py-2.5 border border-steel-200 rounded-md text-sm min-h-touch hover:border-primary transition-colors"
            >
              <span className={sellerId ? "text-steel-900" : "text-steel-400"}>
                {sellerId
                  ? sellers.find((s) => s.id === sellerId)?.full_name ||
                    "เลือกผู้ขาย"
                  : "เลือกผู้ขาย..."}
              </span>
              <ChevronDown className="w-4 h-4 text-steel-400" />
            </button>
          )}
        </div>

        {/* Items */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-steel-700">
              รายการสินค้า <span className="text-danger">*</span>
            </label>
            <button
              onClick={addItem}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-primary border border-primary rounded-md min-h-touch"
            >
              <Plus className="w-3.5 h-3.5" />
              เพิ่มรายการ
            </button>
          </div>

          {items.map((item, idx) => (
            <div
              key={idx}
              className="bg-white rounded-lg p-3 shadow-card space-y-2"
            >
              <div className="flex items-start justify-between">
                <span className="text-xs font-medium text-steel-500">
                  รายการที่ {idx + 1}
                </span>
                {items.length > 1 && (
                  <button
                    onClick={() => removeItem(idx)}
                    className="text-danger text-xs flex items-center gap-1 min-h-touch"
                  >
                    <X className="w-3 h-3" />
                    ลบ
                  </button>
                )}
              </div>

              {/* Catalog Item Picker */}
              {showCatalogPicker === idx ? (
                <div className="space-y-1">
                  <input
                    type="text"
                    value={catalogSearch}
                    onChange={(e) => setCatalogSearch(e.target.value)}
                    placeholder="ค้นหาสินค้า..."
                    className="w-full px-3 py-2 border border-steel-200 rounded-md text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary min-h-input"
                    autoFocus
                  />
                  <div className="max-h-40 overflow-y-auto space-y-1">
                    {catalog
                      .filter(
                        (c) =>
                          !catalogSearch ||
                          c.name
                            .toLowerCase()
                            .includes(catalogSearch.toLowerCase()) ||
                          c.code
                            .toLowerCase()
                            .includes(catalogSearch.toLowerCase())
                      )
                      .map((c) => (
                        <button
                          key={c.id}
                          onClick={() => selectCatalogItem(idx, c)}
                          className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-primary-50 transition-colors min-h-touch"
                        >
                          <div className="font-medium text-steel-800">
                            {c.name}
                          </div>
                          <div className="text-steel-500 text-xs">
                            {c.code} — {formatCurrency(c.default_price)}/{c.default_unit}
                          </div>
                        </button>
                      ))}
                    {catalog.filter(
                      (c) =>
                        !catalogSearch ||
                        c.name
                          .toLowerCase()
                          .includes(catalogSearch.toLowerCase()) ||
                        c.code
                          .toLowerCase()
                          .includes(catalogSearch.toLowerCase())
                    ).length === 0 && (
                      <p className="text-sm text-steel-400 py-2 text-center">
                        ไม่พบสินค้า
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setShowCatalogPicker(idx);
                    setCatalogSearch("");
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 border rounded-md text-sm min-h-touch transition-colors ${
                    item.catalog_item_id
                      ? "border-primary bg-primary-50"
                      : "border-steel-200 hover:border-primary"
                  }`}
                >
                  <span
                    className={
                      item.catalog_item_id ? "text-steel-900" : "text-steel-400"
                    }
                  >
                    {item.catalog_item_id
                      ? item.name
                      : "เลือกสินค้า..."}
                  </span>
                  <Barcode className="w-4 h-4 text-steel-400" />
                </button>
              )}

              {/* Quantity & Price */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-xs text-steel-500 mb-1 block">
                    จำนวน
                  </label>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={item.quantity || ""}
                    onChange={(e) =>
                      updateItem(idx, "quantity", parseFloat(e.target.value) || 0)
                    }
                    className="w-full px-2.5 py-2 border border-steel-200 rounded-md text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary min-h-input"
                  />
                </div>
                <div>
                  <label className="text-xs text-steel-500 mb-1 block">
                    ราคา/หน่วย
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={item.price_per_unit || ""}
                    onChange={(e) =>
                      updateItem(
                        idx,
                        "price_per_unit",
                        parseFloat(e.target.value) || 0
                      )
                    }
                    className="w-full px-2.5 py-2 border border-steel-200 rounded-md text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary min-h-input"
                  />
                </div>
                <div>
                  <label className="text-xs text-steel-500 mb-1 block">
                    รวม
                  </label>
                  <div className="h-full flex items-center px-2.5 py-2 text-sm font-semibold text-primary">
                    {formatCurrency(item.total)}
                  </div>
                </div>
              </div>

              {/* Condition */}
              <div>
                <label className="text-xs text-steel-500 mb-1 block">
                  สภาพสินค้า
                </label>
                <div className="flex gap-1.5 flex-wrap">
                  {conditions.map((cond) => (
                    <button
                      key={cond.id}
                      onClick={() => updateItem(idx, "condition_id", cond.id)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors min-h-touch ${
                        item.condition_id === cond.id
                          ? "border-primary bg-primary-50 text-primary"
                          : "border-steel-200 text-steel-600 hover:bg-steel-50"
                      }`}
                      style={
                        item.condition_id === cond.id && cond.color_code
                          ? {
                              borderColor: cond.color_code,
                              backgroundColor: `${cond.color_code}15`,
                              color: cond.color_code,
                            }
                          : undefined
                      }
                    >
                      {cond.name}
                    </button>
                  ))}
                  {conditions.length === 0 && (
                    <span className="text-xs text-steel-400">ปกติ</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Payment Method */}
        <div className="bg-white rounded-lg p-4 shadow-card">
          <label className="text-sm font-medium text-steel-700 mb-2 block">
            วิธีการชำระเงิน
          </label>
          <div className="flex gap-2">
            {[
              { value: "cash" as const, label: "เงินสด" },
              { value: "bank_transfer" as const, label: "โอน" },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => setPaymentMethod(opt.value)}
                className={`flex-1 px-4 py-2.5 text-sm font-medium rounded-md border transition-colors min-h-touch ${
                  paymentMethod === opt.value
                    ? "border-primary bg-primary-50 text-primary"
                    : "border-steel-200 text-steel-600 hover:bg-steel-50"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div className="bg-white rounded-lg p-4 shadow-card">
          <label className="text-sm font-medium text-steel-700 mb-2 block">
            หมายเหตุ
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="บันทึกเพิ่มเติม (ถ้ามี)..."
            rows={2}
            className="w-full px-3 py-2 border border-steel-200 rounded-md text-sm placeholder:text-steel-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none"
          />
        </div>

        {/* Summary */}
        <div className="bg-white rounded-lg p-4 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-steel-700">
              ยอดรวมทั้งสิ้น
            </span>
            <span className="text-xl font-bold text-primary">
              {formatCurrency(totalAmount)}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="fixed bottom-16 left-0 right-0 z-40 bg-white border-t border-steel-200 px-lg py-3 safe-area-bottom">
        <div className="max-w-screen-sm mx-auto">
          <button
            onClick={handleSubmit}
            disabled={loading || !sellerId}
            className="w-full flex items-center justify-center gap-2 bg-primary text-white text-sm font-semibold py-3 rounded-md shadow-button disabled:opacity-50 min-h-touch"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                กำลังสร้าง...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                สร้างใบรับซื้อ {formatCurrency(totalAmount)}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────

export default function PurchaseOrdersPage() {
  const [pos, setPos] = useState<PurchaseOrderDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedPoId, setSelectedPoId] = useState<number | null>(null);

  const fetchPOs = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params: Record<string, unknown> = { page: 1, limit: 50 };
      if (statusFilter) {
        params.status = statusFilter;
      }
      const res = await apiBridge.purchase.getAll(params);
      setPos(res.data);
      setPagination(res.pagination);
    } catch (err) {
      setError(
        err instanceof BridgeApiError
          ? err.userMessage
          : "ไม่สามารถโหลดรายการรับซื้อได้"
      );
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchPOs();
  }, [fetchPOs]);

  // Filter by search
  const filteredPos = pos.filter((po) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      po.reference_no.toLowerCase().includes(q) ||
      (po.seller_name || "").toLowerCase().includes(q)
    );
  });

  // Detail view
  if (viewMode === "detail" && selectedPoId) {
    return (
      <DashboardShell>
        <PODetail poId={selectedPoId} onBack={() => setViewMode("list")} />
      </DashboardShell>
    );
  }

  // Create form
  if (viewMode === "create") {
    return (
      <DashboardShell>
        <CreatePOForm onCancel={() => setViewMode("list")} />
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white border-b border-steel-200 px-lg">
        <div className="flex items-center h-12">
          <h1 className="text-lg font-bold text-steel-900">รับซื้อ</h1>
          <div className="flex-1" />
          <button
            onClick={fetchPOs}
            className="min-h-touch min-w-touch flex items-center justify-center text-steel-500 hover:text-primary transition-colors"
            title="โหลดใหม่"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Search & Filter */}
      <SearchFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
      />

      {/* Content */}
      {loading ? (
        <POSkeleton />
      ) : error ? (
        <ErrorView message={error} onRetry={fetchPOs} />
      ) : filteredPos.length === 0 ? (
        <EmptyState onNewPO={() => setViewMode("create")} />
      ) : (
        <div className="px-lg pt-2 pb-24 space-y-2">
          {/* Result Count */}
          <p className="text-xs text-steel-400 px-1">
            ทั้งหมด {filteredPos.length} รายการ
            {pagination && pagination.total > filteredPos.length
              ? ` (จาก ${pagination.total})`
              : ""}
          </p>

          {filteredPos.map((po) => (
            <POCard
              key={po.id}
              po={po}
              onClick={() => {
                setSelectedPoId(po.id);
                setViewMode("detail");
              }}
            />
          ))}
        </div>
      )}

      {/* Bottom Action Bar */}
      <div className="fixed bottom-16 left-0 right-0 z-40 bg-white border-t border-steel-200 px-lg py-3 safe-area-bottom">
        <div className="max-w-screen-sm mx-auto">
          <button
            onClick={() => setViewMode("create")}
            className="w-full flex items-center justify-center gap-2 bg-primary text-white text-sm font-semibold py-3 rounded-md shadow-button hover:bg-primary-dark transition-colors min-h-touch"
          >
            <Plus className="w-4 h-4" />
            สร้างใบรับซื้อ
          </button>
        </div>
      </div>
    </DashboardShell>
  );
}
