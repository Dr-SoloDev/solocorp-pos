/**
 * SoloCorp POS — Catalog Bridge Module
 * ======================================
 * Catalog & Price Tiers — จัดการ Purchase Catalog, Tier Prices, Item Conditions
 *
 * @phase 1
 * @module api-bridge/catalog
 */

import { client } from "./client";
import type {
  ApiSuccessResponse,
  ApiPaginatedResponse,
  CatalogItemDTO,
  CreateCatalogItemRequest,
  UpdateCatalogItemRequest,
  UpdateCatalogCategoryRequest,
  UpdatePriceTierRequest,
  ItemConditionDTO,
  PriceBoardDTO,
  CatalogQueryParams,
} from "./types";

export interface CatalogModule {
  // ─── Price Tiers ───────────────────────────────────
  /** ดู catalog พร้อม tier_prices */
  getPriceTiers(): Promise<ApiSuccessResponse<CatalogItemDTO[]>>;

  /** เพิ่มรายการลง price tier */
  createPriceTier(
    data: CatalogItemDTO
  ): Promise<ApiSuccessResponse<{ id: number }>>;

  /** อัปเดตราคา tier ของรายการ */
  updatePriceTier(
    data: UpdatePriceTierRequest
  ): Promise<ApiSuccessResponse<{ message: string }>>;

  // ─── Purchase Catalog ──────────────────────────────
  /** ดูรายการทั้งหมดใน catalog (paginated) */
  getAllItems(
    params?: CatalogQueryParams
  ): Promise<ApiPaginatedResponse<CatalogItemDTO>>;

  /** สร้างรายการใหม่ใน catalog */
  createItem(
    data: CreateCatalogItemRequest
  ): Promise<ApiSuccessResponse<{ id: number; code: string }>>;

  /** ค้นหารายการใน catalog */
  search(
    q: string
  ): Promise<ApiSuccessResponse<CatalogItemDTO[]>>;

  /** ดูรายการตาม ID */
  getItemById(id: number): Promise<ApiSuccessResponse<CatalogItemDTO>>;

  /** แก้ไขรายการใน catalog */
  updateItem(
    id: number,
    data: UpdateCatalogItemRequest
  ): Promise<ApiSuccessResponse<{ message: string }>>;

  /** ลบรายการออกจาก catalog */
  deleteItem(id: number): Promise<ApiSuccessResponse<{ message: string }>>;

  /** อัปเดต category_id ของรายการ */
  updateCategory(
    data: UpdateCatalogCategoryRequest
  ): Promise<ApiSuccessResponse<{ message: string }>>;

  /** ดึงราคาสำหรับพิมพ์ price board */
  getPriceBoard(): Promise<ApiSuccessResponse<PriceBoardDTO>>;

  // ─── Item Conditions ──────────────────────────────
  /** ดูสภาพของทั้งหมด */
  getItemConditions(): Promise<ApiSuccessResponse<ItemConditionDTO[]>>;
}

export const catalogApi: CatalogModule = {
  getPriceTiers: () =>
    client.get<ApiSuccessResponse<CatalogItemDTO[]>>("/price-tiers"),

  createPriceTier: (data) =>
    client.post<ApiSuccessResponse<{ id: number }>>("/price-tiers", data),

  updatePriceTier: (data) =>
    client.put<ApiSuccessResponse<{ message: string }>>("/price-tiers/category", data),

  getAllItems: (params) =>
    client.get<ApiPaginatedResponse<CatalogItemDTO>>(
      "/purchase-catalog",
      params as Record<string, unknown>
    ),

  createItem: (data) =>
    client.post<ApiSuccessResponse<{ id: number; code: string }>>(
      "/purchase-catalog",
      data
    ),

  search: (q) =>
    client.get<ApiSuccessResponse<CatalogItemDTO[]>>("/purchase-catalog/search", { q }),

  getItemById: (id) =>
    client.get<ApiSuccessResponse<CatalogItemDTO>>("/purchase-catalog/item", { id }),

  updateItem: (id, data) =>
    client.put<ApiSuccessResponse<{ message: string }>>("/purchase-catalog/item", {
      ...data,
      id,
    }),

  deleteItem: (id) =>
    client.delete<ApiSuccessResponse<{ message: string }>>("/purchase-catalog/item", { id }),

  updateCategory: (data) =>
    client.post<ApiSuccessResponse<{ message: string }>>(
      "/purchase-catalog/update-category",
      data
    ),

  getPriceBoard: () =>
    client.get<ApiSuccessResponse<PriceBoardDTO>>("/purchase-catalog/price-board"),

  getItemConditions: () =>
    client.get<ApiSuccessResponse<ItemConditionDTO[]>>("/item-conditions"),
};
