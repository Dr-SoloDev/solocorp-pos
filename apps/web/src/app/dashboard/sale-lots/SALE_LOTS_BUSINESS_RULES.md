# Sale Lots — Business Rules (from Old PHP System)

## Source Files Analyzed
- `code/customizations/api/Controllers/SaleLotsController.php` (288 lines)
- `code/customizations/api/Models/SaleLot.php` (725 lines)
- `code/base-pos/api/Controllers/SalesController.php` (207 lines) — base POS sales

## 1. Core Concept

Sale Lots represent bulk sales of inventory to recyclers/factories (ศูนย์ใหญ่/โรงงาน).
Unlike retail sales (1–5 items per transaction), a Sale Lot can contain many categories
of scrap material in a single transaction, all sold in kilograms.

## 2. Status Workflow (State Machine)

```
DRAFT ───→ CONFIRMED ───→ CANCELLED
  │            │
  └── edit     ├── record actual revenue
  └── delete   └── edit (restore→update→deduct)
```

### Transitions
| From | To | Allowed? | Effect |
|------|-----|----------|--------|
| DRAFT | CONFIRMED | ✅ Admin/Manager | Recalculates FIFO cost, deducts stock |
| CONFIRMED | CANCELLED | ✅ Admin/Manager | Restores stock (LIFO unwind) |
| DRAFT | CANCELLED | ❌ Must confirm first | — |
| CONFIRMED | DRAFT | ❌ | — |

### Actions per Status
- **DRAFT**: edit, delete, confirm
- **CONFIRMED**: record revenue, cancel, edit (special path: restore→update→deduct)
- **CANCELLED**: view only, delete

## 3. Data Model (MySQL — Old PHP)

### sale_lots table
| Field | Type | Notes |
|-------|------|-------|
| id | INT PK | Auto-increment |
| reference_no | VARCHAR(50) | Format: `SO-{BRANCH_CODE}-YYYYMMDD-NNN` |
| branch_id | INT FK | → branches |
| buyer_name | VARCHAR(200) | Buyer name (required) |
| sale_date | DATE | Sale date |
| total_amount | DECIMAL | `SUM(items.quantity_kg * items.unit_price)` |
| total_cost | DECIMAL | FIFO-calculated COGS |
| profit | GENERATED | `total_amount - total_cost` (stored GENERATED column) |
| actual_revenue | DECIMAL NULL | Real revenue received (may differ from total_amount) |
| actual_revenue_note | TEXT | Note for revenue adjustment |
| actual_revenue_date | DATE | When revenue was received |
| expenses | JSON | Array of `{description, amount}` |
| status | ENUM | 'draft', 'confirmed', 'cancelled' |
| notes | TEXT | |
| created_by | INT | FK → users |
| updated_by | INT | FK → users |
| created_at | DATETIME | |
| updated_at | DATETIME | |

### sale_lot_items table
| Field | Type | Notes |
|-------|------|-------|
| id | INT PK | |
| sale_lot_id | INT FK | → sale_lots |
| catalog_id | INT NULL | → purchase_item_catalog |
| item_name | VARCHAR(200) | Denormalized name |
| category_id | INT FK | → categories |
| quantity_kg | DECIMAL | Weight in kg |
| unit_price | DECIMAL | Price per kg |
| subtotal | GENERATED | `quantity_kg * unit_price` |
| fifo_cost | DECIMAL | FIFO-calculated cost for this line |

## 4. FIFO Costing Logic

### cost_method per Branch
- Each branch has a `cost_method` column: `'fifo'` (default) or `'weighted'`
- Set in `branches.cost_method` ENUM

### FIFO Algorithm (calculateFifoCost)
1. Query `purchase_order_items` that have remaining stock (quantity - consumed_qty > 0)
2. Filter by `branch_id` + `category_id`, status = 'completed'
3. ORDER BY `po.created_at ASC` (oldest first)
4. Walk through rows, taking min(available, remaining) from each
5. Cost = Σ (taken_kg × unit_price)
6. Throws if insufficient stock

