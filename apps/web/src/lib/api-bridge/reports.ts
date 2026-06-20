/**
 * SoloCorp POS — Reports Bridge Module
 * ======================================
 * Reports & Financial Endpoints — Dashboard, Charts, Reports
 *
 * @phase 1
 * @module api-bridge/reports
 */

import { client } from "./client";
import type {
  ApiSuccessResponse,
  ApiPaginatedResponse,
  DashboardStatsDTO,
  ChartDataDTO,
  SaleDTO,
  PurchaseOrderDTO,
  SaleLotDTO,
  SalesReportDTO,
  ProductSalesDTO,
  CashierPerformanceDTO,
  FinancialSummaryDTO,
  BusinessExpenseDTO,
  CreateExpenseRequest,
  ReportQueryParams,
  FinancialQueryParams,
} from "./types";

export interface ReportsModule {
  // ─── Dashboard ────────────────────────────────────
  /** KPI สำหรับหน้าแรก */
  getDashboardStats(): Promise<ApiSuccessResponse<DashboardStatsDTO>>;

  // ─── Charts ───────────────────────────────────────
  /** chart การขาย (daily/weekly/monthly) */
  getSalesChart(
    params?: ReportQueryParams
  ): Promise<ApiSuccessResponse<ChartDataDTO>>;

  /** chart การซื้อ */
  getPurchaseChart(
    params?: ReportQueryParams
  ): Promise<ApiSuccessResponse<ChartDataDTO>>;

  /** chart sale lot */
  getSaleLotChart(
    params?: ReportQueryParams
  ): Promise<ApiSuccessResponse<ChartDataDTO>>;

  // ─── Recent Data ──────────────────────────────────
  /** การขายล่าสุด */
  getRecentSales(): Promise<ApiSuccessResponse<SaleDTO[]>>;

  /** การซื้อล่าสุด */
  getRecentPurchases(): Promise<ApiSuccessResponse<PurchaseOrderDTO[]>>;

  /** Sale lot ล่าสุด */
  getRecentSaleLots(): Promise<ApiSuccessResponse<SaleLotDTO[]>>;

  // ─── Detailed Reports ─────────────────────────────
  /** รายงานการขาย */
  getSalesReport(
    params?: ReportQueryParams
  ): Promise<ApiSuccessResponse<SalesReportDTO>>;

  /** รายงานการซื้อ */
  getPurchaseReport(
    params?: ReportQueryParams
  ): Promise<ApiSuccessResponse<SalesReportDTO>>;

  /** รายงาน Sale Lots */
  getSaleLotReport(
    params?: ReportQueryParams
  ): Promise<ApiSuccessResponse<SaleLotDTO[]>>;

  // ─── Product Reports ──────────────────────────────
  /** ยอดขายแยกตามสินค้า */
  getProductSales(
    params?: ReportQueryParams
  ): Promise<ApiSuccessResponse<ProductSalesDTO[]>>;

  /** รายงานสต็อก */
  getInventoryReport(): Promise<
    ApiSuccessResponse<{
      categories: { name: string; stock_kg: number }[];
    }>
  >;

  // ─── Performance ──────────────────────────────────
  /** ประสิทธิภาพพนักงาน */
  getCashierPerformance(
    params?: ReportQueryParams
  ): Promise<ApiSuccessResponse<CashierPerformanceDTO[]>>;

  // ─── Tax ──────────────────────────────────────────
  /** รายงานภาษี */
  getTaxReport(
    params?: ReportQueryParams
  ): Promise<
    ApiSuccessResponse<{
      total_sales: number;
      total_purchases: number;
      vat_amount: number;
    }>
  >;

  // ─── Financial ────────────────────────────────────
  /** สรุปการเงิน */
  getFinancialSummary(
    params?: FinancialQueryParams
  ): Promise<ApiSuccessResponse<FinancialSummaryDTO>>;

  /** รายรับแยกตาม lot */
  getLotRevenues(
    params?: FinancialQueryParams
  ): Promise<ApiSuccessResponse<{ lot_id: number; revenue: number; profit: number }[]>>;

  /** ยอดซื้อแยกหมวด */
  getPurchaseByCategory(
    params?: FinancialQueryParams
  ): Promise<ApiSuccessResponse<{ category: string; amount: number }[]>>;

  // ─── Expenses ─────────────────────────────────────
  /** ดูรายการค่าใช้จ่าย */
  getExpenses(
    params?: FinancialQueryParams
  ): Promise<ApiPaginatedResponse<BusinessExpenseDTO>>;

