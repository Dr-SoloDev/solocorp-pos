/**
 * SoloCorp POS — Settings Bridge Module
 * =======================================
 * Store & System Settings + Backup Management
 *
 * @phase 1
 * @module api-bridge/settings
 */

import { client } from "./client";
import type {
  ApiSuccessResponse,
  StoreSettingsDTO,
  UpdateStoreSettingsRequest,
  SystemSettingsDTO,
  UpdateSystemSettingsRequest,
  BackupDTO,
} from "./types";

export interface SettingsModule {
  getStore(): Promise<ApiSuccessResponse<StoreSettingsDTO>>;
  updateStore(data: UpdateStoreSettingsRequest): Promise<ApiSuccessResponse<{ message: string }>>;
  getSystem(): Promise<ApiSuccessResponse<SystemSettingsDTO>>;
  updateSystem(data: UpdateSystemSettingsRequest): Promise<ApiSuccessResponse<{ message: string }>>;
  backupCreate(): Promise<ApiSuccessResponse<{ id: number; filename: string }>>;
  backupRestore(data: { filename: string }): Promise<ApiSuccessResponse<{ message: string }>>;
  backupHistory(): Promise<ApiSuccessResponse<BackupDTO[]>>;
  backupDownload(params: { id: number }): Promise<Blob>;
  backupDelete(data: { id: number }): Promise<ApiSuccessResponse<{ message: string }>>;
}

export const settingsApi: SettingsModule = {
  getStore: () => client.get<ApiSuccessResponse<StoreSettingsDTO>>("/settings/store"),
  updateStore: (data) =>
    client.post<ApiSuccessResponse<{ message: string }>>("/settings/store", data),
  getSystem: () => client.get<ApiSuccessResponse<SystemSettingsDTO>>("/settings/system"),
  updateSystem: (data) =>
    client.post<ApiSuccessResponse<{ message: string }>>("/settings/system", data),
  backupCreate: () =>
    client.post<ApiSuccessResponse<{ id: number; filename: string }>>("/settings/backup/create"),
  backupRestore: (data) =>
    client.post<ApiSuccessResponse<{ message: string }>>("/settings/backup/restore", data),
  backupHistory: () =>
    client.get<ApiSuccessResponse<BackupDTO[]>>("/settings/backup/history"),
  backupDownload: async (params) => {
    const baseUrl =
      (typeof process !== "undefined" && process.env.PHP_API_URL) || "/api";
    const response = await fetch(
      `${baseUrl}/settings/backup/download?id=${params.id}`,
      { credentials: "include" }
    );
    if (!response.ok) throw new Error("Download failed");
    return response.blob();
  },
  backupDelete: (data) =>
    client.post<ApiSuccessResponse<{ message: string }>>("/settings/backup/delete", data),
};
