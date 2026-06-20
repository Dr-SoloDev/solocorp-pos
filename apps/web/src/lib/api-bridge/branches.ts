/**
 * SoloCorp POS — Branches Bridge Module
 * =======================================
 * Branches Management — CRUD + Summary
 *
 * @phase 1
 * @module api-bridge/branches
 */

import { client } from "./client";
import type {
  ApiSuccessResponse,
  BranchDTO,
  BranchSummaryDTO,
  CreateBranchRequest,
  UpdateBranchRequest,
} from "./types";

export interface BranchesModule {
  getAll(): Promise<ApiSuccessResponse<BranchDTO[]>>;
  getActive(): Promise<ApiSuccessResponse<BranchDTO[]>>;
  getById(id: number): Promise<ApiSuccessResponse<BranchDTO>>;
  getSummary(): Promise<ApiSuccessResponse<BranchSummaryDTO[]>>;
  create(data: CreateBranchRequest): Promise<ApiSuccessResponse<{ id: number; name: string }>>;
  update(id: number, data: UpdateBranchRequest): Promise<ApiSuccessResponse<{ message: string }>>;
}

export const branchesApi: BranchesModule = {
  getAll: () => client.get<ApiSuccessResponse<BranchDTO[]>>("/branches"),
  getActive: () => client.get<ApiSuccessResponse<BranchDTO[]>>("/branches/active"),
  getById: (id) => client.get<ApiSuccessResponse<BranchDTO>>("/branches/branch", { id }),
  getSummary: () => client.get<ApiSuccessResponse<BranchSummaryDTO[]>>("/branches/summary"),
  create: (data) =>
    client.post<ApiSuccessResponse<{ id: number; name: string }>>("/branches", data),
  update: (id, data) =>
    client.put<ApiSuccessResponse<{ message: string }>>("/branches/branch", { ...data, id }),
};
