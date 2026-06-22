# 🏢 Orch Kickoff — Sprint & Operational Workflow
## Bangkok POS Phase 1 — Mobile Web
### SoloCorp OS 2.0 (Track B — Strangler Fig)

---

## 📊 สถานะปัจจุบัน (Current State Assessment)

| Component | Status | Notes |
|-----------|--------|-------|
| **Repository** | ✅ `/home/drsolodev/solocorp-pos` | Monorepo pnpm/Turbo |
| **Branch** | ✅ `phase1/mobile-web` @ `6dc5e93` | 4 commits ahead of main |
| **Stack** | Next.js 14.2 + tRPC 10 + Prisma + PostgreSQL | |
| **Auth** | ✅ NextAuth v5 + Credentials | Prisma adapter |
| **Design System** | ✅ `@solocorp/ui` packages | Button, Input, utils |
| **Dev Server** | ✅ Running on port 3000 | Next.js dev mode |

### Existing Pages (5 หน้า — Built!)

| Route | Lines | Status | Description |
|-------|-------|--------|-------------|
| `/dashboard/` | 19L | ⚠️ Minimal | แค่ welcome text |
| `/dashboard/purchase-orders` | 1,117L | ✅ Full | PO management with CRUD |
| `/dashboard/sale-lots` | 1,430L | ✅ Full | Sale lot management |
| `/dashboard/catalog` | 414L | ✅ Full | Catalog + tier pricing |
| `/dashboard/inventory` | 622L | ✅ Full | Stock view + low stock |

### Data Layer Architecture

```
Browser
  │
  ├── ► tRPC Client (react-query)
  │      └── ► tRPC Server Router
  │             └── ► Prisma Client
  │                    └── ► PostgreSQL
  │
  └── ► Bridge API Client (HTTP)
         └── ► Next.js API Proxy (/api/bridge/[...path])
                └── ► PHP Backend (NOT RUNNING)
```

**ทิศทาง:** tRPC + Prisma PostgreSQL เป็น primary data source (Bridge API ไว้สำหรับ migration เท่านั้น)

### tRPC Routers (6 ตัว — พร้อมใช้งาน)

| Router | Procedures |
|--------|-----------|
| `auth` | login, logout, me, updateProfile, changePassword |
| `product` | getAll, getById, create, update, delete, search |
| `category` | getAll, getByParent, create, update, delete |
| `purchase` | getAll, getById, create, update, cancel |
| `sale` | getAll, getById, create, update, cancel, recordRevenue |
| `inventory` | getAll, getByProduct, getAlerts, adjust |

---

## 🚨 Critical Issues ที่ตรวจพบ

### Issue 1: Database — PostgreSQL NOT Running (🔴 BLOCKER)
```
ต้องการ: solocorp-db (PostgreSQL 16 on port 5432)
มีอยู่:   honcho-database-1 (PostgreSQL 15 on port 5432 — different project)
         NO PostgreSQL container for solocorp-pos!
```
**ต้อง:** `docker compose up postgres -d` จาก root project

### Issue 2: Bridge API — PHP Backend Not Running (🟡 Nice-to-have)
```
Bridge API Proxy → 502 (PHP_API_URL not set)
PHP container "scrap-pos-web" ≠ SoloCorp POS
```
**ต้อง:** ใช้ tRPC + Prisma แทน Bridge API (ซึ่งเป็น primary data layer อยู่แล้ว)

### Issue 3: Bottom Nav Routes Mismatch (🔴 BLOCKER)
```
Bottom Nav ใน DashboardShell:
  /  → ควรไป /dashboard
  /purchases  → ควรไป /dashboard/purchase-orders
  /inventory  → ควรไป /dashboard/inventory
  /reports  → ปัจจุบัน 404
  /more  → ปัจจุบัน 404
```

### Issue 4: Missing Routes (5 หน้า)

| ต้องเพิ่ม | Bridge API | tRPC | Prisma Model |
|-----------|-----------|------|-------------|
| `/dashboard/sellers` | ✅ sellers module | ❌ | ผ่าน PO (sellerName) |
| `/dashboard/branches` | ✅ branches module | ❌ | ✅ Branch |
| `/dashboard/stock-transfers` | ✅ stockTransfers | ❌ | ❌ (ใช้ Bridge API) |
| `/dashboard/expenses` | ✅ (in reports) | ❌ | ❌ |
| `/dashboard/reports` | ✅ reports module | ❌ | ❌ |

