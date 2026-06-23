import type { SaleLotItemDTO } from "@/lib/api-bridge/types";

export function formatDate(dateStr: string | undefined | null): string {
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

export function formatWeight(kg: number | undefined | null): string {
  if (kg === null || kg === undefined) return "—";
  return new Intl.NumberFormat("th-TH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(kg);
}

export function getTotalQuantity(items: SaleLotItemDTO[] | undefined): number {
  if (!items || items.length === 0) return 0;
  return items.reduce((sum, item) => sum + (item.quantity ?? 0), 0);
}
