"use client";

/**
 * SoloCorp POS — Sale Lots Page
 * =================================
 * Bridge Client UI for Sale Lots management (Phase 1)
 *
 * Features:
 * - Paginated list of Sale Lots
 * - Search/filter by lot code, buyer name, status, date range
 * - Status badges (draft/confirmed/cancelled)
 * - Confirm (draft → confirmed)
 * - Cancel (confirmed → cancelled)
 * - Record Revenue form
 * - Bottom action bar for mobile touch
 * - Mobile-first (320-768px), touch targets ≥44px
 *
 * Design: Industrial Modern
 * Primary: #1A56DB | Steel grays | Thai-friendly
 *
 * @phase 1
 * @module app/dashboard/sale-lots/page
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { saleLotsApi } from "@/lib/api-bridge/sale-lots";
import type {
  SaleLotDTO,
  SaleLotStatus,
  SaleLotQueryParams,
  SaleLotItemDTO,
} from "@/lib/api-bridge/types";
import { Button } from "@solocorp/ui";
import { Input } from "@solocorp/ui";
import { cn } from "@solocorp/ui";
import {
  Search,
  Plus,
  X,
  Check,
  RotateCcw,
  Banknote,
  FileText,
  Filter,
  AlertCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Building2,
  User,
  Package,
  Scale,
  Hash,
  Tag,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Receipt,
  MoreHorizontal,
  Trash2,
  Edit3,
} from "lucide-react";

// ═══════════════════════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════════════════════

type ViewMode = "list" | "detail";
type ModalType = "confirm" | "cancel" | "recordRevenue" | "delete" | null;
type ToastType = "success" | "error" | "info";

interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════════════════════════

const STATUS_CONFIG: Record<
  SaleLotStatus,
  { label: string; bg: string; text: string; dot: string }
> = {
  draft: {
    label: "ร่าง",
    bg: "bg-steel-100",
    text: "text-steel-700",
    dot: "bg-steel-400",
  },
  confirmed: {
    label: "ยืนยันแล้ว",
    bg: "bg-success-light",
    text: "text-success-dark",
    dot: "bg-success",
  },
  cancelled: {
    label: "ยกเลิก",
    bg: "bg-danger-light",
    text: "text-danger-dark",
    dot: "bg-danger",
  },
};

function formatDate(dateStr: string | undefined | null): string {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("th-TH", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function formatCurrency(amount: number | undefined | null): string {
  if (amount === null || amount === undefined) return "—";
  return new Intl.NumberFormat("th-TH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatWeight(kg: number | undefined | null): string {
  if (kg === null || kg === undefined) return "—";
  return new Intl.NumberFormat("th-TH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(kg);
}

function getTotalQuantity(items: SaleLotItemDTO[] | undefined): number {
  if (!items || items.length === 0) return 0;
  return items.reduce((sum, item) => sum + (item.quantity ?? 0), 0);
}

// ═══════════════════════════════════════════════════════════════════════════════
// Toast Component
// ═══════════════════════════════════════════════════════════════════════════════

function ToastContainer({ toasts, onDismiss }: { toasts: ToastMessage[]; onDismiss: (id: string) => void }) {
  if (toasts.length === 0) return null;
  return (
    <div className="fixed top-4 right-4 left-4 z-[100] flex flex-col gap-2 max-w-sm mx-auto pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            "pointer-events-auto flex items-start gap-3 p-3 rounded-lg shadow-modal animate-slide-down text-sm",
            toast.type === "success" && "bg-success-light text-success-dark border border-success/20",
            toast.type === "error" && "bg-danger-light text-danger-dark border border-danger/20",
            toast.type === "info" && "bg-info-light text-info-dark border border-info/20",
          )}
        >
          {toast.type === "success" && <Check className="w-4 h-4 mt-0.5 shrink-0 text-success" />}
          {toast.type === "error" && <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-danger" />}
          {toast.type === "info" && <FileText className="w-4 h-4 mt-0.5 shrink-0 text-info" />}
          <span className="flex-1">{toast.message}</span>
          <button
            onClick={() => onDismiss(toast.id)}
            className="text-current opacity-50 hover:opacity-100 transition-opacity min-h-touch min-w-touch flex items-center justify-center -m-2"
            aria-label="ปิด"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Status Badge
// ═══════════════════════════════════════════════════════════════════════════════

function StatusBadge({ status }: { status: SaleLotStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-caption font-medium whitespace-nowrap",
        cfg.bg,
        cfg.text,
      )}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full", cfg.dot)} />
      {cfg.label}
    </span>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Sale Lot Card (Mobile List Item)
// ═══════════════════════════════════════════════════════════════════════════════

function SaleLotCard({
  lot,
  onSelect,
}: {
  lot: SaleLotDTO;
  onSelect: (lot: SaleLotDTO) => void;
}) {
  const totalQty = getTotalQuantity(lot.items);
  const itemCount = lot.items?.length ?? 1;
  const productName =
    lot.items && lot.items.length > 0
      ? lot.items[0]?.name ?? "สินค้า"
      : "สินค้า";

  return (
    <button
      onClick={() => onSelect(lot)}
      className="w-full text-left bg-white rounded-lg border border-steel-200 shadow-card p-4 hover:shadow-card-hover transition-shadow active:scale-[0.99] animate-fade-in"
    >
      {/* Row 1: Reference + Status */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="font-mono text-sm font-semibold text-steel-900">
          {lot.reference_no}
        </span>
        <StatusBadge status={lot.status} />
      </div>

      {/* Row 2: Buyer + Branch */}
      <div className="flex items-center gap-3 text-caption text-steel-500 mb-3">
        <span className="flex items-center gap-1">
          <User className="w-3.5 h-3.5" />
          {lot.buyer_name}
        </span>
        {lot.branch_name && (
          <span className="flex items-center gap-1">
            <Building2 className="w-3.5 h-3.5" />
            {lot.branch_name}
          </span>
        )}
      </div>

      {/* Row 3: Product + Qty */}
      <div className="flex items-center gap-3 text-caption text-steel-600 mb-2">
        <span className="flex items-center gap-1 truncate flex-1">
          <Package className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">
            {productName}
            {itemCount > 1 && ` +${itemCount - 1}`}
          </span>
        </span>
        <span className="flex items-center gap-1 shrink-0">
          <Scale className="w-3.5 h-3.5" />
          {formatWeight(totalQty)} kg
        </span>
      </div>

      {/* Row 4: Amount + Date */}
      <div className="flex items-center justify-between text-caption">
        <span className="font-semibold text-primary">
          ฿{formatCurrency(lot.total_amount)}
        </span>
        <span className="text-steel-400">{formatDate(lot.created_at)}</span>
      </div>
    </button>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Sale Lot Table Row (Desktop)
