/**
 * SoloCorp POS — Stock Transfers Bridge Module
 * ==============================================
 * Stock Transfers between branches
 *
 * @phase 1
 * @module api-bridge/stock-transfers
 */

import { client } from "./client";
import type {
  ApiSuccessResponse,
  ApiPaginatedResponse,
  StockTransferDTO,
  CreateStockTransferRequest,
  StockTransferQueryParams,
} from "./types";

export interface StockTransfersModule {
  getAll(params?: StockTransferQueryParams): Promise<ApiPaginatedResponse<StockTransferDTO>>;
  getById(id: number): Promise<ApiSuccessResponse<StockTransferDTO>>;
  create(data: CreateStockTransferRequest): Promise<ApiSuccessResponse<{ id: number; reference_no: string }>>;
  confirm(id: number): Promise<ApiSuccessResponse<{ message: string }>>;
  cancel(data: { id: number; reason?: string }): Promise<ApiSuccessResponse<{ message: string }>>;
}

export const stockTransfersApi: StockTransfersModule = {
  getAll: (params) =>
    client.get<ApiPaginatedResponse<StockTransferDTO>>(
      "/stock-transfers",
      params as Record<string, unknown>
    ),
  getById: (id) =>
    client.get<ApiSuccessResponse<StockTransferDTO>>("/stock-transfers/stock-transfer", { id }),
  create: (data) =>
    client.post<ApiSuccessResponse<{ id: number; reference_no: string }>>(
      "/stock-transfers",
      data
    ),
  confirm: (id) =>
    client.post<ApiSuccessResponse<{ message: string }>>("/stock-transfers/confirm", { id }),
  cancel: (data) =>
    client.post<ApiSuccessResponse<{ message: string }>>("/stock-transfers/cancel", data),
};
