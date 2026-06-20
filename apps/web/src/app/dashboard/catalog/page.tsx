"use client";

import { useState, useEffect, useCallback } from "react";
import { apiBridge, BridgeApiError } from "@/lib/api-bridge";
import DashboardShell from "@/lib/components/shell/DashboardShell";
import { formatCurrency } from "@/lib/utils";
import type {
  CatalogItemDTO,
  TierPriceDTO,
  PaginationMeta,
} from "@/lib/api-bridge/types";
import {
  Search,
  Plus,
  X,
  Package,
  Barcode,
  Tag,
  DollarSign,
  Layers,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  RefreshCw,
  Grid3X3,
  List,
  Info,
  Eye,
  EyeOff,
  Filter,
} from "lucide-react";

// ─── Loading Skeleton ───────────────────────────────────────────────────────

function CatalogSkeleton() {
  return (
    <div className="space-y-3 px-lg pt-lg animate-pulse">
      <div className="h-10 bg-steel-200 rounded-lg w-full" />
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="bg-white rounded-lg p-3 shadow-card space-y-2">
          <div className="flex gap-3">
            <div className="w-12 h-12 bg-steel-200 rounded-lg shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="h-4 bg-steel-200 rounded w-2/3" />
              <div className="h-3 bg-steel-100 rounded w-1/3" />
              <div className="h-3 bg-steel-100 rounded w-1/4" />
            </div>
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

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-lg text-center">
      <div className="w-14 h-14 rounded-full bg-primary-50 flex items-center justify-center mb-4">
        <Package className="w-7 h-7 text-primary" />
      </div>
      <p className="text-steel-700 font-medium mb-1">ไม่มีสินค้าในแคตตาล็อก</p>
      <p className="text-sm text-steel-500">
        ยังไม่มีรายการสินค้าในระบบ
      </p>
    </div>
  );
}

// ─── Price Tier Display ─────────────────────────────────────────────────────

