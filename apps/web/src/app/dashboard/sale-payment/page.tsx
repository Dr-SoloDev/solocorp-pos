"use client";

import { useState, useMemo, useCallback } from "react";
import { apiBridge, BridgeApiError } from "@/lib/api-bridge";
import DashboardShell from "@/lib/components/shell/DashboardShell";
import { formatCurrency } from "@/lib/utils";
import type { ProductDTO } from "@/lib/api-bridge/types";
import { DollarSign, ArrowLeft, CheckCircle, Plus } from "lucide-react";

import ProductPicker from "./_components/ProductPicker";
import BuyerStep from "./_components/BuyerStep";
import ItemsStep from "./_components/ItemsStep";
import ReviewStep from "./_components/ReviewStep";
import type { SaleItem, PaymentMethod } from "./_components/types";

type Step = "buyer" | "items" | "review";

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
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
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
  const handleSelectProduct = useCallback(
    (product: ProductDTO) => {
      setItems((prev) => [
        ...prev,
        {
          tempId: newTempId(),
          product_id: product.id,
          name: product.name,
          category_name: product.category_name || "",
          quantity: 0,
          price: 0,
          total: 0,
        },
      ]);
    },
    []
  );

  const handleUpdateItem = useCallback(
    (index: number, updates: Partial<Omit<SaleItem, "tempId">>) => {
      setItems((prev) => {
        const next = [...prev];
        next[index] = { ...next[index], ...updates } as SaleItem;
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
    if (validItems.length === 0) return;
    setSubmitting(true);
    setSubmitError("");

    try {
      const result = await apiBridge.sales.create({
        customer_id: undefined,
        payment_method: paymentMethod,
        notes: notes.trim() || undefined,
        items: validItems.map((i) => ({
          product_id: i.product_id,
          quantity: i.quantity,
          price: i.price,
          total: i.total,
        })),
      });

      setSuccess({
        ref: result.data.reference_no,
        amount: grandTotal,
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
    setPaymentMethod("cash");
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

  // ── Main Render ──────────────────────────────────
  return (
    <DashboardShell>
      {showInventory && (
        <ProductPicker
          onSelect={(item) => {
            handleSelectProduct(item);
            setShowInventory(false);
          }}
          onClose={() => setShowInventory(false)}
        />
      )}

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

      {step === "buyer" && (
        <BuyerStep
          buyerName={buyerName}
          buyerPhone={buyerPhone}
          onBuyerNameChange={setBuyerName}
          onBuyerPhoneChange={setBuyerPhone}
          onNext={() => setStep("items")}
        />
      )}
      {step === "items" && (
        <ItemsStep
          step={step}
          items={items}
          paymentMethod={paymentMethod}
          onPaymentMethodChange={setPaymentMethod}
          notes={notes}
          onNotesChange={setNotes}
          grandTotal={grandTotal}
          validItems={validItems}
          onAddItem={() => setShowInventory(true)}
          onNext={() => setStep("review")}
          onUpdateItem={handleUpdateItem}
          onRemoveItem={handleRemoveItem}
        />
      )}
      {step === "review" && (
        <ReviewStep
          step={step}
          buyerName={buyerName}
          buyerPhone={buyerPhone}
          paymentMethod={paymentMethod}
          validItems={validItems}
          notes={notes}
          grandTotal={grandTotal}
          submitError={submitError}
          submitting={submitting}
          onEditBuyer={() => setStep("buyer")}
          onEditItems={() => setStep("items")}
          onSubmit={handleSubmit}
        />
      )}
    </DashboardShell>
  );
}
