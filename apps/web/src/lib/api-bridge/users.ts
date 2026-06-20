/**
 * SoloCorp POS — Users Bridge Module
 * ====================================
 * User Management — CRUD + Profile + Activity Log
 *
 * @phase 1
 * @module api-bridge/users
 */

import { client } from "./client";
import type {
  ApiSuccessResponse,
  ApiPaginatedResponse,
  UserDTO,
  CreateUserRequest,
  UpdateUserRequest,
  ChangePasswordRequest,
  ChangeOwnPasswordRequest,
  UpdateProfileRequest,
  ActivityLogDTO,
} from "./types";

export interface UsersModule {
  getAll(): Promise<ApiSuccessResponse<UserDTO[]>>;
  getById(id: number): Promise<ApiSuccessResponse<UserDTO>>;
  create(data: CreateUserRequest): Promise<ApiSuccessResponse<{ id: number; username: string }>>;
  update(id: number, data: UpdateUserRequest): Promise<ApiSuccessResponse<{ message: string }>>;
  remove(id: number): Promise<ApiSuccessResponse<{ message: string }>>;
  changePassword(data: ChangePasswordRequest): Promise<ApiSuccessResponse<{ message: string }>>;
  changeOwnPassword(data: ChangeOwnPasswordRequest): Promise<ApiSuccessResponse<{ message: string }>>;
  getProfile(): Promise<ApiSuccessResponse<UserDTO>>;
  updateProfile(data: UpdateProfileRequest): Promise<ApiSuccessResponse<{ message: string }>>;
  getActivityLog(params?: Record<string, unknown>): Promise<ApiPaginatedResponse<ActivityLogDTO>>;
}

export const usersApi: UsersModule = {
  getAll: () => client.get<ApiSuccessResponse<UserDTO[]>>("/users/all"),
  getById: (id) => client.get<ApiSuccessResponse<UserDTO>>("/users/user", { id }),
  create: (data) =>
    client.post<ApiSuccessResponse<{ id: number; username: string }>>("/users", data),
  update: (id, data) =>
    client.put<ApiSuccessResponse<{ message: string }>>("/users/user", { ...data, id }),
  remove: (id) =>
    client.delete<ApiSuccessResponse<{ message: string }>>("/users/user", { id }),
  changePassword: (data) =>
    client.post<ApiSuccessResponse<{ message: string }>>("/users/change-password", data),
  changeOwnPassword: (data) =>
    client.post<ApiSuccessResponse<{ message: string }>>("/users/change-own-password", data),
  getProfile: () => client.get<ApiSuccessResponse<UserDTO>>("/users/profile"),
  updateProfile: (data) =>
    client.put<ApiSuccessResponse<{ message: string }>>("/users/profile", data),
  getActivityLog: (params) =>
    client.get<ApiPaginatedResponse<ActivityLogDTO>>("/users/activity-log", params),
};