### Issue 5: Seed Data — ไม่มีข้อมูลใน DB
```
packages/db/src/seed.ts — มีอยู่แล้ว!
- 3 users (admin, manager, cashier)
- 1 branch (สำนักงานใหญ่)
- 4 categories (โลหะ, พลาสติก, กระดาษ, อิเล็กทรอนิกส์)
- 7 products
- 5 inventory lots
- 1 purchase order (PO-20260621-001)
- 1 sale order (SO-20260621-001)
```

---

## 🎯 Sprint Plan — Phase 1 Mobile Web (14 Days)

### Day 0: Environment Setup

| # | Task | Time | Owner |
|---|------|------|-------|
| **0.1** | `docker compose up postgres -d` — start PostgreSQL | 2 min | Orch |
| **0.2** | `pnpm install` — install deps | 2 min | Dev |
| **0.3** | `pnpm db:push` — push Prisma schema to DB | 1 min | Dev |
| **0.4** | `pnpm db:seed` — run seed script | 1 min | Dev |
| **0.5** | Verify `http://localhost:3000` → login works | 3 min | Orch |

**Goal:** Database ready + seed data loaded

### Sprint 1: Nav Fix + Dashboard + Missing CRUD (Days 1-4)
**🔴 Priority: สูงสุด — Blockers ต้องมาก่อน**

