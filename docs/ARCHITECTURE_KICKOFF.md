# SoloCorp POS — Architecture Kickoff Report
## Phase 1 Mobile Web | Scrap Metal Workflow
**Date:** 2026-06-22 | **Author:** Arch (คุณวุฒิ) — Head of Architecture
**Branch:** `phase1/mobile-web` | **Deadline:** 30 มิ.ย. 2026

---

## สารบัญ
1. [Architecture Diagram — ระบบปัจจุบัน](#1-architecture-diagram--ระบบปัจจุบัน)
2. [Component Tree — ที่มีอยู่และส่วนที่ขาด](#2-component-tree--ที่มีอยู่และส่วนที่ขาด)
3. [Data Flow Diagram — Buy → Weigh → PO → Pay → Sell](#3-data-flow-diagram--buy--weigh--po--pay--sell)
4. [Route Structure Analysis + Nav Mismatch Fix](#4-route-structure-analysis--nav-mismatch-fix)
5. [Gap Analysis — สิ่งที่ต้องทำต่อใน Phase 1](#5-gap-analysis--สิ่งที่ต้องทำต่อใน-phase-1)
6. [ความเสี่ยงทางเทคนิค (Technical Risks)](#6-ความเสี่ยงทางเทคนิค-technical-risks)
7. [Appendix: Codebase Statistics](#7-appendix-codebase-statistics)

---

## 1. Architecture Diagram — ระบบปัจจุบัน

```
┌─────────────────────────────────────────────────────────────────────┐
│                          NEXT.JS 15 APP                            │
│                    (App Router — Mobile Web)                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌───────────────────┐   ┌────────────────────┐   ┌──────────────┐ │
│  │   PWA Shell        │   │  Auth (NextAuth v5) │   │  React Query │ │
│  │   Manifest.json    │   │  Credentials + CSRF │   │  Cache Layer │ │
│  │   Service Worker   │   │  Middleware Guard   │   │  stale 30s   │ │
│  └───────────────────┘   └────────────────────┘   └──────────────┘ │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │              DASHBOARD LAYOUT (DashboardLayout)               │  │
│  │  ┌─────────┐  ┌─────────────────────────────────────────┐    │  │
│  │  │ Header  │  │  SessionProvider ← TRPCProvider           │    │  │
│  │  │ (Shell) │  │  ┌─────────────────────────────────────┐ │    │  │
│  │  └─────────┘  │  │   PAGE CONTENT (children)           │ │    │  │
│  │               │  └─────────────────────────────────────┘ │    │  │
│  │  ┌──────────────────────────────────────────────────┐    │    │  │
│  │  │     BOTTOM NAV (5 items — mismatch!)             │    │    │  │
│  │  │   /  /purchases  /inventory  /reports  /more     │    │    │  │
│  │  └──────────────────────────────────────────────────┘    │    │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                 PRESENTATION LAYER (Pages)                    │  │
│  │                                                               │  │
│  │  /dashboard               → DashboardPage.tsx                 │  │
│  │  /dashboard/purchase-orders → PurchaseOrdersPage.tsx (1,117L)│  │
│  │  /dashboard/sale-lots       → SaleLotsPage.tsx (1,430L)      │  │
│  │  /dashboard/catalog         → CatalogPage.tsx (414L)         │  │
│  │  /dashboard/inventory       → InventoryPage.tsx (622L)       │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │              API BRIDGE LAYER (lib/api-bridge)                │  │
│  │                                                               │  │
│  │  ┌──────────┐ ┌──────────┐ ┌───────────┐ ┌────────────────┐ │  │
│  │  │Purchase  │ │SaleLots │ │Inventory  │ │Catalog+Sellers │ │  │
│  │  │Bridge    │ │Bridge   │ │Bridge     │ │Bridge          │ │  │
│  │  └────┬─────┘ └────┬────┘ └─────┬─────┘ └───────┬────────┘ │  │
│  │       └────────────┴────────────┴───────────────┘           │  │
│  │                         │                                    │  │
│  │              ┌──────────▼──────────┐                        │  │
│  │              │  ApiClient (client) │                        │  │
│  │              │  HTTP + CSRF Token  │                        │  │
│  │              └──────────┬──────────┘                        │  │
│  └─────────────────────────┼────────────────────────────────────┘  │
│                            │                                        │
│  ┌─────────────────────────▼────────────────────────────────────┐  │
│  │       BRIDGE API ROUTE HANDLER (app/api/bridge/[...path])     │  │
│  │         Forward requests to backend REST API                  │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │              tRPC LAYER (optional, partial use)               │  │
│  │  ┌──────────────┐  ┌─────────────┐  ┌────────────────────┐  │  │
│  │  │ PurchaseRouter│  │ SaleRouter  │  │ InventoryRouter    │  │  │
│  │  │ (via Prisma)  │  │ (via Prisma)│  │ (via Prisma)       │  │  │
│  │  └──────┬───────┘  └──────┬──────┘  └─────────┬──────────┘  │  │
│  │         └──────────────────┴──────────────────┘              │  │
│  │                         │                                    │  │
│  │              ┌──────────▼──────────┐                        │  │
│  │              │  Prisma (Postgres)  │                        │  │
│  │              └─────────────────────┘                        │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
                        │
                        ▼
        ┌────────────────────────────┐
        │   Database (PostgreSQL)    │
        │   via Prisma 6             │
        │                            │
        │   Tables:                  │
        │   ┌────────────────────┐   │
        │   │ purchase_orders     │   │
        │   │ purchase_order_items│   │
        │   │ sale_lots          │   │
        │   │ sale_lot_items     │   │
        │   │ catalog_items      │   │
        │   │ categories         │   │
        │   │ item_conditions    │   │
        │   │ sellers            │   │
        │   │ branches           │   │
        │   │ stock_transfers    │   │
        │   │ price_tiers        │   │
        │   │ users              │   │
        │   │ ...                │   │
        │   └────────────────────┘   │
        └────────────────────────────┘
```

### Key Architecture Decisions (ปัจจุบัน)

| Layer | Tech | Status |
|-------|------|--------|
| Framework | Next.js 15 App Router | ✅ ใช้งานอยู่ |
| Auth | NextAuth v5 (Credentials) | ✅ ใช้ได้ / ต้อง CSRF parse |
| ORM | Prisma 6 + PostgreSQL | ✅ ใช้งานอยู่ |
| API Layer | Bridge API (HTTP → Backend REST) | ✅ Primary path |
| RPC | tRPC 11 (partial) | ⚠️ มี router แต่ยังไม่เต็มที่ |
| State/Query | React Query (TanStack Query) | ✅ ใน DashboardShell |
| Styling | Tailwind 4 | ✅ ใช้งานอยู่ |
| PWA | Manifest + Service Worker | ✅ ตั้งค่าแล้ว |
| Mobile First | 320-768px responsive | ✅ Bottom Nav + Shell |

---

## 2. Component Tree — ที่มีอยู่และส่วนที่ขาด

### 2.1 Component Hierarchy ปัจจุบัน

```
app/
├── layout.tsx                              ← Root layout (metadata, fonts)
├── auth/login/page.tsx                     ← Login page (4,083 chars)
├── manifest.json/route.ts                  ← PWA manifest generator
├── api/bridge/[...path]/route.ts           ← Bridge API handler
│
└── dashboard/
    ├── layout.tsx                          ← DashboardLayout
    │   └── SessionProvider + TRPCProvider + DashboardShell
    │
    ├── page.tsx                            ← Dashboard Home
    │
    ├── purchase-orders/
    │   └── page.tsx (1,117L)               ← PurchaseOrdersPage
    │       ├── PurchaseOrdersSkeleton      ← Loading state
    │       ├── ErrorView                   ← Error state
    │       ├── EmptyState                  ← Empty state
    │       ├── PurchaseOrderCard (mobile)  ← Card view
    │       ├── PurchaseOrderTableRow (desktop) ← Table view
    │       ├── PurchaseOrderDetail         ← Slide panel detail
    │       └── CreatePOForm                ← Create form w/ multi-step
    │           ├── SellerPicker
    │           ├── CatalogPicker
    │           ├── ItemRowEditor
    │           └── PaymentSelector
    │
    ├── sale-lots/
    │   └── page.tsx (1,430L)               ← SaleLotsPage (MOST COMPLEX)
    │       ├── SaleLotsSkeleton
    │       ├── ErrorView
    │       ├── EmptyState
    │       ├── SummaryCards (Stats)
    │       ├── SaleLotCard (mobile)
    │       ├── SaleLotTableRow (desktop)
    │       ├── SaleLotDetail (slide panel)
    │       ├── StatusBadge
    │       └── ActionModal
    │           ├── ConfirmLot
    │           ├── CancelLot
    │           ├── RecordRevenue
    │           └── DeleteLot
    │
    ├── catalog/
    │   └── page.tsx (414L)                 ← CatalogPage
    │       ├── CatalogSkeleton
    │       ├── ErrorView
    │       ├── EmptyState
    │       ├── CatalogItemCard
    │       ├── PriceTierBadge
    │       └── PriceTiersView
    │
    └── inventory/
        └── page.tsx (622L)                 ← InventoryPage
            ├── InventorySkeleton
            ├── ErrorView
            ├── EmptyInventoryState
            ├── StatCard
            ├── StockLevelBar
            ├── ProductCard
            ├── StockAlertsSection
            └── CategoryFilter (Pills)
```

### 2.2 Components ที่มีอยู่แล้ว (Shared)

| Component | Location | สถานะ |
|-----------|----------|--------|
| `DashboardShell` | `lib/components/shell/DashboardShell.tsx` | ✅ ใช้ร่วมกัน |
| `ShellHeader` | inline ใน DashboardShell | ✅ |
| `BottomNav` | inline ใน DashboardShell | ✅ (แต่ Nav mismatch) |
| `ErrorView` | copy-paste ในทุกหน้า | ❌ ควรเป็น shared |
| `Skeleton` | copy-paste ในทุกหน้า | ❌ ควรเป็น shared |
| `StatusBadge` | copy-paste ใน PO + Sale | ❌ ควรเป็น shared |
| `Button` | ใช้ native `<button>` | ❌ ควรมี Design System |

### 2.3 Components ที่ขาด (Gap)

| Component | Priority | เหตุผล |
|-----------|----------|--------|
| `ScaleInput` — UI สำหรับรับน้ำหนักจากเครื่องชั่ง | **CRITICAL** | หัวใจของ Scrap Metal workflow |
| `WeightDeductionSelector` — ค่าหักน้ำหนัก (ภาชนะ, สิ่งปนเปื้อน) | **HIGH** | Standard practice ในร้านรับซื้อ |
| `PriceCalculator` — คำนวณราคาอัตโนมัติ (น้ำหนักสุทธิ × ราคาต่อหน่วย) | **CRITICAL** | ต้อง real-time |
| `SellerQuickCreate` — เพิ่มผู้ขายด่วนหน้ารับซื้อ | **HIGH** | UX สำคัญมาก |
| `PaymentScreen` — หน้าจ่ายเงิน (Cash/Bank Transfer) | **CRITICAL** | ขั้นตอน Pay |
| `ReceiptView` — ดู/พิมพ์/แชร์ใบเสร็จ PDF | **MEDIUM** | Legal requirement |
| `PhotoCapture` — ถ่ายรูปรายการรับซื้อ | **MEDIUM** | Evidence |
| `BranchSelector` — เลือกสาขา (มี stub แค่ UI) | **MEDIUM** | Multi-branch |
| `OfflineIndicator` — แสดงสถานะ offline | **LOW** | PWA enhancement |
| `PullToRefresh` — ดึงเพื่อโหลดใหม่ | **LOW** | Mobile UX |
| Shared `Button` / `Input` / `Modal` (Design System) | **HIGH** | Reduce duplication |
| `BarcodeScanner` — สแกนบาร์โค้ดสินค้า | **LOW** | Phase 2 |
| `FIFOCostCalculator` — คำนวณต้นทุนแบบ FIFO สำหรับขาย | **HIGH** | Sale Lots ต้องการ |

---

## 3. Data Flow Diagram — Buy → Weigh → PO → Pay → Sell

### 3.1 Scrap Metal Workflow — ภาพรวม

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│   BUY    │───→│  WEIGH   │───→│ CREATE   │───→│   PAY    │───→│   SELL   │
│ (รับซื้อ) │    │ (ชั่งน้ำ) │    │   PO     │    │ (จ่ายเงิน) │    │ (ขายต่อ) │
│          │    │   หนัก   │    │ (ใบรับซื้อ)│    │          │    │ Sale Lots│
└──────────┘    └──────────┘    └──────────┘    └──────────┘    └──────────┘
     │              │              │              │              │
     ▼              ▼              ▼              ▼              ▼
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│• เลือก   │    │• Gross   │    │• Select  │    │• Cash    │    │• Select  │
│  ผู้ขาย  │    │  Weight  │    │  Catalog │    │  (เงินสด) │    │  ชนิด    │
│• ระบุ    │    │• Tare    │    │  Item    │    │• Bank    │    │  โลหะ    │
│  ข้อมูล  │    │  (ภาชนะ) │    │• ระบบ     │    │  Transfer│    │• ระบบ     │
│  ผู้ขาย  │    │• Deduct  │    │  คำนวณ   │    │• เปลี่ยน  │    │  คำนวณ   │
│• ถ่ายรูป │    │  (สิ่ง   │    │  ราคา    │    │  ทอน    │    │  FIFO    │
│  ผู้ขาย  │    │   ปนเปื้อน)│    │ อัตโนมัติ │    │• บันทึก  │    │  Cost    │
│  + ของ   │    │• Net     │    │• เพิ่ม   │    │  จำ่าย   │    │• บันทึก  │
│          │    │  Weight  │    │  items   │    │          │    │  รายรับ  │
│          │    │  = Gross │    │  หลาย    │    │          │    │• ตัด     │
│          │    │    - Tare│    │  รายการ  │    │          │    │  สต็อก   │
│          │    │    - Ded │    │• Confirm │    │          │    │  FIFO    │
└──────────┘    └──────────┘    └──────────┘    └──────────┘    └──────────┘
```

### 3.2 Data Flow — ปัจจุบันและสิ่งที่ขาด

#### ✅ BUY (INPUT) — มีบางส่วน
**ปัจจุบัน:**
- `SellerPicker` ใน CreatePOForm ✅
- Seller CRUD ผ่าน Bridge API ✅
- Select catalog items ✅

**สิ่งที่ขาด:**
- ❌ Photo capture UI (มี field `photos` ใน schema)
- ❌ SellerQuickCreate (เพิ่มผู้ขายหน้ารับซื้อโดยไม่ต้องไปหน้า seller list)
- ❌ Seller phone autocomplete / QR scan / citizen ID scan

#### ❌ WEIGH (CRITICAL GAP) — ยังไม่มี
**สิ่งที่ต้องสร้างใน Phase 1:**
- `ScaleInput` component — รองรับ:
  - Manual input (keyboard)
  - Bluetooth scale integration (future)
  - Barcode weigh (future)
- `WeightDeductionSelector`:
  - Tare weight (น้ำหนักภาชนะ/รถเข็น)
  - Impurity deduction (เปอร์เซ็นต์สิ่งปนเปื้อน เช่น ดิน ทราย)
  - Auto-calculate net weight: `net = gross - tare - (gross × deduction_pct)`
- Real-time price calculation:
  - `PriceCalculator` = `net_weight × price_per_unit`
  - อัปเดตแบบ real-time ขณะพิมพ์

#### ✅ CREATE PO — มี แต่ต้องเพิ่ม Weight Logic
**ปัจจุบัน:**
- CreatePOForm ✅ (multi-item, seller selection, payment method)
- Submit ผ่าน Bridge API ✅
- ระบบคำนวณ total ✅ (quantity × price_per_unit)

**สิ่งที่ต้องปรับ:**
- ⚠️ ปรับ flow: แทนที่จะ manual quantity → ให้ WEIGH step ป้อน quantity อัตโนมัติ
- ⚠️ เพิ่ม `weight_deduction` field และ `effective_quantity` (มีใน schema แล้ว!)
- ⚠️ เพิ่ม `condition_id` mapping จาก catalog

#### ❌ PAY — มีเฉพาะ PaymentMethod selector
**ปัจจุบัน:**
- `payment_method` field ("cash" | "bank_transfer") ✅
- ใช้เฉพาะตอนสร้าง PO เท่านั้น

**สิ่งที่ต้องสร้าง:**
- `PaymentScreen` component:
  - แสดงยอดรวม
  - เลือกวิธีจ่าย (เงินสด/โอน)
  - ถ้าเงินสด: รับเงิน → คำนวณเงินทอน
  - ถ้าโอน: แสดงเลขบัญชี QR PromptPay
  - บันทึกการชำระ
  - ปริ้น/แชร์ใบเสร็จ

#### ✅ SELL (Sale Lots) — มีค่อนข้างสมบูรณ์
**ปัจจุบัน:**
- SaleLotsPage (1,430L) — หน้าซับซ้อนที่สุด ✅
  - List view + Detail slide panel
  - CRUD: Create / Confirm / Cancel / Record Revenue / Delete
  - FIFO cost calculation (มี `cost_total`, `profit` fields)
  - Status: draft → confirmed → (revenue_recorded) → cancelled
  - Business rules documented ✅

**สิ่งที่ต้องปรับ:**
- ⚠️ ต้องเชื่อมโยงกับ Inventory: เมื่อ Confirm ให้ตัดสต็อก FIFO
- ⚠️ เพิ่ม `ExpenseItemDTO` management (มี field แล้ว)
- ⚠️ Actual revenue recording

### 3.3 Database Relations (Scrap Metal Core)

```
sellers ────< purchase_orders ────< purchase_order_items >─── catalog_items
  │                                      │
  │                                      │ (consumed_qty → FIFO tracking)
  │                                      │
  │                        ┌─────────────┘
  │                        ▼
  │              stock_transfer_items
  │                        │
  │                        ▼
  │              stock_transfers (ข้ามสาขา)
  │
  └───────────< sale_lot_items >─── sale_lots
                                       │
                                  (FIFO cost:
                                   cost_total,
                                   profit)
```

### 3.4 Weight Deduction Data Model (Prisma Schema ปัจจุบัน)

```prisma
model PurchaseOrderItem {
  id                 Int      @id @default(autoincrement())
  // ...
  quantity           Decimal  @map("quantity")        // Gross weight
  weight_deduction   Decimal  @default(0)             // ค่าหัก (ภาชนะ+สิ่งปนเปื้อน)
  effective_quantity Decimal  @map("effective_qty")    // Net weight = quantity - weight_deduction
  // ...
  consumed_qty       Decimal  @default(0) @map("consumed_qty") // FIFO tracking

  @@map("purchase_order_items")
}
```

✅ Schema มี `weight_deduction` และ `effective_quantity` อยู่แล้ว — UI ยังไม่ใช้!

---

## 4. Route Structure Analysis + Nav Mismatch Fix

### 4.1 Route Structure ปัจจุบัน

```
/                           ← Root (redirect to /auth/login or /dashboard)
├── /auth/login             ← Login page
├── /api/bridge/[...path]   ← Bridge API proxy
├── /manifest.json          ← PWA manifest
├── /sw.js                  ← Service Worker
│
└── /dashboard              ← Protected (middleware)
    ├── /dashboard          ← Home
    ├── /dashboard/purchase-orders
    ├── /dashboard/sale-lots
    ├── /dashboard/catalog
    └── /dashboard/inventory
```

### 4.2 Bottom Nav Mismatch — ROOT CAUSE

**BottomNav items ใน DashboardShell.tsx (บรรทัด 64-96):**
```typescript
const bottomNavItems: NavItem[] = [
  { label: "หน้าแรก",   path: "/",           icon: <LayoutDashboard /> },
  { label: "รับซื้อ",    path: "/purchases",   icon: <ShoppingCart /> },
  { label: "คลัง",       path: "/inventory",   icon: <Package /> },
  { label: "รายงาน",     path: "/reports",     icon: <BarChart3 /> },
  { label: "เพิ่มเติม",   path: "/more",        icon: <MoreHorizontal /> },
];
```

**ปัญหาชัดเจน:**
| Nav Label | path ใน Nav | Route จริง | สถานะ |
|-----------|-------------|------------|--------|
| หน้าแรก | `/` | `/dashboard` | ⚠️ Mismatch (active state ผิด) |
| รับซื้อ | `/purchases` | `/dashboard/purchase-orders` | ❌ 404 |
| คลัง | `/inventory` | `/dashboard/inventory` | ❌ 404 |
| รายงาน | `/reports` | ไม่มี route | ❌ 404 |
| เพิ่มเติม | `/more` | ไม่มี route | ❌ 404 |

### 4.3 แผนแก้ไข Nav Mismatch

```typescript
// Nav Items ที่ถูกต้อง
const bottomNavItems: NavItem[] = [
  { label: "หน้าแรก",   path: "/dashboard",              icon: <LayoutDashboard /> },
  { label: "รับซื้อ",    path: "/dashboard/purchase-orders", icon: <ShoppingCart /> },
  { label: "คลัง",       path: "/dashboard/inventory",     icon: <Package /> },
  { label: "ขาย",        path: "/dashboard/sale-lots",     icon: <BarChart3 /> },
  { label: "แคตตาล็อก",  path: "/dashboard/catalog",       icon: <MoreHorizontal /> },
];
```

### 4.4 ข้อสังเกตเพิ่มเติมเกี่ยวกับ Routing

1. **DashboardLayout ซ้อน DashboardShell:** ใน `dashboard/layout.tsx` มี `DashboardShell` อีกครั้ง แต่ `DashboardShell` ก็มี `SessionProvider` + `QueryClientProvider` ของตัวเอง → **may cause nested providers** (แต่ React tolerates nested providers)
2. **Static Route — ยังไม่มี:** `/purchases/new`, `/sale-lots/new` — shortcut ใน manifest.json ชี้ไป `/purchases/new` และ `/sale-lots/new` ซึ่งยังไม่มี routes จริง → ❌
3. **Dynamic routes ยังไม่มี:** `/purchase-orders/[id]`, `/sale-lots/[id]` — ปัจจุบันใช้ modal/slide panel แทน ซึ่งใช้ได้ดีกับ mobile-first

---

## 5. Gap Analysis — สิ่งที่ต้องทำต่อใน Phase 1

### 5.1 Priority Matrix

| # | Task | Priority | Effort | Impact | Dependency |
|---|------|----------|--------|--------|------------|
| 1 | **Nav Mismatch Fix** | 🔴 Critical | 1 hr | High | — |
| 2 | **Weigh Screen** (ScaleInput + Deduction) | 🔴 Critical | 2-3 days | High | — |
| 3 | **Calculate Price Flow** (real-time) | 🔴 Critical | 1 day | High | #2 |
| 4 | **Payment Screen** | 🟠 High | 2 days | High | #3 |
| 5 | **Receipt/ใบเสร็จ** | 🟠 High | 2 days | Medium | #4 |
| 6 | **FIFO Cost Engine** (เชื่อม PO→Sale) | 🟠 High | 2-3 days | High | DB Schema |
| 7 | **PWA: Offline Support** | 🟡 Medium | 3-5 days | Medium | Service Worker |
| 8 | **Photo Capture** | 🟡 Medium | 1-2 days | Medium | Camera API |
| 9 | **Shared Components** (Design System) | 🟡 Medium | 2-3 days | Medium | — |
| 10 | **Reports Dashboard** | 🟢 Low | 2-3 days | Low | All above |
| 11 | **Barcode Scanner** | 🟢 Low | 1-2 days | Low | Phase 2 |

### 5.2 Detailed Gap — Scrap Metal Workflow

#### ขั้นตอนที่ 1: BUY (INPUT) — ✅ มีพื้นฐาน
**Gap:** ผู้ขายอาจเป็นรายใหม่ที่หน้าร้าน ต้องเพิ่มด่วน
**Solution:** `SellerQuickCreate` bottom sheet → phone + name → auto-create

#### ขั้นตอนที่ 2: WEIGH — ❌ ยังไม่มี
**Gap:** ไม่มี Screen สำหรับรับน้ำหนัก
**Solution:** สร้าง Flow ใหม่:
1. เลือกผู้ขาย
2. เลือก Catalog Item (ชนิดโลหะ)
3. เลือก Condition (สภาพ)
4. **ชั่งน้ำหนักรวม (Gross Weight)**
5. **เลือกค่าหัก:**
   - Tare weight (น้ำหนักภาชนะ/เข่ง/รถเข็น) — manual input
   - Impurity deduction (%) — เปอร์เซ็นต์สิ่งปนเปื้อน
6. **ระบบคำนวณ Net Weight + ราคาอัตโนมัติ**
7. เพิ่มเข้า PO (สามารถเพิ่มหลาย item)
8. กดยืนยัน PO

#### ขั้นตอนที่ 3: PO CREATION — ✅ มี แต่ต้องปรับ
**Gap:** CreatePOForm ปัจจุบันใช้ manual quantity แทนที่จะรับจาก weigh step
**Fix:** ปรับให้ `quantity`, `weight_deduction`, `effective_quantity` ถูกส่งจาก Weigh Screen

#### ขั้นตอนที่ 4: PAY — ❌ ยังไม่สมบูรณ์
**Gap:** ไม่มีหน้าจ่ายเงิน
**Solution:** 
- หลังสร้าง PO → ไปที่ Payment screen
- เลือก Cash → input รับเงิน → คำนวณเงินทอน
- เลือก Bank Transfer → show QR PromptPay / copy account
- Print/send receipt

#### ขั้นตอนที่ 5: SELL (SALE LOTS) — ✅ มีค่อนข้างสมบูรณ์
**Gap:** 
1. ยังไม่เชื่อม FIFO cost กับ PO items Automatically
2. Actual revenue recording ยัง manual
3. Expense management ยัง manual

#### ขั้นตอน Offline (Future Phase)
- ใบรับซื้อต้อง offline-first (PWA)
- Sync เมื่อมีเน็ต
- ใช้ IndexedDB + Background Sync

### 5.3 Missing Routes ที่ควรมีใน Phase 1

| Route | Purpose | Priority |
|-------|---------|----------|
| `/dashboard/purchase-orders/new` | Weigh → PO creation flow | 🔴 |
| `/dashboard/purchase-orders/[id]` | Detail view (replace slide panel) | 🟡 |
| `/dashboard/purchase-orders/[id]/pay` | Payment screen | 🔴 |
| `/dashboard/sale-lots/new` | New Sale Lot creation | 🟡 |
| `/dashboard/sale-lots/[id]` | Detail view (replace slide panel) | 🟡 |
| `/dashboard/reports` | Reports dashboard | 🟢 |

---

## 6. ความเสี่ยงทางเทคนิค (Technical Risks)

### 🔴 RISK-1: Bridge API Dependency
**ปัญหา:** ระบบทั้งหมดพึ่งพา Bridge API → Backend REST (API-Bridge route handler) ถ้า Backend ไม่พร้อม deployment จะติดหมด
**ผลกระทบ:** ไม่สามารถ deploy Phase 1 ได้ถ้า backend ไม่พร้อม
** mitigation:** 
- สำรองด้วย tRPC direct-to-Prisma (มี router อยู่แล้ว)
- Mock API สำหรับพัฒนา Frontend ก่อน

### 🔴 RISK-2: tRPC + Bridge API Dual Layer
**ปัญหา:** มี 2 layers (tRPC router + Bridge API) ที่ทำหน้าที่คล้ายกัน
- tRPC routers: `purchase.ts`, `sale.ts`, `inventory.ts` — ใช้ Prisma โดยตรง
- Bridge API: ส่ง HTTP request ไป backend
**ผลกระทบ:** ซับซ้อน, double maintenance
**mitigation:** ตัดสินใจให้ชัดเจน: **ใช้ Bridge API เป็น primary** (สอดคล้องกับ `api-bridge` design), tRPC สำหรับ utility queries หรือ fallback

### 🟠 RISK-3: Weight Deduction Field — มีแต่ไม่ใช้
**ปัญหา:** Schema มี `weight_deduction` และ `effective_quantity` แต่ UI ไม่มีทางกรอก
**ผลกระทบ:** PO items จะมี `quantity = effective_quantity` เสมอ → สูญเสียความแม่นยำทางธุรกิจ
** mitigation:** เพิ่ม Weigh Screen ก่อน create PO

### 🟠 RISK-4: FIFO Cost Calculation
**ปัญหา:** การตัดสต็อก FIFO ต้อง track ว่า PO item ไหนถูก consume โดย Sale Lot item ไหน
- Schema มี `consumed_qty` ใน `purchase_order_items`
- แต่ใน `SaleLotItemDTO` ไม่มี reference กลับไปยัง PO items
**ผลกระทบ:** Cost calculation ใน Sale Lots อาจไม่ถูกต้อง
** mitigation:** เพิ่ม `purchase_order_item_id` reference ใน SaleLotItem หรือใช้ batch allocation table

### 🟠 RISK-5: PWA Offline Support
**ปัญหา:** Service Worker registry แล้ว (มี `/sw.js` route) แต่ยังไม่มี offline caching strategy
- `serviceWorker.ts` (9,473 chars) — ต้อง audit ว่า implement offline หรือยัง
**ผลกระทบ:** PWA ไม่ทำงาน offline ซึ่งสำคัญมากสำหรับร้านรับซื้อที่เน็ตไม่เสถียร
** mitigation:** 
- Audit `serviceWorker.ts` content
- ใช้ Workbox หรือ custom cache-first strategy สำหรับ API calls
- Queue pending PO creations → sync เมื่อ reconnect

### 🟡 RISK-6: Auth Token Parsing
**ปัญหา:** Login OK แต่ต้อง CSRF token parsing (token part ก่อน `|`)
**ผลกระทบ:** Auth failure เมื่อ token format เปลี่ยน
** mitigation:** 
- Standardize token format ใน `middleware.ts` และ `AuthProvider`
- เพิ่ม test สำหรับ auth flow

### 🟡 RISK-7: Large Single-File Pages
**ปัญหา:** Butละหน้าอยู่ในไฟล์เดียวขนาดใหญ่:
- `purchase-orders/page.tsx`: 1,117L (41,700 chars)
- `sale-lots/page.tsx`: 1,430L (56,029 chars)
**ผลกระทบ:** Maintainability ต่ำ, merge conflicts สูง
** mitigation:** 
- Refactor เป็น components แยก (หลัง Phase 1)
- ใช้ `app-router` segments สำหรับ child routes

### 🟡 RISK-8: Branch Hardcoded
**ปัญหา:** `branch_id = 1` hardcoded ใน `CreatePOForm` (บรรทัด 557)
**ผลกระทบ:** ไม่รองรับ multi-branch
** mitigation:** เพิ่ม BranchSelector component ที่ใช้ branch จาก session/context

### 🟢 RISK-9: Deadline
**ปัญหา:** Deadline 30 มิ.ย. 2026 = 8 วันนับจากวันนี้ (22 มิ.ย.)
**ผลกระทบ:** Feature scope อาจต้องลด
** mitigation:** 
- Phase 1.1 (30 มิ.ย.): Nav Fix + Weigh + Pay (MVP)
- Phase 1.2 (15 ก.ค.): Offline + Reports + Photo

---

## 7. Appendix: Codebase Statistics

### 7.1 File Sizes (Critical Paths)

| File | Lines | Size | Complexity |
|------|-------|------|------------|
| `app/dashboard/sale-lots/page.tsx` | 1,430L | 56 KB | **🔴 High** |
| `app/dashboard/purchase-orders/page.tsx` | 1,117L | 42 KB | **🔴 High** |
| `lib/api-bridge/types.ts` | 950L | 26 KB | 🔵 Types |
| `lib/api-bridge/client.ts` | 300L | 11 KB | 🟡 Medium |
| `lib/pwa/serviceWorker.ts` | 250L | 9.5 KB | 🟡 Medium |
| `app/dashboard/inventory/page.tsx` | 622L | 22 KB | 🟡 Medium |
| `app/dashboard/catalog/page.tsx` | 414L | 15 KB | 🟢 Low |
| `lib/components/shell/DashboardShell.tsx` | 228L | 7.4 KB | 🟡 Medium |
| `packages/db/prisma/schema.prisma` | 312L | 10 KB | 🔵 Schema |

### 7.2 Prisma Models (Scrap Metal Core)

| Model | Fields | Relations | Status |
|-------|--------|-----------|--------|
| `purchase_orders` | 18 | sellers, branch, user, items | ✅ |
| `purchase_order_items` | 15 | purchase_order, catalog_item, condition | ✅ (มี weight_deduction) |
| `sale_lots` | 20 | branch, user, items | ✅ |
| `sale_lot_items` | 11 | sale_lot, catalog_item | ✅ |
| `catalog_items` | 12 | category, tier_prices, conditions | ✅ |
| `item_conditions` | 4 | catalog_items | ✅ |
| `categories` | 5 | catalog_items | ✅ |
| `sellers` | 14 | purchase_orders | ✅ |
| `stock_transfers` | 14 | from/to branch | ✅ |
| `price_tiers` | 5 | catalog_item | ✅ |
| `branches` | 10 | users, pos_devices | ✅ |

### 7.3 API Bridge Modules

| Module | Methods | Status |
|--------|---------|--------|
| `purchase.ts` | list / getById / create / cancel | ✅ |
| `sale-lots.ts` | list / getById / create / update / cancel / recordRevenue / delete | ✅ |
| `inventory.ts` | getProducts / getCategories / getLowStock / getStockAlerts | ✅ |
| `catalog.ts` | getAllItems / createItem / search / getPriceTiers / getItemConditions | ✅ |
| `sellers.ts` | getAll / search / getById / create / update / blacklist / getHistory | ✅ |

---

## สรุป (Executive Summary)

### สถานะปัจจุบัน
- ✅ **Architecture หลักพร้อมแล้ว:** Next.js 15 + Prisma 6 + Bridge API + PWA Shell
- ✅ **4 หน้าหลักทำงานได้:** Dashboard, PO (1,117L), Sale Lots (1,430L), Catalog (414L), Inventory (622L)
- ✅ **PWA ตั้งค่า:** Manifest.json + Service Worker
- ✅ **Auth:** NextAuth v5 Credentials + Middleware guard
- ✅ **Database Schema รองรับ Scrap Metal:** มี `weight_deduction`, `effective_quantity`, `consumed_qty`

### สิ่งที่ต้องทำทันที (Next 8 วัน → Deadline 30 มิ.ย.)

**Week 1 — Critical Path (22-26 มิ.ย.):**
1. 🔴 **Nav Mismatch Fix** — `/purchases` → `/dashboard/purchase-orders` (1 hr)
2. 🔴 **Weigh Screen** — ScaleInput + WeightDeduction + PriceCalculator (2-3 วัน)
3. 🔴 **Payment Screen** — Cash/BankTransfer + Change Calculation (1-2 วัน)

**Week 2 — High Priority (27-30 มิ.ย.):**
4. 🟠 **Receipt/Print** (2 วัน)
5. 🟠 **FIFO Cost Connect — PO → Sale Lots** (1-2 วัน)
6. 🟠 **Shared Components Refactor** (1 วัน)

### ความเสี่ยงหลัก
1. **Bridge API dependency** — Backend ต้องพร้อม
2. **Deadline 8 วัน** — ต้อง prioritise hard
3. **FIFO cost tracking** — Schema พร้อมแต่ business logic ยังขาด

---

*End of Architecture Kickoff Report — Phase 1 Mobile Web | Scrap Metal Workflow*
