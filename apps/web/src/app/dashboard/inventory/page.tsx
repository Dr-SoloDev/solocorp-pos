"use client";

import { useState, useEffect, useCallback } from "react";
import { apiBridge, BridgeApiError } from "@/lib/api-bridge";
import DashboardShell from "@/lib/components/shell/DashboardShell";
import { formatCurrency } from "@/lib/utils";
import type {
  ProductDTO,
  CategoryDTO,
  StockAlertDTO,
  PaginationMeta,
} from "@/lib/api-bridge/types";
import {
  Search,
  X,
  Package,
  AlertTriangle,
  RefreshCw,
  Box,
  Layers,
  Hash,
  Filter,
  ChevronDown,
  BarChart3,
  TrendingDown,
  CheckCircle,
  Clock,
  MapPin,
  Scale,
  Eye,
  Info,
} from "lucide-react";

// ─── Loading Skeleton ───────────────────────────────────────────────────────

function InventorySkeleton() {
  return (
    <div className="space-y-3 px-lg pt-lg animate-pulse">
      <div className="h-10 bg-steel-200 rounded-lg w-full" />
      <div className="grid grid-cols-2 gap-3">
        <div className="h-20 bg-steel-200 rounded-lg" />
        <div className="h-20 bg-steel-200 rounded-lg" />
      </div>
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-white rounded-lg p-3 shadow-card space-y-2">
          <div className="h-4 bg-steel-200 rounded w-2/3" />
          <div className="h-3 bg-steel-100 rounded w-1/2" />
          <div className="flex gap-2">
            <div className="h-5 bg-steel-100 rounded w-16" />
            <div className="h-5 bg-steel-100 rounded w-16" />
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

function EmptyInventoryState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-lg text-center">
      <div className="w-14 h-14 rounded-full bg-primary-50 flex items-center justify-center mb-4">
        <Package className="w-7 h-7 text-primary" />
      </div>
      <p className="text-steel-700 font-medium mb-1">ไม่มีสินค้าในคลัง</p>
      <p className="text-sm text-steel-500">
        ยังไม่มีรายการสินค้าในระบบ
      </p>
    </div>
  );
}

// ─── Stat Card ──────────────────────────────────────────────────────────────

function StatCard({
  icon,
  label,
  value,
  sub,
  color = "primary",
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  color?: "primary" | "danger" | "warning" | "success";
}) {
  const colorMap = {
    primary: {
      bg: "bg-primary-50",
      text: "text-primary",
      value: "text-primary",
    },
    danger: {
      bg: "bg-danger-light",
      text: "text-danger",
      value: "text-danger",
    },
    warning: {
      bg: "bg-warning-light",
      text: "text-warning",
      value: "text-warning",
    },
    success: {
      bg: "bg-success-light",
      text: "text-success",
      value: "text-success",
    },
  };
  const c = colorMap[color];

  return (
    <div className="bg-white rounded-lg p-3 shadow-card">
      <div className="flex items-center gap-2 mb-1">
        <div className={`w-7 h-7 rounded-md ${c.bg} flex items-center justify-center`}>
          <span className={c.text}>{icon}</span>
        </div>
        <span className="text-xs text-steel-500">{label}</span>
      </div>
      <p className={`text-lg font-bold ${c.value}`}>{value}</p>
      {sub && <p className="text-xs text-steel-400 mt-0.5">{sub}</p>}
    </div>
  );
}

// ─── Stock Level Bar ────────────────────────────────────────────────────────

function StockLevelBar({
  current,
  threshold,
}: {
  current: number;
  threshold: number;
}) {
  const pct = threshold > 0 ? Math.min((current / threshold) * 100, 100) : 100;
  const isLow = current <= threshold;
  const isCritical = current <= threshold * 0.5;

  let barColor = "bg-success";
  if (isCritical) barColor = "bg-danger";
  else if (isLow) barColor = "bg-warning";

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-steel-500">
          คงเหลือ: <span className="font-semibold text-steel-700">{current}</span>
        </span>
        <span className="text-steel-400">เกณฑ์: {threshold}</span>
      </div>
      <div className="h-2 bg-steel-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>
    </div>
  );
}

// ─── Product Card ───────────────────────────────────────────────────────────