// ═══════════════════════════════════════════════════════════════════════════════

function SaleLotTableRow({
  lot,
  onSelect,
}: {
  lot: SaleLotDTO;
  onSelect: (lot: SaleLotDTO) => void;
}) {
  const totalQty = getTotalQuantity(lot.items);
  const itemCount = lot.items?.length ?? 1;
  const productName =
    lot.items && lot.items.length > 0
      ? lot.items[0]?.name ?? "สินค้า"
      : "สินค้า";

  return (
    <tr
      onClick={() => onSelect(lot)}
      className="border-b border-steel-100 hover:bg-steel-50 cursor-pointer transition-colors"
    >
      <td className="py-3 px-4">
        <span className="font-mono text-sm font-semibold text-steel-900">
          {lot.reference_no}
        </span>
      </td>
      <td className="py-3 px-4">
        <span className="flex items-center gap-1 text-steel-700">
          <User className="w-3.5 h-3.5 text-steel-400" />
          {lot.buyer_name}
        </span>
      </td>
      <td className="py-3 px-4 text-steel-600 text-sm">
        <span className="truncate max-w-[160px] inline-block">
          {productName}
          {itemCount > 1 && (
            <span className="text-steel-400 ml-1">+{itemCount - 1}</span>
          )}
        </span>
      </td>
      <td className="py-3 px-4 text-steel-600 text-sm">
        {formatWeight(totalQty)} kg
      </td>
      <td className="py-3 px-4 text-sm font-semibold">
        ฿{formatCurrency(lot.total_amount)}
      </td>
      <td className="py-3 px-4">
        <StatusBadge status={lot.status} />
      </td>
      <td className="py-3 px-4 text-caption text-steel-400">
        {formatDate(lot.created_at)}
      </td>
    </tr>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Detail Modal / Slide Panel
// ═══════════════════════════════════════════════════════════════════════════════

function SaleLotDetail({
  lot,
  onClose,
  onAction,
  loading,
}: {
  lot: SaleLotDTO;
  onClose: () => void;
  onAction: (action: ModalType) => void;
  loading: boolean;
}) {
  const totalQty = getTotalQuantity(lot.items);
  const profit = lot.profit ?? (lot.total_amount - (lot.cost_total ?? 0));

  return (
    <div className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 animate-fade-in"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative w-full sm:max-w-lg max-h-[85vh] bg-white rounded-t-xl sm:rounded-xl shadow-modal animate-slide-up overflow-y-auto scrollbar-thin">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-steel-200 px-lg py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={onClose}
              className="min-h-touch min-w-touch flex items-center justify-center -ml-2 text-steel-500 hover:text-steel-700"
              aria-label="ปิด"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <h2 className="text-sm font-semibold text-steel-900 truncate">
                {lot.reference_no}
              </h2>
              <p className="text-caption text-steel-400">
                สร้างเมื่อ {formatDate(lot.created_at)}
              </p>
            </div>
          </div>
          <StatusBadge status={lot.status} />
        </div>

        {/* Content */}
        <div className="p-lg space-y-xl">
          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-lg">
            <div>
              <p className="text-caption text-steel-400 mb-1">ผู้ซื้อ</p>
              <p className="text-sm font-medium text-steel-800">
                {lot.buyer_name}
              </p>
            </div>
            <div>
              <p className="text-caption text-steel-400 mb-1">สาขา</p>
              <p className="text-sm font-medium text-steel-800">
                {lot.branch_name ?? "—"}
              </p>
            </div>
            <div>
              <p className="text-caption text-steel-400 mb-1">วันที่ขาย</p>
              <p className="text-sm font-medium text-steel-800">
                    {formatDate(lot.created_at)}
                  </p>
            </div>
            <div>
              <p className="text-caption text-steel-400 mb-1">น้ำหนักรวม</p>
              <p className="text-sm font-medium text-steel-800">
                {formatWeight(totalQty)} kg
              </p>
            </div>
          </div>

          {/* Financial Summary */}
          <div className="bg-steel-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-steel-600">ยอดขายรวม</span>
              <span className="font-semibold text-steel-900">
                ฿{formatCurrency(lot.total_amount)}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-steel-600">ต้นทุน (FIFO)</span>
              <span className="font-medium text-steel-700">
                ฿{formatCurrency(lot.cost_total ?? 0)}
              </span>
            </div>
            {lot.actual_revenue !== null && lot.actual_revenue !== undefined && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-steel-600">รายรับจริง</span>
                <span className="font-semibold text-info">฿{formatCurrency(lot.actual_revenue)}</span>
              </div>
            )}
            <div className="border-t border-steel-200 pt-2 flex justify-between items-center text-sm">
              <span className="font-medium text-steel-700">กำไร</span>
              <span
                className={cn(
                  "font-bold",
                  profit >= 0 ? "text-success" : "text-danger"
                )}
              >
                {profit >= 0 ? "+" : ""}฿{formatCurrency(profit)}
              </span>
            </div>
          </div>

          {/* Items Section */}
          {lot.items && lot.items.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-steel-800 mb-3 flex items-center gap-2">
                <Package className="w-4 h-4" />
                รายการสินค้า ({lot.items.length})
              </h3>
              <div className="space-y-2">
                {lot.items.map((item, idx) => (
                  <div
                    key={item.id ?? idx}
                    className="flex items-center justify-between bg-white border border-steel-200 rounded-lg p-3 text-sm"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-steel-800 truncate">
                        {item.name ?? "สินค้า"}
                      </p>
                      <p className="text-caption text-steel-400">
                        {item.category_name ?? ""}
                      </p>
                    </div>
                    <div className="text-right shrink-0 ml-3">
                      <p className="font-medium text-steel-800">
                        {formatWeight(item.quantity)} kg
                      </p>
                      <p className="text-caption text-steel-400">
                        ฿{formatCurrency(item.price_per_unit)}/kg
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {lot.notes && (
            <div>
              <h3 className="text-caption font-medium text-steel-400 mb-1">
                หมายเหตุ
              </h3>
              <p className="text-sm text-steel-700 bg-steel-50 rounded-lg p-3">
                {lot.notes}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col gap-2 pt-2 border-t border-steel-200">
            {lot.status === "draft" && (
              <Button
                variant="default"
                size="lg"
                className="w-full"
                onClick={() => onAction("confirm")}
                disabled={loading}
              >
                <Check className="w-4 h-4 mr-2" />
                ยืนยัน Sale Lot (ตัดสต็อก)
              </Button>
            )}
            {lot.status === "confirmed" && (
              <>
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full"
                  onClick={() => onAction("recordRevenue")}
                  disabled={loading}
                >
                  <Banknote className="w-4 h-4 mr-2" />
                  บันทึกรายรับจริง
                </Button>
                <Button
                  variant="destructive"
                  size="lg"
                  className="w-full"
                  onClick={() => onAction("cancel")}
                  disabled={loading}
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  ยกเลิก Sale Lot
                </Button>
              </>
            )}
            {(lot.status === "draft" || lot.status === "cancelled") && (
              <Button
                variant="ghost"
                size="lg"
                className="w-full text-steel-500"
                onClick={() => onAction("delete")}
                disabled={loading}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                ลบ Sale Lot
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Action Modal (Confirm / Cancel / Record Revenue / Delete)
// ═══════════════════════════════════════════════════════════════════════════════

function ActionModal({
  type,
  lot,
  onClose,
  onConfirm,
  loading,
}: {
  type: ModalType;
  lot: SaleLotDTO | null;
  onClose: () => void;
  onConfirm: (payload?: Record<string, unknown>) => void;
  loading: boolean;
}) {
  const [reason, setReason] = useState("");
  const [revenueAmount, setRevenueAmount] = useState(
    lot?.total_amount?.toString() ?? ""
  );
  const [revenueNote, setRevenueNote] = useState("");

  if (!type || !lot) return null;

  const titles: Record<string, string> = {
    confirm: "ยืนยัน Sale Lot",
    cancel: "ยกเลิก Sale Lot",
    recordRevenue: "บันทึกรายรับจริง",
    delete: "ลบ Sale Lot",
  };

  const descriptions: Record<string, string> = {
    confirm: `ยืนยัน Sale Lot ${lot.reference_no}? ระบบจะตัดสต็อกแบบ FIFO โดยอัตโนมัติ`,
    cancel: `ยกเลิก Sale Lot ${lot.reference_no}? ระบบจะคืนสต็อกกลับเข้า inventory`,
    recordRevenue: `บันทึกรายรับจริงสำหรับ ${lot.reference_no}`,
    delete: `ลบ Sale Lot ${lot.reference_no}? การกระทำนี้ไม่สามารถย้อนกลับได้`,
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-lg">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-sm bg-white rounded-xl shadow-modal animate-scale-in p-xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-lg">
          <h3 className="text-base font-semibold text-steel-900">
            {titles[type]}
          </h3>
          <button
            onClick={onClose}
            className="min-h-touch min-w-touch flex items-center justify-center -mr-2 text-steel-400 hover:text-steel-600"
            aria-label="ปิด"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <p className="text-sm text-steel-600 mb-lg">{descriptions[type]}</p>

        {type === "cancel" && (
          <div className="mb-lg">
            <label className="block text-caption font-medium text-steel-500 mb-1">
              เหตุผลที่ยกเลิก (ไม่บังคับ)
            </label>
            <textarea
              className="w-full min-h-[80px] rounded-md border border-steel-200 bg-white px-3 py-2 text-sm placeholder:text-steel-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 resize-none"
              placeholder="ระบุเหตุผล..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
        )}

        {type === "recordRevenue" && (
          <div className="space-y-md mb-lg">
            <div>
              <label className="block text-caption font-medium text-steel-500 mb-1">
                ยอดรายรับจริง (บาท) *
              </label>
              <Input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={revenueAmount}
                onChange={(e) => setRevenueAmount(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-caption font-medium text-steel-500 mb-1">
                หมายเหตุ
              </label>
              <textarea
                className="w-full min-h-[60px] rounded-md border border-steel-200 bg-white px-3 py-2 text-sm placeholder:text-steel-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 resize-none"
                placeholder="บันทึกเพิ่มเติม..."
                value={revenueNote}
                onChange={(e) => setRevenueNote(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            size="lg"
            className="flex-1"
            onClick={onClose}
            disabled={loading}
          >
            ยกเลิก
          </Button>
          <Button
            variant={
              type === "cancel" || type === "delete"
                ? "destructive"
                : "default"
            }
            size="lg"
            className="flex-1"
            onClick={() => {
              const payload: Record<string, unknown> = {};
              if (type === "cancel") payload.reason = reason;
              if (type === "recordRevenue") {
                payload.actual_revenue = parseFloat(revenueAmount) || 0;
                payload.actual_revenue_note = revenueNote;
              }
              onConfirm(payload);
            }}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : type === "recordRevenue" ? (
              <Banknote className="w-4 h-4 mr-2" />
            ) : type === "confirm" ? (
              <Check className="w-4 h-4 mr-2" />
            ) : type === "cancel" ? (
              <RotateCcw className="w-4 h-4 mr-2" />
            ) : (
              <Trash2 className="w-4 h-4 mr-2" />
            )}
            {type === "confirm"
              ? "ยืนยัน"
              : type === "cancel"
              ? "ยกเลิก"
              : type === "recordRevenue"
              ? "บันทึก"
              : "ลบ"}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Filter Bar
// ═══════════════════════════════════════════════════════════════════════════════

function FilterBar({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  dateFrom,
  onDateFromChange,
  dateTo,
  onDateToChange,
  showFilters,
  onToggleFilters,
}: {
  search: string;
  onSearchChange: (v: string) => void;
  statusFilter: SaleLotStatus | "";
  onStatusFilterChange: (v: SaleLotStatus | "") => void;
  dateFrom: string;
  onDateFromChange: (v: string) => void;
  dateTo: string;
  onDateToChange: (v: string) => void;
  showFilters: boolean;
  onToggleFilters: () => void;
}) {
  return (
    <div className="space-y-md">
      {/* Search Row */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-steel-400 pointer-events-none" />
          <input
            type="text"
            placeholder="ค้นหาเลขที่อ้างอิง, ผู้ซื้อ..."
            className="w-full h-10 pl-9 pr-3 rounded-md border border-steel-200 bg-white text-sm placeholder:text-steel-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <button
          onClick={onToggleFilters}
          className={cn(
            "min-h-touch min-w-touch flex items-center justify-center rounded-md border transition-colors",
            showFilters
              ? "bg-primary text-white border-primary"
              : "border-steel-200 text-steel-500 hover:bg-steel-100"
          )}
          aria-label="ตัวกรอง"
        >
          <Filter className="w-4 h-4" />
        </button>
      </div>

      {/* Expandable Filters */}
      {showFilters && (
        <div className="bg-white border border-steel-200 rounded-lg p-md space-y-md animate-slide-down">
          <div className="grid grid-cols-2 gap-md">
            {/* Status Filter */}
            <div>
              <label className="block text-caption font-medium text-steel-500 mb-1">
                สถานะ
              </label>
              <select
                className="w-full h-10 rounded-md border border-steel-200 bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                value={statusFilter}
                onChange={(e) =>
                  onStatusFilterChange(e.target.value as SaleLotStatus | "")
                }
              >
                <option value="">ทั้งหมด</option>
                <option value="draft">ร่าง</option>
                <option value="confirmed">ยืนยันแล้ว</option>
                <option value="cancelled">ยกเลิก</option>
              </select>
            </div>

            {/* Date From */}
            <div>
              <label className="block text-caption font-medium text-steel-500 mb-1">
                วันที่เริ่มต้น
              </label>
              <input
                type="date"
                className="w-full h-10 rounded-md border border-steel-200 bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                value={dateFrom}
                onChange={(e) => onDateFromChange(e.target.value)}
              />
            </div>

            {/* Date To */}
            <div>
              <label className="block text-caption font-medium text-steel-500 mb-1">
                วันที่สิ้นสุด
              </label>
              <input
                type="date"
                className="w-full h-10 rounded-md border border-steel-200 bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                value={dateTo}
                onChange={(e) => onDateToChange(e.target.value)}
              />
            </div>

            {/* Clear Filters */}
            <div className="flex items-end">
              <button
                onClick={() => {
                  onStatusFilterChange("");
                  onDateFromChange("");
                  onDateToChange("");
                  onSearchChange("");
                }}
                className="h-10 px-3 text-caption text-primary hover:text-primary-dark transition-colors font-medium"
              >
                ล้างตัวกรอง
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Pagination
// ═══════════════════════════════════════════════════════════════════════════════

function PaginationBar({
  page,
  totalPages,
  total,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  total: number;
  onPageChange: (p: number) => void;
}) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-steel-200 rounded-b-lg">
      <span className="text-caption text-steel-500">
        ทั้งหมด {total} รายการ
      </span>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="min-h-touch min-w-touch flex items-center justify-center rounded-md text-steel-500 hover:bg-steel-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label="ก่อนหน้า"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-caption font-medium text-steel-700 px-2">
          {page} / {totalPages}
        </span>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="min-h-touch min-w-touch flex items-center justify-center rounded-md text-steel-500 hover:bg-steel-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label="ถัดไป"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Summary Stats Bar
// ═══════════════════════════════════════════════════════════════════════════════

function SummaryStats({ lots }: { lots: SaleLotDTO[] }) {
  const totalAmount = lots.reduce((sum, l) => sum + (l.total_amount ?? 0), 0);
  const totalProfit = lots.reduce(
    (sum, l) => sum + (l.profit ?? (l.total_amount - (l.cost_total ?? 0))),
    0
  );
  const confirmedCount = lots.filter((l) => l.status === "confirmed").length;
  const draftCount = lots.filter((l) => l.status === "draft").length;

  return (
    <div className="grid grid-cols-3 gap-2">
      <div className="bg-white border border-steel-200 rounded-lg p-3 text-center">
        <p className="text-caption text-steel-400">รวมยอด</p>
        <p className="text-sm font-bold text-steel-900 mt-0.5">
          ฿{formatCurrency(totalAmount)}
        </p>
      </div>
      <div className="bg-white border border-steel-200 rounded-lg p-3 text-center">
        <p className="text-caption text-steel-400">กำไร</p>
        <p
          className={cn(
            "text-sm font-bold mt-0.5",
            totalProfit >= 0 ? "text-success" : "text-danger"
          )}
        >
          ฿{formatCurrency(totalProfit)}
        </p>
      </div>
      <div className="bg-white border border-steel-200 rounded-lg p-3 text-center">
        <p className="text-caption text-steel-400">สถานะ</p>
        <p className="text-sm font-medium text-steel-700 mt-0.5">
          {confirmedCount} ยืนยัน / {draftCount} ร่าง
        </p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Empty State
// ═══════════════════════════════════════════════════════════════════════════════

function EmptyState({ hasFilters }: { hasFilters: boolean }) {
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

// ═══════════════════════════════════════════════════════════════════════════════
// Loading Skeleton
// ═══════════════════════════════════════════════════════════════════════════════

function ListSkeleton() {
  return (
    <div className="space-y-md">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="bg-white rounded-lg border border-steel-200 p-4 animate-pulse"
        >
          <div className="flex justify-between mb-2">
            <div className="h-4 bg-steel-200 rounded w-28" />
            <div className="h-5 bg-steel-200 rounded-full w-16" />
          </div>
          <div className="h-3 bg-steel-200 rounded w-40 mb-3" />
          <div className="flex justify-between">
            <div className="h-3 bg-steel-200 rounded w-24" />
            <div className="h-3 bg-steel-200 rounded w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Main Page
// ═══════════════════════════════════════════════════════════════════════════════

export default function SaleLotsPage() {
  // ─── State ────────────────────────────────────────────────────────────────
  const [lots, setLots] = useState<SaleLotDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;

  // Filter state
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<SaleLotStatus | "">("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // UI state
  const [selectedLot, setSelectedLot] = useState<SaleLotDTO | null>(null);
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // ─── Toast ────────────────────────────────────────────────────────────────
  const addToast = useCallback((type: ToastType, message: string) => {
    const id = Date.now().toString() + Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // ─── Fetch Data ───────────────────────────────────────────────────────────
  const fetchLots = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: SaleLotQueryParams = {
        page,
        limit,
      };
      if (statusFilter) params.status = statusFilter;
      if (dateFrom) params.date_from = dateFrom;
      if (dateTo) params.date_to = dateTo;

      const response = await saleLotsApi.getAll(params);
      setLots(response.data ?? []);
      setTotalPages(response.pagination?.totalPages ?? 1);
      setTotal(response.pagination?.total ?? 0);
    } catch (err: any) {
      const msg =
        err?.userMessage ?? err?.message ?? "ไม่สามารถโหลดข้อมูล Sale Lots";
      setError(msg);
      addToast("error", msg);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, dateFrom, dateTo, addToast]);

  useEffect(() => {
    fetchLots();
  }, [fetchLots]);

  // ─── Client-side search filter ────────────────────────────────────────────
  const filteredLots = lots.filter((lot) => {
    if (!search) return true;
    const q = search.toLowerCase().trim();
    return (
      lot.reference_no?.toLowerCase().includes(q) ||
      lot.buyer_name?.toLowerCase().includes(q) ||
      lot.notes?.toLowerCase().includes(q) ||
      lot.items?.some(
        (item) =>
          item.name?.toLowerCase().includes(q) ||
          item.category_name?.toLowerCase().includes(q)
      )
    );
  });

  // ─── Actions ──────────────────────────────────────────────────────────────
  const handleConfirm = async (id: number) => {
    setActionLoading(true);
    try {
      const result = await saleLotsApi.confirm(id);
      addToast(
        "success",
        result?.message ?? `ยืนยัน Sale Lot #${id} สำเร็จ`
      );
      setActiveModal(null);
      setSelectedLot(null);
      fetchLots();
    } catch (err: any) {
      addToast("error", err?.userMessage ?? err?.message ?? "ยืนยันไม่สำเร็จ");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async (id: number, reason?: string) => {
    setActionLoading(true);
    try {
      const result = await saleLotsApi.cancel({ id, reason });
      addToast(
        "success",
        result?.message ?? `ยกเลิก Sale Lot #${id} สำเร็จ`
      );
      setActiveModal(null);
      setSelectedLot(null);
      fetchLots();
    } catch (err: any) {
      addToast(
        "error",
        err?.userMessage ?? err?.message ?? "ยกเลิกไม่สำเร็จ"
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleRecordRevenue = async (
    id: number,
    actualRevenue: number,
    note?: string
  ) => {
    setActionLoading(true);
    try {
      const result = await saleLotsApi.recordRevenue({
        id,
        actual_revenue: actualRevenue,
        ...(note ? { actual_revenue_note: note } : {}),
      });
      addToast(
        "success",
        result?.message ?? `บันทึกรายรับสำหรับ Sale Lot #${id} สำเร็จ`
      );
      setActiveModal(null);
      setSelectedLot(null);
      fetchLots();
    } catch (err: any) {
      addToast(
        "error",
        err?.userMessage ?? err?.message ?? "บันทึกรายรับไม่สำเร็จ"
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    setActionLoading(true);
    try {
      const result = await saleLotsApi.remove(id);
      addToast(
        "success",
        result?.message ?? `ลบ Sale Lot #${id} สำเร็จ`
      );
      setActiveModal(null);
      setSelectedLot(null);
      fetchLots();
    } catch (err: any) {
      addToast("error", err?.userMessage ?? err?.message ?? "ลบไม่สำเร็จ");
    } finally {
      setActionLoading(false);
    }
  };

  const handleModalAction = (payload?: Record<string, unknown>) => {
    if (!selectedLot || !activeModal) return;

    switch (activeModal) {
      case "confirm":
        handleConfirm(selectedLot.id);
        break;
      case "cancel":
        handleCancel(selectedLot.id, (payload?.reason as string) ?? "");
        break;
      case "recordRevenue":
        handleRecordRevenue(
          selectedLot.id,
          (payload?.actual_revenue as number) ?? 0,
          payload?.actual_revenue_note as string
        );
        break;
      case "delete":
        handleDelete(selectedLot.id);
        break;
    }
  };

  // ─── Action Bar Items ─────────────────────────────────────────────────────
  const getActionBarItems = () => {
    if (!selectedLot) return [];
    const items: Array<{
      label: string;
      icon: React.ReactNode;
      action: () => void;
      variant: "default" | "destructive" | "outline";
      show: boolean;
    }> = [
      {
        label: "ยืนยัน",
        icon: <Check className="w-5 h-5" />,
        action: () => setActiveModal("confirm"),
        variant: "default",
        show: selectedLot.status === "draft",
      },
      {
        label: "รายรับ",
        icon: <Banknote className="w-5 h-5" />,
        action: () => setActiveModal("recordRevenue"),
        variant: "outline",
        show: selectedLot.status === "confirmed",
      },
      {
        label: "ยกเลิก",
        icon: <RotateCcw className="w-5 h-5" />,
        action: () => setActiveModal("cancel"),
        variant: "destructive",
        show: selectedLot.status === "confirmed",
      },
      {
        label: "ลบ",
        icon: <Trash2 className="w-5 h-5" />,
        action: () => setActiveModal("delete"),
        variant: "destructive",
        show:
          selectedLot.status === "draft" || selectedLot.status === "cancelled",
      },
    ];
    return items.filter((item) => item.show);
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  const actionBarItems = getActionBarItems();
  const hasFilters = !!statusFilter || !!dateFrom || !!dateTo || !!search;

  return (
    <div className="min-h-screen bg-steel-50">
      {/* Toast Container */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Page Header */}
      <div className="sticky top-0 z-30 bg-white border-b border-steel-200">
        <div className="flex items-center justify-between px-lg py-3">
          {selectedLot && viewMode === "detail" ? (
            <button
              onClick={() => {
                setSelectedLot(null);
                setViewMode("list");
              }}
              className="flex items-center gap-2 text-steel-700 hover:text-steel-900 transition-colors min-h-touch"
            >
              <ChevronLeft className="w-5 h-5" />
              <span className="text-sm font-medium">กลับ</span>
            </button>
          ) : (
            <>
              <h1 className="text-base font-bold text-steel-900 flex items-center gap-2">
                <Receipt className="w-5 h-5 text-primary" />
                Sale Lots
              </h1>
              <span className="text-caption text-steel-400 bg-steel-100 px-2 py-0.5 rounded-full">
                {total} รายการ
              </span>
            </>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="px-lg py-md pb-24 space-y-md max-w-screen-sm mx-auto">
        {viewMode === "list" && (
          <>
            {/* Filter Bar */}
            <FilterBar
              search={search}
              onSearchChange={setSearch}
              statusFilter={statusFilter}
              onStatusFilterChange={(v) => {
                setStatusFilter(v);
                setPage(1);
              }}
              dateFrom={dateFrom}
              onDateFromChange={(v) => {
                setDateFrom(v);
                setPage(1);
              }}
              dateTo={dateTo}
              onDateToChange={(v) => {
                setDateTo(v);
                setPage(1);
              }}
              showFilters={showFilters}
              onToggleFilters={() => setShowFilters(!showFilters)}
            />

            {/* Summary Stats */}
            {!loading && filteredLots.length > 0 && (
              <SummaryStats lots={filteredLots} />
            )}

            {/* Loading State */}
            {loading && <ListSkeleton />}

            {/* Error State */}
            {!loading && error && (
              <div className="bg-danger-light border border-danger/20 rounded-lg p-xl text-center">
                <AlertCircle className="w-8 h-8 text-danger mx-auto mb-2" />
                <p className="text-sm text-danger-dark">{error}</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-md"
                  onClick={fetchLots}
                >
                  ลองใหม่
                </Button>
              </div>
            )}

            {/* Empty State */}
            {!loading && !error && filteredLots.length === 0 && (
              <EmptyState hasFilters={hasFilters} />
            )}

            {/* Desktop Table (hidden on mobile) */}
            {!loading && !error && filteredLots.length > 0 && (
              <>
                {/* Mobile Card View (sm and below) */}
                <div className="block sm:hidden space-y-md">
                  {filteredLots.map((lot) => (
                    <SaleLotCard
                      key={lot.id}
                      lot={lot}
                      onSelect={(l) => {
                        setSelectedLot(l);
                        setViewMode("detail");
                      }}
                    />
                  ))}
                </div>

                {/* Desktop Table View (sm and above) */}
                <div className="hidden sm:block bg-white rounded-lg border border-steel-200 shadow-card overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-steel-200 bg-steel-50">
                        <th className="py-3 px-4 text-left text-caption font-medium text-steel-500 uppercase tracking-wider">
                          เลขที่
                        </th>
                        <th className="py-3 px-4 text-left text-caption font-medium text-steel-500 uppercase tracking-wider">
                          ผู้ซื้อ
                        </th>
                        <th className="py-3 px-4 text-left text-caption font-medium text-steel-500 uppercase tracking-wider">
                          สินค้า
                        </th>
                        <th className="py-3 px-4 text-left text-caption font-medium text-steel-500 uppercase tracking-wider">
                          ปริมาณ
                        </th>
                        <th className="py-3 px-4 text-left text-caption font-medium text-steel-500 uppercase tracking-wider">
                          ยอดรวม
                        </th>
                        <th className="py-3 px-4 text-left text-caption font-medium text-steel-500 uppercase tracking-wider">
                          สถานะ
                        </th>
                        <th className="py-3 px-4 text-left text-caption font-medium text-steel-500 uppercase tracking-wider">
                          วันที่
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredLots.map((lot) => (
                        <SaleLotTableRow
                          key={lot.id}
                          lot={lot}
                          onSelect={(l) => {
                            setSelectedLot(l);
                            setViewMode("detail");
                          }}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <PaginationBar
                  page={page}
                  totalPages={totalPages}
                  total={total}
                  onPageChange={setPage}
                />
              </>
            )}
          </>
        )}

        {/* Detail View */}
        {viewMode === "detail" && selectedLot && (
          <SaleLotDetail
            lot={selectedLot}
            onClose={() => {
              setSelectedLot(null);
              setViewMode("list");
            }}
            onAction={(action) => setActiveModal(action)}
            loading={actionLoading}
          />
        )}
      </div>

      {/* Bottom Action Bar (mobile touch) */}
      {viewMode === "detail" && selectedLot && actionBarItems.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-steel-200 safe-area-bottom animate-slide-up">
          <div className="flex items-stretch max-w-screen-sm mx-auto">
            {actionBarItems.map((item, idx) => (
              <button
                key={idx}
                onClick={item.action}
                disabled={actionLoading}
                className={cn(
                  "flex-1 flex flex-col items-center justify-center gap-0.5 py-2 min-h-touch text-caption font-medium transition-colors",
                  item.variant === "default" &&
                    "text-white bg-primary hover:bg-primary-dark",
                  item.variant === "destructive" &&
                    "text-danger hover:bg-danger-light",
                  item.variant === "outline" &&
                    "text-steel-700 hover:bg-steel-100 border-r border-steel-200",
                  actionLoading && "opacity-50"
                )}
              >
                {actionLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  item.icon
                )}
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Action Modal */}
      <ActionModal
        type={activeModal}
        lot={selectedLot}
        onClose={() => setActiveModal(null)}
        onConfirm={handleModalAction}
        loading={actionLoading}
      />
    </div>
  );
}
