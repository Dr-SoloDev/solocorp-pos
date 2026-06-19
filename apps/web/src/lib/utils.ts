// Date formatting utilities for Thai locale
export function formatThaiDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString("th-TH", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function formatThaiDateTime(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString("th-TH", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Currency formatting
export function formatCurrency(amount: number | string): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
  }).format(num);
}

// Generate order code
export function generateOrderCode(prefix: string): string {
  const date = new Date();
  const yy = date.getFullYear().toString().slice(-2);
  const mm = (date.getMonth() + 1).toString().padStart(2, "0");
  const dd = date.getDate().toString().padStart(2, "0");
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}${yy}${mm}${dd}-${rand}`;
}
