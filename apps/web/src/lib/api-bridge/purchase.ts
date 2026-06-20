/**
 * SoloCorp POS — Purchase Orders Bridge Module
 * ==============================================
 * Purchase Orders CRUD — จัดการรับซื้อสินค้า (Business Rule 2.x)
 *
 * Key Business Rules:
 * - PO มี 3-tier pricing (บิล 1/2/3)
 * - Item conditions with weight deduction
 * - FIFO costing สำหรับ inventory
 *
 * @phase 1
 * @module api-bridge/purchase
 */

import { client } from "./client";
import type {
  ApiPaginatedResponse,
  ApiSuccessResponse,
  PurchaseOrderDTO,
  CreatePurchaseOrderRequest,
  CancelPurchaseOrderRequest,
  PurchaseOrderQueryParams,
  PhotoDTO,
  PhotoTokenDTO,
} from "./types";

export interface PurchaseModule {
  /** รายการ Purchase Orders ทั้งหมด (paginated + filterable) */
  getAll(
    params?: PurchaseOrderQueryParams
  ): Promise<ApiPaginatedResponse<PurchaseOrderDTO>>;

  /** ดู PO รายการตาม ID */
  getById(id: number): Promise<ApiSuccessResponse<PurchaseOrderDTO>>;

  /** สร้าง PO ใหม่ */
  create(
    data: CreatePurchaseOrderRequest
  ): Promise<ApiSuccessResponse<{ id: number; reference_no: string; total_amount: number }>>;

  /** ยกเลิก PO */
  cancel(
    data: CancelPurchaseOrderRequest
  ): Promise<ApiSuccessResponse<{ message: string }>>;

  /** อัปโหลดรูป PO */
  uploadPhoto(
    poId: number,
    file: File
  ): Promise<ApiSuccessResponse<{ filename: string; url: string }>>;

  /** ดูรูปของ PO */
  getPhotos(poId: number): Promise<ApiSuccessResponse<PhotoDTO[]>>;

  /** ขอ HMAC token สำหรับ upload */
  getPhotoToken(): Promise<ApiSuccessResponse<PhotoTokenDTO>>;
}

export const purchaseApi: PurchaseModule = {
  getAll: (params) =>
    client.get<ApiPaginatedResponse<PurchaseOrderDTO>>("/purchase-orders", params as Record<string, unknown>),

  getById: (id) =>
    client.get<ApiSuccessResponse<PurchaseOrderDTO>>("/purchase-orders/order", { id }),

  create: (data) =>
    client.post<ApiSuccessResponse<{ id: number; reference_no: string; total_amount: number }>>(
      "/purchase-orders",
      data,
      { timeout: 20000 }
    ),

  cancel: (data) =>
    client.post<ApiSuccessResponse<{ message: string }>>("/purchase-orders/cancel", data),

  uploadPhoto: async (poId, file) => {
    // Photo upload uses FormData (multipart)
    const formData = new FormData();
    formData.append("file", file);
    formData.append("po_id", String(poId));

    // Use raw fetch for multipart
    const baseUrl =
      (typeof process !== "undefined" && process.env.PHP_API_URL) || "/api";
    const response = await fetch(`${baseUrl}/purchase-orders/photos`, {
      method: "POST",
      credentials: "include",
      body: formData,
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      throw Object.assign(new Error(errorBody.message || "Upload failed"), {
        status: response.status,
      });
    }

    return response.json();
  },

  getPhotos: (poId) =>
    client.get<ApiSuccessResponse<PhotoDTO[]>>("/purchase-orders/photos", { po_id: poId }),

  getPhotoToken: () =>
    client.get<ApiSuccessResponse<PhotoTokenDTO>>("/purchase-orders/photo-token"),
};
