/**
 * SoloCorp POS — Database Seed
 * ===============================
 * Creates test users for development & testing.
 *
 * Usage:
 *   pnpm db:seed
 *   or: cd packages/db && npx tsx src/seed.ts
 *
 * @phase 1
 */

import { PrismaClient, UserRole } from "../generated/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...\n");

  // ─── Helper: hash password using dynamic import ───────────────────────
  // bcryptjs ESM/CJS compatibility: use createHash wrapper
  const { hashSync } = await import("bcryptjs");

  const hashPassword = (plain: string): string => hashSync(plain, 12);

  // ─── Test Users ───────────────────────────────────────────────────────

  const users = [
    {
      email: "admin@solocorp.com",
      name: "Admin User",
      password: "admin123",
      role: UserRole.ADMIN,
      phone: "081-000-0001",
      isActive: true,
    },
    {
      email: "manager@solocorp.com",
      name: "Manager User",
      password: "manager123",
      role: UserRole.MANAGER,
      phone: "081-000-0002",
      isActive: true,
    },
    {
      email: "cashier@solocorp.com",
      name: "Cashier User",
      password: "cashier123",
      role: UserRole.CASHIER,
      phone: "081-000-0003",
      isActive: true,
    },
    {
      email: "viewer@solocorp.com",
      name: "Viewer User",
      password: "viewer123",
      role: UserRole.VIEWER,
      phone: "081-000-0004",
      isActive: true,
    },
    {
      email: "inactive@solocorp.com",
      name: "Inactive User",
      password: "inactive123",
      role: UserRole.CASHIER,
      phone: "081-000-0005",
      isActive: false, // Cannot login — for testing disabled account
    },
  ];

  for (const userData of users) {
    const existing = await prisma.user.findUnique({
      where: { email: userData.email },
    });

    if (existing) {
      console.log(`  ⏭️   ${userData.email} — already exists, skipping`);
      continue;
    }

    const passwordHash = hashPassword(userData.password);

    const user = await prisma.user.create({
      data: {
        email: userData.email,
        name: userData.name,
        passwordHash,
        role: userData.role,
        phone: userData.phone,
        isActive: userData.isActive,
      },
    });

    console.log(
      `  ✅  ${user.email} (${user.role.toLowerCase()}) — password: ${userData.password}`,
    );
  }

  console.log("\n🎉 Seed complete!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  Test Credentials:");
  console.log("  ──────────────────────────────────────");
  console.log("  admin@solocorp.com    / admin123   (Admin)");
  console.log("  manager@solocorp.com  / manager123 (Manager)");
  console.log("  cashier@solocorp.com  / cashier123 (Cashier)");
  console.log("  viewer@solocorp.com   / viewer123  (Viewer)");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
}

main()
  .catch((e) => {
    console.error("\n❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
