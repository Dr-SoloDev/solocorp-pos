# SoloCorp POS — Clean Room Specification (Project Bangkok)

**จัดทำโดย:** Reverse Engineering Agent  
**วันที่:** 19 มิถุนายน 2569  
**วัตถุประสงค์:** Reverse engineer business logic จากระบบผลิตจริง (4 สาขา) → เขียน spec โดยไม่ reference source code  
**วิธีใช้:** Implementer อ่านแล้วสร้างระบบใหม่จากศูนย์ได้ โดยไม่แตะ code เก่า

---

## สารบัญ

1. [Data Model Spec](#1-data-model-spec)
2. [API Spec](#2-api-spec)
3. [Business Rules](#3-business-rules)
4. [Auth & Authorization Spec](#4-auth--authorization-spec)
5. [Report Spec](#5-report-spec)
6. [Printer Spec](#6-printer-spec)
7. [Unknowns & Open Questions](#7-unknowns--open-questions)

---

## 1. Data Model Spec

### 1.1 Entity Relationship Overview

ระบบ SoloCorp POS ประกอบด้วย entities หลักดังนี้ (เรียงตามลำดับ business flow):

```
Branch ──┬── User
          ├── PurchaseOrder ──┬── PurchaseOrderItem ──┬── CatalogItem
          │                   │                        │
          │                   └── Seller               │
          │                                            │
          ├── SaleLot ────────┬── SaleLotItem ─────────┘
          │                   │
          │                   ├── ActualRevenue (1-to-1)
          │                   └── Expenses (JSON)
          │
          ├── StockTransfer ──┬── Source Branch
          │                   └── Destination Branch
          │
          ├── BusinessExpense
          │
          ├── Product ────────┬── Category
          │                   └── InventoryTransaction
          │
          ├── Sale ───────────┬── SaleItem
          │                   ├── Customer
          │                   └── User
          │
          ├── Category ───────┬── ItemCondition
          │                    └── PurchaseItemCatalog
          │
          └── Photo (attached to PurchaseOrder)
```

### 1.2 Entity Definitions

#### 1.2.1 Branch (สาขา)

| Field | Type | Description |
|-------|------|-------------|
| id | INT PK AUTO_INCREMENT | รหัสสาขา |
| name | VARCHAR(100) | ชื่อสาขา (เช่น "หลัก", "ลพบุรี", "เชียงใหม่", "ภูเก็ต") |
| code | VARCHAR(20) UNIQUE | รหัสย่อสาขา |
| address | TEXT | ที่อยู่สาขา |
| phone | VARCHAR(20) | เบอร์โทรสาขา |
| status | ENUM('active','inactive') | สถานะการใช้งาน |
| cost_method | ENUM('fifo','weighted') | วิธีคำนวณต้นทุนของสาขา (default: fifo) |
| created_at | DATETIME | |
| updated_at | DATETIME | |

**Constraints:**
- 1 สาขามี users, purchase orders, sale lots, stock, expenses ของตนเอง
- cost_method กำหนดวิธีคิดต้นทุนขาย (FIFO หรือ Weighted Average)
- ห้ามลบสาขาที่มี transactions

#### 1.2.2 User (ผู้ใช้ระบบ)

| Field | Type | Description |
|-------|------|-------------|
| id | INT PK AUTO_INCREMENT | |
| username | VARCHAR(50) UNIQUE | ชื่อผู้ใช้ |
| password | VARCHAR(255) | bcrypt hash |
| email | VARCHAR(100) | |
| full_name | VARCHAR(100) | ชื่อ-นามสกุล |
| role | ENUM('admin','manager','cashier') | สิทธิ์การใช้งาน |
| branch_id | INT FK → Branch | สาขาที่สังกัด (nullable สำหรับ admin) |
| status | ENUM('active','inactive') | |
| last_login | DATETIME | |
| created_at | DATETIME | |
| updated_at | DATETIME | |

**Business Rules:**
- password ต้องมีความยาว >= 12 ตัวอักษร
- admin เท่านั้นที่สร้าง/แก้ไข/ลบ user ได้
- user ไม่สามารถแก้ไข role/status ของตัวเองได้
- username เปลี่ยนไม่ได้หลังจากสร้าง
- cashier ถูกจำกัดอยู่ที่สาขาของตัวเอง (branch_id)

#### 1.2.3 Seller (ผู้ขาย)

| Field | Type | Description |
|-------|------|-------------|
| id | INT PK AUTO_INCREMENT | |
| full_name | VARCHAR(100) | ชื่อ-นามสกุล |
| phone | VARCHAR(20) | เบอร์โทรศัพท์ |
| id_card_number | VARCHAR(20) | เลขบัตรประชาชน |
| address | TEXT | ที่อยู่ |
| vehicle_plate | VARCHAR(20) | ทะเบียนรถ (สำหรับผู้ขายที่มาขายเป็นประจำ) |
| is_blacklisted | BOOLEAN DEFAULT FALSE | สถานะแบล็คลิสต์ |
| blacklist_reason | TEXT | เหตุผลที่แบล็คลิสต์ |
| blacklisted_at | DATETIME | วันที่ถูกแบล็คลิสต์ |
| blacklisted_by | INT FK → User | ผู้ที่ทำการแบล็คลิสต์ |
| total_purchases | INT | จำนวนครั้งที่มาขาย |
| last_purchase_at | DATETIME | วันที่มาขายล่าสุด |
| status | ENUM('active','inactive') | |
| created_at | DATETIME | |
| updated_at | DATETIME | |

**Business Rules:**
- ค้นหาผู้ขายจากชื่อ, เบอร์โทร, หรือเลขบัตรประชาชน
- ถ้าผู้ขายถูก blacklist → ต้องแจ้งเตือนตอนสร้าง purchase order
- สะสมยอดซื้อรวมและประวัติการขาย
- blacklist ต้องมีเหตุผลและระบุผู้กระทำ

#### 1.2.4 Category (หมวดหมู่สินค้า)

| Field | Type | Description |
|-------|------|-------------|
| id | INT PK AUTO_INCREMENT | |
| name | VARCHAR(100) UNIQUE | ชื่อหมวดหมู่ (unique ทั่วระบบ) |
| description | TEXT | |
| default_unit | VARCHAR(20) DEFAULT 'กก.' | หน่วยเริ่มต้น (กก., ลัง, ชิ้น, ฯลฯ) |
| stock_kg | DECIMAL(12,2) DEFAULT 0 | น้ำหนักคงเหลือรวมทุก lot |
| alert_threshold | DECIMAL(12,2) NULLABLE | ค่าเตือนเมื่อ stock ≤ threshold |
| status | ENUM('active','inactive') | |
| created_at | DATETIME | |

**Business Rules:**
- หมวดหมู่เป็น global (ไม่ผูกกับสาขา) — merge duplicates จากชื่อ
- alert_threshold = NULL หมายถึงไม่ต้องแจ้งเตือน
- ห้ามลบหมวดหมู่ที่มีรายการสินค้า

#### 1.2.5 ItemCondition (สภาพของ)

| Field | Type | Description |
|-------|------|-------------|
| id | INT PK AUTO_INCREMENT | |
| name | VARCHAR(50) | ชื่อสภาพ (เช่น "ดี", "พอใช้", "ชำรุด") |
| weight_deduction | DECIMAL(5,2) | % หักน้ำหนัก (เช่น ดี=0%, พอใช้=10%, ชำรุด=20%) |
| sort_order | INT | ลำดับเรียง |
| color_code | VARCHAR(7) | รหัสสี (เช่น #00FF00, #FFAA00, #FF0000) |
| status | ENUM('active','inactive') | |
| created_at | DATETIME | |

**Business Rules:**
- weight_deduction เป็นเปอร์เซ็นต์ที่หักจากน้ำหนักจริงก่อนคิดเงิน
- เช่น สภาพพอใช้ หัก 10% → ถ้าชั่งได้ 100 กก. คิดเงินที่ 90 กก.
- sort_order ใช้เรียงลำดับใน dropdown

#### 1.2.6 PurchaseItemCatalog (รายการรับซื่อ — Catalog)

| Field | Type | Description |
|-------|------|-------------|
| id | INT PK AUTO_INCREMENT | |
| code | VARCHAR(50) | รหัสสินค้า |
| name | VARCHAR(200) | ชื่อรายการ |
| category_id | INT FK → Category | หมวดหมู่ |
| default_unit | VARCHAR(20) | หน่วยเริ่มต้น |
| default_price | DECIMAL(12,2) | ราคาเริ่มต้น |
| tier_prices | JSON | ราคาแบบ tier (array of {label, price}) |
| is_active | BOOLEAN DEFAULT TRUE | |
| created_at | DATETIME | |
| updated_at | DATETIME | |

**Business Rules:**
- JSON tier_prices เช่น `[{"label": "บิล 1", "price": 8}, {"label": "บิล 2", "price": 7}, {"label": "บิล 3", "price": 6}]`
- ความหมาย tier: บิล 1 = ราคาดีสุด (ลูกค้าประจำ), บิล 2 = ราคากลาง, บิล 3 = ราคาถูกสุด
- catalog ใช้สำหรับ autocomplete + กำหนดราคาเริ่มต้นตอนรับซื้อ
- price-board endpoint ส่งเฉพาะรายการที่มี tier_prices

#### 1.2.7 PurchaseOrder (ใบรับซื้อ)

| Field | Type | Description |
|-------|------|-------------|
| id | INT PK AUTO_INCREMENT | |
| reference_no | VARCHAR(50) UNIQUE | เลขที่ใบรับซื้อ (รูปแบบ PO-YYYYMMDD-XXX) |
| branch_id | INT FK → Branch | สาขาที่รับซื้อ |
| seller_id | INT FK → Seller | ผู้ขาย |
| user_id | INT FK → User | พนักงาน |
| payment_method | VARCHAR(20) | วิธีชำระ (cash, bank_transfer) |
| total_amount | DECIMAL(12,2) | ยอดรวม |
| notes | TEXT | หมายเหตุ |
| status | ENUM('active','cancelled') | สถานะ |
| cancelled_at | DATETIME NULLABLE | |
| cancelled_by | INT FK → User NULLABLE | |
| created_at | DATETIME | |
| updated_at | DATETIME | |

#### 1.2.8 PurchaseOrderItem (รายการในใบรับซื้อ)

| Field | Type | Description |
|-------|------|-------------|
| id | INT PK AUTO_INCREMENT | |
| purchase_order_id | INT FK → PurchaseOrder | |
| catalog_item_id | INT FK → PurchaseItemCatalog | เชื่อมกับ catalog |
| name | VARCHAR(200) | ชื่อรายการ (denormalized) |
| category_id | INT FK → Category | หมวดหมู่ |
| condition_id | INT FK → ItemCondition | สภาพ |
| quantity | DECIMAL(12,2) | น้ำหนัก/จำนวน |
| unit | VARCHAR(20) | หน่วย |
| price_per_unit | DECIMAL(12,2) | ราคาต่อหน่วย |
| tier_label | VARCHAR(50) | ระดับราคาที่ใช้ (เช่น "บิล 1") |
| total | DECIMAL(12,2) | ราคารวม = quantity × price_per_unit |
| consumed_qty | DECIMAL(12,2) DEFAULT 0 | จำนวนที่ถูกขายไปแล้ว (FIFO tracking) |
| created_at | DATETIME | |

**Business Rules:**
- consumed_qty ใช้สำหรับ FIFO cost tracking — จำนวนที่ cut จาก PO item นี้ไปแล้ว
- เมื่อ sale lot item ขายของจาก lot นี้ → consumed_qty += จำนวนที่ขาย
- PO item ที่ consumed_qty < quantity หมายถึงยังมี stock เหลืออยู่

#### 1.2.9 SaleLot (การขายแบบ Lot)

| Field | Type | Description |
|-------|------|-------------|
| id | INT PK AUTO_INCREMENT | |
| reference_no | VARCHAR(50) UNIQUE | เลขที่อ้างอิง (รูปแบบ LOT-YYYYMMDD-XXX) |
| branch_id | INT FK → Branch | สาขาที่ขาย |
| buyer_name | VARCHAR(200) | ชื่อผู้ซื้อ |
| buyer_phone | VARCHAR(20) | เบอร์ผู้ซื้อ |
| user_id | INT FK → User | พนักงานผู้บันทึก |
| total_amount | DECIMAL(12,2) | ยอดรวม |
| actual_revenue | DECIMAL(12,2) NULLABLE | รายรับจริง (Bangkok specific: หลังหักค่าใช้จ่าย) |
| expenses | JSON NULLABLE | ค่าใช้จ่ายเพิ่มเติม (array of {description, amount}) |
| notes | TEXT | หมายเหตุ |
| status | ENUM('draft','confirmed','cancelled') | สถานะ |
| confirmed_at | DATETIME NULLABLE | |
| confirmed_by | INT FK → User NULLABLE | |
| cancelled_at | DATETIME NULLABLE | |
| cancelled_by | INT FK → User NULLABLE | |
| created_at | DATETIME | |
| updated_at | DATETIME | |

**SaleLot Lifecycle:**
```
DRAFT ──→ CONFIRMED ──→ (record revenue)
  │           │
  └────→ CANCELLED    └────→ (actual_revenue บันทึกภายหลัง)
```

**Business Rules:**
- DRAFT = ยังไม่ตัด stock (สามารถแก้ไข/ลบได้)
- CONFIRMED = ตัด stock แล้ว (FIFO consumed_qty ถูก update)
- CANCELLED = คืน stock (consumed_qty ถูกลด)
- actual_revenue สามารถบันทึกทีหลัง (อาจต่างจาก total_amount เนื่องจากมีค่าใช้จ่ายแฝง)
- expenses เป็น JSON array บันทึกค่าใช้จ่ายเพิ่มเติมของการขาย lot นั้น

#### 1.2.10 SaleLotItem (รายการใน Sale Lot)

| Field | Type | Description |
|-------|------|-------------|
| id | INT PK AUTO_INCREMENT | |
| sale_lot_id | INT FK → SaleLot | |
| catalog_item_id | INT FK → PurchaseItemCatalog | เชื่อมกับ catalog |
| name | VARCHAR(200) | ชื่อรายการ |
| category_id | INT FK → Category | หมวดหมู่ |
| quantity | DECIMAL(12,2) | น้ำหนัก/จำนวนที่ขาย |
| unit | VARCHAR(20) | หน่วย |
| price_per_unit | DECIMAL(12,2) | ราคาขายต่อหน่วย |
| total | DECIMAL(12,2) | ราคารวม |
| cost_per_unit | DECIMAL(12,2) | ต้นทุนต่อหน่วย (คำนวณจาก FIFO) |
| cost_total | DECIMAL(12,2) | ต้นทุนรวม |
| profit | DECIMAL(12,2) | กำไร = total - cost_total |
| created_at | DATETIME | |

**Business Rules:**
- cost_per_unit และ cost_total ถูกคำนวณจาก FIFO logic ตอน confirm
- profit = total - cost_total
- catalog_item_id ถูกเพิ่มเพื่อให้เชื่อมกลับไปยัง catalog ได้ (migration 034)

#### 1.2.11 StockTransfer (โอนสินค้าระหว่างสาขา)

| Field | Type | Description |
|-------|------|-------------|
| id | INT PK AUTO_INCREMENT | |
| reference_no | VARCHAR(50) UNIQUE | เลขที่อ้างอิง |
| from_branch_id | INT FK → Branch | สาขาต้นทาง |
| to_branch_id | INT FK → Branch | สาขาปลายทาง |
| user_id | INT FK → User | ผู้ทำรายการ |
| notes | TEXT | หมายเหตุ |
| status | ENUM('draft','confirmed','cancelled') | |
| carrier_name | VARCHAR(100) | ชื่อคนส่งของ |
| vehicle_plate | VARCHAR(20) | ทะเบียนรถ |
| tracking_number | VARCHAR(100) | เลขติดตามพัสดุ |
| from_address | TEXT | ที่อยู่ต้นทาง |
| to_address | TEXT | ที่อยู่ปลายทาง |
| confirmed_at | DATETIME NULLABLE | |
| confirmed_by | INT FK → User NULLABLE | |
| cancelled_at | DATETIME NULLABLE | |
| created_at | DATETIME | |
| updated_at | DATETIME | |

**Business Rules:**
- DRAFT → CONFIRMED: ตัด stock สาขาต้นทาง + เพิ่ม stock สาขาปลายทาง
- CANCELLED (เฉพาะ draft): ไม่กระทบ stock
- logistic fields (carrier, vehicle, tracking) สำหรับติดตามการขนส่ง

#### 1.2.12 BusinessExpense (ค่าใช้จ่ายธุรกิจ)

| Field | Type | Description |
|-------|------|-------------|
| id | INT PK AUTO_INCREMENT | |
| branch_id | INT FK → Branch | สาขาที่เกิดค่าใช้จ่าย |
| description | VARCHAR(255) | รายการ |
| amount | DECIMAL(12,2) | จำนวนเงิน |
| category | VARCHAR(50) | ประเภท (เช่น ค่าเช่า, ค่าน้ำ, ค่าไฟ, เงินเดือน, อื่นๆ) |
| expense_date | DATE | วันที่เกิดรายการ |
| user_id | INT FK → User | ผู้บันทึก |
| created_at | DATETIME | |

#### 1.2.13 Product (สินค้าขายปลีก) — Base POS

| Field | Type | Description |
|-------|------|-------------|
| id | INT PK AUTO_INCREMENT | |
| name | VARCHAR(200) | ชื่อสินค้า |
| sku | VARCHAR(100) | รหัสสินค้า |
| barcode | VARCHAR(100) | บาร์โค้ด |
| description | TEXT | |
| category_id | INT FK → Category | หมวดหมู่ |
| price_tier1 | DECIMAL(12,2) | ราคาขาย tier 1 (ถูกสุด) |
| price_tier2 | DECIMAL(12,2) | ราคาขาย tier 2 (กลาง) |
| price_tier3 | DECIMAL(12,2) | ราคาขาย tier 3 (แพงสุด) |
| cost | DECIMAL(12,2) | ต้นทุน |
| quantity | INT | จำนวนคงเหลือ |
| unit | VARCHAR(20) | หน่วย |
| low_stock_threshold | INT DEFAULT 5 | ค่าเตือนสต็อกต่ำ |
| status | ENUM('active','inactive') | |
| user_id | INT FK → User | |
| created_at | DATETIME | |
| updated_at | DATETIME | |

**Business Rules (3-Tier Pricing):**
- ราคา Tier 1 ≤ Tier 2 ≤ Tier 3 (ห้ามกลับด้าน)
- Tier 1 = ราคาสมาชิก/ขายส่ง
- Tier 2 = ราคาปกติ
- Tier 3 = ราคาขายปลีกสูงสุด
- price field = price_tier2 (backward compatibility)

#### 1.2.14 Sale (การขายปลีก) — Base POS

| Field | Type | Description |
|-------|------|-------------|
| id | INT PK AUTO_INCREMENT | |
| reference_no | VARCHAR(50) UNIQUE | เลขที่อ้างอิง |
| customer_id | INT FK → Customer | ลูกค้า (default = walk-in customer id=1) |
| user_id | INT FK → User | พนักงานขาย |
| total_amount | DECIMAL(12,2) | ยอดรวมก่อนส่วนลด |
| discount_amount | DECIMAL(12,2) | ส่วนลด |
| tax_amount | DECIMAL(12,2) | ภาษี |
| grand_total | DECIMAL(12,2) | ยอดสุทธิ |
| payment_method | VARCHAR(20) | วิธีชำระ (cash, bank_transfer, etc.) |
| payment_status | ENUM('paid','voided') | |
| notes | TEXT | |
| created_at | DATETIME | |

#### 1.2.15 SaleItem (รายการในใบขาย)

| Field | Type | Description |
|-------|------|-------------|
| id | INT PK AUTO_INCREMENT | |
| sale_id | INT FK → Sale | |
| product_id | INT FK → Product | |
| quantity | DECIMAL(12,2) | |
| price | DECIMAL(12,2) | ราคาต่อหน่วย |
| total | DECIMAL(12,2) | |
| created_at | DATETIME | |

#### 1.2.16 Customer (ลูกค้า)

| Field | Type | Description |
|-------|------|-------------|
| id | INT PK AUTO_INCREMENT | |
| name | VARCHAR(100) | |
| phone | VARCHAR(20) | |
| email | VARCHAR(100) | |
| address | TEXT | |
| created_at | DATETIME | |
| updated_at | DATETIME | |

**Note:** มี default "Walk-in Customer" (id=1) สำหรับลูกค้าที่ไม่ระบุตัวตน

#### 1.2.17 InventoryTransaction (รายการเคลื่อนไหวสต็อก)

| Field | Type | Description |
|-------|------|-------------|
| id | INT PK AUTO_INCREMENT | |
| product_id | INT FK → Product | |
| type | ENUM('purchase','sale','adjustment','return') | |
| quantity | INT | |
| reference_id | INT NULLABLE | |
| notes | TEXT | |
| user_id | INT FK → User | |
| created_at | DATETIME | |

#### 1.2.18 Photo (รูปภาพสินค้า)

| Field | Type | Description |
|-------|------|-------------|
| id | INT PK AUTO_INCREMENT | |
| purchase_order_id | INT FK → PurchaseOrder | ใบรับซื้อที่รูปถ่ายสังกัด |
| filename | VARCHAR(255) | ชื่อไฟล์ |
| filepath | VARCHAR(500) | path จริง |
| original_name | VARCHAR(255) | |
| mime_type | VARCHAR(50) | |
| file_size | INT | ขนาดไฟล์ (bytes) |
| user_id | INT FK → User | |
| created_at | DATETIME | |

#### 1.2.19 Additional Support Tables

**login_attempts** (rate limiting)
| Field | Type | Description |
|-------|------|-------------|
| ip | VARCHAR(45) PK | ที่อยู่ IP |
| attempts | INT | จำนวนครั้งที่พยายาม |
| window_start | DATETIME | จุดเริ่มต้น window 15 นาที |

**token_blocklist** (JWT revocation)
| Field | Type | Description |
|-------|------|-------------|
| jti | VARCHAR(255) PK | JWT Token ID |
| expires_at | DATETIME | วันหมดอายุของ token |

**activity_log** (audit log)
| Field | Type | Description |
|-------|------|-------------|
| id | INT PK AUTO_INCREMENT | |
| user_id | INT FK → User | |
| action | VARCHAR(50) | ประเภท action (login, create_sale, void_sale, ฯลฯ) |
| description | TEXT | รายละเอียด |
| ip_address | VARCHAR(45) | |
| created_at | DATETIME | |

### 1.3 Relationships Summary

```
Branch 1──N User
Branch 1──N PurchaseOrder
Branch 1──N SaleLot
Branch 1──N BusinessExpense
Branch 1──N StockTransfer (from_branch / to_branch)

User 1──N PurchaseOrder
User 1──N SaleLot
User 1──N StockTransfer
User 1──N ActivityLog
User 1──N Photo

Seller 1──N PurchaseOrder
Seller N──M PurchaseOrderItem (via PO)

Category 1──N PurchaseOrderItem
Category 1──N SaleLotItem
Category 1──N Product
Category 1──N PurchaseItemCatalog

PurchaseItemCatalog 1──N PurchaseOrderItem
PurchaseItemCatalog 1──N SaleLotItem

PurchaseOrder 1──N PurchaseOrderItem
PurchaseOrder 1──N Photo

SaleLot 1──N SaleLotItem
SaleLot 1──0..1 ActualRevenue (recorded later)

Product 1──N InventoryTransaction
Product 1──N SaleItem

Sale 1──N SaleItem
Customer 1──N Sale
```

---

## 2. API Spec

### 2.1 API Design Conventions

- **Base URL:** `/api/`
- **Format:** JSON request/response ทั้งหมด
- **Authentication:** JWT (Bearer token ใน Authorization header หรือ httpOnly cookie `posToken`)
- **Response Format:**
  ```json
  // Success
  { "status": "success", "message": "...", "data": { ... } }
  
  // Error
  { "status": "error", "message": "..." }
  ```
- **Pagination:** Query params `?page=1&limit=20` (default limit = 20)
- **HTTP Methods:** GET (read), POST (create), PUT (update), DELETE (delete)

### 2.2 Auth Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/login` | Public | ล็อกอินด้วย username + password |
| POST | `/api/auth/verify` | Public | ตรวจสอบว่า token ยังใช้ได้ |
| POST | `/api/auth/logout` | Required | logout + revoke token |

**POST /api/auth/login**
```
Request:
{
  "username": "...",
  "password": "..."
}

Response:
{
  "user": {
    "id": 1,
    "username": "...",
    "full_name": "...",
    "role": "admin",
    "branch_id": 1,
    "email": "..."
  }
}
// Server ตั้ง httpOnly cookie `posToken` + non-httpOnly cookie `posUser` โดยอัตโนมัติ
```

**Rate Limiting:**
- 5 attempts ต่อ IP ใน window 15 นาที
- ถ้าเกิน → 429 Too Many Requests
- หลังจากล็อกอินสำเร็จ → ล้าง rate limit ของ IP นั้น

### 2.3 Users Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/users/all` | admin | ดูรายชื่อผู้ใช้ทั้งหมด |
| POST | `/api/users` | admin | สร้างผู้ใช้ใหม่ |
| GET | `/api/users/user?id=X` | admin | ดูข้อมูลผู้ใช้ |
| PUT | `/api/users/user?id=X` | admin | แก้ไขผู้ใช้ |
| DELETE | `/api/users/user?id=X` | admin | ลบผู้ใช้ (ลบตัวเองไม่ได้) |
| POST | `/api/users/change-password` | admin | เปลี่ยนรหัสผ่านผู้ใช้อื่น |
| GET | `/api/users/activity-log` | admin | ดู audit log |
| GET | `/api/users/profile` | any | ดูโปรไฟล์ตัวเอง |
| PUT | `/api/users/profile` | any | แก้ไขโปรไฟล์ตัวเอง (เฉพาะ full_name, email) |
| POST | `/api/users/change-own-password` | any | เปลี่ยนรหัสผ่านตัวเอง |

### 2.4 Branches Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/branches` | any | ดูสาขาทั้งหมด |
| POST | `/api/branches` | admin | สร้างสาขาใหม่ |
| GET | `/api/branches/active` | any | ดูสาขาที่ active เท่านั้น |
| GET | `/api/branches/summary` | any | ดูสรุปยอดแต่ละสาขา |
| GET | `/api/branches/branch?id=X` | any | ดูข้อมูลสาขา |
| PUT | `/api/branches/branch?id=X` | admin | แก้ไขสาขา |

### 2.5 Sellers Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/sellers` | any | ดูผู้ขายทั้งหมด (มี pagination) |
| POST | `/api/sellers` | any | สร้างผู้ขายใหม่ |
| GET | `/api/sellers/search?q=XXX` | any | ค้นหาผู้ขาย (ชื่อ/เบอร์/บัตร) |
| GET | `/api/sellers/seller?id=X` | any | ดูข้อมูลผู้ขาย |
| PUT | `/api/sellers/seller?id=X` | any | แก้ไขผู้ขาย |
| POST | `/api/sellers/blacklist` | admin,manager | แบล็คลิสต์ผู้ขาย |
| POST | `/api/sellers/unblacklist` | admin,manager | ปลดแบล็คลิสต์ |
| GET | `/api/sellers/history?seller_id=X` | any | ดูประวัติการขายของผู้ขาย |

### 2.6 Purchase Orders Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/purchase-orders` | any | ดู PO ทั้งหมด (filter: branch, date_from, date_to, seller_id, status) |
| POST | `/api/purchase-orders` | admin,manager | สร้าง PO ใหม่ |
| GET | `/api/purchase-orders/order?id=X` | any | ดู PO รายการ |
| POST | `/api/purchase-orders/cancel` | admin,manager | ยกเลิก PO + คืน stock |

**POST /api/purchase-orders**
```
Request:
{
  "seller_id": 1,
  "branch_id": 1,
  "payment_method": "cash",
  "notes": "...",
  "items": [
    {
      "catalog_item_id": 1,
      "name": "เหล็กท้าย",
      "category_id": 1,
      "condition_id": 1,
      "quantity": 120,
      "unit": "กก.",
      "price_per_unit": 8,
      "tier_label": "บิล 1",
      "total": 960
    }
  ]
}

Response:
{
  "id": 1,
  "reference_no": "PO-20260619-001",
  "total_amount": 960
}
```

**POST /api/purchase-orders/cancel**
```
Request:
{
  "id": 1,
  "reason": "สินค้าเสียหาย"
}
```

### 2.7 Sale Lots Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/sale-lots` | any | ดู Sale Lots ทั้งหมด |
| POST | `/api/sale-lots` | admin,manager | สร้าง Sale Lot (DRAFT) |
| GET | `/api/sale-lots/sale-lot?id=X` | any | ดู Sale Lot รายการ |
| PUT | `/api/sale-lots/sale-lot?id=X` | admin,manager | แก้ไข Sale Lot (เฉพาะ DRAFT) |
| DELETE | `/api/sale-lots/sale-lot?id=X` | admin | ลบ Sale Lot (เฉพาะ DRAFT) |
| POST | `/api/sale-lots/confirm` | admin,manager | ยืนยัน Sale Lot → ตัด FIFO stock |
| POST | `/api/sale-lots/cancel` | admin,manager | ยกเลิก Sale Lot → คืน stock |
| POST | `/api/sale-lots/record-revenue` | admin,manager | บันทึกรายรับจริง |

**POST /api/sale-lots**
```
Request:
{
  "branch_id": 1,
  "buyer_name": "บริษัท รีไซเคิล จำกัด",
  "buyer_phone": "088-XXX-XXXX",
  "notes": "...",
  "items": [
    {
      "catalog_item_id": 1,
      "name": "เหล็กท้าย",
      "category_id": 1,
      "quantity": 50,
      "unit": "กก.",
      "price_per_unit": 15,
      "total": 750
    }
  ]
}
```

**POST /api/sale-lots/confirm**
```
Request: { "id": 1 }
// System จะ:
//   1. คำนวณ FIFO cost ของแต่ละ item
//   2. ตัด stock จาก purchase_order_items.consumed_qty
//   3. เปลี่ยน status → confirmed
```

**POST /api/sale-lots/record-revenue**
```
Request:
{
  "id": 1,
  "actual_revenue": 7200,
  "expenses": [
    { "description": "ค่าขนส่ง", "amount": 300 },
    { "description": "ค่าคอมมิชชั่น", "amount": 200 }
  ]
}
```

### 2.8 Stock Transfers Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/stock-transfers` | any | ดูรายการโอนทั้งหมด |
| POST | `/api/stock-transfers` | admin,manager | สร้าง Stock Transfer |
| POST | `/api/stock-transfers/confirm` | admin,manager | ยืนยันการโอน |
| POST | `/api/stock-transfers/cancel` | admin,manager | ยกเลิกการโอน |

**POST /api/stock-transfers**
```
Request:
{
  "from_branch_id": 1,
  "to_branch_id": 2,
  "notes": "โอนเหล็กไปสาขาลพบุรี",
  "carrier_name": "บริษัทขนส่ง XYZ",
  "vehicle_plate": "กข 1234",
  "tracking_number": "TH123456789",
  "items": [
    { "purchase_order_item_id": 1, "quantity": 50 }
  ]
}
```

### 2.9 Catalog & Price Tiers Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/price-tiers` | any | ดูรายการ catalog พร้อม tier_prices |
| POST | `/api/price-tiers` | admin,manager | เพิ่มรายการ catalog |
| PUT | `/api/price-tiers/category` | admin,manager | อัปเดตราคา tier ของรายการ |
| GET | `/api/purchase-catalog` | any | ดู catalog ทั้งหมด |
| POST | `/api/purchase-catalog` | admin,manager | เพิ่มรายการ catalog |
| GET | `/api/purchase-catalog/search?q=XXX` | any | ค้นหา catalog |
| GET | `/api/purchase-catalog/item?id=X` | any | ดูรายการ |
| PUT | `/api/purchase-catalog/item?id=X` | admin,manager | แก้ไขรายการ |
| DELETE | `/api/purchase-catalog/item?id=X` | admin | ลบรายการ |
| POST | `/api/purchase-catalog/update-category` | admin,manager | อัปเดต category_id ของ catalog |
| GET | `/api/purchase-catalog/price-board` | any | ดึงราคาทุกรายการสำหรับพิมพ์บอร์ด |
| GET | `/api/item-conditions` | any | ดูสภาพของทั้งหมด |

### 2.10 Inventory Endpoints (Base POS)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/inventory/categories` | any | ดูหมวดหมู่ทั้งหมด |
| POST | `/api/inventory/categories` | admin,manager | สร้างหมวดหมู่ |
| GET | `/api/inventory/category?id=X` | any | ดูหมวดหมู่ |
| PUT | `/api/inventory/category?id=X` | admin,manager | แก้ไขหมวดหมู่ |
| DELETE | `/api/inventory/category?id=X` | admin | ลบหมวดหมู่ (ต้องไม่มีสินค้า) |
| GET | `/api/inventory/products` | any | ดูสินค้าทั้งหมด (filter: category_id) |
| POST | `/api/inventory/products` | admin,manager | สร้างสินค้า |
| GET | `/api/inventory/product?id=X` | any | ดูสินค้า |
| PUT | `/api/inventory/product?id=X` | admin,manager | แก้ไขสินค้า |
| DELETE | `/api/inventory/product?id=X` | admin | ลบสินค้า (soft delete ถ้ามี transactions) |
| GET | `/api/inventory/low-stock` | any | ดูสินค้าที่สต็อกต่ำ |
| GET | `/api/inventory/transactions` | any | ดูประวัติเคลื่อนไหวสต็อก |
| POST | `/api/inventory/transactions` | admin,manager | บันทึกการเคลื่อนไหว |
| POST | `/api/inventory/set-threshold` | admin | ตั้งค่า alert_threshold หมวดหมู่ |
| GET | `/api/inventory/stock-alerts` | any | ดูรายการที่ stock ≤ alert_threshold |

### 2.11 Sales Endpoints (Base POS)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/sales` | admin,manager,cashier | สร้างใบขาย |
| GET | `/api/sales` | any | ดูใบขายทั้งหมด (filter: date, customer, status) |
| GET | `/api/sales/sale?id=X` | any | ดูรายละเอียดใบขาย |
| POST | `/api/sales/void` | admin,manager | ยกเลิกใบขาย (ต้องระบุเหตุผล) |
| GET | `/api/sales/export` | admin,manager | Export ใบขายเป็น CSV |

### 2.12 Financial Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/financial/summary` | admin,manager | ดูสรุปการเงิน (turnover, profit, expenses) |
| GET | `/api/financial/lot-revenues` | admin,manager | ดูรายรับแยกตาม lot |
| GET | `/api/financial/purchase-by-category` | admin,manager | ดูยอดซื้อแยกตามหมวด |
| GET | `/api/financial/expenses` | admin,manager | ดูรายการค่าใช้จ่าย |
| POST | `/api/financial/expenses` | admin,manager | บันทึกค่าใช้จ่าย |
| DELETE | `/api/financial/expenses` | admin | ลบรายการค่าใช้จ่าย |
| GET | `/api/financial/export` | admin,manager | Export ข้อมูลการเงินเป็น CSV |

### 2.13 Reports Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/reports/dashboard-stats` | any | KPI สำหรับ dashboard |
| GET | `/api/reports/sales-chart` | any | ข้อมูล chart การขาย (daily) |
| GET | `/api/reports/recent-sales` | any | การขายล่าสุด |
| GET | `/api/reports/purchase-chart` | any | ข้อมูล chart การซื้อ |
| GET | `/api/reports/recent-purchases` | any | การซื้อล่าสุด |
| GET | `/api/reports/recent-sale-lots` | any | Sale lot ล่าสุด |
| GET | `/api/reports/sales-report` | any | รายงานการขายแบบเต็ม |
| GET | `/api/reports/product-sales` | any | ยอดขายแยกตามสินค้า |
| GET | `/api/reports/inventory-report` | any | รายงานสต็อก |
| GET | `/api/reports/cashier-performance` | admin,manager | ประสิทธิภาพพนักงาน |
| GET | `/api/reports/tax-report` | admin,manager | รายงานภาษี |
| GET | `/api/reports/purchase-report` | any | รายงานการซื้อ |
| GET | `/api/reports/sale-lot-report` | any | รายงาน sale lot |
| GET | `/api/reports/sale-lot-chart` | any | chart sale lot |

### 2.14 Photo Upload Endpoint

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/purchase-orders/photos` | HMAC or JWT | อัปโหลดรูปสินค้า |
| GET | `/api/purchase-orders/photos` | HMAC or JWT | ดูรายการรูปของ PO |
| GET | `/api/purchase-orders/photo-token` | JWT | ขอ HMAC token สำหรับ upload |

**POST /api/purchase-orders/photos** (multipart/form-data)
```
Fields:
  - file: รูปภาพ
  - purchase_order_id: INT
  - hmac_token: string (สำหรับ mobile ที่ไม่มี JWT)
```

### 2.15 Settings Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/settings/store` | any | ดูข้อมูลร้านค้า |
| POST | `/api/settings/store` | admin | บันทึกข้อมูลร้าน |
| GET | `/api/settings/system` | admin | ดู system settings |
| POST | `/api/settings/system` | admin | บันทึก system settings |
| POST | `/api/settings/backup/create` | admin | สร้าง backup DB |
| POST | `/api/settings/backup/restore` | admin | restore backup |
| GET | `/api/settings/backup/history` | admin | ดูประวัติ backup |
| GET | `/api/settings/backup/download` | admin | ดาวน์โหลด backup |
| POST | `/api/settings/backup/delete` | admin | ลบ backup |

---

## 3. Business Rules

### 3.1 FIFO Costing (First-In-First-Out)

**หลักการ:**
- สินค้าที่รับซื้อมาก่อน → ต้องถูกขายออกก่อน
- เวลาขาย (confirm sale lot) → ระบบต้องตัดต้นทุนจาก purchase_order_items ที่เก่าที่สุดก่อน
- แต่ละ PO item มีฟิลด์ consumed_qty เพื่อติดตามว่าตัดไปแล้วเท่าไหร่

**FIFO Algorithm (สำหรับ Sale Lot Confirm):**
1. รับ sale lot items ที่กำลังจะ confirm
2. For each sale lot item:
   a. หาหมวดหมู่ (category_id) และจำนวน (quantity) ที่ต้องการตัด
   b. ค้นหา purchase_order_items ของสาขาเดียวกัน (branch_id) ที่:
      - status = 'active' (PO ยังไม่ถูก cancel)
      - category_id ตรงกัน
      - consumed_qty < quantity (ยังมี stock เหลือ)
   c. เรียงตาม created_at ASC (ของเก่าที่สุดก่อน)
   d. ตัดทีละ PO item จนครบจำนวน:
      - quantity_to_cut = min(remaining_qty_needed, PO_item.quantity - PO_item.consumed_qty)
      - cost = PO_item.price_per_unit × quantity_to_cut
      - PO_item.consumed_qty += quantity_to_cut
   e. คำนวณ cost_per_unit = cost_total / quantity
   f. บันทึก cost_per_unit, cost_total, profit ใน sale_lot_items

**สูตร:**
```
profit_per_item = total_sale_price - total_fifo_cost
profit_margin = profit_per_item / total_sale_price * 100
```

**กรณียกเลิก Sale Lot (Cancel):**
1. ลด consumed_qty ของ PO items ที่ถูกตัดจาก lot นี้
2. คืน stock ให้กับ category
3. เปลี่ยน status → cancelled

### 3.2 3-Tier Pricing

**แนวคิด:**
- สินค้าแต่ละรายการใน catalog มีราคาหลายระดับ (tier)
- พนักงานเลือก tier ตอนรับซื้อเพื่อกำหนดราคา

**Tier Structure:**
```
Tier 1 (บิล 1): ราคาสูงสุด — สำหรับลูกค้าประจำ / ปริมาณมาก
Tier 2 (บิล 2): ราคากลาง — ปกติ
Tier 3 (บิล 3): ราคาต่ำสุด — สำหรับสินค้าคุณภาพต่ำ
```

**Business Rules:**
- แต่ละรายการสามารถมี tier กี่ระดับก็ได้ (ยืดหยุ่น 3+)
- แต่ละ tier มี {label, price}
- ราคา tier ต้องไม่ติดลบ
- label มีความยาวสูงสุด 50 ตัวอักษร
- tier_prices เก็บเป็น JSON array ใน purchase_item_catalog
- เวลารับซื้อ พนักงานเลือก tier → ระบบ autofill ราคาต่อหน่วย
- tier ที่เลือกถูกบันทึกใน purchase_order_items.tier_label

**สำหรับ Product (Base POS):**
- 3 fixed tiers: price_tier1, price_tier2, price_tier3
- constraint: tier1 ≤ tier2 ≤ tier3

### 3.3 Item Condition & Weight Deduction

**หลักการ:**
- สภาพของมีผลต่อราคารับซื้อ (ผ่าน weight deduction)
- สภาพดี = ไม่หัก, พอใช้ = หัก 10%, ชำรุด = หัก 20%

**สูตรคำนวณ:**
```
effective_quantity = actual_quantity × (100 - weight_deduction_pct) / 100
total_price = effective_quantity × price_per_unit
```

**ตัวอย่าง:**
- ขายทองแดง 100 กก. สภาพพอใช้ (weight_deduction = 10%)
- effective_quantity = 100 × 90% = 90 กก.
- ถ้าราคา 65 บาท/กก. → total = 90 × 65 = 5,850 บาท

### 3.4 Multi-Branch Isolation

**หลักการ:**
- แต่ละสาขามี stock, PO, sale lots ของตัวเอง
- ยกเว้น: categories, item_conditions, purchase_item_catalog, customers เป็น global

**Isolation Rules:**
- PurchaseOrder → ผูกกับ branch_id
- SaleLot → ผูกกับ branch_id
- StockTransfer → โอนระหว่าง branch_id → branch_id
- BusinessExpense → ผูกกับ branch_id
- User → อาจผูกกับ branch_id (cashier ถูกจำกัดที่สาขา)
- Product → ไม่ได้ผูกกับสาขา (global product list)
- Category → global (merge duplicates จากชื่อ)

**Data Visibility:**
- admin → เห็นทุกสาขา
- manager → เห็นเฉพาะสาขาที่สังกัด (แต่สามารถดู report รวมได้?)
- cashier → เฉพาะสาขาที่สังกัด

> **Unknown:** ระบบเก่าอาจมี branch filter ใน query ทุก endpoint — ต้องยืนยันกับ user ว่าต้องการให้ manager เห็นทุกสาขาหรือเฉพาะสาขาตัวเอง

### 3.5 Purchase Order Status

```
active ──→ cancelled
```

- **active:** PO ใช้งานได้, stock ถูกนับรวม
- **cancelled:** PO ถูกยกเลิก, stock ถูกคืน, consumed_qty ไม่นับรวม

**Cancel Rules:**
- ระบุเหตุผลการยกเลิกเสมอ
- ถ้ามี sale lot ที่ตัด stock จาก PO นี้ไปแล้ว → ต้องจัดการ consumed_qty
- เฉพาะ admin/manager ที่ cancel ได้

### 3.6 Sale Lot Status & Revenue

**Lifecycle:**
```
draft ──→ confirmed ──→ (actual_revenue recorded later)
  │           │
  └──→ cancelled
```

- **draft:** ยังไม่ตัด stock, สามารถแก้ไข/ลบ
- **confirmed:** ตัด FIFO stock แล้ว, cost + profit ถูกคำนวณ
- **cancelled:** คืน stock, consumed_qty ถูกลด

**Actual Revenue Concept (เฉพาะ Bangkok?):**
- บางครั้งรายรับจริง ≠ total_amount ของ sale lot (เช่น มีค่านายหน้า ค่าขนส่ง)
- บันทึก actual_revenue ภายหลังเพื่อ reconcile
- expenses JSON เก็บบันทึกค่าใช้จ่ายแยกย่อย

### 3.7 Stock Transfer

**Lifecycle:**
```
draft ──→ confirmed
  │
  └──→ cancelled
```

- **draft:** ยังไม่กระทบ stock
- **confirmed:** 
  - ตัด stock (consumed_qty) จากสาขาต้นทาง
  - เพิ่ม stock (PO items ใหม่?) ที่สาขาปลายทาง
- **cancelled:** เฉพาะ draft — ไม่กระทบ stock

**Logistics Info:**
- บันทึกผู้ขนส่ง, ทะเบียนรถ, tracking number
- ที่อยู่ต้นทาง/ปลายทาง

### 3.8 Reference Number Patterns

| Document | Format | Example |
|----------|--------|---------|
| Purchase Order | PO-YYYYMMDD-NNN | PO-20260619-001 |
| Sale Lot | LOT-YYYYMMDD-NNN | LOT-20260619-001 |
| Stock Transfer | TFR-YYYYMMDD-NNN | TFR-20260619-001 |
| Sale (Base) | SALE-YYYYMMDD-NNN | SALE-20260619-001 |

NNN = วิ่งเลขตามวันที่ (001, 002, ...)

### 3.9 Cost Method

แต่ละสาขามีฟิลด์ cost_method ที่เลือกได้ 2 แบบ:
- **fifo:** First-In-First-Out (default) — ตัดต้นทุนจาก PO items ที่เก่าที่สุด
- **weighted:** Weighted Average — คำนวณต้นทุนจากราคาเฉลี่ยของ stock ทั้งหมด

> **Unknown:** ระบบเก่าใช้ FIFO (มี consumed_qty + migration 020 ชัดเจน) แต่ weighted average ถูกเพิ่มมาทีหลัง — ไม่ชัดเจนว่ามี implementation จริงหรือยัง

### 3.10 Stock Alert System

- แต่ละ category มี alert_threshold (ตั้งโดย admin)
- เมื่อ stock_kg ≤ alert_threshold → แสดงใน getStockAlerts()
- stock_kg ถูกอัปเดตทุกครั้งที่มี PO (เพิ่ม) หรือ sale lot confirm (ลด)
- แยกตามสาขา? หรือรวมทุกล็อท?

> **Unknown:** stock_kg ใน categories table — น่าจะเป็นยอดรวมทุกล็อทในสาขานั้น? หรือรวมทุกสาขา? ต้องยืนยัน

---

## 4. Auth & Authorization Spec

### 4.1 Authentication Flow

```
┌─────────┐     POST /auth/login     ┌───────────┐
│  Client  │ ──────────────────────→  │  Server   │
│          │ ←──────────────────────  │           │
└─────────┘    200 { user } +         └───────────┘
                Set-Cookie: posToken
                Set-Cookie: posUser
```

**Token Details:**
- Type: JWT (JSON Web Token)
- Expiry: 24 ชั่วโมง (JWT_EXPIRY)
- Algorithm: HS256
- Payload: { user_id, username, role, branch_id, jti (unique), exp, iat }
- Transport: httpOnly cookie (`posToken`) หรือ `Authorization: Bearer <token>`
- Cookie flags: HttpOnly, SameSite=Strict, Secure (production)

**Token Validation on Every Request (ยกเว้น public routes):**
1. อ่าน token จาก httpOnly cookie `posToken` ก่อน
2. ถ้าไม่มี → อ่านจาก `Authorization: Bearer` header
3. validate JWT signature + expiry
4. check token_blocklist (ถูก revoke หรือไม่)
5. ถ้า token ไม่ valid → 401 Unauthorized

**Logout:**
1. อ่าน token จาก cookie หรือ header
2. เก็บ jti + exp ใน token_blocklist table
3. ล้าง cookie ทั้งสอง
4. response success

### 4.2 Roles & Permissions Matrix

| Feature | admin | manager | cashier |
|---------|-------|---------|---------|
| **Auth** | | | |
| Login | ✅ | ✅ | ✅ |
| Logout | ✅ | ✅ | ✅ |
| **Users** | | | |
| List users | ✅ | ❌ | ❌ |
| Create user | ✅ | ❌ | ❌ |
| Edit user | ✅ | ❌ | ❌ |
| Delete user | ✅ | ❌ | ❌ |
| Change password | ✅ (any user) | ❌ | ❌ |
| View activity log | ✅ | ❌ | ❌ |
| Edit own profile | ✅ | ✅ | ✅ |
| Change own password | ✅ | ✅ | ✅ |
| **Branches** | | | |
| View branches | ✅ | ✅ | ✅ |
| Create/Edit branch | ✅ | ❌ | ❌ |
| **Sellers** | | | |
| View sellers | ✅ | ✅ | ✅ |
| Create seller | ✅ | ✅ | ✅ |
| Edit seller | ✅ | ✅ | ✅ |
| Blacklist/Unblacklist | ✅ | ✅ | ❌ |
| **Purchase Orders** | | | |
| View PO | ✅ | ✅ | ❌ |
| Create PO | ✅ | ✅ | ❌ |
| Cancel PO | ✅ | ✅ | ❌ |
| **Sale Lots** | | | |
| View Sale Lots | ✅ | ✅ | ❌ |
| Create Sale Lot | ✅ | ✅ | ❌ |
| Edit Sale Lot | ✅ | ✅ | ❌ |
| Confirm Sale Lot | ✅ | ✅ | ❌ |
| Cancel Sale Lot | ✅ | ✅ | ❌ |
| Record Revenue | ✅ | ✅ | ❌ |
| **Stock Transfers** | | | |
| View Transfers | ✅ | ✅ | ❌ |
| Create Transfer | ✅ | ✅ | ❌ |
| Confirm Transfer | ✅ | ✅ | ❌ |
| Cancel Transfer | ✅ | ✅ | ❌ |
| **Catalog & Inventory** | | | |
| View catalog | ✅ | ✅ | ✅ |
| Create catalog item | ✅ | ✅ | ❌ |
| Edit catalog item | ✅ | ✅ | ❌ |
| Delete catalog item | ✅ | ❌ | ❌ |
| Update price tiers | ✅ | ✅ | ❌ |
| View categories | ✅ | ✅ | ✅ |
| Create/Edit category | ✅ | ✅ | ❌ |
| Delete category | ✅ | ❌ | ❌ |
| Create product | ✅ | ✅ | ❌ |
| Edit product | ✅ | ✅ | ❌ |
| Delete product | ✅ | ❌ | ❌ |
| Inventory transactions | ✅ | ✅ | ❌ |
| Set stock threshold | ✅ | ❌ | ❌ |
| **Sales** | | | |
| View sales | ✅ | ✅ | ✅ |
| Create sale | ✅ | ✅ | ✅ |
| Void sale | ✅ | ✅ | ❌ |
| Export sales CSV | ✅ | ✅ | ❌ |
| **Financial** | | | |
| View financial summary | ✅ | ✅ | ❌ |
| Manage expenses | ✅ | ✅ | ❌ |
| Export financial CSV | ✅ | ✅ | ❌ |
| **Reports** | | | |
| Dashboard stats | ✅ | ✅ | ✅ |
| Sales/Purchase reports | ✅ | ✅ | ✅ |
| Cashier performance | ✅ | ✅ | ❌ |
| Tax report | ✅ | ✅ | ❌ |
| **Settings** | | | |
| View settings | ✅ | ✅ | ❌ |
| Save settings | ✅ | ❌ | ❌ |
| Backup/Restore | ✅ | ❌ | ❌ |
| **Photos** | | | |
| Upload photos | ✅ | ✅ | ✅ (?) |
| View photos | ✅ | ✅ | ✅ |

### 4.3 Public Routes (No Auth)

1. `POST /api/auth/login`
2. `POST /api/auth/verify`
3. `POST /api/purchase-orders/photos` (ใช้ HMAC token แทน JWT — สำหรับ mobile upload)

### 4.4 Branch Isolation in Auth

- JWT token มีฟิลด์ `branch_id`
- cashier → ถูกจำกัดเฉพาะ branch_id ของตัวเอง (backend ต้อง filter)
- admin → branch_id = null (เข้าถึงทุกสาขา)
- manager → ควรจำกัดที่ branch_id หรือเห็นทุกสาขา? (ต้องยืนยัน)

> **Unknown:** ระบบเก่า branch isolation level สำหรับ manager — ให้เห็นทุกสาขาหรือเฉพาะสาขาตัวเอง?

---

## 5. Report Spec

### 5.1 Dashboard Stats (WF-04)

**วัตถุประสงค์:** แสดง KPI แบบ real-time สำหรับผู้จัดการ/เจ้าของ 4 สาขา

**Data Points:**
- ยอดซื้อวันนี้ (today's total purchase)
- ยอดขายวันนี้ (today's total sale)
- กำไรวันนี้ (today's profit)
- จำนวนบิลวันนี้ (today's transaction count)
- ยอดซื้อ/ขาย/กำไร แยกตามสาขา
- สินค้าค้างนาน (>30 วัน) — aging inventory warning
- Recent sales (5 รายการล่าสุด)
- Recent purchases (5 รายการล่าสุด)
- Recent sale lots (5 รายการล่าสุด)

**Auto-refresh:** ทุก 30-60 วินาที (dashboard สำหรับจอโทรทัศน์ในร้าน)

### 5.2 Sales Report

**Data Source:** sales + sale_items tables
**Filters:** date range (from-to), branch, payment method, payment status, customer
**Columns:**
- Reference #, Date/Time, Customer, Items Count, Subtotal, Discount, Tax, Grand Total, Payment Method, Status, Cashier, Notes

**Export:** CSV

### 5.3 Purchase Report

**Data Source:** purchase_orders + purchase_order_items
**Filters:** date range, branch, seller, payment method, status
**Columns:**
- Reference #, Date, Seller, Branch, Items Count, Total Amount, Payment Method, Status, User

### 5.4 Sale Lot Report

**Data Source:** sale_lots + sale_lot_items
**Filters:** date range, branch, status
**Columns:**
- Reference #, Date, Buyer, Branch, Items Count, Total Amount, Cost Total, Profit, Status

### 5.5 Product Sales Report

**Data Source:** sale_items + products
**Description:** ยอดขายแยกตามสินค้า (top sellers)
**Filters:** date range, category

### 5.6 Inventory Report

**Data Source:** products, categories
**Description:** สถานะสต็อกปัจจุบัน
**Columns:**
- Product Name, SKU, Category, Current Qty, Low Stock Threshold, Status

### 5.7 Cashier Performance Report

**Data Source:** sales + users
**Description:** ประสิทธิภาพพนักงานขาย
**Columns:**
- Cashier Name, Number of Sales, Total Amount, Average per Sale, Period
**Access:** admin, manager เท่านั้น

### 5.8 Tax Report

**Data Source:** sales
**Description:** สรุปภาษีสำหรับยื่นภาษี
**Access:** admin, manager เท่านั้น

### 5.9 Financial Summary

**Data Source:** purchase_orders, sale_lots, business_expenses
**Description:** สรุปการเงินแบบรวม
**Metrics:**
- Total Purchase Volume (TPV)
- Total Sale Revenue (TSR)
- Gross Profit = TSR - FIFO Cost
- Net Profit = Gross Profit - Expenses
- Expense Breakdown by Category
- Purchase by Category (top categories)

### 5.10 Export CSV

**Endpoints ที่ export ได้:**
- `/api/sales/export` → CSV
- `/api/financial/export` → CSV

**CSV Format:**
- Header row (ภาษาไทยหรืออังกฤษ)
- Data rows
- BOM สำหรับ Excel compatibility
- Content-Type: text/csv

---

## 6. Printer Spec

### 6.1 Supported Printer Types

- **Thermal Printer (ESC/POS protocol)**
  - รองรับการพิมพ์ใบรับซื้อ (Purchase Receipt)
  - รองรับการพิมพ์ใบเสร็จขาย (Sale Receipt)
  - รองรับ Price Board (กระดานราคา)

### 6.2 Receipt Types (WF-02)

**Type A — Normal Receipt (ใบเสร็จปกติ):**
- Header: ร้านชื่อ + ที่อยู่ + เบอร์โทร
- เลขที่ใบเสร็จ + วันที่
- รายการสินค้า (ชื่อ × จำนวน @ ราคา = รวม)
- ยอดรวม
- วิธีชำระเงิน
- Footer: ขอบคุณที่ใช้บริการ

**Type B — Precious Metals Receipt (ใบรับซื้อโลหะมีค่า):**
- Header: ร้านชื่อ + ที่อยู่
- เลขที่ใบรับซื้อ + วันที่
- ข้อมูลผู้ขาย (ชื่อ, ที่อยู่, เลขบัตร)
- รายการโลหะมีค่า (ชนิด, น้ำหนัก, ความบริสุทธิ์, ราคา)
- ข้อความทางกฎหมาย (ต้องมีตาม พ.ร.บ. รับซื้อของเก่า)
- ลายเซ็นผู้ขาย + พนักงาน

### 6.3 Thermal Print Commands (ESC/POS)

ระบบใหม่ต้องรองรับ command พื้นฐานเหล่านี้:
- **Initialization:** ESC @
- **Text alignment:** ESC a n (0=left, 1=center, 2=right)
- **Text style:** ESC ! n (bold, double-height, etc.)
- **Line feed:** LF
- **Cut paper:** GS V m
- **Barcode:** GS k m n d1...dn
- **QR Code:** GS ( k pL pH cn fn n

### 6.4 Price Board

**วัตถุประสงค์:** พิมพ์ราคาสินค้าทั้งหมดแยกตามหมวด สำหรับแปะหน้าร้าน
**Format:** 
- หัวข้อ "ราคารับซื้อ" + วันที่
- แยกตามหมวดหมู่ (Category)
- แต่ละรายการ: รหัส - ชื่อ - ราคา tier (บิล1/บิล2/บิล3)
- หน่วย: กก./ลัง/ชิ้น

---

## 7. Unknowns & Open Questions

ระหว่างการ reverse engineer พบประเด็นที่ต้องยืนยันกับ SoloCorp team ดังนี้:

### 7.1 Business Logic Unknowns

| # | คำถาม | ความสำคัญ | เกี่ยวข้องกับ |
|---|-------|-----------|-------------|
| 1 | **Manager branch isolation:** manager ควรเห็นเฉพาะสาขาตัวเอง หรือเห็นทุกสาขา? | สูง | Auth, Reports |
| 2 | **stock_kg ใน categories:** เป็นยอดรวมทุกสาขาหรือแยกตามสาขา? | สูง | Inventory, Alert |
| 3 | **Weighted Average costing:** มี implementation จริงหรือเป็นเพียง schema ที่เตรียมไว้? | สูง | FIFO, Costing |
| 4 | **Actual Revenue (recordRevenue):** workflow จริงเป็นยังไง? บันทึกหลังขายกี่วัน? | กลาง | Sale Lot |
| 5 | **Sale lot partial cancel:** cancel บางรายการใน lot ได้ไหม? หรือต้อง cancel ทั้ง lot? | กลาง | Sale Lot |
| 6 | **Product ↔ Catalog relationship:** Product (base POS) กับ PurchaseItemCatalog (customization) เชื่อมกันหรือแยก? | กลาง | Data Model |
| 7 | **PO → Sale workflow:** การขายแบบ lot ใช้ PO items โดยตรง แต่การขายปลีก (sales) ใช้ products — สองระบบนี้เชื่อมกันอย่างไร? | สูง | Business Flow |
| 8 | **Photo upload mobile flow:** HMAC token ทำงานอย่างไร? expire เมื่อไหร่? | กลาง | WF-01 |
| 9 | **Precious metals receipt:** ข้อกำหนดทางกฎหมายที่ต้องมีคืออะไร? | กลาง | WF-02 |

### 7.2 Technical Unknowns

| # | คำถาม | ความสำคัญ |
|---|-------|-----------|
| 1 | ระบบเก่าใช้ฐานข้อมูลอะไร? (MySQL 8.0) — ระบบใหม่ใช้ DB อะไร? | Tech Stack |
| 2 | ระบบเก่าเป็น PHP จริง — ระบบใหม่จะใช้ tech stack อะไร? (React/Next.js, Vue/Nuxt?) | Tech Stack |
| 3 | ต้องรองรับ offline mode หรือไม่? | UX |
| 4 | ต้องพิมพ์ผ่าน web browser (Browser Print API) หรือ direct ESC/POS ผ่าน WebSocket? | Printer |
| 5 | 4 สาขา production มี database แยกหรือรวม? | Infrastructure |
| 6 | ต้อง migration data จากระบบเก่าหรือเริ่มใหม่? | Implementation |

### 7.3 Feature Priorities Unknowns

| # | คำถาม |
|---|-------|
| 1 | Feature ไหนบ้างที่ต้องมีใน MVP vs Phase 2? |
| 2 | ต้องรองรับ barcode scanner (hardware) หรือไม่? |
| 3 | ต้องรองรับ integration กับธนาคาร (PromptPay, QR Payment) หรือไม่? |
| 4 | Weight deduction logic — implementation ใช้ตอน purchase หรือตอน sale? |
| 5 | การคิด stock_kg — อัปเดตอัตโนมัติเมื่อ PO/Sale Lot หรือ manual? |

---

## Appendix A: Business Terminology

| ไทย | English | Description |
|-----|---------|-------------|
| สาขา | Branch | สถานที่รับซื้อ/ขายของเก่า (มี 4 แห่ง) |
| ใบรับซื้อ | Purchase Order (PO) | เอกสารบันทึกการรับซื้อสินค้าจากผู้ขาย |
| ผู้ขาย | Seller | บุคคลที่นำของมาขายให้ร้าน |
| หมวดหมู่ | Category | ประเภทสินค้า (เศษเหล็ก, ทองแดง, ขวด, ฯลฯ) |
| สภาพของ | Condition | สภาวะของสินค้า (ดี, พอใช้, ชำรุด) |
| ราคา Tier | Tier Price | ระดับราคารับซื้อ (บิล 1, บิล 2, บิล 3) |
| น้ำหนักสุทธิ | Effective Quantity | น้ำหนักหลังหัก deduction ตามสภาพ |
| การขาย Lot | Sale Lot | การขายสินค้าเป็นจำนวนมากในครั้งเดียว |
| FIFO | FIFO | First-In-First-Out — ตัดต้นทุนจากของเก่าสุดก่อน |
| ค่าใช้จ่าย | Business Expense | ค่าใช้จ่ายดำเนินงาน (ค่าเช่า, ค่าน้ำ, ค่าไฟ) |
| รายรับจริง | Actual Revenue | รายรับที่ได้รับจริงหลังหักค่าใช้จ่ายแฝง |
| โอนสต็อก | Stock Transfer | การย้ายสินค้าระหว่างสาขา |
| แบล็คลิสต์ | Blacklist | รายชื่อผู้ขายที่ไม่รับซื้อ |
| กระดานราคา | Price Board | ป้ายแสดงราคารับซื้อหน้าร้าน |

---

*End of Clean Room Specification v1.0*
*สร้างจาก reverse engineering ของระบบ production (SoloCorp POS 4 สาขา)*
*ไม่มีการอ้างอิง source code ใดๆ ทั้งสิ้น*