function ProductCard({
  product,
  isLowStock,
}: {
  product: ProductDTO;
  isLowStock: boolean;
}) {
  const threshold = product.low_stock_threshold || 10;
  const isLow = product.quantity <= threshold;
  const isCritical = product.quantity <= threshold * 0.5;

  return (
    <div className="bg-white rounded-lg p-3 shadow-card">
      {/* Top Row */}
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
            isCritical
              ? "bg-danger-light"
              : isLow
              ? "bg-warning-light"
              : "bg-primary-50"
          }`}
        >
          <Package
            className={`w-5 h-5 ${
              isCritical
                ? "text-danger"
                : isLow
                ? "text-warning"
                : "text-primary"
            }`}
          />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <h3 className="text-sm font-medium text-steel-900 truncate">
              {product.name}
            </h3>
            {product.status === "inactive" && (
              <span className="text-xs text-steel-400">(ปิดใช้งาน)</span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-0.5 text-xs text-steel-500">
            <span className="flex items-center gap-0.5">
              <Hash className="w-3 h-3" />
              {product.sku}
            </span>
            {product.barcode && (
              <>
                <span className="w-1 h-1 rounded-full bg-steel-300" />
                <span>{product.barcode}</span>
              </>
            )}
            <span className="w-1 h-1 rounded-full bg-steel-300" />
            <span>{product.category_name || "ไม่มีหมวดหมู่"}</span>
          </div>
        </div>
      </div>

      {/* Stock Info */}
      <div className="mt-3 pt-3 border-t border-steel-100">
        <StockLevelBar current={product.quantity} threshold={threshold} />
      </div>

      {/* Price Tiers */}
      <div className="mt-2 flex items-center gap-2 text-xs text-steel-500">
        <span>ราคา:</span>
        <span className="font-medium text-steel-700">
          {formatCurrency(product.price_tier1)}
        </span>
        <span className="text-steel-300">|</span>
        <span className="font-medium text-steel-700">
          {formatCurrency(product.price_tier2)}
        </span>
        <span className="text-steel-300">|</span>
        <span className="font-medium text-steel-700">
          {formatCurrency(product.price_tier3)}
        </span>
      </div>

      {/* Low Stock Warning */}
      {isLow && (
        <div
          className={`mt-2 flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium ${
            isCritical
              ? "bg-danger-light text-danger"
              : "bg-warning-light text-warning"
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          <span>
            {isCritical
              ? "สต็อกใกล้หมด! คงเหลือเพียง"
              : "สต็อกต่ำกว่าเกณฑ์ คงเหลือ"}{" "}
            {product.quantity} {product.unit}
          </span>
        </div>
      )}
    </div>
  );
}

// ─── Stock Alerts Section ───────────────────────────────────────────────────

