"use client";

import { useState, useCallback, useMemo } from "react";
import { apiBridge, BridgeApiError } from "@/lib/api-bridge";
import DashboardShell from "@/lib/components/shell/DashboardShell";
import { formatCurrency } from "@/lib/utils";
import type { CatalogItemDTO } from "@/lib/api-bridge/types";
import { Scale, Plus, CheckCircle, ArrowLeft } from "lucide-react";

import { SellerStepSection } from "./_components/SellerStepSection";
import { ItemsStepSection } from "./_components/ItemsStepSection";
import { ReviewStepSection } from "./_components/ReviewStepSection";
import { CatalogItemPicker } from "./_components/CatalogItemPicker";
import type { WeighItem, Step } from "./_components/types";

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
    (index: number, updates: Partial<Omit<WeighItem, "tempId">>) => {
      setItems((prev) => {
        const next = [...prev];
        const current = next[index]!;
        const weight = updates.weight ?? current.weight;
        const deductionPct = updates.deduction_pct ?? current.deduction_pct;
        const pricePerUnit = updates.price_per_unit ?? current.price_per_unit;
        const deductionWeight = (weight * deductionPct) / 100;
        const netWeight = Math.max(0, weight - deductionWeight);
        const total = netWeight * pricePerUnit;
        next[index] = {
          ...current,
          ...updates,
          deduction_weight: deductionWeight,
          net_weight: netWeight,
          total,
        } as WeighItem;
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

      {step === "seller" && (
        <SellerStepSection
          sellerId={sellerId}
          sellerName={sellerName}
          onSellerChange={(id, name) => {
            setSellerId(id);
            setSellerName(name);
          }}
          onNext={() => setStep("items")}
        />
      )}
      {step === "items" && (
        <ItemsStepSection
          step={step}
          items={items}
          onAddItem={() => setShowCatalog(true)}
          onUpdateItem={handleUpdateItem}
          onRemoveItem={handleRemoveItem}
          notes={notes}
          onNotesChange={setNotes}
          paymentMethod={paymentMethod}
          onPaymentChange={setPaymentMethod}
          grandTotal={grandTotal}
          onNext={() => setStep("review")}
        />
      )}
      {step === "review" && (
        <ReviewStepSection
          step={step}
          sellerName={sellerName}
          items={items}
          paymentMethod={paymentMethod}
          notes={notes}
          grandTotal={grandTotal}
          submitError={submitError}
          submitting={submitting}
          onEditSeller={() => setStep("seller")}
          onEditItems={() => setStep("items")}
          onSubmit={handleSubmit}
        />
      )}
    </DashboardShell>
  );
}
