/**
 * SoloCorp POS — Inventory Bridge Module
 * ========================================
 * Inventory Management — จัดการ Categories, Products, Stock Alerts
 *
 * @phase 1
 * @module api-bridge/inventory
 */

import { client } from "./client";
import type {
  ApiSuccessResponse,
  ApiPaginatedResponse,
  CategoryDTO,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  ProductDTO,
  CreateProductRequest,
  UpdateProductRequest,
  InventoryTransactionDTO,
  CreateInventoryTransactionRequest,
  StockAlertDTO,
  SetThresholdRequest,
  ProductQueryParams,
} from "./types";

export interface InventoryModule {
  // ─── Categories ──────────────────────────────────────
  /** หมวดหมู่ทั้งหมด */
  getCategories(): Promise<ApiSuccessResponse<CategoryDTO[]>>;

  /** ดูหมวดหมู่ตาม ID */
  getCategoryById(id: number): Promise<ApiSuccessResponse<CategoryDTO>>;

  /** สร้างหมวดหมู่ */
  createCategory(
    data: CreateCategoryRequest
  ): Promise<ApiSuccessResponse<{ id: number; name: string }>>;

  /** แก้ไขหมวดหมู่ */
  updateCategory(
    id: number,
    data: UpdateCategoryRequest
  ): Promise<ApiSuccessResponse<{ message: string }>>;

  /** ลบหมวดหมู่ */
  deleteCategory(id: number): Promise<ApiSuccessResponse<{ message: string }>>;

  // ─── Products ────────────────────────────────────────
  /** รายการสินค้าทั้งหมด (paginated) */
  getProducts(
    params?: ProductQueryParams
  ): Promise<ApiPaginatedResponse<ProductDTO>>;

  /** ดูสินค้าตาม ID */
  getProductById(id: number): Promise<ApiSuccessResponse<ProductDTO>>;

  /** สร้างสินค้าใหม่ */
  createProduct(
    data: CreateProductRequest
  ): Promise<ApiSuccessResponse<{ id: number; name: string }>>;

  /** แก้ไขสินค้า */
  updateProduct(
    id: number,
    data: UpdateProductRequest
  ): Promise<ApiSuccessResponse<{ message: string }>>;

  /** ลบสินค้า */
  deleteProduct(id: number): Promise<ApiSuccessResponse<{ message: string }>>;

  // ─── Stock Management ────────────────────────────────
  /** สินค้าที่สต็อกต่ำกว่าเกณฑ์ */
  getLowStock(): Promise<ApiSuccessResponse<ProductDTO[]>>;

  /** ประวัติเคลื่อนไหวสต็อก */
  getTransactions(
    params?: Record<string, unknown>
  ): Promise<ApiPaginatedResponse<InventoryTransactionDTO>>;

  /** บันทึกการเคลื่อนไหวสต็อก */
  createTransaction(
    data: CreateInventoryTransactionRequest
  ): Promise<ApiSuccessResponse<{ id: number }>>;

  /** ตั้งค่า alert threshold */
  setThreshold(
    data: SetThresholdRequest
  ): Promise<ApiSuccessResponse<{ message: string }>>;

  /** รายการแจ้งเตือนสต็อกต่ำ */
  getStockAlerts(): Promise<ApiSuccessResponse<StockAlertDTO[]>>;
}

export const inventoryApi: InventoryModule = {
  // Categories
  getCategories: () =>
    client.get<ApiSuccessResponse<CategoryDTO[]>>("/inventory/categories"),

  getCategoryById: (id) =>
    client.get<ApiSuccessResponse<CategoryDTO>>("/inventory/category", { id }),

  createCategory: (data) =>
    client.post<ApiSuccessResponse<{ id: number; name: string }>>(
      "/inventory/categories",
      data
    ),

  updateCategory: (id, data) =>
    client.put<ApiSuccessResponse<{ message: string }>>("/inventory/category", {
      ...data,
      id,
    }),

  deleteCategory: (id) =>
    client.delete<ApiSuccessResponse<{ message: string }>>(
      "/inventory/category",
      { id }
    ),

  // Products
  getProducts: (params) =>
    client.get<ApiPaginatedResponse<ProductDTO>>(
      "/inventory/products",
      params as Record<string, unknown>
    ),

  getProductById: (id) =>
    client.get<ApiSuccessResponse<ProductDTO>>("/inventory/product", { id }),

  createProduct: (data) =>
    client.post<ApiSuccessResponse<{ id: number; name: string }>>(
      "/inventory/products",
      data
    ),

  updateProduct: (id, data) =>
    client.put<ApiSuccessResponse<{ message: string }>>("/inventory/product", {
      ...data,
      id,
    }),

  deleteProduct: (id) =>
    client.delete<ApiSuccessResponse<{ message: string }>>(
      "/inventory/product",
      { id }
    ),

  // Stock
  getLowStock: () =>
    client.get<ApiSuccessResponse<ProductDTO[]>>("/inventory/low-stock"),

  getTransactions: (params) =>
    client.get<ApiPaginatedResponse<InventoryTransactionDTO>>(
      "/inventory/transactions",
      params
    ),

  createTransaction: (data) =>
    client.post<ApiSuccessResponse<{ id: number }>>(
      "/inventory/transactions",
      data
    ),

  setThreshold: (data) =>
    client.post<ApiSuccessResponse<{ message: string }>>(
      "/inventory/set-threshold",
      data
    ),

  getStockAlerts: () =>
    client.get<ApiSuccessResponse<StockAlertDTO[]>>("/inventory/stock-alerts"),
};