### Weighted Average (calculateWeightedAvgCost)
1. Total available qty = SUM(quantity - consumed_qty)
2. Total value = SUM((quantity - consumed_qty) × unit_price)
3. Avg price = total_value / total_qty
4. Cost = avg_price × requested_quantity
5. Throws if insufficient stock

### Stock Deduction (deductStock)
- On CONFIRMED: decreases `categories.stock_kg` AND updates `purchase_order_items.consumed_qty`
- Uses `FOR UPDATE` row lock + atomic `SET consumed_qty = consumed_qty + ? WHERE consumed_qty + ? <= quantity`
- Prevents double-deduction (race condition)

### Stock Restore (restoreStock)
- On CANCELLED: increases `categories.stock_kg` AND decreases `purchase_order_items.consumed_qty`
- Atomic: `SET consumed_qty = consumed_qty - ? WHERE consumed_qty >= ?`

## 5. Reference Number Format
- Format: `SO-{BRANCH_CODE}-YYYYMMDD-NNN`
- Example: `SO-BKK-20260621-001`
- Sequential per branch per day (MAX+1 to prevent race conditions)
- Branch code comes from `branches.code`

## 6. Access Control
| Action | Allowed Roles |
|--------|---------------|
| List | All authenticated users |
| View detail | All (scoped to own branch for non-admin) |
| Create | Admin, Manager |
| Edit | Admin, Manager |
| Delete | Admin, Manager (DRAFT or CANCELLED only) |
| Confirm | Admin, Manager |
| Cancel | Admin, Manager |
| Record Revenue | Admin, Manager |

## 7. Security Rules
- Non-admin users are **forced** to their own branch scope
- Non-admin users **cannot** view/edit lots from other branches
- Admin users can view/edit all branches
- Delete only allowed for DRAFT or CANCELLED status
- Status transitions validated server-side (cannot skip states)
- `FOR UPDATE` row locks prevent TOCTOU race conditions

## 8. API Endpoints (Old PHP)
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | /sale-lots | List with filters (?branch_id=&status=&date_from=&date_to=) |
| GET | /sale-lots/sale-lot?id= | Get single lot with items + profit_breakdown |
| POST | /sale-lots | Create (branch_id, buyer_name, sale_date, items[], notes) |
| PUT | /sale-lots/sale-lot?id= | Update |
| POST | /sale-lots/confirm?id= | Confirm (draft→confirmed) |
| POST | /sale-lots/cancel?id= | Cancel (confirmed→cancelled) + restore stock |
| POST | /sale-lots/record-revenue?id= | Record actual revenue |
| DELETE | /sale-lots/sale-lot?id= | Delete (draft/cancelled only) |

## 9. Bridge Client API (TypeScript — New System)
Already defined in `@/lib/api-bridge/sale-lots.ts`:
- `saleLotsApi.getAll(params?)` — paginated list
- `saleLotsApi.getById(id)` — single lot with items
- `saleLotsApi.create(data)` — create draft
- `saleLotsApi.update(id, data)` — update (draft only)
- `saleLotsApi.remove(id)` — delete (draft/cancelled only)
- `saleLotsApi.confirm(id)` — confirm → deduct stock
- `saleLotsApi.cancel(data)` — cancel → restore stock
- `saleLotsApi.recordRevenue(data)` — record actual revenue

## 10. Mapping to New Prisma Schema

| Old PHP (MySQL) | New Prisma (PostgreSQL) | Notes |
|----------------|------------------------|-------|
| sale_lots | Lot (model) | New unified model with lotCode, availableQty, FIFO tracking |
| sale_lot_items | SaleItem (model) | Has lotId FK → Lot |
| purchase_order_items.consumed_qty | Lot.availableQty | FIFO tracking via availableQty |
| categories.stock_kg | — | Handled via Lot aggregation |
| — | PurchaseItem.lotId | FK from purchase to lot for cost tracking |

The new Prisma model `Lot` has:
- `lotCode` + `branchId` (unique compound) — replaces reference_no
- `availableQty` — tracks remaining unsold quantity (FIFO)
- `condition` — GOOD/FAIR/POOR
- Relations: purchaseItems, saleItems, adjustments