function PriceTierBadge({
  tier,
}: {
  tier: TierPriceDTO;
}) {
  const colorMap: Record<string, string> = {
    บิล1: "bg-blue-50 text-blue-700 border-blue-200",
    บิล2: "bg-amber-50 text-amber-700 border-amber-200",
    บิล3: "bg-emerald-50 text-emerald-700 border-emerald-200",
  };
  const defaultColor = "bg-steel-50 text-steel-700 border-steel-200";
  const colorClass = colorMap[tier.label] || defaultColor;

  return (
    <div
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border ${colorClass}`}
    >
      <span>{tier.label}:</span>
      <span className="font-semibold">{formatCurrency(tier.price)}</span>
    </div>
  );
}

// ─── Catalog Item Card ──────────────────────────────────────────────────────

function CatalogItemCard({
  item,
  onToggleExpand,
  isExpanded,
}: {
  item: CatalogItemDTO;
  onToggleExpand: () => void;
  isExpanded: boolean;
}) {
  return (
    <div className="bg-white rounded-lg shadow-card overflow-hidden">
      {/* Main Row */}
      <button
        onClick={onToggleExpand}
        className="w-full text-left p-3 flex items-center gap-3 hover:bg-steel-50/50 transition-colors active:scale-[0.99]"
      >
        {/* Icon */}
        <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center shrink-0">
          <Package className="w-5 h-5 text-primary" />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <h3 className="text-sm font-medium text-steel-900 truncate">
              {item.name}
            </h3>
            {!item.is_active && (
              <span className="text-xs text-steel-400">(ไม่ใช้งาน)</span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-0.5 text-xs text-steel-500">
            <span className="flex items-center gap-0.5">
              <Barcode className="w-3 h-3" />
              {item.code}
            </span>
            <span className="w-1 h-1 rounded-full bg-steel-300" />
            <span>{item.category_name || "ไม่มีหมวดหมู่"}</span>
          </div>
          <div className="mt-1">
            <span className="text-sm font-semibold text-primary">
              {formatCurrency(item.default_price)}
            </span>
            <span className="text-xs text-steel-400 ml-1">
              /{item.default_unit}
            </span>
          </div>
        </div>

        {/* Expand */}
        <div className="shrink-0">
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-steel-400" />
          ) : (
            <ChevronRight className="w-4 h-4 text-steel-400" />
          )}
        </div>
      </button>

      {/* Expanded: Price Tiers */}
      {isExpanded && (
        <div className="px-3 pb-3 pt-1 border-t border-steel-100">
          <div className="flex items-center gap-1.5 mb-2">
            <Layers className="w-3.5 h-3.5 text-steel-500" />
            <span className="text-xs font-medium text-steel-600">
              ระดับราคา (Price Tiers)
            </span>
          </div>
          {item.tier_prices && item.tier_prices.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {item.tier_prices.map((tier, i) => (
                <PriceTierBadge key={i} tier={tier} />
              ))}
            </div>
          ) : (
            <p className="text-xs text-steel-400">
              ไม่มีข้อมูลระดับราคา
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Price Tiers Section View ───────────────────────────────────────────────

function PriceTiersView({
  items,
}: {
  items: CatalogItemDTO[];
}) {
  return (
    <div className="px-lg pb-24 space-y-3">
      <p className="text-xs text-steel-400">
        ระดับราคาทั้งหมด {items.length} รายการ
      </p>
      {items.map((item) => (
        <div key={item.id} className="bg-white rounded-lg p-3 shadow-card">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-md bg-primary-50 flex items-center justify-center">
              <Package className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-steel-900">{item.name}</p>
              <p className="text-xs text-steel-500">{item.code}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {item.tier_prices?.map((tier, i) => (
              <div key={i} className="text-center p-2 rounded-md bg-steel-50">
                <p className="text-xs text-steel-500">{tier.label}</p>
                <p className="text-sm font-bold text-steel-800">
                  {formatCurrency(tier.price)}
                </p>
              </div>
            ))}
            {(!item.tier_prices || item.tier_prices.length === 0) && (
              <p className="text-xs text-steel-400 col-span-3 text-center py-2">
                ไม่มีระดับราคา
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────

export default function CatalogPage() {
  const [items, setItems] = useState<CatalogItemDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
  const [viewMode, setViewMode] = useState<"list" | "tiers">("list");

  const fetchCatalog = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await apiBridge.catalog.getAllItems({ limit: 200 });
      setItems(res.data);
    } catch (err) {
      setError(
        err instanceof BridgeApiError
          ? err.userMessage
          : "ไม่สามารถโหลดแคตตาล็อกได้"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCatalog();
  }, [fetchCatalog]);

  // Filter by search
  const filteredItems = items.filter((item) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.name.toLowerCase().includes(q) ||
      item.code.toLowerCase().includes(q) ||
      (item.category_name || "").toLowerCase().includes(q)
    );
  });

  const toggleExpand = (id: number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <DashboardShell>
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white border-b border-steel-200 px-lg">
        <div className="flex items-center h-12">
          <h1 className="text-lg font-bold text-steel-900">แคตตาล็อก</h1>
          <div className="flex-1" />
          <button
            onClick={fetchCatalog}
            className="min-h-touch min-w-touch flex items-center justify-center text-steel-500 hover:text-primary transition-colors"
            title="โหลดใหม่"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="sticky top-12 z-30 bg-steel-50 pt-3 pb-2 px-lg">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-steel-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหาสินค้า, รหัส, หมวดหมู่..."
            className="w-full pl-9 pr-9 py-2.5 bg-white border border-steel-200 rounded-lg text-sm placeholder:text-steel-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary min-h-input"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 min-h-touch min-w-touch flex items-center justify-center"
            >
              <X className="w-4 h-4 text-steel-400" />
            </button>
          )}
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-2 mt-2">
          <button
            onClick={() => setViewMode("list")}
            className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-md border transition-colors min-h-touch ${
              viewMode === "list"
                ? "bg-primary-50 border-primary text-primary"
                : "bg-white border-steel-200 text-steel-600 hover:bg-steel-50"
            }`}
          >
            <List className="w-3.5 h-3.5" />
            รายการสินค้า
          </button>
          <button
            onClick={() => setViewMode("tiers")}
            className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-md border transition-colors min-h-touch ${
              viewMode === "tiers"
                ? "bg-primary-50 border-primary text-primary"
                : "bg-white border-steel-200 text-steel-600 hover:bg-steel-50"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            ระดับราคา
          </button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <CatalogSkeleton />
      ) : error ? (
        <ErrorView message={error} onRetry={fetchCatalog} />
      ) : filteredItems.length === 0 ? (
        searchQuery ? (
          <div className="flex flex-col items-center justify-center py-16 px-lg text-center">
            <Search className="w-8 h-8 text-steel-300 mb-3" />
            <p className="text-steel-600 font-medium mb-1">
              ไม่พบสินค้าที่ค้นหา
            </p>
            <p className="text-sm text-steel-500">
              ลองเปลี่ยนคำค้นหา หรือตรวจสอบการสะกด
            </p>
          </div>
        ) : (
          <EmptyState />
        )
      ) : viewMode === "tiers" ? (
        <PriceTiersView items={filteredItems} />
      ) : (
        <div className="px-lg pt-2 pb-24 space-y-2">
          <p className="text-xs text-steel-400 px-1">
            ทั้งหมด {filteredItems.length} รายการ
            {filteredItems.length < items.length
              ? ` (จาก ${items.length})`
              : ""}
          </p>
          {filteredItems.map((item) => (
            <CatalogItemCard
              key={item.id}
              item={item}
              isExpanded={expandedIds.has(item.id)}
              onToggleExpand={() => toggleExpand(item.id)}
            />
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
