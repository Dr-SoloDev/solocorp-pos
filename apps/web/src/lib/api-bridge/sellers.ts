/**
 * SoloCorp POS — Sellers Bridge Module
 * ======================================
 * Sellers Management — CRUD + Blacklist + History
 *
 * @phase 1
 * @module api-bridge/sellers
 */

import { client } from "./client";
import type {
  ApiSuccessResponse,
  ApiPaginatedResponse,
  SellerDTO,
  CreateSellerRequest,
  UpdateSellerRequest,
  BlacklistRequest,
  SellerHistoryDTO,
  SellerQueryParams,
} from "./types";

export interface SellersModule {
  getAll(params?: SellerQueryParams): Promise<ApiPaginatedResponse<SellerDTO>>;
  search(q: string): Promise<ApiSuccessResponse<SellerDTO[]>>;
  getById(id: number): Promise<ApiSuccessResponse<SellerDTO>>;
  create(data: CreateSellerRequest): Promise<ApiSuccessResponse<{ id: number; full_name: string }>>;
  update(id: number, data: UpdateSellerRequest): Promise<ApiSuccessResponse<{ message: string }>>;
  blacklist(data: BlacklistRequest): Promise<ApiSuccessResponse<{ message: string }>>;
  unblacklist(sellerId: number): Promise<ApiSuccessResponse<{ message: string }>>;
  getHistory(sellerId: number): Promise<ApiSuccessResponse<SellerHistoryDTO>>;
}

export const sellersApi: SellersModule = {
  getAll: (params) =>
    client.get<ApiPaginatedResponse<SellerDTO>>("/sellers", params as Record<string, unknown>),
  search: (q) =>
    client.get<ApiSuccessResponse<SellerDTO[]>>("/sellers/search", { q }),
  getById: (id) =>
    client.get<ApiSuccessResponse<SellerDTO>>("/sellers/seller", { id }),
  create: (data) =>
    client.post<ApiSuccessResponse<{ id: number; full_name: string }>>("/sellers", data),
  update: (id, data) =>
    client.put<ApiSuccessResponse<{ message: string }>>("/sellers/seller", { ...data, id }),
  blacklist: (data) =>
    client.post<ApiSuccessResponse<{ message: string }>>("/sellers/blacklist", data),
  unblacklist: (sellerId) =>
    client.post<ApiSuccessResponse<{ message: string }>>("/sellers/unblacklist", { seller_id: sellerId }),
  getHistory: (sellerId) =>
    client.get<ApiSuccessResponse<SellerHistoryDTO>>("/sellers/history", { seller_id: sellerId }),
};
