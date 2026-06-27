# Lekk — Brand Guide 1-Pager

> **Project:** Lekk POS (รหัส: Bangkok)
> **Direction:** Industrial Modern
> **Version:** 1.0.0
> **วันที่:** 19 มิถุนายน 2569

---

## 🎨 Brand DNA

```
Lekk = Industrial Workshop Utility
══════════════════════════════════════
• Industrial — ไม่ใช่ ERP สำนักงาน: heavy border, เส้นหนา, dark steel
• Modern — Blue accent ตัดกับ dark surfaces
• Practical — Efficiency-first, information-dense
• Honest — ไม่มี decoration ที่ไม่มี function
```

## 🎯 Color Palette

### Primary Brand Colors

| Token | Hex | Usage |
|-------|-----|-------|
| **Primary** | `#1A56DB` | CTAs, key actions, active states |
| **Primary Dark** | `#1243AF` | Hover/pressed states |
| **Primary Light** | `#3B82F6` | Highlights, links (dark bg variant) |
| **Accent** | `#2563EB` | Secondary accent |

### Neutral Palette (Industrial Steel)

| Token | Hex | Usage |
|-------|-----|-------|
| **Steel 900** | `#111827` | Headings, primary text |
| **Steel 800** | `#1F2937` | Secondary text, dark surfaces |
| **Steel 600** | `#4B5563` | Muted text, labels |
| **Steel 400** | `#9CA3AF` | Placeholder, disabled |
| **Steel 200** | `#E5E7EB` | Borders, dividers |
| **Steel 100** | `#F3F4F6` | Hover states, light bg |
| **Steel 50** | `#F9FAFB` | Page background |
| **White** | `#FFFFFF` | Card surface, dialogs |

### Condition Colors (POS-specific)

| Condition | Hex | Badge | Usage |
|-----------|-----|-------|-------|
| **ดี (Good)** | `#059669` | 🟢 | สภาพดี |
| **พอใช้ (Fair)** | `#D97706` | 🟡 | สภาพพอใช้ |
| **ชำรุด (Poor)** | `#DC2626` | 🔴 | สภาพชำรุด |

### Semantic Colors

| Token | Hex | Usage |
|-------|-----|-------|
| **Success** | `#059669` | Purchase complete, save success |
| **Warning** | `#D97706` | Aging inventory, expiry alerts |
| **Danger** | `#DC2626` | Delete, errors, critical |
| **Info** | `#0284C7` | Information, tips |

### Dark Mode Variant (Future)

| Token | Light | Dark |
|-------|-------|------|
| BG | `#F9FAFB` | `#1A1B1E` |
| Surface | `#FFFFFF` | `#2A2B2E` |
| Border | `#E5E7EB` | `#3A3B3E` |
| Text | `#111827` | `#E5E7EB` |
| Primary | `#1A56DB` | `#3B82F6` |

---

## 🔤 Typography

### Font Family

- **English:** Inter (sans-serif) — ใช้สำหรับ UI ทั้งหมด
- **Thai:** Sarabun — ใช้สำหรับเนื้อหาภาษาไทย
- **Fallback:** system-ui, -apple-system, sans-serif

### Type Scale

```
Display   : 36px/2.25rem  → 700 (Headline pages)
Heading 1 : 30px/1.875rem → 700 (Section titles)
Heading 2 : 24px/1.5rem   → 600 (Card headers)
Heading 3 : 20px/1.25rem  → 600 (Sub-sections)
Heading 4 : 18px/1.125rem → 600 (Item titles)
Body      : 16px/1rem     → 400 (Content)
Body Small: 14px/0.875rem → 400 (Secondary)
Caption   : 12px/0.75rem  → 400 (Labels, hints)
Fine      : 10px/0.625rem → 400 (Tags, timestamps)
```

### Font Weights

| Weight | Name | Usage |
|--------|------|-------|
| 400 | Regular | Body text, paragraphs |
| 500 | Medium | Labels, buttons (ghost) |
| 600 | SemiBold | Buttons, subheadings |
| 700 | Bold | Headings, brand logo |

### Line Heights

- **Tight:** 1.15 (Headings)
- **Normal:** 1.5 (Body)
- **Relaxed:** 1.75 (Long text)

---

## 📐 Spacing System (4px Grid)

| Token | Pixels | Rem | Usage |
|-------|--------|-----|-------|
| **xs** | 4px | 0.25rem | Icon padding, fine adjustments |
| **sm** | 8px | 0.5rem | Between elements, small gaps |
| **md** | 12px | 0.75rem | Form spacing, card padding (tight) |
| **lg** | 16px | 1rem | Card padding, section gaps |
| **xl** | 24px | 1.5rem | Between sections |
| **2xl** | 32px | 2rem | Page padding, modal padding |
| **3xl** | 48px | 3rem | Major section breaks |
| **4xl** | 64px | 4rem | Page margins (desktop) |

### Layout Widths

