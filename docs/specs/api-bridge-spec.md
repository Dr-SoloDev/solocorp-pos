# SoloCorp POS — API Bridge Specification (Project Bangkok)

**Version:** 2.0.0  
**วันที่:** 21 มิถุนายน 2569  
**Phase:** 1 (Strangler Fig Bridge Strategy)  
**สถาปัตยกรรม:** PWA Mobile-Frontend → Bridge API Layer → PHP Backend (Legacy)

## คำตัดสิน CEO (อนุมัติ)

| ข้อ | การตัดสินใจ | รายละเอียด |
|:---|:-----------|:-----------|
| **Sale Lots** | ✅ **คงไว้ใน Phase 1** | ไม่ตัดออก — FIFO costing bridge ผ่าน PHP API |
| **Auth** | ✅ **Option B — NextAuth Login ใหม่** | ใช้ NextAuth + PrismaAdapter + Credentials provider (bcrypt) — users ต้อง login ใหม่ในระบบ |
| **Database** | ✅ **Option A — Dual DB** | Phase 1: Bridge Layer → PHP MySQL (read/write) + PostgreSQL (NextAuth/New data). Phase 2: Migrate MySQL → PostgreSQL

---

## สารบัญ

1. [Bridge Architecture Overview](#1-bridge-architecture-overview)
2. [API Endpoint Mapping](#2-api-endpoint-mapping)
3. [Request/Response Types](#3-requestresponse-types)
4. [Error Handling Patterns](#4-error-handling-patterns)
5. [Auth Flow (JWT → Next.js Session)](#5-auth-flow-jwt--nextjs-session)
6. [Rate Limiting Plan](#6-rate-limiting-plan)
7. [Mobile-first App Router Structure](#7-mobile-first-app-router-structure)
8. [PWA Shell Layout](#8-pwa-shell-layout)
9. [Bridge Layer Implementation Guide](#9-bridge-layer-implementation-guide)

---

## 1. Bridge Architecture Overview

### 1.1 Strangler Fig Pattern

```
                    ┌──────────────────────┐
                    │    Mobile PWA App     │
                    │  (Next.js App Router) │
                    └──────────┬───────────┘
                               │
                    ┌──────────▼───────────┐
                    │    Bridge API Layer   │
                    │  (src/lib/api-bridge/)│
                    │                      │
                    │  ┌────────────────┐  │
                    │  │   React Query   │  │
                    │  │  (TanStack v4)  │  │
                    │  └───────┬────────┘  │
                    │          │            │
                    │  ┌───────▼────────┐  │
                    │  │   HTTP Client   │  │
                    │  │  (fetch + retry)│  │
                    │  └───────┬────────┘  │
                    └──────────┬───────────┘
                               │ HTTPS
                    ┌──────────▼───────────┐
                    │   PHP Backend (Old)   │
                    │   /api/index.php     │
                    │   JWT Auth           │
                    └──────────────────────┘
```

### 1.2 Bridge Layer Components

| Component | File | หน้าที่ |
|-----------|------|--------|
| HTTP Client | `client.ts` | fetch wrapper, retry, error normalization, JWT cookie forwarding |
| Types/DTOs | `types.ts` | TypeScript interfaces สำหรับทุก request/response |
| Auth Module | `auth.ts` | Login, logout, verify, session management |
| Purchase Module | `purchase.ts` | Purchase Orders CRUD + cancel |
| Sale Lots Module | `sale-lots.ts` | Sale Lots CRUD + confirm + cancel + record revenue |
| Inventory Module | `inventory.ts` | Categories, Products, Stock Alerts, Transactions |
| Reports Module | `reports.ts` | Dashboard stats, charts, reports |
| Catalog Module | `catalog.ts` | Price tiers, Purchase Catalog, Item Conditions |

### 1.3 URL Mapping Convention

```
PHP API:          /api/{resource}/{action}?{params}
Bridge Client:    apiBridge.{module}.{method}({params})
React Query Key:  ['{module}', '{action}', ...args]

Example:
PHP:      GET /api/purchase-orders/order?id=5
Bridge:   apiBridge.purchase.getById(5)
RQ Key:   ['purchase', 'getById', 5]
```

---

## 2. API Endpoint Mapping

### 2.1 Auth Endpoints

| PHP Endpoint | Method | Bridge Function | Auth | Description |
|---|---|---|---|---|
| `/api/auth/login` | POST | `auth.login(data)` | Public | ล็อกอินรับ JWT cookie |
| `/api/auth/verify` | POST | `auth.verify()` | Public | ตรวจสอบ token validity |
| `/api/auth/logout` | POST | `auth.logout()` | Required | Logout + revoke token |

### 2.2 Users Endpoints

| PHP Endpoint | Method | Bridge Function | Auth | Description |
|---|---|---|---|---|
| `/api/users/all` | GET | `users.getAll()` | admin | รายชื่อผู้ใช้ทั้งหมด |
| `/api/users` | POST | `users.create(data)` | admin | สร้างผู้ใช้ใหม่ |
| `/api/users/user?id=X` | GET | `users.getById(id)` | admin | ดูข้อมูลผู้ใช้ |
| `/api/users/user?id=X` | PUT | `users.update(id, data)` | admin | แก้ไขผู้ใช้ |
| `/api/users/user?id=X` | DELETE | `users.remove(id)` | admin | ลบผู้ใช้ |
| `/api/users/change-password` | POST | `users.changePassword(data)` | admin | เปลี่ยนรหัสผ่านผู้ใช้อื่น |
| `/api/users/activity-log` | GET | `users.getActivityLog(params)` | admin | ดู audit log |
| `/api/users/profile` | GET | `users.getProfile()` | any | ดูโปรไฟล์ตัวเอง |
| `/api/users/profile` | PUT | `users.updateProfile(data)` | any | แก้ไขโปรไฟล์ตัวเอง |
| `/api/users/change-own-password` | POST | `users.changeOwnPassword(data)` | any | เปลี่ยนรหัสผ่านตัวเอง |

### 2.3 Branches Endpoints

| PHP Endpoint | Method | Bridge Function | Auth | Description |
|---|---|---|---|---|
| `/api/branches` | GET | `branches.getAll()` | any | ดูสาขาทั้งหมด |
| `/api/branches` | POST | `branches.create(data)` | admin | สร้างสาขาใหม่ |
| `/api/branches/active` | GET | `branches.getActive()` | any | ดูสาขาที่ active |
| `/api/branches/summary` | GET | `branches.getSummary()` | any | สรุปยอดแต่ละสาขา |
| `/api/branches/branch?id=X` | GET | `branches.getById(id)` | any | ดูข้อมูลสาขา |
| `/api/branches/branch?id=X` | PUT | `branches.update(id, data)` | admin | แก้ไขสาขา |

### 2.4 Sellers Endpoints

| PHP Endpoint | Method | Bridge Function | Auth | Description |
|---|---|---|---|---|
| `/api/sellers` | GET | `sellers.getAll(params)` | any | ดูผู้ขายทั้งหมด (paginated) |
| `/api/sellers` | POST | `sellers.create(data)` | any | สร้างผู้ขายใหม่ |
| `/api/sellers/search?q=X` | GET | `sellers.search(q)` | any | ค้นหาผู้ขาย |
| `/api/sellers/seller?id=X` | GET | `sellers.getById(id)` | any | ดูข้อมูลผู้ขาย |
| `/api/sellers/seller?id=X` | PUT | `sellers.update(id, data)` | any | แก้ไขผู้ขาย |
| `/api/sellers/blacklist` | POST | `sellers.blacklist(data)` | admin,manager | แบล็คลิสต์ผู้ขาย |
| `/api/sellers/unblacklist` | POST | `sellers.unblacklist(data)` | admin,manager | ปลดแบล็คลิสต์ |
| `/api/sellers/history?seller_id=X` | GET | `sellers.getHistory(sellerId)` | any | ประวัติการขายของผู้ขาย |

### 2.5 Purchase Orders Endpoints

| PHP Endpoint | Method | Bridge Function | Auth | Description |
|---|---|---|---|---|
| `/api/purchase-orders` | GET | `purchase.getAll(params)` | any | ดู PO ทั้งหมด |
| `/api/purchase-orders` | POST | `purchase.create(data)` | admin,manager | สร้าง PO ใหม่ |
| `/api/purchase-orders/order?id=X` | GET | `purchase.getById(id)` | any | ดู PO รายการ |
| `/api/purchase-orders/cancel` | POST | `purchase.cancel(data)` | admin,manager | ยกเลิก PO |
| `/api/purchase-orders/photos` | POST | `purchase.uploadPhoto(data)` | HMAC/JWT | อัปโหลดรูป |
| `/api/purchase-orders/photos?po_id=X` | GET | `purchase.getPhotos(poId)` | HMAC/JWT | ดูรูปของ PO |
| `/api/purchase-orders/photo-token` | GET | `purchase.getPhotoToken()` | JWT | ขอ HMAC token |

### 2.6 Sale Lots Endpoints

| PHP Endpoint | Method | Bridge Function | Auth | Description |
|---|---|---|---|---|
| `/api/sale-lots` | GET | `saleLots.getAll(params)` | any | ดู Sale Lots ทั้งหมด |
| `/api/sale-lots` | POST | `saleLots.create(data)` | admin,manager | สร้าง Sale Lot (DRAFT) |
| `/api/sale-lots/sale-lot?id=X` | GET | `saleLots.getById(id)` | any | ดู Sale Lot รายการ |
| `/api/sale-lots/sale-lot?id=X` | PUT | `saleLots.update(id, data)` | admin,manager | แก้ไข (DRAFT) |
| `/api/sale-lots/sale-lot?id=X` | DELETE | `saleLots.remove(id)` | admin | ลบ (DRAFT) |
| `/api/sale-lots/confirm` | POST | `saleLots.confirm(id)` | admin,manager | ยืนยัน → ตัด FIFO stock |
| `/api/sale-lots/cancel` | POST | `saleLots.cancel(data)` | admin,manager | ยกเลิก → คืน stock |
| `/api/sale-lots/record-revenue` | POST | `saleLots.recordRevenue(data)` | admin,manager | บันทึกรายรับจริง |

### 2.7 Stock Transfers Endpoints

| PHP Endpoint | Method | Bridge Function | Auth | Description |
|---|---|---|---|---|
| `/api/stock-transfers` | GET | `stockTransfers.getAll(params)` | any | ดูรายการโอนทั้งหมด |
| `/api/stock-transfers` | POST | `stockTransfers.create(data)` | admin,manager | สร้าง Stock Transfer |
| `/api/stock-transfers/confirm` | POST | `stockTransfers.confirm(id)` | admin,manager | ยืนยันการโอน |
| `/api/stock-transfers/cancel` | POST | `stockTransfers.cancel(data)` | admin,manager | ยกเลิกการโอน |

### 2.8 Catalog & Price Tiers Endpoints

| PHP Endpoint | Method | Bridge Function | Auth | Description |
|---|---|---|---|---|
| `/api/price-tiers` | GET | `catalog.getPriceTiers()` | any | ดู catalog พร้อม tier_prices |
| `/api/price-tiers` | POST | `catalog.createPriceTier(data)` | admin,manager | เพิ่มรายการ catalog |
| `/api/price-tiers/category` | PUT | `catalog.updatePriceTier(data)` | admin,manager | อัปเดตราคา tier |
| `/api/purchase-catalog` | GET | `catalog.getAllItems(params)` | any | ดู catalog ทั้งหมด |
| `/api/purchase-catalog` | POST | `catalog.createItem(data)` | admin,manager | เพิ่มรายการ catalog |
| `/api/purchase-catalog/search?q=X` | GET | `catalog.search(q)` | any | ค้นหา catalog |
| `/api/purchase-catalog/item?id=X` | GET | `catalog.getItemById(id)` | any | ดูรายการ |
| `/api/purchase-catalog/item?id=X` | PUT | `catalog.updateItem(id, data)` | admin,manager | แก้ไขรายการ |
| `/api/purchase-catalog/item?id=X` | DELETE | `catalog.deleteItem(id)` | admin | ลบรายการ |
| `/api/purchase-catalog/update-category` | POST | `catalog.updateCategory(data)` | admin,manager | อัปเดต category_id |
| `/api/purchase-catalog/price-board` | GET | `catalog.getPriceBoard()` | any | ดึงราคาสำหรับพิมพ์บอร์ด |
| `/api/item-conditions` | GET | `catalog.getItemConditions()` | any | ดูสภาพของทั้งหมด |

### 2.9 Inventory Endpoints

| PHP Endpoint | Method | Bridge Function | Auth | Description |
|---|---|---|---|---|
| `/api/inventory/categories` | GET | `inventory.getCategories()` | any | ดูหมวดหมู่ทั้งหมด |
| `/api/inventory/categories` | POST | `inventory.createCategory(data)` | admin,manager | สร้างหมวดหมู่ |
| `/api/inventory/category?id=X` | GET | `inventory.getCategoryById(id)` | any | ดูหมวดหมู่ |
| `/api/inventory/category?id=X` | PUT | `inventory.updateCategory(id, data)` | admin,manager | แก้ไขหมวดหมู่ |
| `/api/inventory/category?id=X` | DELETE | `inventory.deleteCategory(id)` | admin | ลบหมวดหมู่ |
| `/api/inventory/products` | GET | `inventory.getProducts(params)` | any | ดูสินค้าทั้งหมด |
| `/api/inventory/products` | POST | `inventory.createProduct(data)` | admin,manager | สร้างสินค้า |
| `/api/inventory/product?id=X` | GET | `inventory.getProductById(id)` | any | ดูสินค้า |
| `/api/inventory/product?id=X` | PUT | `inventory.updateProduct(id, data)` | admin,manager | แก้ไขสินค้า |
| `/api/inventory/product?id=X` | DELETE | `inventory.deleteProduct(id)` | admin | ลบสินค้า |
| `/api/inventory/low-stock` | GET | `inventory.getLowStock()` | any | ดูสินค้าสต็อกต่ำ |
| `/api/inventory/transactions` | GET | `inventory.getTransactions(params)` | any | ประวัติเคลื่อนไหวสต็อก |
| `/api/inventory/transactions` | POST | `inventory.createTransaction(data)` | admin,manager | บันทึกการเคลื่อนไหว |
| `/api/inventory/set-threshold` | POST | `inventory.setThreshold(data)` | admin | ตั้งค่า alert_threshold |
| `/api/inventory/stock-alerts` | GET | `inventory.getStockAlerts()` | any | ดูรายการ stock ≤ threshold |

### 2.10 Sales Endpoints (Base POS)

| PHP Endpoint | Method | Bridge Function | Auth | Description |
|---|---|---|---|---|
| `/api/sales` | POST | `sales.create(data)` | any* | สร้างใบขาย |
| `/api/sales` | GET | `sales.getAll(params)` | any | ดูใบขายทั้งหมด |
| `/api/sales/sale?id=X` | GET | `sales.getById(id)` | any | ดูรายละเอียดใบขาย |
| `/api/sales/void` | POST | `sales.voidSale(data)` | admin,manager | ยกเลิกใบขาย |
| `/api/sales/export` | GET | `sales.exportCSV(params)` | admin,manager | Export CSV |

### 2.11 Financial Endpoints

| PHP Endpoint | Method | Bridge Function | Auth | Description |
|---|---|---|---|---|
| `/api/financial/summary` | GET | `reports.getFinancialSummary(params)` | admin,manager | สรุปการเงิน |
| `/api/financial/lot-revenues` | GET | `reports.getLotRevenues(params)` | admin,manager | รายรับแยกตาม lot |
| `/api/financial/purchase-by-category` | GET | `reports.getPurchaseByCategory(params)` | admin,manager | ยอดซื้อแยกหมวด |
| `/api/financial/expenses` | GET | `reports.getExpenses(params)` | admin,manager | ดูรายการค่าใช้จ่าย |
| `/api/financial/expenses` | POST | `reports.createExpense(data)` | admin,manager | บันทึกค่าใช้จ่าย |
| `/api/financial/expenses?id=X` | DELETE | `reports.deleteExpense(id)` | admin | ลบค่าใช้จ่าย |
| `/api/financial/export` | GET | `reports.exportFinancialCSV(params)` | admin,manager | Export CSV |

### 2.12 Reports Endpoints

| PHP Endpoint | Method | Bridge Function | Auth | Description |
|---|---|---|---|---|
| `/api/reports/dashboard-stats` | GET | `reports.getDashboardStats()` | any | KPI สำหรับ dashboard |
| `/api/reports/sales-chart` | GET | `reports.getSalesChart(params)` | any | Chart การขาย |
| `/api/reports/recent-sales` | GET | `reports.getRecentSales()` | any | การขายล่าสุด |
| `/api/reports/purchase-chart` | GET | `reports.getPurchaseChart(params)` | any | Chart การซื้อ |
| `/api/reports/recent-purchases` | GET | `reports.getRecentPurchases()` | any | การซื้อล่าสุด |
| `/api/reports/recent-sale-lots` | GET | `reports.getRecentSaleLots()` | any | Sale lot ล่าสุด |
| `/api/reports/sales-report` | GET | `reports.getSalesReport(params)` | any | รายงานการขาย |
| `/api/reports/product-sales` | GET | `reports.getProductSales(params)` | any | ยอดขายแยกตามสินค้า |
| `/api/reports/inventory-report` | GET | `reports.getInventoryReport()` | any | รายงานสต็อก |
| `/api/reports/cashier-performance` | GET | `reports.getCashierPerformance(params)` | admin,manager | ประสิทธิภาพพนักงาน |
| `/api/reports/tax-report` | GET | `reports.getTaxReport(params)` | admin,manager | รายงานภาษี |
| `/api/reports/purchase-report` | GET | `reports.getPurchaseReport(params)` | any | รายงานการซื้อ |
| `/api/reports/sale-lot-report` | GET | `reports.getSaleLotReport(params)` | any | รายงาน sale lot |
| `/api/reports/sale-lot-chart` | GET | `reports.getSaleLotChart(params)` | any | chart sale lot |

### 2.13 Settings Endpoints

| PHP Endpoint | Method | Bridge Function | Auth | Description |
|---|---|---|---|---|
| `/api/settings/store` | GET | `settings.getStore()` | any | ดูข้อมูลร้านค้า |
| `/api/settings/store` | POST | `settings.updateStore(data)` | admin | บันทึกข้อมูลร้าน |
| `/api/settings/system` | GET | `settings.getSystem()` | admin | ดู system settings |
| `/api/settings/system` | POST | `settings.updateSystem(data)` | admin | บันทึก system settings |
| `/api/settings/backup/create` | POST | `settings.backupCreate()` | admin | สร้าง backup DB |
| `/api/settings/backup/restore` | POST | `settings.backupRestore(data)` | admin | restore backup |
| `/api/settings/backup/history` | GET | `settings.backupHistory()` | admin | ประวัติ backup |
| `/api/settings/backup/download` | GET | `settings.backupDownload(params)` | admin | ดาวน์โหลด backup |
| `/api/settings/backup/delete` | POST | `settings.backupDelete(data)` | admin | ลบ backup |

---

## 3. Request/Response Types

### 3.1 Common Response Envelope

```typescript
// Success Response
interface ApiSuccessResponse<T> {
  status: 'success';
  message: string;
  data: T;
}

// Error Response
interface ApiErrorResponse {
  status: 'error';
  message: string;
  errors?: Record<string, string[]>; // field-level validation errors
}

// Paginated Response
interface ApiPaginatedResponse<T> {
  status: 'success';
  message: string;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

### 3.2 Auth Types

```typescript
// POST /api/auth/login
interface LoginRequest {
  username: string;   // ชื่อผู้ใช้
  password: string;   // รหัสผ่าน (≥12 chars)
}

interface LoginResponse {
  user: UserDTO;
}
// Server sets: Set-Cookie: posToken (httpOnly) + posUser (non-httpOnly)

// POST /api/auth/verify
interface VerifyResponse {
  valid: boolean;
  user?: UserDTO;
}

// POST /api/auth/logout
// Request: (empty, token from cookie)
interface LogoutResponse {
  message: string;
}
```

### 3.3 User Types

```typescript
interface UserDTO {
  id: number;
  username: string;
  full_name: string;
  email: string;
  role: 'admin' | 'manager' | 'cashier';
  branch_id: number | null;
  status: 'active' | 'inactive';
  last_login?: string; // ISO datetime
  created_at: string;
}

interface CreateUserRequest {
  username: string;
  password: string;
  full_name: string;
  email: string;
  role: 'admin' | 'manager' | 'cashier';
  branch_id?: number;
}

interface UpdateUserRequest {
  full_name?: string;
  email?: string;
  role?: 'admin' | 'manager' | 'cashier';
  branch_id?: number | null;
  status?: 'active' | 'inactive';
}

interface ChangePasswordRequest {
  user_id: number;
  new_password: string;
}

interface ChangeOwnPasswordRequest {
  current_password: string;
  new_password: string;
}

interface UpdateProfileRequest {
  full_name?: string;
  email?: string;
}

interface ActivityLogDTO {
  id: number;
  user_id: number;
  user_name: string;
  action: string;
  description: string;
  ip_address: string;
  created_at: string;
}
```

### 3.4 Branch Types

```typescript
interface BranchDTO {
  id: number;
  name: string;
  code: string;
  address: string;
  phone: string;
  status: 'active' | 'inactive';
  cost_method: 'fifo' | 'weighted';
  created_at: string;
  updated_at: string;
}

interface CreateBranchRequest {
  name: string;
  code: string;
  address?: string;
  phone?: string;
  cost_method?: 'fifo' | 'weighted';
}

interface BranchSummaryDTO {
  id: number;
  name: string;
  code: string;
  total_purchases_today: number;
  total_sales_today: number;
  total_profit_today: number;
  transaction_count: number;
}
```

### 3.5 Seller Types

```typescript
interface SellerDTO {
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
  status: 'active' | 'inactive';
  created_at: string;
}

interface CreateSellerRequest {
  full_name: string;
  phone: string;
  id_card_number: string;
  address?: string;
  vehicle_plate?: string;
}

interface BlacklistRequest {
  seller_id: number;
  reason: string;
}

interface SellerHistoryDTO {
  purchase_orders: PurchaseOrderDTO[];
  total_amount: number;
  total_count: number;
}
```

### 3.6 Purchase Order Types

```typescript
interface PurchaseOrderDTO {
  id: number;
  reference_no: string;       // PO-YYYYMMDD-XXX
  branch_id: number;
  seller_id: number;
  seller_name?: string;
  user_id: number;
  user_name?: string;
  payment_method: 'cash' | 'bank_transfer';
  total_amount: number;
  notes?: string;
  status: 'active' | 'cancelled';
  cancelled_at?: string;
  cancelled_by?: number;
  items?: PurchaseOrderItemDTO[];
  photos?: PhotoDTO[];
  created_at: string;
  updated_at: string;
}

interface PurchaseOrderItemDTO {
  id: number;
  purchase_order_id: number;
  catalog_item_id: number;
  name: string;
  category_id: number;
  category_name?: string;
  condition_id: number;
  condition_name?: string;
  condition_color?: string;
  quantity: number;
  effective_quantity: number; // หลังหัก weight_deduction
  unit: string;
  price_per_unit: number;
  tier_label: string;         // "บิล 1", "บิล 2", "บิล 3"
  total: number;
  consumed_qty: number;
}

interface CreatePurchaseOrderRequest {
  seller_id: number;
  branch_id: number;
  payment_method: 'cash' | 'bank_transfer';
  notes?: string;
  items: CreatePurchaseOrderItemRequest[];
}

interface CreatePurchaseOrderItemRequest {
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

interface CancelPurchaseOrderRequest {
  id: number;
  reason: string;
}

// Query Params for GET /api/purchase-orders
interface PurchaseOrderQueryParams {
  page?: number;
  limit?: number;
  branch_id?: number;
  date_from?: string;
  date_to?: string;
  seller_id?: number;
  status?: 'active' | 'cancelled';
}
```

### 3.7 Sale Lot Types

```typescript
interface SaleLotDTO {
  id: number;
  reference_no: string;       // LOT-YYYYMMDD-XXX
  branch_id: number;
  branch_name?: string;
  buyer_name: string;
  buyer_phone?: string;
  user_id: number;
  user_name?: string;
  total_amount: number;
  cost_total?: number;        // computed on confirm
  profit?: number;            // computed on confirm
  actual_revenue?: number;
  expenses?: ExpenseDTO[];
  notes?: string;
  status: 'draft' | 'confirmed' | 'cancelled';
  confirmed_at?: string;
  confirmed_by?: number;
  cancelled_at?: string;
  items?: SaleLotItemDTO[];
  created_at: string;
  updated_at: string;
}

interface SaleLotItemDTO {
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
  cost_per_unit?: number;     // computed on confirm
  cost_total?: number;        // computed on confirm
  profit?: number;            // computed on confirm
}

interface CreateSaleLotRequest {
  branch_id: number;
  buyer_name: string;
  buyer_phone?: string;
  notes?: string;
  items: CreateSaleLotItemRequest[];
}

interface CreateSaleLotItemRequest {
  catalog_item_id: number;
  name: string;
  category_id: number;
  quantity: number;
  unit: string;
  price_per_unit: number;
  total: number;
}

interface ConfirmSaleLotRequest {
  id: number;
}

interface CancelSaleLotRequest {
  id: number;
  reason?: string;
}

interface RecordRevenueRequest {
  id: number;
  actual_revenue: number;
  expenses?: ExpenseItem[];
}

interface ExpenseItem {
  description: string;
  amount: number;
}

interface ExpenseDTO {
  id: number;
  description: string;
  amount: number;
}

// Query Params for GET /api/sale-lots
interface SaleLotQueryParams {
  page?: number;
  limit?: number;
  branch_id?: number;
  date_from?: string;
  date_to?: string;
  status?: 'draft' | 'confirmed' | 'cancelled';
}
```

### 3.8 Stock Transfer Types

```typescript
interface StockTransferDTO {
  id: number;
  reference_no: string;       // TFR-YYYYMMDD-XXX
  from_branch_id: number;
  from_branch_name?: string;
  to_branch_id: number;
  to_branch_name?: string;
  user_id: number;
  user_name?: string;
  notes?: string;
  status: 'draft' | 'confirmed' | 'cancelled';
  carrier_name?: string;
  vehicle_plate?: string;
  tracking_number?: string;
  from_address?: string;
  to_address?: string;
  items?: StockTransferItemDTO[];
  confirmed_at?: string;
  confirmed_by?: number;
  created_at: string;
}

interface StockTransferItemDTO {
  purchase_order_item_id: number;
  catalog_item_name?: string;
  quantity: number;
}

interface CreateStockTransferRequest {
  from_branch_id: number;
  to_branch_id: number;
  notes?: string;
  carrier_name?: string;
  vehicle_plate?: string;
  tracking_number?: string;
  items: { purchase_order_item_id: number; quantity: number }[];
}

interface ConfirmStockTransferRequest {
  id: number;
}

interface CancelStockTransferRequest {
  id: number;
  reason?: string;
}
```

### 3.9 Catalog & Price Tier Types

```typescript
interface CatalogItemDTO {
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

interface TierPriceDTO {
  label: string;    // "บิล 1", "บิล 2", "บิล 3"
  price: number;
}

interface CreateCatalogItemRequest {
  code: string;
  name: string;
  category_id: number;
  default_unit?: string;
  default_price: number;
  tier_prices: TierPriceDTO[];
}

interface UpdateCatalogItemRequest {
  code?: string;
  name?: string;
  category_id?: number;
  default_unit?: string;
  default_price?: number;
  tier_prices?: TierPriceDTO[];
  is_active?: boolean;
}

interface ItemConditionDTO {
  id: number;
  name: string;           // "ดี", "พอใช้", "ชำรุด"
  weight_deduction: number; // 0, 10, 20 (percent)
  sort_order: number;
  color_code: string;     // #059669, #D97706, #DC2626
  status: 'active' | 'inactive';
}

interface PriceBoardDTO {
  categories: {
    id: number;
    name: string;
    items: {
      code: string;
      name: string;
      tier_prices: TierPriceDTO[];
      unit: string;
    }[];
  }[];
  updated_at: string;
}

interface UpdatePriceTierRequest {
  catalog_item_id: number;
  tier_prices: TierPriceDTO[];
}
```

### 3.10 Inventory Types

```typescript
interface CategoryDTO {
  id: number;
  name: string;
  description?: string;
  default_unit: string;
  stock_kg: number;
  alert_threshold?: number;
  status: 'active' | 'inactive';
  created_at: string;
}

interface CreateCategoryRequest {
  name: string;
  description?: string;
  default_unit?: string;
  alert_threshold?: number;
}

interface ProductDTO {
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
  status: 'active' | 'inactive';
  created_at: string;
}

interface CreateProductRequest {
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

interface InventoryTransactionDTO {
  id: number;
  product_id: number;
  type: 'purchase' | 'sale' | 'adjustment' | 'return';
  quantity: number;
  reference_id?: number;
  notes?: string;
  user_id: number;
  created_at: string;
}

interface StockAlertDTO {
  category_id: number;
  category_name: string;
  stock_kg: number;
  alert_threshold: number;
  branch_id?: number;
}

interface SetThresholdRequest {
  category_id: number;
  alert_threshold: number;
}
```

### 3.11 Sale Types (Base POS)

```typescript
interface SaleDTO {
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
  payment_status: 'paid' | 'voided';
  notes?: string;
  items?: SaleItemDTO[];
  created_at: string;
}

interface SaleItemDTO {
  id: number;
  sale_id: number;
  product_id: number;
  product_name?: string;
  quantity: number;
  price: number;
  total: number;
}

interface CreateSaleRequest {
  customer_id?: number;
  payment_method: string;
  notes?: string;
  items: {
    product_id: number;
    quantity: number;
    price: number;
    total: number;
  }[];
}

interface VoidSaleRequest {
  id: number;
  reason: string;
}
```

### 3.12 Business Expense Types

```typescript
interface BusinessExpenseDTO {
  id: number;
  branch_id: number;
  description: string;
  amount: number;
  category: string;       // ค่าเช่า, ค่าน้ำ, ค่าไฟ, เงินเดือน, อื่นๆ
  expense_date: string;   // YYYY-MM-DD
  user_id: number;
  created_at: string;
}

interface CreateExpenseRequest {
  branch_id: number;
  description: string;
  amount: number;
  category: string;
  expense_date: string;
}
```

### 3.13 Photo Types

```typescript
interface PhotoDTO {
  id: number;
  purchase_order_id: number;
  filename: string;
  original_name: string;
  mime_type: string;
  file_size: number;
  url: string;            // computed full URL
  created_at: string;
}
```

### 3.14 Report Types

```typescript
interface DashboardStatsDTO {
  today: {
    total_purchase: number;
    total_sale: number;
    total_profit: number;
    transaction_count: number;
  };
  by_branch: {
    branch_id: number;
    branch_name: string;
    purchase_amount: number;
    sale_amount: number;
    profit: number;
  }[];
  aging_inventory: {
    category_name: string;
    days_held: number;
    quantity: number;
  }[];
  recent_sales: SaleDTO[];
  recent_purchases: PurchaseOrderDTO[];
  recent_sale_lots: SaleLotDTO[];
}

interface SalesChartDTO {
  labels: string[];     // dates
  datasets: {
    label: string;
    data: number[];
  }[];
}

interface ReportQueryParams {
  date_from?: string;
  date_to?: string;
  branch_id?: number;
  status?: string;
}

interface ExportQueryParams extends ReportQueryParams {
  format?: 'csv' | 'xlsx';
}
```

### 3.15 Settings Types

```typescript
interface StoreSettingsDTO {
  name: string;
  address: string;
  phone: string;
  tax_id: string;
  logo_url?: string;
}

interface SystemSettingsDTO {
  currency: string;
  timezone: string;
  date_format: string;
  receipt_footer: string;
  enable_low_stock_alert: boolean;
  auto_backup_enabled: boolean;
}

interface BackupDTO {
  id: number;
  filename: string;
  file_size: number;
  created_at: string;
  created_by: number;
}
```

---

## 4. Error Handling Patterns

### 4.1 Error Classification

| HTTP Status | Error Code | ความหมาย | การจัดการ |
|---|---|---|---|
| 400 | `BAD_REQUEST` | ข้อมูลไม่ถูกต้อง | แสดง field-level errors |
| 401 | `UNAUTHORIZED` | ไม่ได้ล็อกอิน | Redirect ไปหน้า login |
| 403 | `FORBIDDEN` | ไม่มีสิทธิ์ | แสดง toast "คุณไม่มีสิทธิ์" |
| 404 | `NOT_FOUND` | ไม่พบข้อมูล | แสดง "ไม่พบข้อมูล" |
| 409 | `CONFLICT` | ข้อมูลซ้ำ/ขัดแย้ง | แสดง message |
| 422 | `VALIDATION_ERROR` | validation ล้มเหลว | แสดง field errors |
| 429 | `RATE_LIMITED` | request เกิน限额 | รอแล้ว retry |
| 500 | `SERVER_ERROR` | ข้อผิดพลาดเซิร์ฟเวอร์ | แสดง "เกิดข้อผิดพลาด" + log |

### 4.2 Bridge Client Error Handling

```typescript
// api-bridge/client.ts

class BridgeApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public fieldErrors?: Record<string, string[]>
  ) {
    super(message);
    this.name = 'BridgeApiError';
  }

  static fromHttpError(status: number, body: any): BridgeApiError {
    const codes: Record<number, string> = {
      400: 'BAD_REQUEST',
      401: 'UNAUTHORIZED',
      403: 'FORBIDDEN',
      404: 'NOT_FOUND',
      409: 'CONFLICT',
      422: 'VALIDATION_ERROR',
      429: 'RATE_LIMITED',
      500: 'SERVER_ERROR',
    };
    return new BridgeApiError(
      status,
      codes[status] || 'UNKNOWN',
      body?.message || 'เกิดข้อผิดพลาด',
      body?.errors
    );
  }

  isAuthError(): boolean {
    return this.status === 401;
  }

  isForbidden(): boolean {
    return this.status === 403;
  }

  isRateLimited(): boolean {
    return this.status === 429;
  }
}
```

### 4.3 React Query Error Handler

```typescript
// Centralized error handling for React Query mutations
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        if (error instanceof BridgeApiError) {
          if (error.isAuthError()) return false;     // Don't retry auth errors
          if (error.isForbidden()) return false;      // Don't retry forbidden
          if (error.isRateLimited()) {
            // Retry once after delay
            return failureCount < 1;
          }
        }
        return failureCount < 3;  // Default: retry 3 times
      },
      staleTime: 30 * 1000,       // 30s default stale time
      gcTime: 5 * 60 * 1000,      // 5min cache
    },
    mutations: {
      onError: (error) => {
        if (error instanceof BridgeApiError) {
          // Toast notification
          showErrorToast({
            title: getErrorTitle(error.code),
            description: error.message,
          });
        }
      },
    },
  },
});

function getErrorTitle(code: string): string {
  const titles: Record<string, string> = {
    UNAUTHORIZED: 'กรุณาเข้าสู่ระบบอีกครั้ง',
    FORBIDDEN: 'ไม่มีสิทธิ์เข้าถึง',
    NOT_FOUND: 'ไม่พบข้อมูล',
    VALIDATION_ERROR: 'ข้อมูลไม่ถูกต้อง',
    RATE_LIMITED: 'ดำเนินการเร็วเกินไป กรุณารอสักครู่',
    SERVER_ERROR: 'เกิดข้อผิดพลาดของระบบ',
  };
  return titles[code] || 'เกิดข้อผิดพลาด';
}
```

### 4.4 Network Error Recovery

```typescript
// Retry with exponential backoff
const NETWORK_RETRY_CONFIG = {
  maxRetries: 3,
  initialDelay: 1000,     // 1s
  maxDelay: 10000,        // 10s
  backoffFactor: 2,       // exponential
};

// Offline detection
const OFFLINE_CONFIG = {
  checkInterval: 30000,   // Check every 30s
  onOffline: () => {
    // Show offline indicator
    // Queue mutations for retry
  },
  onOnline: () => {
    // Hide offline indicator
    // Flush queued mutations
    // Invalidate queries
  },
};
```

---

## 5. Auth Flow (JWT → Next.js Session)

### 5.1 Authentication Architecture

```
┌──────────┐        ┌──────────────┐        ┌──────────┐
│  PWA App  │        │  Bridge Layer │        │ PHP API  │
│ (Browser) │        │  (Next.js)   │        │ (Legacy) │
└─────┬─────┘        └──────┬───────┘        └────┬─────┘
      │                     │                     │
      │  POST /auth/login   │                     │
      │  {username,pass}    │                     │
      │────────────────────→│────────────────────→│
      │                     │                     │
      │                     │  200 { user }       │
      │                     │  Set-Cookie: posToken│
      │←────────────────────│←────────────────────│
      │                     │                     │
      │  Store session      │                     │
      │  in NextAuth        │                     │
      │                     │                     │
      │  GET /purchase-orders                     │
      │  (Session cookie    │                     │
      │   + forward posToken)                    │
      │────────────────────→│────────────────────→│
      │                     │                     │
      │          200 { data }                     │
      │←────────────────────│←────────────────────│
```

### 5.2 Session Strategy (Phase 1)

```typescript
// Phase 1: Bridge approach — forward JWT cookie to PHP
// Next.js acts as BFF (Backend-for-Frontend)

// 1. Login: forward credentials → PHP sets httpOnly cookie
// 2. Next.js reads posToken from response, stores in session
// 3. Every subsequent request: forward posToken to PHP

interface SessionUser {
  id: number;
  username: string;
  full_name: string;
  role: 'admin' | 'manager' | 'cashier';
  branch_id: number | null;
  email: string;
}

// NextAuth.js v5 custom provider
// Provider type: "credentials" — forwards to PHP /api/auth/login
// Session is stored server-side (JWT strategy)
// The posToken is stored in the JWT-encrypted NextAuth session
```

### 5.3 Token Lifecycle

```
State Flow:

[Logged Out]
    │
    │ POST /auth/login (username + password)
    ▼
[Pending Auth] ──→ Error → [Logged Out] (show error toast)
    │
    │ 200 { user } + Set-Cookie: posToken
    ▼
[Logged In]
    │
    │ NextAuth session created
    │ posToken stored in encrypted session (server-side)
    │
    ├──→ GET /api/verify (validate token)
    │       │
    │       ├── 200 { valid: true } → stay [Logged In]
    │       └── 401 → [Logged Out] (session expired)
    │
    ├──→ POST /auth/logout → clear cookies → [Logged Out]
    │
    └──→ Token expiry (24h) → auto-redirect → [Logged Out]
```

### 5.4 NextAuth.js v5 Configuration

```typescript
// auth.ts (NextAuth v5 config)
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const res = await fetch(`${process.env.PHP_API_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(credentials),
        });

        if (!res.ok) return null;

        const data = await res.json();
        const cookies = res.headers.getSetCookie();

        // Store phpToken in the session (for forwarding to PHP)
        const phpToken = extractCookie(cookies, 'posToken');

        return {
          id: String(data.user.id),
          name: data.user.full_name,
          email: data.user.email,
          role: data.user.role,
          branch_id: data.user.branch_id,
          phpToken,
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours (match PHP JWT expiry)
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.branch_id = (user as any).branch_id;
        token.phpToken = (user as any).phpToken;
      }
      return token;
    },
    async session({ session, token }) {
      session.user = {
        ...session.user,
        role: token.role as string,
        branch_id: token.branch_id as number | null,
      };
      // phpToken is stored on session (not exposed to client)
      (session as any).phpToken = token.phpToken;
      return session;
    },
  },
  pages: {
    signIn: '/auth/login',
  },
});
```

### 5.5 Request Forwarding Strategy

```typescript
// Every Bridge API call MUST forward the PHP token
// The token is retrieved from the server-side session

// Client Component: useSession() for user info
// Server Component: auth() for full session + phpToken

// In Bridge client.ts:
async function getPhpToken(): Promise<string | null> {
  // Server-side: get from cookies/session
  if (typeof window === 'undefined') {
    const { auth } = await import('@/lib/auth');
    const session = await auth();
    return (session as any)?.phpToken ?? null;
  }
  // Client-side: get from NextAuth client session
  const { getSession } = await import('next-auth/react');
  const session = await getSession();
  return (session as any)?.phpToken ?? null;
}
```

### 5.6 Cookie Forwarding Rules

| Cookie | Type | HttpOnly | Secure | SameSite | หน้าที่ |
|--------|------|----------|--------|----------|--------|
| `posToken` | JWT | ✅ | ✅ (prod) | Strict | Auth token for PHP |
| `posUser` | JSON | ❌ | ✅ (prod) | Strict | User info for legacy UI |
| `next-auth.session-token` | JWE | ✅ | ✅ (prod) | Lax | NextAuth session |
| `__Secure-next-auth.session-token` | JWE | ✅ | ✅ (prod) | Lax | NextAuth session (prod) |

---

## 6. Rate Limiting Plan

### 6.1 PHP Backend Rate Limits

| Endpoint Group | Limit | Window | เมื่อเกิน |
|---|---|---|---|
| Auth (login) | 5 attempts | 15 min | 429 Too Many Requests |
| All other endpoints | 60 requests | 1 min | 429 Too Many Requests |
| Photo upload | 10 requests | 1 min | 429 Too Many Requests |

### 6.2 Bridge Layer Rate Limiting Strategy

```typescript
// Phase 1: Forward rate limit responses from PHP
// Phase 2 (future): Implement middleware-level rate limiting in Next.js

interface RateLimitConfig {
  // Client-side throttling to prevent flooding
  client: {
    login: { maxAttempts: 5; windowMs: 15 * 60 * 1000 };
    mutations: { maxAttempts: 30; windowMs: 60 * 1000 };
  };
}

// Когда PHP responds 429:
// 1. Show "กรุณารอสักครู่" toast
// 2. Implement exponential backoff for auto-retry
// 3. Log rate limit event for monitoring

// Client-side throttling for login
const loginThrottle = new Map<string, { count: number; windowStart: number }>();

function checkLoginThrottle(username: string): boolean {
  const now = Date.now();
  const entry = loginThrottle.get(username);

  if (!entry || now - entry.windowStart > 15 * 60 * 1000) {
    loginThrottle.set(username, { count: 1, windowStart: now });
    return true;
  }

  if (entry.count >= 5) {
    return false; // Blocked
  }

  entry.count++;
  return true;
}
```

### 6.3 Retry Strategy

```
PHP Response 429:
  ↓
React Query retry (1 attempt after delay)
  ↓
Success?
  ├── Yes → Continue
  └── No  → Show error toast
           ↓
           Exponential backoff:
           Attempt 1: wait 2s
           Attempt 2: wait 4s
           Attempt 3: wait 8s (max)
           ↓
           Still failing → Show "ระบบไม่พร้อมใช้งาน กรุณาลองภายหลัง"
```

---

## 7. Mobile-first App Router Structure

### 7.1 Next.js App Router Layout

```
src/app/
├── layout.tsx                    # Root layout (providers, fonts)
├── globals.css                   # Global styles (Tailwind)
├── (auth)/
│   ├── layout.tsx                # Auth layout (centered card)
│   └── login/
│       └── page.tsx              # Login page
│
├── (dashboard)/
│   ├── layout.tsx                # Shell layout (Bottom Nav + Header)
│   │
│   ├── page.tsx                  # Dashboard (KPI cards)
│   │
│   ├── purchases/
│   │   ├── page.tsx              # Purchase orders list
│   │   ├── new/
│   │   │   └── page.tsx          # Create purchase order
│   │   └── [id]/
│   │       └── page.tsx          # Purchase order detail
│   │
│   ├── sale-lots/
│   │   ├── page.tsx              # Sale lots list
│   │   ├── new/
│   │   │   └── page.tsx          # Create sale lot
│   │   └── [id]/
│   │       └── page.tsx          # Sale lot detail
│   │
│   ├── inventory/
│   │   ├── page.tsx              # Inventory overview
│   │   ├── categories/
│   │   │   └── page.tsx          # Manage categories
│   │   └── products/
│   │       ├── page.tsx          # Products list
│   │       └── [id]/
│   │           └── page.tsx      # Product detail
│   │
│   ├── reports/
│   │   ├── page.tsx              # Reports overview
│   │   ├── sales/
│   │   │   └── page.tsx          # Sales report
│   │   ├── purchases/
│   │   │   └── page.tsx          # Purchase report
│   │   └── financial/
│   │       └── page.tsx          # Financial summary
│   │
│   ├── sellers/
│   │   ├── page.tsx              # Sellers list
│   │   ├── new/
│   │   │   └── page.tsx          # Create seller
│   │   └── [id]/
│   │       └── page.tsx          # Seller detail
│   │
│   ├── catalog/
│   │   ├── page.tsx              # Catalog items list
│   │   └── price-board/
│   │       └── page.tsx          # Price board view
│   │
│   └── settings/
│       └── page.tsx              # Settings page
│
└── api/
    └── auth/
        └── [...nextauth]/
            └── route.ts          # NextAuth.js API route
```

### 7.2 Route Group Strategy

```
(auth)/        = No Shell layout, centered card UI
(dashboard)/   = Shell layout (Bottom Nav + Header), protected routes
```

### 7.3 Layout Hierarchy

```typescript
// Root Layout (layout.tsx)
// ─ Provides: SessionProvider, QueryClientProvider, ThemeProvider
// ─ Imports: Fonts (Inter + Sarabun), globals.css
// ─ Structure: <html> → <body> → providers → {children}

// Auth Layout ((auth)/layout.tsx)
// ─ Minimal layout: centered card on steel-50 background
// ─ No bottom nav, no header
// ─ Used for: /login

// Shell Layout ((dashboard)/layout.tsx)
// ─ Full PWA shell
// ─ Mobile-first responsive:
//   • ≤ 639px: Bottom Nav (5 items) + Header
//   • 640-768px: Bottom Nav + wider sidebar
// ─ Structure: Header → main content → Bottom Nav
// ─ Content area: overflow-y-auto, pb-20 (space for bottom nav)
```

---

## 8. PWA Shell Layout

### 8.1 Shell Component Structure

```typescript
// (dashboard)/layout.tsx
<DashboardShell>
  <Header />           // Top bar: logo, branch selector, user menu
  <main>{children}</main>  // Scrollable content area
  <BottomNav />        // 5-item bottom navigation bar
</DashboardShell>
```

### 8.2 Header Component

```
┌──────────────────────────────────────────┐
│ [☰]  SoloCorp POS    [สาขาหลัก ▼]  [👤] │
│ ──────────────────────────────────────── │
│              (content area)               │
│                                           │
```

### 8.3 Bottom Navigation

```
┌──────────┬──────────┬──────────┬──────────┬──────────┐
│  📊      │  📥     │  📦      │  📈      │  ⚙️      │
│ Dashboard│ รับซื้อ  │ คลัง     │ รายงาน   │ เพิ่มเติม │
└──────────┴──────────┴──────────┴──────────┴──────────┘
```

**Bottom Nav Items (Mobile-first):**

| Icon | Label | Path | Auth Required | Badge |
|---|---|---|---|---|
| `layout-dashboard` | หน้าแรก | `/` | any | — |
| `shopping-cart` | รับซื้อ | `/purchases` | admin,manager | — |
| `package` | คลัง | `/inventory` | any | stock alert |
| `bar-chart-3` | รายงาน | `/reports` | any | — |
| `more-horizontal` | เพิ่มเติม | — | — | — |

**เพิ่มเติม (Overflow Menu):**
| Icon | Label | Path |
|---|---|---|
| `tag` | ขาย (Sale) | `/sale-lots` |
| `users` | ผู้ขาย | `/sellers` |
| `shopping-bag` | แคตตาล็อก | `/catalog` |
| `settings` | ตั้งค่า | `/settings` |

### 8.4 PWA Manifest

```json
{
  "name": "SoloCorp POS",
  "short_name": "SoloCorp",
  "description": "ระบบรับซื้อของเก่า สำหรับคนขายของเก่า",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#F9FAFB",
  "theme_color": "#1A56DB",
  "orientation": "portrait",
  "scope": "/",
  "lang": "th-TH",
  "icons": [
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ],
  "categories": ["business", "finance"],
  "prefer_related_applications": false,
  "screenshots": []
}
```

### 8.5 Service Worker Strategy

```typescript
// Phase 1: Network-first with cache fallback (basic offline support)
// Phase 2 (future): Full offline with IndexedDB sync queue

// Service Worker Registration (sw.ts or public/sw.js)

const CACHE_NAME = 'solocorp-pos-v1';
const STATIC_ASSETS = [
  '/',
  '/offline',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
];

// Install: pre-cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
});

// Activate: clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      );
    })
  );
});

// Fetch: Network-first strategy for API, Cache-first for static
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // API requests: network-first
  if (request.url.includes('/api/')) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Static assets: cache-first
  event.respondWith(cacheFirst(request));
});
```

### 8.6 Responsive Breakpoints

| Breakpoint | Width | Layout | Bottom Nav | Sidebar |
|---|---|---|---|---|
| **Mobile S** | 320-374px | Single column, compact | 5 items, label hidden | None |
| **Mobile M** | 375-424px | Single column | 5 items, short label | None |
| **Mobile L** | 425-639px | Single column | 5 items, full label | None |
| **Tablet** | 640-768px | Single/2-column | Bottom nav | Collapsed sidebar |

**Tailwind Configuration:**

```typescript
// tailwind.config.ts — already configured with:
// sm: 640px (tablet breakpoint for 2-col)
// md: 768px (sidebar appears)
// lg: 1024px (desktop)
// xl: 1280px (wide)

// Mobile-first classes:
// <div className="grid grid-cols-1 sm:grid-cols-2 gap-lg p-lg">
// <BottomNav className="sm:hidden" />  {/* Hidden on tablet+ */}
// <Sidebar className="hidden sm:flex" /> {/* Show on tablet+ */}
```

### 8.7 Mobile-first Design Tokens

```typescript
// Responsive spacing
const mobileSpacing = {
  page: 'p-lg',              // lg: 16px
  card: 'p-md',             // md: 12px
  section: 'gap-xl',        // xl: 24px
  bottomNavHeight: 'h-16',  // 64px (safe for 44px touch targets + padding)
  headerHeight: 'h-12',     // 48px
};

// Touch targets (44px minimum)
const touchTargets = {
  button: 'min-h-touch min-w-touch',    // 44px
  input: 'min-h-input',                  // 40px
  navItem: 'min-h-touch min-w-[72px]',  // 44x72px
};
```

---

## 9. Bridge Layer Implementation Guide

### 9.1 File Structure

```
src/lib/api-bridge/
├── client.ts           # HTTP client wrapper
├── types.ts            # All DTOs (จาก Section 3)
├── auth.ts             # Auth endpoints
├── purchase.ts         # Purchase orders endpoints
├── sale-lots.ts        # Sale lots endpoints
├── inventory.ts        # Inventory & categories endpoints
├── reports.ts          # Reports & financial endpoints
├── catalog.ts          # Catalog & price tiers endpoints
├── sellers.ts          # Sellers endpoints
├── branches.ts         # Branches endpoints
├── users.ts            # Users endpoints
├── sales.ts            # Sales endpoints (Base POS)
├── settings.ts         # Settings & backup endpoints
└── stock-transfers.ts  # Stock transfers endpoints
```

### 9.2 Module Pattern

```typescript
// Every module file follows this pattern:

export const purchaseApi = {
  getAll: (params?: PurchaseOrderQueryParams) =>
    client.get<ApiPaginatedResponse<PurchaseOrderDTO>>('/purchase-orders', params),

  getById: (id: number) =>
    client.get<ApiSuccessResponse<PurchaseOrderDTO>>(`/purchase-orders/order`, { id }),

  create: (data: CreatePurchaseOrderRequest) =>
    client.post<ApiSuccessResponse<{ id: number; reference_no: string; total_amount: number }>>(
      '/purchase-orders', data
    ),

  cancel: (data: CancelPurchaseOrderRequest) =>
    client.post<ApiSuccessResponse<{ message: string }>>('/purchase-orders/cancel', data),
};

// React Query hooks (in a separate hooks file or co-located)
export function usePurchaseOrders(params?: PurchaseOrderQueryParams) {
  return useQuery({
    queryKey: ['purchase-orders', 'list', params],
    queryFn: () => purchaseApi.getAll(params),
  });
}

export function usePurchaseOrder(id: number) {
  return useQuery({
    queryKey: ['purchase-orders', 'detail', id],
    queryFn: () => purchaseApi.getById(id),
    enabled: !!id,
  });
}

export function useCreatePurchaseOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: purchaseApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
    },
  });
}
```

### 9.3 React Query Key Convention

```typescript
// Query key hierarchy:
// ['module', 'action', ...identifiers]

const QueryKeys = {
  // Auth
  session: ['auth', 'session'],
  profile: ['auth', 'profile'],

  // Branches
  branches: {
    all: ['branches'],
    summary: ['branches', 'summary'],
    active: ['branches', 'active'],
  },

  // Sellers
  sellers: {
    list: (params?: SellerQueryParams) => ['sellers', 'list', params],
    detail: (id: number) => ['sellers', 'detail', id],
    search: (q: string) => ['sellers', 'search', q],
    history: (id: number) => ['sellers', 'history', id],
  },

  // Purchase Orders
  purchaseOrders: {
    list: (params?: PurchaseOrderQueryParams) => ['purchase-orders', 'list', params],
    detail: (id: number) => ['purchase-orders', 'detail', id],
  },

  // Sale Lots
  saleLots: {
    list: (params?: SaleLotQueryParams) => ['sale-lots', 'list', params],
    detail: (id: number) => ['sale-lots', 'detail', id],
  },

  // Inventory
  categories: {
    all: ['categories'],
    detail: (id: number) => ['categories', 'detail', id],
  },
  products: {
    list: (params?: ProductQueryParams) => ['products', 'list', params],
    detail: (id: number) => ['products', 'detail', id],
  },
  stockAlerts: ['inventory', 'stock-alerts'],

  // Catalog
  catalog: {
    list: (params?: CatalogQueryParams) => ['catalog', 'list', params],
    detail: (id: number) => ['catalog', 'detail', id],
    search: (q: string) => ['catalog', 'search', q],
    priceBoard: ['catalog', 'price-board'],
  },
  itemConditions: ['item-conditions'],

  // Reports
  dashboard: ['reports', 'dashboard'],
  salesChart: (params?: DateRangeParams) => ['reports', 'sales-chart', params],
  salesReport: (params?: DateRangeParams) => ['reports', 'sales', params],
  purchaseReport: (params?: DateRangeParams) => ['reports', 'purchases', params],

  // Settings
  store: ['settings', 'store'],
  system: ['settings', 'system'],
};
```

### 9.4 API Response Normalization

```typescript
// All PHP API responses follow { status, message, data } format
// The client.ts normalizes this into clean TypeScript types

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw BridgeApiError.fromHttpError(response.status, body);
  }

  const body = await response.json();

  // Check for PHP error response format
  if (body.status === 'error') {
    throw new BridgeApiError(400, 'BAD_REQUEST', body.message, body.errors);
  }

  return body as T;
}
```

### 9.5 Environment Configuration

```env
# .env.local (Next.js)
PHP_API_URL=https://legacy-api.solocorp.com/api
PHP_API_TIMEOUT=10000      # 10 seconds
PHP_API_RETRY_COUNT=3
NEXT_PUBLIC_PWA_ENABLED=true
```

```typescript
// config.ts
export const bridgeConfig = {
  phpApiUrl: process.env.PHP_API_URL || 'http://localhost/api',
  timeout: Number(process.env.PHP_API_TIMEOUT) || 10000,
  retryCount: Number(process.env.PHP_API_RETRY_COUNT) || 3,
  pwaEnabled: process.env.NEXT_PUBLIC_PWA_ENABLED === 'true',
};
```

---

## Appendix A: Migration Path (Phase 1 → Phase 2)

```
Phase 1 (ตอนนี้): 
  PWA → Bridge API Layer → PHP Backend (JWT)
  
Phase 2 (future):
  PWA → tRPC Router → New Next.js API → New Database
  (ทีละ endpoint ทยอยย้ายจาก Bridge ไป tRPC)
  
Strangler Fig Strategy:
  1. สร้าง Bridge Layer → ระบบทำงานเหมือนเดิม
  2. ย้าย Auth ไป Next.js ก่อน
  3. ย้าย Reports (read-only) ไป tRPC
  4. ย้าย Purchase Orders ไป tRPC
  5. ย้าย Sale Lots + FIFO logic ไป tRPC
  6. ปิด PHP Backend
```

---

*End of API Bridge Specification v1.0*
*ออกแบบสำหรับ Project Bangkok Phase 1 — Strangler Fig Bridge Strategy*
*Industrial Modern Design System — SoloCorp POS*