| # | Task | Est. | Owner | Notes |
|---|------|------|-------|-------|
| **1.1** | 🔴 Fix Bottom Nav → map paths correctly | 2 hr | Dev | DashboardShell.tsx |
| **1.2** | 🔴 Add missing nav items + overflow menu | 2 hr | Dev | 6 items → structured |
| **1.3** | Build Dashboard KPI with real tRPC data (today's purchases, sales, profit, low stock) | 4 hr | Dev | Use `inventory.getAlerts`, `purchase.getAll`, `sale.getAll` |
| **1.4** | 🆕 Sellers page — CRUD (simple: list sellers from purchase history) | 5 hr | Dev | Model-based on PO sellers |
| **1.5** | 🆕 Branches page — CRUD (list/create/edit) via tRPC | 3 hr | Dev | Branch model exists |
| **1.6** | Verify tRPC endpoints + DB connection | 2 hr | Orch/Dev | |

**Deliverable:** Nav ทำงานไม่ 404 + Dashboard KPI + Sellers + Branches

### Sprint 2: Core Business Flow — Purchase to Sale (Days 5-8)
**🔵 Priority: สูง — Business Flow หลัก**

| # | Task | Est. | Owner | Notes |
|---|------|------|-------|-------|
| **2.1** | Purchase Orders — refine UI: status indicator, cancel flow, search/filter | 4 hr | Dev | เพิ่ม filter, search |
| **2.2** | Sale Lots — refine UI: draft→confirmed→revenue recording | 6 hr | Dev | Add profit tracking |
| **2.3** | Catalog — refine UI: tier pricing, toggle active | 3 hr | Dev | |
| **2.4** | Inventory — refine: low-stock alerts, stock by category | 4 hr | Dev | |
| **2.5** | 🆕 Expenses page — CRUD (via settings/adjustment model) | 3 hr | Dev | Need new Prisma model or Bridge API |
| **2.6** | 🆕 Stock Transfer page — inter-branch transfer | 5 hr | Dev | Need new model or Bridge API |

**Deliverable:** รับซื้อ → inventory → ขาย lot → profit tracking → expense recording

### Sprint 3: Mobile UI Polish (Days 9-11)
**🟢 Priority: ปานกลาง — คุณภาพการใช้งาน**

| # | Task | Est. | Owner | Notes |
|---|------|------|-------|-------|
| **3.1** | Mobile responsive pass — 320px, 375px, 414px, 768px | 4 hr | Dev | All 8+ pages |
| **3.2** | Touch target audit — ≥ 44px | 2 hr | Dev | |
| **3.3** | Loading (skeleton) + Error (toast) + Empty states | 4 hr | Dev | |
| **3.4** | Bottom nav badge (low stock count) | 2 hr | Dev | |
| **3.5** | PWA manifest check | 1 hr | Dev | |

**Deliverable:** ทุกหน้าดูดี + touch friendly + loading/error/empty states

### Sprint 4: QA + CEO Review (Days 12-14)
**🟣 Priority: คุณภาพ**

| # | Task | Est. | Owner | Notes |
|---|------|------|-------|-------|
| **4.1** | TypeScript strict check + lint + build test | 2 hr | Dev | |
| **4.2** | E2E flow: Login → PO → Inventory → Sale Lot → Profit | 4 hr | QA | |
| **4.3** | Edge cases: cancel PO → stock revert, void sale, empty inventory | 3 hr | Dev | |
| **4.4** | Nav consistency audit | 1 hr | Orch | |
| **4.5** | CEO demo pack — screenshots + video + summary | 3 hr | Orch | |
| **4.6** | Retro + Phase 1 sign-off | 2 hr | Team | |

**Deliverable:** พร้อมส่ง CEO review + sign-off

---

## 🥇 Priority Order (ลำดับความสำคัญ)

```
P0 — 🔴 BLOCKER (Day 0-1)
  ├── Start PostgreSQL + push schema + seed data
  ├── Fix Bottom Nav routes (5 items → correct paths)
  └── Verify login works + tRPC endpoints respond

P1 — 🔵 CORE FLOW (Days 2-8)
  ├── Dashboard KPI with real data
  ├── PO Management (refine)
  ├── Sale Lots (refine + confirm/cancel flow)
  ├── Catalog + Inventory (refine)
  ├── Sellers + Branches pages
  └── Expenses + Stock Transfer

P2 — 🟢 MOBILE QUALITY (Days 9-11)
  ├── Responsive design pass
  ├── Touch targets
  ├── Loading/error/empty states
  └── Badge + PWA

P3 — 🟣 HANDOVER (Days 12-14)
  ├── TypeScript + lint
  ├── E2E testing
  ├── Edge cases
  └── CEO demo pack
```

---

## 🔄 Workflow Diagram — Business Flow: รับซื้อ → ขาย

```
═══ AUTH / ENTRY ════════════════════════════════════
         │
         ▼
  ┌─────────────────┐
  │ 0. Login         │
  │   admin@solocorp │
  │   / admin123     │
  └───────┬─────────┘
          │
          ▼
  ┌─────────────────────────────────────┐
  │ Dashboard  (tRPC: getAll + getAlerts)│
  │  ■ Today's Purchases: 12            │
  │  ■ Today's Sales:    ฿45,000       │
  │  ■ Est. Profit:      ฿8,200        │
  │  ■ Low Stock Alerts: 3 items        │
  │  ■ Active Branches:  2              │
  └───────┬─────────────────────────────┘
          │

═══ RECEIVING (รับซื้อ) ═══════════════════════════════
          │
          ▼
  ┌──────────────────┐     ┌─────────────────────────┐
  │ Sellers          │────▶│ Purchase Order (tRPC)   │
  │  ● รายชื่อผู้ขาย   │     │  1. Select seller       │
  │  ● ประวัติการขาย   │     │  2. Add items:          │
  │  ● หมายเหตุ/ติดต่อ  │     │     • เลือกสินค้า        │
  └──────────────────┘     │     • น้ำหนัก             │
                            │     • ราคา/กก.           │
                            │     • สภาพ (Good/Fair)   │
                            │  3. Payment method       │
                            │  4. Save → Status:       │
                            │     COMPLETED (auto)     │
                            └─────────┬───────────────┘
                                      │
                                      ▼
                            ┌──────────────────────┐
                            │ tRPC: purchase.cancel │
                            │ ถ้าต้องการยกเลิก       │
                            │ → stock revert        │
                            └──────────┬───────────┘
                                       │
                                       ▼
                              ┌─────────────────┐
                              │ Prisma: Lot     │
                              │ availableQty +  │
                              │ quantity +      │
                              └─────────────────┘

═══ INVENTORY ═══════════════════════════════════════
                  │
                  ▼
           ┌──────────────────┐
           │ Inventory (tRPC) │
           │  ● All stock     │
           │  ● By category   │
           │  ● Low stock     │
           │    (≤ minStock)  │
           │  ● Lot tracking  │
           │  ● Buy price     │
           │    (FIFO basis)  │
           └──────┬───────────┘
                  │
          ┌───────┴───────┐
          ▼               ▼
   ┌──────────┐    ┌──────────┐
   │ Adjust   │    │ Transfer │
   │ stock    │    │ (branch) │
   └──────────┘    └──────────┘

═══ SALE (ขาย Lot) ═════════════════════════════════
                  │
                  ▼
  ┌──────────────────────────┐
  │ Catalog / Price Tiers     │
  │  ● Configure items        │
  │  ● Tier pricing           │
  │  (Grade A/B/C)            │
  └───────────┬──────────────┘
              │
              ▼
  ┌──────────────────────────┐
  │ Sale Order (tRPC)        │
  │  1. Buyer info           │
  │  2. Select items         │
  │     (จาก inventory)      │
  │  3. Quantity + Price     │
  │  4. Cost = avg buy price │
  │  5. Est. profit (auto)   │
  │  6. Save → COMPLETED     │
  └───────────┬──────────────┘
              │
              ▼
  ┌─────────────────────┐
  │ Prisma Updates:     │
  │ ● Lot.availableQty  │
  │   -= sale quantity  │
  │ ● Inventory status  │
  └──────────┬──────────┘
             │
             ▼
  ┌─────────────────────┐
  │ Revenue Recording   │
  │ ● Actual revenue    │
  │ ● Expenses (ถ้ามี)   │
  │ ● Net profit calc   │
  │   = revenue - cost  │
  │     - expenses      │
  └─────────────────────┘

═══ CLOSING ════════════════════════════════════════
         │
         ▼
  ┌────────────────────┐
  │ Dashboard Updated   │
  │ Today's Summary:    │
  │  ● New POs: + stock │
  │  ● Sales: revenue   │
  │  ● Profit: net calc │
  │  ● Low stock alerts │
  └────────────────────┘
```

---

## 🛠️ Resource Needs — สิ่งที่ขาด / ต้องทำ

### 🔴 Critical (ต้องทำก่อน Sprint 1)

| # | Resource | Status | Action |
|---|----------|--------|--------|
| 1 | **PostgreSQL container** | ❌ ไม่มี | `docker compose up postgres -d` |
| 2 | **Prisma schema push** | ❌ ต้องทำ | `pnpm db:push` หรือ `pnpm db:migrate` |
| 3 | **Seed data** | ⚠️ script พร้อม | `pnpm db:seed` |
| 4 | **DATABASE_URL** | ⚠️ ใน .env.example | ต้องตั้งค่าให้ถูกต้อง |
| 5 | **@solocorp/auth build** | ❓ ต้องตรวจ | `pnpm build -F @solocorp/auth` |

### 🟡 Important (ก่อน Sprint 2)

| # | Resource | Status | Action |
|---|----------|--------|--------|
| 1 | **Expense model** | ❌ ไม่มีใน Prisma | เพิ่ม model หรือใช้ Settings |
| 2 | **Stock Transfer model** | ❌ ไม่มีใน Prisma | เพิ่ม model หรือใช้ Bridge API |
| 3 | **Low stock threshold** | ⚠️ มี `minStock` ใน Product | UI alert filter ต้องเพิ่ม |
| 4 | **Seller model** | ❌ ไม่มีแยก | ใช้ข้อมูลจาก PurchaseOrder.sellerName |

### 🟢 Nice to Have

| Resource | Notes |
|----------|-------|
| Photo upload | `imageUrl` ใน Product — รอ Phase 2 |
| Export CSV/Excel | สำหรับรายงาน |
| Print/PDF receipt | หน้าโกดัง |
| Push notifications | Low stock alert |
| Dark mode | ไม่จำเป็นสำหรับ Phase 1 |

---

## ✅ Quality Checklist — Verification Steps ก่อนส่ง CEO

### 🔴 MUST PASS (ถ้าไม่ผ่าน → ไม่ส่ง)

- [ ] **Login:** admin@solocorp.app / admin123 → ทำงาน
- [ ] **Bottom Nav:** ทุก item → route ถูกต้อง → ไม่ 404
- [ ] **Dashboard:** KPI แสดงข้อมูลจริงจาก tRPC
- [ ] **Purchase Orders:** list → create → confirm → stock update
- [ ] **Sale Orders:** list → create → confirm → profit display
- [ ] **Inventory:** แสดง stock ถูกต้อง, low stock alert
- [ ] **Mobile 375px:** layout ไม่แตก, touch targets ≥ 44px
- [ ] **No console errors:** 0 runtime errors

### 🟡 SHOULD PASS

- [ ] **Sellers CRUD:** list/create/edit
- [ ] **Branches CRUD:** list/create/edit
- [ ] **Catalog CRUD:** create/edit/activate, tier pricing
- [ ] **Expenses CRUD:** create/view
- [ ] **Stock Transfer:** draft → confirm
- [ ] **Empty states:** ทุกตารางแสดง "ไม่มีข้อมูล"
- [ ] **Loading states:** skeleton/spinner
- [ ] **Error states:** toast เมื่อ API fail

### 🟣 NICE TO HAVE

- [ ] PWA installable
- [ ] Low stock badge on nav
- [ ] Dark mode

---

## 📡 Communication Plan

### Daily Standup (ทุกเช้า — LINE/Discord)
```
📅 วันนี้ (Day X/14):
  • [Task] — 🟢 Done / 🟡 Doing / 🔴 Blocked

✅ เมื่อวาน:
  • [Task A] — completed

🚧 Blockers:
  • [issue] — ต้องการความช่วยเหลือ

📊 Progress: X/Y tasks (Z%)
```

### Weekly Status (ทุกวันศุกร์ — CEO ทาง Google Doc)
```
1. Sprint Progress — tasks done / total
2. Screenshots — feature ใหม่
3. Blockers + Risks
4. Next Week Plan
5. Resource Requests
```

### CEO Demo (Day 13-14)
```
1. ✅ Login → Dashboard
2. ✅ Bottom Nav → routes ตรง
3. ✅ Purchase Order → confirm
4. ✅ Inventory → stock updated
5. ✅ Sale Order → confirm → profit
6. ✅ Expenses → record
7. ✅ Mobile responsive
8. 📸 Screenshots (ทุกหน้า)
9. 🎥 Screen recording (core flow)
```

---

## 🚀 Day 1 Action Plan (Immediate Steps)

```bash
# Step 1: Start PostgreSQL
cd /home/drsolodev/solocorp-pos
docker compose up postgres -d

# Step 2: Push schema + seed
pnpm install
pnpm db:push       # หรือ pnpm db:migrate
pnpm db:seed

# Step 3: Verify
curl http://localhost:3000/api/auth/callback/credentials \
  -X POST -H "Content-Type: application/json" \
  -d '{"username":"admin@solocorp.app","password":"admin123"}' \
  -o /dev/null -w '%{http_code}'

# Step 4: Fix nav (DashboardShell.tsx)
# FROM: /, /purchases, /inventory, /reports, /more
# TO:   /dashboard, /dashboard/purchase-orders, /dashboard/inventory, 
#       /dashboard/sale-lots, /dashboard/catalog

# Step 5: Verify dev server
curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/dashboard
```

---

## 📋 Technical Architecture Overview

```
solocorp-pos (Monorepo)
├── apps/web                    # Next.js 14.2 App Router
│   ├── src/app/dashboard/      # ✅ 5 existing pages
│   ├── src/app/api/            # NextAuth + Bridge Proxy
│   ├── src/trpc/               # 6 routers
│   │   ├── router.ts          # Root router
│   │   ├── trpc.ts            # Context + middleware
│   │   └── routers/           # auth, product, purchase, sale, inventory, category
│   └── src/lib/               # Bridge API client (12 modules)
│
├── packages/db                # Prisma + PostgreSQL
│   ├── prisma/schema.prisma   # 14 models
│   ├── src/seed.ts            # Seed data script
│   └── generated/client/      # Prisma client (pre-generated)
│
├── packages/auth              # NextAuth v5 config
├── packages/ui                # Design system (Button, Input, etc.)
├── packages/validators        # Zod schemas
└── packages/config            # Shared config
```

### Prisma Models (14 models, 312 lines)

| Model | Table | Purpose |
|-------|-------|---------|
| User | users | Auth + user mgmt |
| Account | accounts | NextAuth OAuth |
| Session | sessions | NextAuth sessions |
| VerificationToken | verification_tokens | Email verification |
| Branch | branches | สาขา |
| Category | categories | หมวดหมู่สินค้า |
| Product | products | สินค้า |
| Lot | lots | Inventory lots (FIFO tracking) |
| PurchaseOrder | purchase_orders | ใบรับซื้อ |
| PurchaseItem | purchase_items | รายการรับซื้อ |
| SaleOrder | sale_orders | ใบขาย |
| SaleItem | sale_items | รายการขาย |
| InventoryAdjustment | inventory_adjustments | ปรับสต็อก |
| Setting | settings | ตั้งค่าระบบ |

---

## 📋 Deliverables Summary

| Sprint | Deliverable | Day |
|--------|-------------|-----|
| Setup | PostgreSQL running + Prisma schema pushed + seed data loaded | Day 0 |
| S1 | Nav routes fixed + Dashboard KPI + Sellers + Branches | Day 4 |
| S2 | PO → Inventory → Sale Lot flow complete + Expenses + Stock Transfer | Day 8 |
| S3 | Mobile responsive + Touch targets + Loading/Error/Empty states | Day 11 |
| S4 | E2E test pass + Edge cases fixed + CEO demo pack + Sign-off | Day 14 |

---

## ก่อนเริ่ม Sprint — Discovery Findings

### ✅ Found
- Real project at **`/home/drsolodev/solocorp-pos`** (NOT `projects/bangkok-pos` — นั่นคือ T3 scaffold test)
- Branch `phase1/mobile-web` has **5 pages built** (PO 1,117L, SaleLots 1,430L, Catalog 414L, Inventory 622L, Dashboard 19L)
- **tRPC + Prisma** is the real data layer (6 routers ready)
- **Seed script** exists at `packages/db/src/seed.ts` — 7 products, 5 lots, PO, sale order
- **Bridge API** is an additional HTTP layer for PHP migration — NOT required for Phase 1
- **@solocorp/ui** design system packaged and ready

### ⚠️ Issues Found
- **No PostgreSQL running** — must start via docker compose
- **Bridge API proxy returns 502** — PHP backend not configured (use tRPC instead)
- **Bottom Nav routes mismatch** — all 5 nav items map to wrong/404 paths
- **No Prisma migrations committed** — need `db:push` or initial migrate
- **No Seller/Branch/Expense/StockTransfer pages** — 4 missing CRUD pages
- **Dashboard is minimal** — needs real KPI data from tRPC

---

*Document Version: 3.0 (Final)*
*Author: Orch (พี่ทรงศักดิ์) — Head of Operations & Orchestration*
*Last Updated: 22 June 2026*

### ✅ Verification Log
- [x] Git log: `phase1/mobile-web` @ `6dc5e93`, 4 commits, clean tree
- [x] Page analysis: all 5 pages read and measured
- [x] DashboardShell nav audit: all 5 paths mapped vs actual routes
- [x] Bridge API client: 12 modules, base URL config, PHP proxy route
- [x] tRPC router audit: 6 routers with full procedure list
- [x] Prisma schema: 14 models, 312 lines, fully analyzed
- [x] Seed script verification: users, branches, categories, products, lots, orders
- [x] Docker containers: `solocorp-db` NOT running → blocker identified
- [x] Dev server: HTTP 200 on port 3000, login route returns 307 (redirect OK)
- [x] Bridge API proxy: returns 502 (PHP backend not running)
- [x] Existing `bangkok-pos-mysql`: MySQL only, NOT the solocorp DB
- [x] `honcho-database-1`: PostgreSQL 15 on 5432 but belongs to different project
