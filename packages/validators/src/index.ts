import { z } from "zod";

// ─── Auth ───────────────────────────────────────────────

export const loginSchema = z.object({
  email: z.string().email("กรุณากรอกอีเมลที่ถูกต้อง"),
  password: z.string().min(6, "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร"),
});

export const registerSchema = z.object({
  email: z.string().email("กรุณากรอกอีเมลที่ถูกต้อง"),
  name: z.string().min(2, "ชื่อต้องมีอย่างน้อย 2 ตัวอักษร"),
  password: z.string().min(6, "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร"),
  role: z.enum(["ADMIN", "MANAGER", "CASHIER", "VIEWER"]).default("CASHIER"),
});

// ─── Product ────────────────────────────────────────────

export const productSchema = z.object({
  name: z.string().min(1, "กรุณากรอกชื่อสินค้า"),
  barcode: z.string().optional(),
  sku: z.string().optional(),
  description: z.string().optional(),
  categoryId: z.string().optional(),
  unit: z.string().default("ชิ้น"),
  buyPrice: z.number().positive().optional(),
  sellPrice: z.number().positive().optional(),
  minStock: z.number().int().min(0).default(0),
  maxStock: z.number().int().min(0).optional(),
  imageUrl: z.string().url().optional(),
});

export const productUpdateSchema = productSchema.partial();

// ─── Category ───────────────────────────────────────────

export const categorySchema = z.object({
  name: z.string().min(1, "กรุณากรอกชื่อหมวดหมู่"),
  description: z.string().optional(),
  parentId: z.string().optional(),
});

// ─── Purchase Order ─────────────────────────────────────

export const purchaseItemSchema = z.object({
  productId: z.string(),
  quantity: z.number().int().positive("จำนวนต้องมากกว่า 0"),
  unitPrice: z.number().positive("ราคาต้องมากกว่า 0"),
  condition: z.enum(["GOOD", "FAIR", "POOR"]).default("GOOD"),
  notes: z.string().optional(),
});

export const purchaseOrderSchema = z.object({
  sellerName: z.string().optional(),
  sellerPhone: z.string().optional(),
  sellerIdCard: z.string().optional(),
  sellerAddress: z.string().optional(),
  discount: z.number().min(0).default(0),
  paymentMethod: z.enum(["CASH", "PROMPTPAY", "BANK_TRANSFER", "CREDIT_CARD", "QR_CODE"]).default("CASH"),
  notes: z.string().optional(),
  items: z.array(purchaseItemSchema).min(1, "ต้องมีอย่างน้อย 1 รายการ"),
});

// ─── Sale Order ─────────────────────────────────────────

export const saleItemSchema = z.object({
  productId: z.string(),
  lotId: z.string().optional(),
  quantity: z.number().int().positive("จำนวนต้องมากกว่า 0"),
  unitPrice: z.number().positive("ราคาต้องมากกว่า 0"),
  notes: z.string().optional(),
});

export const saleOrderSchema = z.object({
  customerName: z.string().optional(),
  customerPhone: z.string().optional(),
  discount: z.number().min(0).default(0),
  paymentMethod: z.enum(["CASH", "PROMPTPAY", "BANK_TRANSFER", "CREDIT_CARD", "QR_CODE"]).default("CASH"),
  notes: z.string().optional(),
  items: z.array(saleItemSchema).min(1, "ต้องมีอย่างน้อย 1 รายการ"),
});

// ─── Inventory ──────────────────────────────────────────

export const inventoryAdjustmentSchema = z.object({
  lotId: z.string(),
  type: z.enum(["PURCHASE", "SALE", "RETURN", "ADJUSTMENT"]).default("ADJUSTMENT"),
  quantity: z.number().int("จำนวนต้องเป็นเลขจำนวนเต็ม"),
  reason: z.string().min(1, "กรุณากรอกเหตุผล"),
});

// ─── Branch ─────────────────────────────────────────────

export const branchSchema = z.object({
  name: z.string().min(1, "กรุณากรอกชื่อสาขา"),
  code: z.string().min(1, "กรุณากรอกรหัสสาขา"),
  address: z.string().optional(),
  phone: z.string().optional(),
});

// ─── User ───────────────────────────────────────────────

export const userCreateSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  password: z.string().min(6),
  role: z.enum(["ADMIN", "MANAGER", "CASHIER", "VIEWER"]),
  phone: z.string().optional(),
  branchId: z.string().optional(),
});

export const userUpdateSchema = userCreateSchema.partial().omit({ password: true });

// ─── Settings ───────────────────────────────────────────

export const settingSchema = z.object({
  key: z.string().min(1),
  value: z.string(),
});

// ─── Types ──────────────────────────────────────────────

export type LoginInput = z.infer<typeof loginSchema>;
export type ProductInput = z.infer<typeof productSchema>;
export type PurchaseOrderInput = z.infer<typeof purchaseOrderSchema>;
export type SaleOrderInput = z.infer<typeof saleOrderSchema>;
