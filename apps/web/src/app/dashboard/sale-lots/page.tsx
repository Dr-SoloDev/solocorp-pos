"use client";

/**
 * Sale Lots Page — Bridge Client UI
 * Paginated list with search/filter, status actions, mobile-first.
 * @phase 1
 * @module app/dashboard/sale-lots/page
 */

import { useState, useEffect, useCallback } from "react";
import { saleLotsApi } from "@/lib/api-bridge/sale-lots";
import type {
  SaleLotDTO,
  SaleLotStatus,
  SaleLotQueryParams,
} from "@/lib/api-bridge/types";
import { Button, cn } from "@solocorp/ui";
import {
  AlertCircle,
  Banknote,
  Check,
  ChevronLeft,
  Loader2,
  Receipt,
  RotateCcw,
  Trash2,
} from "lucide-react";
import {
  SaleLotDetail,
  ActionModal,
  ToastContainer,
  SaleLotCard,
  SaleLotTableRow,
  FilterBar,
  PaginationBar,
  SummaryStats,
  EmptyState,
  ListSkeleton,
  type ModalType,
  type ViewMode,
  type ToastType,
  type ToastMessage,
} from "./_components";

// ─── Main Page ──────────────────

export default function SaleLotsPage() {
  // State
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

  // Toast
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

  // Fetch Data
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

  // Client-side search filter
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

  // Actions
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

  // Action Bar Items
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

  // Render
  const actionBarItems = getActionBarItems();
  const hasFilters = !!statusFilter || !!dateFrom || !!dateTo || !!search;

  return (
    <div className="min-h-screen bg-steel-50">
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

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

      <div className="px-lg py-md pb-24 space-y-md max-w-screen-sm mx-auto">
        {viewMode === "list" && (
          <>
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

            {!loading && filteredLots.length > 0 && (
              <SummaryStats lots={filteredLots} />
            )}

            {loading && <ListSkeleton />}

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

            {!loading && !error && filteredLots.length === 0 && (
              <EmptyState hasFilters={hasFilters} />
            )}

            {!loading && !error && filteredLots.length > 0 && (
              <>
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
