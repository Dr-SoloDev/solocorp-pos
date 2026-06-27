# Rebrand Plan: Solocorp POS → Lekk (เหล็ก)

> **Report created:** 25 June 2026
> **Source project:** `/home/drsolodev/solocorp-pos`
> **New brand name:** **Lekk** (เหล็ก)
> **New npm scope:** `@lekk`

---

## 1. ภาพรวม

โปรเจกต์เป็น monorepo POS สำหรับร้านรับซื้อของเก่า สร้างด้วย **Next.js 14 + tRPC + Prisma + pnpm/Turborepo** มีทั้งหมด **9 workspace packages** และ **Web App** หนึ่งตัว

---

## 2. หมวดหมู่ไฟล์ที่ต้องเปลี่ยน

### 2.1 🔴 CRITICAL — Scope `@solocorp/*` (11 ไฟล์หลัก + หลายไฟล์ย่อย)

กลุ่มนี้ถ้าไม่เปลี่ยน **build จะพัง**

| #   | ไฟล์                               | สิ่งที่ต้องเปลี่ยน                                                             |
| --- | ---------------------------------- | ------------------------------------------------------------------------------ |
| 1   | `package.json` (root)              | `name: "solocorp-pos"` → `"lekk"`, `description`, 5× `@solocorp/db` ใน scripts |
| 2   | `apps/web/package.json`            | `name: "@solocorp/web"` → `"@lekk/web"`, 6× workspace deps                     |
| 3   | `packages/db/package.json`         | `name: "@solocorp/db"` → `"@lekk/db"`, tsconfig dep                            |
| 4   | `packages/auth/package.json`       | `name: "@solocorp/auth"` → `"@lekk/auth"`, 2× workspace deps                   |
| 5   | `packages/ui/package.json`         | `name: "@solocorp/ui"` → `"@lekk/ui"`, tsconfig dep                            |
| 6   | `packages/config/package.json`     | `name: "@solocorp/config"` → `"@lekk/config"`, tsconfig dep                    |
| 7   | `packages/validators/package.json` | `name: "@solocorp/validators"` → `"@lekk/validators"`, tsconfig dep            |
| 8   | `tooling/eslint/package.json`      | `name: "@solocorp/eslint-config"` → `"@lekk/eslint-config"`                    |
| 9   | `tooling/prettier/package.json`    | `name: "@solocorp/prettier-config"` → `"@lekk/prettier-config"`                |
| 10  | `tooling/typescript/package.json`  | `name: "@solocorp/typescript-config"` → `"@lekk/typescript-config"`            |
| 11  | `apps/web/next.config.js`          | 6× `@solocorp/*` ใน transpilePackages + optimizePackageImports                 |

**6 tsconfig.json files** (extends `@solocorp/typescript-config` → `@lekk/typescript-config`):

- `packages/db/tsconfig.json`, `packages/ui/tsconfig.json`, `packages/config/tsconfig.json`
- `packages/validators/tsconfig.json`, `packages/auth/tsconfig.json`, `apps/web/tsconfig.json`

**17+ source files** มี `import … from "@solocorp/*"`:

- `apps/web/src/lib/auth.ts` (1)
- `apps/web/src/trpc/trpc.ts` (1)
- `apps/web/src/middleware.ts` (1)
- `apps/web/src/trpc/routers/{category,inventory,purchase,sale,product}.ts` (5)
- `apps/web/src/app/api/auth/[...nextauth]/route.ts` (1)
- `apps/web/src/app/dashboard/sale-lots/page.tsx` (1)
- `apps/web/src/app/dashboard/sale-lots/_components/{ActionModal,SaleLotDetail,ToastContainer,FilterBar,SummaryStats,StatusBadge}.tsx` (6)
- `packages/auth/src/index.ts` (1)

**2 Dockerfiles** — `pnpm -F @solocorp/db db:generate`:

- `docker/Dockerfile` (line 24)
- `docker/Dockerfile.dev` (line 19)

**pnpm-lock.yaml** — จะ regenerate อัตโนมัติเมื่อรัน `pnpm install` ใหม่

---

### 2.2 🟡 BRANDING — ข้อความ "SoloCorp POS" / "solocorp" (≈30 ไฟล์)

