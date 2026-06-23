"use client";

import { useState, useEffect, useCallback } from "react";
import { apiBridge, BridgeApiError } from "@/lib/api-bridge";
import { formatThaiDateTime, formatCurrency } from "@/lib/utils";
import type {
  PurchaseOrderDTO,
  PurchaseOrderItemDTO,
} from "@/lib/api-bridge/types";
import { ArrowLeft, Layers, Tag, Scale } from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import { ErrorView } from "./ErrorView";

export function PODetail({
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
