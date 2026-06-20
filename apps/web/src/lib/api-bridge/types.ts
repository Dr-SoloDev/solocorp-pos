/**
 * SoloCorp POS — Bridge API Data Transfer Objects (DTOs)
 * ========================================================
 * TypeScript interfaces สำหรับทุก Request/Response ที่ใช้ใน Bridge Layer
 * สอดคล้องกับ clean-room-spec.md sections 1.x และ 2.x
 *
 * @phase 1
 * @module api-bridge/types
 */

// ═══════════════════════════════════════════════════════════════════════════════
// Common / Envelope
// ═══════════════════════════════════════════════════════════════════════════════

export interface ApiSuccessResponse<T> {
  status: "success";
  message: string;
  data: T;
}

export interface ApiErrorResponse {
  status: "error";
  message: string;
  errors?: Record<string, string[]>;
}

export interface ApiPaginatedResponse<T> {
  status: "success";
  message: string;
  data: T[];
  pagination: PaginationMeta;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Auth
// ═══════════════════════════════════════════════════════════════════════════════

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  user: UserDTO;
}

export interface VerifyResponse {
  valid: boolean;
  user?: UserDTO;
}

export interface LogoutResponse {
  message: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Users
// ═══════════════════════════════════════════════════════════════════════════════

export interface UserDTO {
  id: number;
  username: string;
  full_name: string;
  email: string;
  role: UserRole;
  branch_id: number | null;
  status: "active" | "inactive";
  last_login?: string;
  created_at: string;
}

export type UserRole = "admin" | "manager" | "cashier";

export interface CreateUserRequest {
  username: string;
  password: string;
  full_name: string;
  email: string;
  role: UserRole;
  branch_id?: number;
}

export interface UpdateUserRequest {
  full_name?: string;
  email?: string;
  role?: UserRole;
  branch_id?: number | null;
  status?: "active" | "inactive";
}

export interface ChangePasswordRequest {
  user_id: number;
  new_password: string;
}

export interface ChangeOwnPasswordRequest {
  current_password: string;
  new_password: string;
}

export interface UpdateProfileRequest {
  full_name?: string;
  email?: string;
}

export interface ActivityLogDTO {
  id: number;
  user_id: number;
  user_name: string;
  action: string;
  description: string;
  ip_address: string;
  created_at: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Branches
// ═══════════════════════════════════════════════════════════════════════════════

export interface BranchDTO {
  id: number;
  name: string;
  code: string;
  address: string;
  phone: string;
  status: "active" | "inactive";
  cost_method: "fifo" | "weighted";
  created_at: string;
  updated_at: string;
}

export interface CreateBranchRequest {
  name: string;
  code: string;
  address?: string;
  phone?: string;
  cost_method?: "fifo" | "weighted";
}

export interface UpdateBranchRequest {
  name?: string;
  address?: string;
  phone?: string;
  status?: "active" | "inactive";
  cost_method?: "fifo" | "weighted";
}

export interface BranchSummaryDTO {
  id: number;
  name: string;
  code: string;
  total_purchases_today: number;
  total_sales_today: number;
  total_profit_today: number;
  transaction_count: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Sellers
// ═══════════════════════════════════════════════════════════════════════════════

export interface SellerDTO {
  id: number;
  full_name: string;
  phone: string;
  id_card_number: string;
  address?: string;
  vehicle_plate?: string;
  is_blacklisted: boolean;
  blacklist_reason?: string;
  blacklisted_at?: string;
  blacklisted_by?: number;
  total_purchases: number;
  last_purchase_at?: string;
  status: "active" | "inactive";
  created_at: string;
  updated_at: string;
}

export interface CreateSellerRequest {
  full_name: string;
  phone: string;
  id_card_number: string;
  address?: string;
  vehicle_plate?: string;
}

export interface UpdateSellerRequest {
  full_name?: string;
  phone?: string;
  id_card_number?: string;
  address?: string;
  vehicle_plate?: string;
  status?: "active" | "inactive";
}

export interface BlacklistRequest {
  seller_id: number;
  reason: string;
}

export interface SellerHistoryDTO {
  purchase_orders: PurchaseOrderDTO[];
  total_amount: number;
  total_count: number;
}

export interface SellerQueryParams {
  page?: number;
  limit?: number;
  status?: "active" | "inactive";
}

// ═══════════════════════════════════════════════════════════════════════════════
// Purchase Orders
// ═══════════════════════════════════════════════════════════════════════════════

export interface PurchaseOrderDTO {
  id: number;
  reference_no: string;
  branch_id: number;
  branch_name?: string;
  seller_id: number;
  seller_name?: string;
  user_id: number;
  user_name?: string;
  payment_method: PaymentMethod;
  total_amount: number;
  notes?: string;
  status: "active" | "cancelled";
  cancelled_at?: string;
  cancelled_by?: number;
  items?: PurchaseOrderItemDTO[];
  photos?: PhotoDTO[];
  created_at: string;
  updated_at: string;
}

export interface PurchaseOrderItemDTO {
  id: number;
  purchase_order_id: number;
  catalog_item_id: number;
  name: string;
  category_id: number;
  category_name?: string;
  condition_id: number;
  condition_name?: string;
  condition_color?: string;
  weight_deduction: number;
  quantity: number;
  effective_quantity: number;
  unit: string;
  price_per_unit: number;
  tier_label: string;
  total: number;
  consumed_qty: number;
}

export interface CreatePurchaseOrderRequest {
  seller_id: number;
  branch_id: number;
  payment_method: PaymentMethod;
  notes?: string;
  items: CreatePurchaseOrderItemRequest[];
}

export interface CreatePurchaseOrderItemRequest {
  catalog_item_id: number;
  name: string;
  category_id: number;
  condition_id: number;
  quantity: number;
  unit: string;
  price_per_unit: number;
  tier_label: string;
  total: number;
}

export interface CancelPurchaseOrderRequest {
  id: number;
  reason: string;
}

export type PaymentMethod = "cash" | "bank_transfer";

export interface PurchaseOrderQueryParams {
  page?: number;
  limit?: number;
  branch_id?: number;
  date_from?: string;
  date_to?: string;
  seller_id?: number;
  status?: "active" | "cancelled";
}

// ═══════════════════════════════════════════════════════════════════════════════
// Sale Lots
// ═══════════════════════════════════════════════════════════════════════════════

export interface SaleLotDTO {
  id: number;
  reference_no: string;
  branch_id: number;
  branch_name?: string;
  buyer_name: string;
  buyer_phone?: string;
  user_id: number;
  user_name?: string;
  total_amount: number;
  cost_total?: number;
  profit?: number;
  actual_revenue?: number;
  expenses?: ExpenseItemDTO[];
  notes?: string;
  status: SaleLotStatus;
  confirmed_at?: string;
  confirmed_by?: number;
  cancelled_at?: string;
  cancelled_by?: number;
  items?: SaleLotItemDTO[];
  created_at: string;
  updated_at: string;
}

export type SaleLotStatus = "draft" | "confirmed" | "cancelled";

export interface SaleLotItemDTO {
  id: number;
  sale_lot_id: number;
  catalog_item_id: number;
  name: string;
  category_id: number;
  category_name?: string;
  quantity: number;
  unit: string;
  price_per_unit: number;
  total: number;
  cost_per_unit?: number;
  cost_total?: number;
  profit?: number;
}

export interface CreateSaleLotRequest {
  branch_id: number;
  buyer_name: string;
  buyer_phone?: string;
  notes?: string;
  items: CreateSaleLotItemRequest[];
}

export interface CreateSaleLotItemRequest {
  catalog_item_id: number;
  name: string;
  category_id: number;
  quantity: number;
  unit: string;
  price_per_unit: number;
  total: number;
}

export interface UpdateSaleLotRequest {
  buyer_name?: string;
  buyer_phone?: string;
  notes?: string;
  items?: CreateSaleLotItemRequest[];
}

export interface CancelSaleLotRequest {
  id: number;
  reason?: string;
}

export interface RecordRevenueRequest {
  id: number;
  actual_revenue: number;
  expenses?: ExpenseItemInput[];
}

export interface ExpenseItemInput {
  description: string;
  amount: number;
}

export interface ExpenseItemDTO {
  id: number;
  description: string;
  amount: number;
}

export interface SaleLotQueryParams {
  page?: number;
  limit?: number;
  branch_id?: number;
  date_from?: string;
  date_to?: string;
  status?: SaleLotStatus;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Stock Transfers
// ═══════════════════════════════════════════════════════════════════════════════

export interface StockTransferDTO {
  id: number;
  reference_no: string;
  from_branch_id: number;
  from_branch_name?: string;
  to_branch_id: number;
  to_branch_name?: string;
  user_id: number;
  user_name?: string;
  notes?: string;
  status: TransferStatus;
  carrier_name?: string;
  vehicle_plate?: string;
  tracking_number?: string;
  from_address?: string;
  to_address?: string;
  items?: StockTransferItemDTO[];
  confirmed_at?: string;
  confirmed_by?: number;
  cancelled_at?: string;
  created_at: string;
  updated_at: string;
}

export type TransferStatus = "draft" | "confirmed" | "cancelled";

export interface StockTransferItemDTO {
  purchase_order_item_id: number;
  catalog_item_name?: string;
  quantity: number;
}

export interface CreateStockTransferRequest {
  from_branch_id: number;
  to_branch_id: number;
  notes?: string;
  carrier_name?: string;
  vehicle_plate?: string;
  tracking_number?: string;
  items: StockTransferItemInput[];
}

export interface StockTransferItemInput {
  purchase_order_item_id: number;
  quantity: number;
}

export interface StockTransferQueryParams {
  page?: number;
  limit?: number;
  from_branch_id?: number;
  to_branch_id?: number;
  status?: TransferStatus;
  date_from?: string;
  date_to?: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Catalog & Price Tiers
// ═══════════════════════════════════════════════════════════════════════════════

export interface CatalogItemDTO {
  id: number;
  code: string;
  name: string;
  category_id: number;
  category_name?: string;
  default_unit: string;
  default_price: number;
  tier_prices: TierPriceDTO[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TierPriceDTO {
  label: string;
  price: number;
}

export interface CreateCatalogItemRequest {
  code: string;
  name: string;
  category_id: number;
  default_unit?: string;
  default_price: number;
  tier_prices: TierPriceDTO[];
}

export interface UpdateCatalogItemRequest {
  code?: string;
  name?: string;
  category_id?: number;
  default_unit?: string;
  default_price?: number;
  tier_prices?: TierPriceDTO[];
  is_active?: boolean;
}

export interface UpdateCatalogCategoryRequest {
  item_id: number;
  category_id: number;
}

export interface UpdatePriceTierRequest {
  catalog_item_id: number;
  tier_prices: TierPriceDTO[];
}

export interface ItemConditionDTO {
  id: number;
  name: string;
  weight_deduction: number;
  sort_order: number;
  color_code: string;
  status: "active" | "inactive";
}

export interface PriceBoardDTO {
  categories: PriceBoardCategoryDTO[];
  updated_at: string;
}

export interface PriceBoardCategoryDTO {
  id: number;
  name: string;
  items: PriceBoardItemDTO[];
}

export interface PriceBoardItemDTO {
  code: string;
  name: string;
  tier_prices: TierPriceDTO[];
  unit: string;
}

export interface CatalogQueryParams {
  page?: number;
  limit?: number;
  category_id?: number;
  is_active?: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Inventory (Categories + Products)
// ═══════════════════════════════════════════════════════════════════════════════

export interface CategoryDTO {
  id: number;
  name: string;
  description?: string;
  default_unit: string;
  stock_kg: number;
  alert_threshold?: number;
  status: "active" | "inactive";
  created_at: string;
}

export interface CreateCategoryRequest {
  name: string;
  description?: string;
  default_unit?: string;
  alert_threshold?: number;
}

export interface UpdateCategoryRequest {
  name?: string;
  description?: string;
  default_unit?: string;
  alert_threshold?: number;
  status?: "active" | "inactive";
}

export interface ProductDTO {
  id: number;
  name: string;
  sku: string;
  barcode?: string;
  description?: string;
  category_id: number;
  category_name?: string;
  price_tier1: number;
  price_tier2: number;
  price_tier3: number;
  cost: number;
  quantity: number;
  unit: string;
  low_stock_threshold: number;
  status: "active" | "inactive";
  user_id: number;
  created_at: string;
  updated_at: string;
}

export interface CreateProductRequest {
  name: string;
  sku: string;
  barcode?: string;
  description?: string;
  category_id: number;
  price_tier1: number;
  price_tier2: number;
  price_tier3: number;
  cost: number;
  quantity: number;
  unit?: string;
  low_stock_threshold?: number;
}

export interface UpdateProductRequest {
  name?: string;
  sku?: string;
  barcode?: string;
  description?: string;
  category_id?: number;
  price_tier1?: number;
  price_tier2?: number;
  price_tier3?: number;
  cost?: number;
  quantity?: number;
  unit?: string;
  low_stock_threshold?: number;
  status?: "active" | "inactive";
}

export interface InventoryTransactionDTO {
  id: number;
  product_id: number;
  product_name?: string;
  type: InventoryTxType;
  quantity: number;
  reference_id?: number;
  notes?: string;
  user_id: number;
  user_name?: string;
  created_at: string;
}

export type InventoryTxType = "purchase" | "sale" | "adjustment" | "return";

export interface CreateInventoryTransactionRequest {
  product_id: number;
  type: InventoryTxType;
  quantity: number;
  reference_id?: number;
  notes?: string;
}

export interface StockAlertDTO {
  category_id: number;
  category_name: string;
  stock_kg: number;
  alert_threshold: number;
  branch_id?: number;
}

export interface SetThresholdRequest {
  category_id: number;
  alert_threshold: number;
}

export interface ProductQueryParams {
  page?: number;
  limit?: number;
  category_id?: number;
  status?: "active" | "inactive";
}

// ═══════════════════════════════════════════════════════════════════════════════
// Sales (Base POS)
// ═══════════════════════════════════════════════════════════════════════════════

export interface SaleDTO {
  id: number;
  reference_no: string;
  customer_id: number;
  customer_name?: string;
  user_id: number;
  user_name?: string;
  total_amount: number;
  discount_amount: number;
  tax_amount: number;
  grand_total: number;
  payment_method: string;
  payment_status: "paid" | "voided";
  notes?: string;
  items?: SaleItemDTO[];
  created_at: string;
}

export interface SaleItemDTO {
  id: number;
  sale_id: number;
  product_id: number;
  product_name?: string;
  quantity: number;
  price: number;
  total: number;
}

export interface CreateSaleRequest {
  customer_id?: number;
  payment_method: string;
  notes?: string;
  items: CreateSaleItemRequest[];
}

export interface CreateSaleItemRequest {
  product_id: number;
  quantity: number;
  price: number;
  total: number;
}

export interface VoidSaleRequest {
  id: number;
  reason: string;
}

export interface SaleQueryParams {
  page?: number;
  limit?: number;
  date_from?: string;
  date_to?: string;
  branch_id?: number;
  payment_status?: "paid" | "voided";
}

// ═══════════════════════════════════════════════════════════════════════════════
// Financial / Expenses
// ═══════════════════════════════════════════════════════════════════════════════

export interface BusinessExpenseDTO {
  id: number;
  branch_id: number;
  branch_name?: string;
  description: string;
  amount: number;
  category: ExpenseCategory;
  expense_date: string;
  user_id: number;
  user_name?: string;
  created_at: string;
}

export type ExpenseCategory = "ค่าเช่า" | "ค่าน้ำ" | "ค่าไฟ" | "เงินเดือน" | "อื่นๆ";

export interface CreateExpenseRequest {
  branch_id: number;
  description: string;
  amount: number;
  category: ExpenseCategory;
  expense_date: string;
}

export interface FinancialSummaryDTO {
  total_purchase_volume: number;
  total_sale_revenue: number;
  gross_profit: number;
  net_profit: number;
  total_expenses: number;
  expense_breakdown: { category: string; amount: number }[];
  purchase_by_category: { category: string; amount: number }[];
  period?: {
    date_from: string;
    date_to: string;
  };
}

export interface FinancialQueryParams {
  date_from?: string;
  date_to?: string;
  branch_id?: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Reports
// ═══════════════════════════════════════════════════════════════════════════════

export interface DashboardStatsDTO {
  today: {
    total_purchase: number;
    total_sale: number;
    total_profit: number;
    transaction_count: number;
  };
  by_branch: BranchDailySummaryDTO[];
  aging_inventory: AgingInventoryItemDTO[];
  recent_sales: SaleDTO[];
  recent_purchases: PurchaseOrderDTO[];
  recent_sale_lots: SaleLotDTO[];
}

export interface BranchDailySummaryDTO {
  branch_id: number;
  branch_name: string;
  purchase_amount: number;
  sale_amount: number;
  profit: number;
}

export interface AgingInventoryItemDTO {
  category_name: string;
  days_held: number;
  quantity: number;
}

export interface ChartDataDTO {
  labels: string[];
  datasets: ChartDatasetDTO[];
}

export interface ChartDatasetDTO {
  label: string;
  data: number[];
  color?: string;
}

export interface SalesReportDTO {
  rows: SaleDTO[];
  summary: {
    total_sales: number;
    total_amount: number;
    total_discount: number;
    total_tax: number;
    grand_total: number;
  };
}

export interface ProductSalesDTO {
  product_id: number;
  product_name: string;
  sku: string;
  category_name: string;
  total_quantity: number;
  total_amount: number;
}

export interface CashierPerformanceDTO {
  user_id: number;
  full_name: string;
  total_sales: number;
  total_amount: number;
  average_per_sale: number;
}

export interface ReportQueryParams {
  date_from?: string;
  date_to?: string;
  branch_id?: number;
  category_id?: number;
  status?: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Photos
// ═══════════════════════════════════════════════════════════════════════════════

export interface PhotoDTO {
  id: number;
  purchase_order_id: number;
  filename: string;
  original_name: string;
  mime_type: string;
  file_size: number;
  url: string;
  user_id?: number;
  created_at: string;
}

export interface PhotoTokenDTO {
  token: string;
  expires_at: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Settings
// ═══════════════════════════════════════════════════════════════════════════════

export interface StoreSettingsDTO {
  name: string;
  address: string;
  phone: string;
  tax_id: string;
  logo_url?: string;
}

export interface UpdateStoreSettingsRequest {
  name?: string;
  address?: string;
  phone?: string;
  tax_id?: string;
  logo_url?: string;
}

export interface SystemSettingsDTO {
  currency: string;
  timezone: string;
  date_format: string;
  receipt_footer: string;
  enable_low_stock_alert: boolean;
  auto_backup_enabled: boolean;
}

export interface UpdateSystemSettingsRequest {
  currency?: string;
  timezone?: string;
  date_format?: string;
  receipt_footer?: string;
  enable_low_stock_alert?: boolean;
  auto_backup_enabled?: boolean;
}

export interface BackupDTO {
  id: number;
  filename: string;
  file_size: number;
  created_at: string;
  created_by: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Customer
// ═══════════════════════════════════════════════════════════════════════════════

export interface CustomerDTO {
  id: number;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateCustomerRequest {
  name: string;
  phone: string;
  email?: string;
  address?: string;
}
