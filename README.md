# Lekk (เหล็ก)

ระบบรับซื้อของเก่า สำหรับคนขายของเก่า

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 14 (App Router) + TypeScript |
| **API Layer** | tRPC (type-safe, no REST endpoints) |
| **ORM** | Prisma + PostgreSQL 16 |
| **Styling** | TailwindCSS v3 + Design Tokens |
| **Auth** | NextAuth.js v5 (Auth.js) with JWT + RBAC |
| **Package Manager** | pnpm (monorepo with Turborepo) |
| **Deploy** | Docker Compose |

## Project Structure

```
solocorp-pos/
├── apps/
│   └── web/              # Next.js App Router (POS frontend)
├── packages/
│   ├── db/               # Prisma schema + client
│   ├── auth/             # Auth.js config
│   ├── ui/               # Shared UI components (shadcn/ui style)
│   ├── validators/       # Zod schemas (shared)
│   └── config/           # Shared config (env, constants)
├── tooling/              # ESLint, Prettier, TypeScript configs
├── docker/               # Docker Compose + Dockerfiles
├── design-system/        # Design tokens, brand guide, mockups
└── docs/                 # Project documentation
```

## Prerequisites

- **Node.js** >= 18 (ใช้ v20 แนะนำ)
- **pnpm** >= 9 (ติดตั้ง: `npm install -g pnpm` หรือ `corepack enable && corepack prepare pnpm@latest --activate`)
- **Docker** && **Docker Compose** (สำหรับ PostgreSQL)

## Quick Start

### 1. Clone & Install

```bash
git clone <repo-url> solocorp-pos
cd solocorp-pos
pnpm install
```

### 2. Setup Environment

```bash
cp .env.example .env
# แก้ไข .env ถ้าต้องการเปลี่ยนค่า
```

### 3. Start Database (Docker)

```bash
docker compose -f docker/docker-compose.yml up -d postgres
```

### 4. Setup Database Schema

```bash
# Generate Prisma client
pnpm db:generate

# Push schema to database (สำหรับ dev — ใช้ migrate ใน production)
pnpm db:push

# หรือใช้ migration
pnpm db:migrate
```

### 5. Start Dev Server

```bash
pnpm dev
```

เปิด `http://localhost:3000`

## Development

### Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start all apps in dev mode |
| `pnpm build` | Build all packages + apps |
| `pnpm lint` | Lint all projects |
| `pnpm db:generate` | Generate Prisma client |
| `pnpm db:push` | Push schema to DB (dev) |
| `pnpm db:migrate` | Run Prisma migrations |
| `pnpm db:studio` | Open Prisma Studio (DB GUI) |
| `pnpm format` | Format code with Prettier |

### Docker Compose Services

| Service | Port | Description |
|---------|------|-------------|
| PostgreSQL | 5432 | Database |
| Adminer | 8080 | Database admin UI |
| App | 3000 | Next.js dev server |

```bash
# Start all services
docker compose -f docker/docker-compose.yml up -d

# View logs
docker compose -f docker/docker-compose.yml logs -f

# Stop all
docker compose -f docker/docker-compose.yml down
```

### Adminer

Open `http://localhost:8080` — login with:
- **System:** PostgreSQL
- **Server:** postgres
- **Username:** solocorp
- **Password:** (from .env หรือ `solocorp_dev_pass`)
- **Database:** solocorp_pos

## Architecture

### tRPC API

All API calls go through tRPC (no REST endpoints). The tRPC router is defined in `apps/web/src/trpc/`:

- `router.ts` — Root app router
- `trpc.ts` — TRPC context + auth middleware
- `routers/` — Feature routers (auth, product, purchase, sale, inventory, category)

### Auth

- NextAuth.js v5 with JWT sessions
- Credentials provider (email + password)
- RBAC: ADMIN, MANAGER, CASHIER, VIEWER
- Auth routes: `/api/auth/*`
- Login page: `/auth/login`

### Database (Prisma)

- PostgreSQL 16 with Prisma ORM
- Schema: `packages/db/prisma/schema.prisma`
- Auto-generated client in `packages/db/generated/`
- Models: User, Product, Category, Lot (inventory), PurchaseOrder, SaleOrder, etc.

## Design System

Design tokens และ Brand Guide อยู่ที่ `design-system/`:
- `tailwind.config.js` — Design token definitions
- `brand-guide.md` — Complete brand guide
- `mockups/` — HTML mockups

## License

Private — Lekk