  /** บันทึกค่าใช้จ่าย */
  createExpense(
    data: CreateExpenseRequest
  ): Promise<ApiSuccessResponse<{ id: number }>>;

  /** ลบค่าใช้จ่าย */
  deleteExpense(id: number): Promise<ApiSuccessResponse<{ message: string }>>;

  // ─── Export ───────────────────────────────────────
  /** Export รายงานเป็น CSV */
  exportFinancialCSV(
    params?: FinancialQueryParams
  ): Promise<Blob>;
}

export const reportsApi: ReportsModule = {
  getDashboardStats: () =>
    client.get<ApiSuccessResponse<DashboardStatsDTO>>("/reports/dashboard-stats"),

  getSalesChart: (params) =>
    client.get<ApiSuccessResponse<ChartDataDTO>>(
      "/reports/sales-chart",
      params as Record<string, unknown>
    ),

  getPurchaseChart: (params) =>
    client.get<ApiSuccessResponse<ChartDataDTO>>(
      "/reports/purchase-chart",
      params as Record<string, unknown>
    ),

  getSaleLotChart: (params) =>
    client.get<ApiSuccessResponse<ChartDataDTO>>(
      "/reports/sale-lot-chart",
      params as Record<string, unknown>
    ),

  getRecentSales: () =>
    client.get<ApiSuccessResponse<SaleDTO[]>>("/reports/recent-sales"),

  getRecentPurchases: () =>
    client.get<ApiSuccessResponse<PurchaseOrderDTO[]>>("/reports/recent-purchases"),

  getRecentSaleLots: () =>
    client.get<ApiSuccessResponse<SaleLotDTO[]>>("/reports/recent-sale-lots"),

  getSalesReport: (params) =>
    client.get<ApiSuccessResponse<SalesReportDTO>>(
      "/reports/sales-report",
      params as Record<string, unknown>
    ),

  getPurchaseReport: (params) =>
    client.get<ApiSuccessResponse<SalesReportDTO>>(
      "/reports/purchase-report",
      params as Record<string, unknown>
    ),

  getSaleLotReport: (params) =>
    client.get<ApiSuccessResponse<SaleLotDTO[]>>(
      "/reports/sale-lot-report",
      params as Record<string, unknown>
    ),

  getProductSales: (params) =>
    client.get<ApiSuccessResponse<ProductSalesDTO[]>>(
      "/reports/product-sales",
      params as Record<string, unknown>
    ),

  getInventoryReport: () =>
    client.get<
      ApiSuccessResponse<{ categories: { name: string; stock_kg: number }[] }>
    >("/reports/inventory-report"),

  getCashierPerformance: (params) =>
    client.get<ApiSuccessResponse<CashierPerformanceDTO[]>>(
      "/reports/cashier-performance",
      params as Record<string, unknown>
    ),

  getTaxReport: (params) =>
    client.get<
      ApiSuccessResponse<{
        total_sales: number;
        total_purchases: number;
        vat_amount: number;
      }>
    >("/reports/tax-report", params as Record<string, unknown>),

  getFinancialSummary: (params) =>
    client.get<ApiSuccessResponse<FinancialSummaryDTO>>(
      "/financial/summary",
      params as Record<string, unknown>
    ),

  getLotRevenues: (params) =>
    client.get<
      ApiSuccessResponse<{ lot_id: number; revenue: number; profit: number }[]>
    >("/financial/lot-revenues", params as Record<string, unknown>),

  getPurchaseByCategory: (params) =>
    client.get<ApiSuccessResponse<{ category: string; amount: number }[]>>(
      "/financial/purchase-by-category",
      params as Record<string, unknown>
    ),

  getExpenses: (params) =>
    client.get<ApiPaginatedResponse<BusinessExpenseDTO>>(
      "/financial/expenses",
      params as Record<string, unknown>
    ),

  createExpense: (data) =>
    client.post<ApiSuccessResponse<{ id: number }>>("/financial/expenses", data),

  deleteExpense: (id) =>
    client.delete<ApiSuccessResponse<{ message: string }>>("/financial/expenses", { id }),

  exportFinancialCSV: async (params) => {
    const baseUrl =
      (typeof process !== "undefined" && process.env.PHP_API_URL) || "/api";
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null) searchParams.append(k, String(v));
      });
    }
    const response = await fetch(
      `${baseUrl}/financial/export?${searchParams.toString()}`,
      { credentials: "include" }
    );
    if (!response.ok) throw new Error("Export failed");
    return response.blob();
  },
};