function StockAlertsSection({
  alerts,
  onRefresh,
  loading,
}: {
  alerts: StockAlertDTO[];
  onRefresh: () => void;
  loading: boolean;
}) {
  const [expanded, setExpanded] = useState(true);

  if (alerts.length === 0) return null;

  return (
    <div className="mb-3">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-lg py-3 bg-white border-b border-steel-200 min-h-touch"
      >
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-danger-light flex items-center justify-center">
            <AlertTriangle className="w-3.5 h-3.5 text-danger" />
          </div>
          <span className="text-sm font-semibold text-steel-800">
            สินค้าใกล้หมด
          </span>
          <span className="bg-danger text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
            {alerts.length}
          </span>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-steel-400 transition-transform ${
            expanded ? "" : "-rotate-90"
          }`}
        />
      </button>

      {expanded && (
        <div className="px-lg pt-2 space-y-2">
          {alerts.map((alert, i) => (
            <div
              key={`${alert.category_id}-${i}`}
              className="bg-white rounded-lg p-3 shadow-card border-l-3 border-danger"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-steel-900">
                    {alert.category_name}
                  </p>
                  <p className="text-xs text-steel-500 mt-0.5">
                    คงเหลือ:{" "}
                    <span className="font-semibold text-danger">
                      {alert.stock_kg}
                    </span>{" "}
                    / เกณฑ์: {alert.alert_threshold}
                  </p>
                </div>
                <div className="w-8 h-8 rounded-full bg-danger-light flex items-center justify-center shrink-0">
                  <TrendingDown className="w-4 h-4 text-danger" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Category Filter Pills ──────────────────────────────────────────────────

function CategoryFilter({
  categories,
  selected,
  onChange,
}: {
  categories: CategoryDTO[];
  selected: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
      <button
        onClick={() => onChange("")}
        className={`shrink-0 px-3 py-1.5 text-xs font-medium rounded-full border transition-colors min-h-touch ${
          selected === ""
            ? "bg-primary text-white border-primary"
            : "bg-white border-steel-200 text-steel-600 hover:bg-steel-50"
        }`}
      >
        ทั้งหมด
      </button>
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onChange(cat.name)}
          className={`shrink-0 px-3 py-1.5 text-xs font-medium rounded-full border transition-colors min-h-touch ${
            selected === cat.name
              ? "bg-primary text-white border-primary"
              : "bg-white border-steel-200 text-steel-600 hover:bg-steel-50"
          }`}
        >
          {cat.name}
        </button>
      ))}
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────

export default function InventoryPage() {
  const [products, setProducts] = useState<ProductDTO[]>([]);
  const [categories, setCategories] = useState<CategoryDTO[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<ProductDTO[]>([]);
  const [stockAlerts, setStockAlerts] = useState<StockAlertDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [productRes, categoryRes, lowStockRes, alertsRes] =
        await Promise.all([
          apiBridge.inventory.getProducts({ limit: 200 }),
          apiBridge.inventory.getCategories(),
          apiBridge.inventory.getLowStock(),
          apiBridge.inventory.getStockAlerts(),
        ]);
      setProducts(productRes.data);
      setCategories(categoryRes.data);
      setLowStockProducts(lowStockRes.data);
      setStockAlerts(alertsRes.data);
    } catch (err) {
      setError(
        err instanceof BridgeApiError
          ? err.userMessage
          : "ไม่สามารถโหลดข้อมูลคลังสินค้าได้"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // Compute stats
  const totalProducts = products.length;
  const totalStock = products.reduce((sum, p) => sum + p.quantity, 0);
  const lowStockCount = lowStockProducts.length;
  const activeProducts = products.filter((p) => p.status === "active").length;

  // Filter products
  const filteredProducts = products.filter((p) => {
    if (showLowStockOnly && p.quantity > (p.low_stock_threshold || 10))
      return false;
    if (categoryFilter && p.category_name !== categoryFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        (p.barcode || "").toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <DashboardShell>
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white border-b border-steel-200 px-lg">
        <div className="flex items-center h-12">
          <h1 className="text-lg font-bold text-steel-900">คลังสินค้า</h1>
          <div className="flex-1" />
          <button
            onClick={fetchAll}
            className="min-h-touch min-w-touch flex items-center justify-center text-steel-500 hover:text-primary transition-colors"
            title="โหลดใหม่"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="sticky top-12 z-30 bg-steel-50 pt-3 pb-2 px-lg space-y-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-steel-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหาสินค้า, SKU, บาร์โค้ด..."
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

        {/* Filters */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowLowStockOnly(!showLowStockOnly)}
            className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-md border transition-colors min-h-touch ${
              showLowStockOnly
                ? "bg-danger-light border-danger text-danger"
                : "bg-white border-steel-200 text-steel-600 hover:bg-steel-50"
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            สต็อกต่ำ
            {lowStockCount > 0 && (
              <span className="ml-1 bg-danger text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {lowStockCount}
              </span>
            )}
          </button>

          <div className="flex-1 overflow-hidden">
            {categories.length > 0 && (
              <CategoryFilter
                categories={categories}
                selected={categoryFilter}
                onChange={setCategoryFilter}
              />
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <InventorySkeleton />
      ) : error ? (
        <ErrorView message={error} onRetry={fetchAll} />
      ) : products.length === 0 ? (
        <EmptyInventoryState />
      ) : (
        <div className="pb-24">
          {/* Stats Cards */}
          <div className="px-lg pt-3 pb-2">
            <div className="grid grid-cols-2 gap-2">
              <StatCard
                icon={<Box className="w-4 h-4" />}
                label="สินค้าทั้งหมด"
                value={totalProducts}
                sub={`ใช้งาน ${activeProducts} รายการ`}
                color="primary"
              />
              <StatCard
                icon={<BarChart3 className="w-4 h-4" />}
                label="สต็อกรวม"
                value={totalStock.toLocaleString()}
                sub={`${products.filter(p => p.quantity > 0).length} รายการมีสต็อก`}
                color="success"
              />
            </div>
          </div>

          {/* Stock Alerts */}
          <StockAlertsSection
            alerts={stockAlerts}
            onRefresh={fetchAll}
            loading={loading}
          />

          {/* Product List */}
          <div className="px-lg pt-2 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs text-steel-400">
                {showLowStockOnly ? "สินค้าสต็อกต่ำ" : "รายการสินค้า"}{" "}
                {filteredProducts.length} รายการ
                {filteredProducts.length < products.length
                  ? ` (จาก ${products.length})`
                  : ""}
              </p>
            </div>

            {filteredProducts.map((product) => {
              const threshold = product.low_stock_threshold || 10;
              const isLowStock = product.quantity <= threshold;
              // Check if it's in the lowStockProducts list
              const isLow = lowStockProducts.some(
                (lp) => lp.id === product.id
              );
              return (
                <ProductCard
                  key={product.id}
                  product={product}
                  isLowStock={isLow || isLowStock}
                />
              );
            })}

            {filteredProducts.length === 0 && searchQuery && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Search className="w-8 h-8 text-steel-300 mb-3" />
                <p className="text-steel-600 font-medium mb-1">
                  ไม่พบสินค้าที่ค้นหา
                </p>
                <p className="text-sm text-steel-500">
                  ลองเปลี่ยนคำค้นหาหรือตรวจสอบการสะกด
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