| Breakpoint | Width | Layout |
|------------|-------|--------|
| Mobile | 0–639px | Single column, bottom nav |
| Tablet | 640–1023px | Side nav (collapsed), 2-column |
| Desktop | 1024–1439px | Persistent side nav, 2-3 column |
| Wide | 1440px+ | Full layout, data tables |

---

## 🔲 Corners & Borders

| Token | Value | Usage |
|-------|-------|-------|
| **rounded-sm** | 4px | Input fields, small elements |
| **rounded-md** | 6px | Cards, buttons |
| **rounded-lg** | 8px | Modals, drawers |
| **rounded-full** | 9999px | Badges, chips |

### Border Widths (Industrial Heavy)

| Token | Value | Usage |
|-------|-------|-------|
| **border** | 1px | Default divider |
| **border-2** | 2px | Active/focus states |
| **border-4** | 4px | Selected cards, emphasis |

---

## 🎯 Iconography

- **Library:** Lucide Icons (https://lucide.dev)
- **Style:** Outlined (stroke, not filled)
- **Size:** 16–24px (default 20px)
- **Stroke Width:** 1.5–2px (default 1.5)
- **Color:** Inherit text color beside it

### Core POS Icons

| Feature | Lucide Icon |
|---------|-------------|
| รับซื้อ (Purchase) | `shopping-cart` |
| ขาย (Sale) | `tag` |
| คลัง (Inventory) | `package` |
| รายงาน (Reports) | `bar-chart-3` |
| ผู้ขาย (Sellers) | `users` |
| ตั้งค่า (Settings) | `settings` |
| ตะกร้า (Cart) | `shopping-bag` |
| ชำระเงิน (Payment) | `wallet` |
| พิมพ์ (Print) | `printer` |
| ค้นหา (Search) | `search` |
| กล้อง (Camera) | `camera` |
| เครื่องชั่ง (Scale) | `weight` |
| QR Code | `qr-code` |
| ส่วนลด (Discount) | `percentage` |
| สาขา (Branch) | `store` |

---

## 📦 Logo & Brand Assets

```
Lekk
══════
**Brand Name:** Lekk (เหล็ก)
**Logo Type:** Text-based wordmark
**Font:** Inter Bold 700
**Color:** Primary Blue #1A56DB on light / #3B82F6 on dark
**Size (Header):** 20px (1.25rem)
**Spacing:** tracking-tight (-0.025em)
**Abbreviation (logo badge):** Lk

**Tagline (optional):**
  "ระบบรับซื้อของเก่า สำหรับคนขายของเก่า"
  Font: Sarabun 400, 14px, Steel 600

**Favicon:** Cash icon (💰) หรือ Lucide `wallet` icon

**Concept Logo Suggestion:**
  โลโก้รูปเหล็กเส้นหรือแท่งเหล็ก (steel bar) ตัดกับตัวอักษร Lekk
  เพื่อสื่อถึง "เหล็ก" และธุรกิจรับซื้อของเก่า
  — Minimal, industrial feel, ใช้เส้นหนา ๆ แบบ heavy stroke
```

---

## 🧩 Component Design Principles

1. **Information Density** — Maximize data per pixel, minimal whitespace waste
2. **Visual Hierarchy** — Primary actions prominent, secondary actions muted
3. **Touch-First (Mobile)** — 44px minimum tap targets, bottom nav, step wizards
4. **Keyboard-Friendly (Desktop)** — Support tab navigation, F-keys, numpad
5. **Condition Color Coding** — 🟢ดี / 🟡พอใช้ / 🔴ชำรุด throughout system
6. **Consistent Feedback** — Toast/Snackbar after every action

---

## 📋 Design Token Summary (Imports)

```css
/* TailwindCSS v3 custom config tokens */

/* Colors */
--color-primary: #1A56DB;
--color-primary-dark: #1243AF;
--color-primary-light: #3B82F6;
--color-steel-900: #111827;
--color-steel-800: #1F2937;
--color-steel-600: #4B5563;
--color-steel-400: #9CA3AF;
--color-steel-200: #E5E7EB;
--color-steel-100: #F3F4F6;
--color-steel-50: #F9FAFB;
--color-condition-good: #059669;
--color-condition-fair: #D97706;
--color-condition-poor: #DC2626;

/* Spacing (4px base) */
--space-xs: 4px;
--space-sm: 8px;
--space-md: 12px;
--space-lg: 16px;
--space-xl: 24px;
--space-2xl: 32px;
--space-3xl: 48px;

/* Typography */
--font-family: 'Inter', 'Sarabun', system-ui, sans-serif;
--font-mono: 'JetBrains Mono', 'Cascadia Code', monospace;

/* Border Radius */
--radius-sm: 4px;
--radius-md: 6px;
--radius-lg: 8px;

/* Shadows */
--shadow-card: 0 1px 3px rgba(0,0,0,0.08);
--shadow-dropdown: 0 4px 12px rgba(0,0,0,0.12);
--shadow-modal: 0 8px 24px rgba(0,0,0,0.16);
```
