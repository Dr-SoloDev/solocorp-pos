"use client";

import { useState, useEffect, useCallback } from "react";
import { apiBridge, BridgeApiError } from "@/lib/api-bridge";
import DashboardShell from "@/lib/components/shell/DashboardShell";
import type {
  PurchaseOrderDTO,
  PaginationMeta,
} from "@/lib/api-bridge/types";
import {
  Plus,
  Package,
  RefreshCw,
} from "lucide-react";
import { CreatePOForm } from "./_components/CreatePOForm";
import { PODetail } from "./_components/PODetail";
import { POCard } from "./_components/POCard";
import { SearchFilterBar } from "./_components/SearchFilterBar";
import { ErrorView } from "./_components/ErrorView";

// ─── Types ──────────────────────────────────────────────────────────────────

type ViewMode = "list" | "create" | "detail";

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
