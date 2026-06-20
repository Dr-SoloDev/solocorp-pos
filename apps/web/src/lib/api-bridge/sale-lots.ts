/**
 * SoloCorp POS — Sale Lots Bridge Module
 * ========================================
 * Sale Lots — จัดการขายแบบยก lot (Business Rule 3.x)
 *
 * Key Business Rules:
 * - DRAFT → CONFIRMED → ตัด FIFO stock อัตโนมัติ
 * - CANCELLED → คืน stock
 * - บันทึกรายรับจริง (อาจต่างจากราคาตอนสร้าง lot)
 *
 * @phase 1
 * @module api-bridge/sale-lots
 */

import { client } from "./client";
import type {
  ApiPaginatedResponse,
  ApiSuccessResponse,
  SaleLotDTO,
  CreateSaleLotRequest,
  UpdateSaleLotRequest,
  CancelSaleLotRequest,
  RecordRevenueRequest,
  SaleLotQueryParams,
} from "./types";

export interface SaleLotsModule {
  /** รายการ Sale Lots ทั้งหมด (paginated + filterable) */
  getAll(
    params?: SaleLotQueryParams
  ): Promise<ApiPaginatedResponse<SaleLotDTO>>;

  /** ดู Sale Lot รายการตาม ID */
  getById(id: number): Promise<ApiSuccessResponse<SaleLotDTO>>;

  /** สร้าง Sale Lot ใหม่ (สถานะ DRAFT) */
  create(
    data: CreateSaleLotRequest
  ): Promise<ApiSuccessResponse<{ id: number; reference_no: string; total_amount: number }>>;

  /** แก้ไข Sale Lot (เฉพาะ DRAFT) */
  update(
    id: number,
    data: UpdateSaleLotRequest
  ): Promise<ApiSuccessResponse<{ message: string }>>;

  /** ลบ Sale Lot (เฉพาะ DRAFT) */
  remove(id: number): Promise<ApiSuccessResponse<{ message: string }>>;

  /**
   * ยืนยัน Sale Lot → เปลี่ยนจาก DRAFT เป็น CONFIRMED
   * สำคัญ: ตัด stock แบบ FIFO อัตโนมัติ
   */
  confirm(
    id: number
  ): Promise<
    ApiSuccessResponse<{
      message: string;
      cost_total: number;
      profit: number;
    }>
  >;

  /**
   * ยกเลิก Sale Lot → คืน stock เข้า inventory
   * เฉพาะ CONFIRMED → CANCELLED
   */
  cancel(
    data: CancelSaleLotRequest
  ): Promise<ApiSuccessResponse<{ message: string }>>;

  /**
   * บันทึกรายรับจริง (actual revenue)
   * สำหรับปรับปรุงตัวเลขรายรับที่บันทึกจริง
   */
  recordRevenue(
    data: RecordRevenueRequest
  ): Promise<ApiSuccessResponse<{ message: string; profit_adjustment: number }>>;
}

export const saleLotsApi: SaleLotsModule = {
  getAll: (params) =>
    client.get<ApiPaginatedResponse<SaleLotDTO>>("/sale-lots", params as Record<string, unknown>),

  getById: (id) =>
    client.get<ApiSuccessResponse<SaleLotDTO>>("/sale-lots/sale-lot", { id }),

  create: (data) =>
    client.post<ApiSuccessResponse<{ id: number; reference_no: string; total_amount: number }>>(
      "/sale-lots",
      data,
      { timeout: 20000 }
    ),

  update: (id, data) =>
    client.put<ApiSuccessResponse<{ message: string }>>("/sale-lots/sale-lot", { ...data, id }),

  remove: (id) =>
    client.delete<ApiSuccessResponse<{ message: string }>>("/sale-lots/sale-lot", { id }),

  confirm: (id) =>
    client.post<ApiSuccessResponse<{ message: string; cost_total: number; profit: number }>>(
      "/sale-lots/confirm",
      { id }
    ),

  cancel: (data) =>
    client.post<ApiSuccessResponse<{ message: string }>>("/sale-lots/cancel", data),

  recordRevenue: (data) =>
    client.post<ApiSuccessResponse<{ message: string; profit_adjustment: number }>>(
      "/sale-lots/record-revenue",
      data
    ),
};