| หมวด                   | ไฟล์                                                   | จำนวนจุด                                          |
| ---------------------- | ------------------------------------------------------ | ------------------------------------------------- |
| **README**             | `README.md`                                            | 3+ (title, structure tree, license)               |
| **Brand Guide**        | `design-system/brand-guide.md`                         | 5+ (หัว, brand DNA, logo section ทั้งหมด)         |
| **Mockups**            | `design-system/mockups/{dashboard,sale,purchase}.html` | 4                                                 |
| **Metadata**           | `apps/web/src/app/layout.tsx`                          | 2 (title.default, title.template)                 |
| **Login Page**         | `apps/web/src/app/auth/login/page.tsx`                 | 2 (h1, footer)                                    |
| **PWA Manifest**       | `apps/web/src/lib/pwa/manifest.ts`                     | 4 (name, short_name, file header ×2)              |
| **Service Worker**     | `apps/web/src/lib/pwa/serviceWorker.ts`                | 2 (file header, CACHE_NAME)                       |
| **Dashboard Shell**    | `apps/web/src/lib/components/shell/DashboardShell.tsx` | 3 (file header, "SoloCorp POS", logo "SC")        |
| **Config**             | `packages/config/src/index.ts`                         | 2 (APP_NAME, INTERNAL_BARCODE_PREFIX "SC")        |
| **Seed**               | `packages/db/src/seed.ts`                              | 4 (console.log, 3× email @solocorp.app)           |
| **API Bridge headers** | `apps/web/src/lib/api-bridge/*.ts` (13 ไฟล์)           | 13 (file headers)                                 |
| **Middleware header**  | `apps/web/src/middleware.ts`                           | 1 (file header)                                   |
| **Manifest route**     | `apps/web/src/app/manifest.json/route.ts`              | 1 (file header)                                   |
| **Bridge route**       | `apps/web/src/app/api/bridge/[...path]/route.ts`       | 1 (file header)                                   |
| **Docker init SQL**    | `docker/init-db.sql`                                   | 1 (comment)                                       |
| **Docker Compose**     | `docker/docker-compose.yml`                            | 5 (3× container_name, POSTGRES_USER, POSTGRES_DB) |
| **Env files**          | `.env.example`, `.env` (ถ้ามี)                         | 3 (DATABASE_URL, NEXTAUTH_SECRET)                 |
| **env.mjs**            | `apps/web/src/env.mjs`                                 | 1 (NEXTAUTH_SECRET default)                       |
| **Docs**               | `docs/ARCHITECTURE_KICKOFF.md`, `docs/CODE-REVIEW.md`  | 2                                                 |
| **API Spec**           | `docs/specs/api-bridge-spec.md`                        | 3+ (title, spec body, mock JSON)                  |
| **ORCH-PLAN**          | `ORCH-PLAN.md`                                         | 6+ (references ตลอด)                              |
| **env.local**          | `apps/web/.env.local`                                  | 1 (file header — skippable)                       |

---

### 2.3 🟢 DATABASE — เปลี่ยนชื่อ DB / User / Container

ไม่จำเป็นต้องเปลี่ยนก็ทำงานได้ แต่ถ้าจะ rebrand ให้หมด:

- **docker-compose.yml:** `POSTGRES_USER: solocorp` → `lekk`, `POSTGRES_DB: solocorp_pos` → `lekk_pos`
- **Container names:** `solocorp-db` → `lekk-db`, `solocorp-adminer` → `lekk-adminer`, `solocorp-app` → `lekk-app`
- **DATABASE_URL** ใน `.env` และ `env.mjs` (connstring, default secret)
- **Seed emails:** `admin@solocorp.app` → `admin@lekk.app` (หรือ domain จริง)

---

## 3. สรุปจำนวนโดยประมาณ

| ประเภท                              | จำนวนไฟล์    |
| ----------------------------------- | ------------ |
| package.json (name + dep scopes)    | 10           |
| tsconfig.json (extends)             | 6            |
| Source files (import paths)         | ~17          |
| next.config.js                      | 1            |
| Dockerfiles                         | 2            |
| **Subtotal (build-critical)**       | **~36 ไฟล์** |
| Branding text/docs/mockups          | ~30 ไฟล์     |
| **รวมทั้งหมดโดยประมาณ**             | **~66 ไฟล์** |
| จำนวนจุดเปลี่ยน (total occurrences) | **~140+**    |

---

## 4. ความเสี่ยง

| ความเสี่ยง                                      | ระดับ   | คำอธิบาย                                                    |
| ----------------------------------------------- | ------- | ----------------------------------------------------------- |
| **Build failure** ถ้า scope ไม่ match           | 🔴 สูง  | pnpm workspace resolution ล้มเหลว, import path ใช้การไม่ได้ |
| **OAuth callback URLs** ถ้าเปลี่ยน NEXTAUTH_URL | 🟡 กลาง | ต้อง sync กับ Auth provider                                 |
| **Prisma client** regenerate                    | 🟡 กลาง | ต้องรัน `pnpm db:generate` ใหม่หลังเปลี่ยน scope ทุกครั้ง   |
| **pnpm-lock.yaml** conflict                     | 🟡 กลาง | ถ้าทำ rebrand พร้อมกันกับ feature branch อื่น               |
| **Cache invalidation**                          | 🟢 ต่ำ  | service worker cache name, localStorage keys                |
| **favicon / PWA icons**                         | 🟢 ต่ำ  | แค่เปลี่ยนชื่อ app, assets ใช้ได้เหมือนเดิม                 |
| **Docker volume** ถ้าเปลี่ยน DB name            | 🟡 กลาง | ข้อมูลเก่าอยู่ใน volume `pgdata` ต้อง migrate หรือสร้างใหม่ |

