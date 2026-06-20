/**
 * SoloCorp POS — Bridge API Layer Barrel Export
 * ===============================================
 * รวมทุก API module ไว้ใน apiBridge object เดียว
 *
 * Usage:
 *   import { apiBridge } from '@/lib/api-bridge';
 *   const orders = await apiBridge.purchase.getAll({ page: 1 });
 *
 * @phase 1
 * @module api-bridge
 */

import { client, configureBridge, getBridgeConfig, BridgeApiError } from "./client";
import { authApi } from "./auth";
import { purchaseApi } from "./purchase";
import { saleLotsApi } from "./sale-lots";
import { inventoryApi } from "./inventory";
import { reportsApi } from "./reports";
import { catalogApi } from "./catalog";
import { sellersApi } from "./sellers";

// Export client utilities
export { client, configureBridge, getBridgeConfig, BridgeApiError };

// Export all DTOs
export * from "./types";

/**
 * Unified Bridge API — จุดรวมทุก API module
 *
 * เรียกใช้งาน: apiBridge.{module}.{method}()
 */
export const apiBridge = {
  auth: authApi,
  purchase: purchaseApi,
  saleLots: saleLotsApi,
  inventory: inventoryApi,
  reports: reportsApi,
  catalog: catalogApi,
  sellers: sellersApi,
} as const;

export type ApiBridge = typeof apiBridge;
