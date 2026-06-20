/**
 * SoloCorp POS — Sales Bridge Module
 * ====================================
 * Base POS Sales — CRUD + Void
 *
 * @phase 1 (Basic POS endpoints, Sale Lots มี module แยก)
 * @module api-bridge/sales
 */

import { client } from "./client";
import type {
  ApiSuccessResponse,
  ApiPaginatedResponse,
  SaleDTO,
  CreateSaleRequest,
  VoidSaleRequest,
  SaleQueryParams,
} from "./types";

export interface SalesModule {
  getAll(params?: SaleQueryParams): Promise<ApiPaginatedResponse<SaleDTO>>;
  getById(id: number): Promise<ApiSuccessResponse<SaleDTO>>;
  create(data: CreateSaleRequest): Promise<ApiSuccessResponse<{ id: number; reference_no: string }>>;
  voidSale(data: VoidSaleRequest): Promise<ApiSuccessResponse<{ message: string }>>;
  exportCSV(params?: SaleQueryParams): Promise<Blob>;
}

export const salesApi: SalesModule = {
  getAll: (params) =>
    client.get<ApiPaginatedResponse<SaleDTO>>("/sales", params as Record<string, unknown>),
  getById: (id) =>
    client.get<ApiSuccessResponse<SaleDTO>>("/sales/sale", { id }),
  create: (data) =>
    client.post<ApiSuccessResponse<{ id: number; reference_no: string }>>("/sales", data),
  voidSale: (data) =>
    client.post<ApiSuccessResponse<{ message: string }>>("/sales/void", data),
  exportCSV: async (params) => {
    const baseUrl =
      (typeof process !== "undefined" && process.env.PHP_API_URL) || "/api";
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null) searchParams.append(k, String(v));
      });
    }
    const response = await fetch(
      `${baseUrl}/sales/export?${searchParams.toString()}`,
      { credentials: "include" }
    );
    if (!response.ok) throw new Error("Export failed");
    return response.blob();
  },
};