---

## 5. ลำดับการเปลี่ยนที่แนะนำ

### Phase 1 — Core build paths (ทำพร้อมกันเป็น atomic commit)

1. **Rename all `@solocorp/*` → `@lekk/*`** ใน package.json files (10 ไฟล์)
2. **Update all import paths** ใน source files (~17 ไฟล์)
3. **Update tsconfig.json** extends paths (6 ไฟล์)
4. **Update next.config.js** (1 ไฟล์)
5. **Update Dockerfiles** (2 ไฟล์)
6. **Update root package.json** scripts (5 commands)
7. **Root `name`** จาก `solocorp-pos` → `lekk`
8. **รัน `pnpm install`** เพื่อ rebuild lock file
9. **รัน `pnpm build`** เพื่อ verify

### Phase 2 — Branding & UI text

1. **Metadata:** `apps/web/src/app/layout.tsx` (title)
2. **PWA:** `manifest.ts` (name, short_name)
3. **Login screen:** `login/page.tsx` (h1, footer)
4. **Dashboard shell:** `DashboardShell.tsx` (header title, logo "SC")
5. **Config:** `packages/config/src/index.ts` (APP_NAME, barcode prefix)
6. **Service worker:** CACHE_NAME
7. **README.md + brand-guide.md**
8. **Design mockups** (3 HTML files)
9. **File headers:** API bridge files, middleware, routes (14+ ไฟล์)

### Phase 3 — Operational

1. **Seed data:** email domains, console.log messages
2. **Docker compose:** container names, user, DB name
3. **.env files:** DATABASE_URL, NEXTAUTH_SECRET
4. **Documentation:** docs/\*.md, ORCH-PLAN.md
5. **favicon** → เปลี่ยนเป็นโลโก้ "Lekk" (เหล็ก)

---

## 6. ข้อเสนอเพิ่มเติมสำหรับ Rebrand

### Logo & Visual Identity

- **Logo concept:** คำว่า "เหล็ก" หรือ "Lekk" — ใช้ฟอนต์หนา (Inter Bold) สี Primary Blue (#1A56DB)
- **Logo badge:** อักษรย่อ **Lk** แทน **SC** (DashboardShell header)
- **Favicon:** 🔩 (น็อต/bolt) หรือ ⚙️ (gear) — สื่อถึง metal/industrial แทน 💰 cash

### Tagline

- เปลี่ยนจาก "ระบบรับซื้อของเก่า สำหรับคนขายของเก่า"
- ข้อเสนอ: **"Lekk — ระบบจัดการร้านรับซื้อของเก่า"** หรือคงเดิมไว้

### Brand Color

- Industrial Modern palette เดิมใช้ได้ดีอยู่แล้ว — primary blue #1A56DB เข้ากับ concept "เหล็ก"
- หรือพิจารณาเพิ่ม **warm steel/orange accent** เพื่อสื่อถึงความร้อน/เหล็ก

### Domain

- `@solocorp.app` → `@lekk.app` หรือ `@lekk.industries`

### Barcode Prefix

- `SC` → `LK`

### App Title

- "Lekk POS" หรือ "Lekk" อย่างเดียว (สั้น จำง่าย)

### PWA Short Name

- `SoloCorp` → `Lekk`

---

## 7. Automation Suggestion

เนื่องจากมี ~140+ จุดเปลี่ยน แนะนำให้ใช้ **script automate** ด้วย sed/patch:

```bash
# แบบคร่าวๆ — sed replace scope ในทุก package.json
find . -name "package.json" -not -path "*/node_modules/*" -not -path "*/generated/*" \
  -exec sed -i 's/@solocorp/@lekk/g' {} +

# Replace import paths ใน .ts/.tsx
find . -name "*.ts" -o -name "*.tsx" | xargs grep -l "@solocorp" \
  | grep -v node_modules | grep -v generated \
  | xargs sed -i 's/@solocorp/@lekk/g'
```

แล้วค่อยตรวจสอบ manual สำหรับ branding text ที่ไม่ใช่ scope

---

## 8. สรุปโดยย่อ

- **Total files affected:** ~66 ไฟล์ (~140+ จุดเปลี่ยน)
- **Build-critical:** ~36 ไฟล์ (scopes, imports, tsconfig, Dockerfiles)
- **Estimated effort:** 1–2 ชั่วโมงกับ script automation, หรือ 3–4 ชั่วโมง manual
- **Risk level:** ปานกลาง (scope rename ถ้าทำครบจะ rebuild ได้ทันที ไม่มี遗留 issues)
- **Recommended approach:** Phase 1 (critical) → build verify → Phase 2 (branding) → Phase 3 (ops/docs)
