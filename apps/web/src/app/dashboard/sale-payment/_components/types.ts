export interface SaleItem {
  tempId: string;
  product_id: number;
  name: string;
  category_name: string;
  quantity: number;
  price: number;
  total: number;
}

export type PaymentMethod = "cash" | "bank_transfer";
