import { PrismaClient, Prisma } from "../generated/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding Lekk POS Database...\n");

  // ─── 1. Admin User ────────────────────────────────────
  const passwordHash = await hash("admin123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@lekk.app" },
    update: {},
    create: {
      email: "admin@lekk.app",
      name: "ผู้ดูแลระบบ",
      passwordHash,
      role: "ADMIN",
      phone: "080-000-0001",
      isActive: true,
    },
  });
  console.log(`✅ Admin user: ${admin.email} (${admin.role})`);

  // ─── 2. Manager User ──────────────────────────────────
  const mgrHash = await hash("manager123", 12);
  const manager = await prisma.user.upsert({
    where: { email: "manager@lekk.app" },
    update: {},
    create: {
      email: "manager@lekk.app",
      name: "ผู้จัดการ",
      passwordHash: mgrHash,
      role: "MANAGER",
      phone: "080-000-0002",
      isActive: true,
    },
  });
  console.log(`✅ Manager user: ${manager.email}`);

  // ─── 3. Cashier User ──────────────────────────────────
  const cashHash = await hash("cashier123", 12);
  const cashier = await prisma.user.upsert({
    where: { email: "cashier@lekk.app" },
    update: {},
    create: {
      email: "cashier@lekk.app",
      name: "พนักงานขาย",
      passwordHash: cashHash,
      role: "CASHIER",
      phone: "080-000-0003",
      isActive: true,
    },
  });
  console.log(`✅ Cashier user: ${cashier.email}`);

  // ─── 4. Branch ─────────────────────────────────────────
  const branch = await prisma.branch.upsert({
    where: { code: "HQ" },
    update: {},
    create: {
      name: "สำนักงานใหญ่",
      code: "HQ",
      address: "123 ถนนสุขุมวิท กรุงเทพฯ",
      phone: "02-000-0000",
      isActive: true,
    },
  });
  // Assign users to branch
  await prisma.user.updateMany({ where: { branchId: null }, data: { branchId: branch.id } });
  console.log(`✅ Branch: ${branch.name} (${branch.code})`);

  // ─── 5. Categories ─────────────────────────────────────
  const catData = [
    { id: "cat-metal", name: "โลหะ", desc: "เหล็ก ทองแดง อลูมิเนียม" },
    { id: "cat-plastic", name: "พลาสติก", desc: "พลาสติกทุกประเภท" },
    { id: "cat-paper", name: "กระดาษ", desc: "กระดาษลัง หนังสือ" },
    { id: "cat-electronics", name: "อิเล็กทรอนิกส์", desc: "อุปกรณ์ไฟฟ้า อิเล็กทรอนิกส์" },
  ];
  for (const c of catData) {
    await prisma.category.upsert({
      where: { id: c.id },
      update: {},
      create: { id: c.id, name: c.name, description: c.desc, isActive: true },
    });
  }
  console.log(`✅ Categories: ${catData.length} created`);

  // ─── 6. Products ───────────────────────────────────────
  const products = [
    { id: "prod-fe", name: "เหล็กเส้น", barcode: "8850001000001", sku: "FE-001", cat: "cat-metal", unit: "กก.", bp: 8.00, sp: 12.00, min: 100 },
    { id: "prod-al", name: "อลูมิเนียมแผ่น", barcode: "8850001000002", sku: "AL-001", cat: "cat-metal", unit: "กก.", bp: 35.00, sp: 50.00, min: 50 },
    { id: "prod-cu", name: "ทองแดงเส้น", barcode: "8850001000003", sku: "CU-001", cat: "cat-metal", unit: "กก.", bp: 180.00, sp: 250.00, min: 20 },
    { id: "prod-hdpe", name: "พลาสติก HDPE", barcode: "8850001000004", sku: "PL-001", cat: "cat-plastic", unit: "กก.", bp: 5.00, sp: 8.00, min: 200 },
    { id: "prod-pp", name: "พลาสติก PP", barcode: "8850001000005", sku: "PL-002", cat: "cat-plastic", unit: "กก.", bp: 4.00, sp: 7.00, min: 200 },
    { id: "prod-cardboard", name: "กระดาษลัง", barcode: "8850001000006", sku: "PA-001", cat: "cat-paper", unit: "กก.", bp: 2.00, sp: 4.00, min: 500 },
    { id: "prod-pcb", name: "แผงวงจรอิเล็กทรอนิกส์", barcode: "8850001000007", sku: "EL-001", cat: "cat-electronics", unit: "กก.", bp: 45.00, sp: 70.00, min: 30 },
  ];
  for (const p of products) {
    await prisma.product.upsert({
      where: { id: p.id },
      update: {},
      create: {
        id: p.id, name: p.name, barcode: p.barcode, sku: p.sku,
        categoryId: p.cat, unit: p.unit,
        buyPrice: new Prisma.Decimal(p.bp), sellPrice: new Prisma.Decimal(p.sp),
        minStock: p.min, isActive: true,
      },
    });
  }
  console.log(`✅ Products: ${products.length} created`);

  // ─── 7. Inventory Lots ─────────────────────────────────
  const lotData = [
    { lc: "LOT-FE-001", pid: "prod-fe", qty: 500, av: 480, cond: "GOOD" as const, bp: 8.00, sp: 12.00 },
    { lc: "LOT-AL-001", pid: "prod-al", qty: 200, av: 200, cond: "GOOD" as const, bp: 35.00, sp: 50.00 },
    { lc: "LOT-CU-001", pid: "prod-cu", qty: 50, av: 50, cond: "GOOD" as const, bp: 180.00, sp: 250.00 },
    { lc: "LOT-HDPE-001", pid: "prod-hdpe", qty: 1000, av: 850, cond: "FAIR" as const, bp: 5.00, sp: 8.00 },
    { lc: "LOT-PA-001", pid: "prod-cardboard", qty: 2000, av: 1500, cond: "POOR" as const, bp: 2.00, sp: 4.00 },
  ];
  for (const lot of lotData) {
    await prisma.lot.upsert({
      where: { lotCode_branchId: { lotCode: lot.lc, branchId: branch.id } },
      update: {},
      create: {
        lotCode: lot.lc, productId: lot.pid, branchId: branch.id,
        quantity: lot.qty, availableQty: lot.av, condition: lot.cond,
        buyPrice: new Prisma.Decimal(lot.bp), sellPrice: new Prisma.Decimal(lot.sp),
        createdById: admin.id,
      },
    });
  }
  console.log(`✅ Lots: ${lotData.length} created`);

  // ─── 8. Purchase Order ─────────────────────────────────
  const feLot = await prisma.lot.findFirst({ where: { lotCode: "LOT-FE-001" } });
  if (feLot) {
    await prisma.purchaseOrder.create({
      data: {
        orderCode: "PO-20260621-001",
        sellerName: "นายสมชาย ใจดี",
        sellerPhone: "081-234-5678",
        totalAmount: new Prisma.Decimal(4000),
        netAmount: new Prisma.Decimal(4000),
        paymentMethod: "CASH",
        status: "COMPLETED",
        createdById: admin.id,
        items: {
          create: [{
            productId: "prod-fe", lotId: feLot.id,
            quantity: 500, unitPrice: new Prisma.Decimal(8),
            totalPrice: new Prisma.Decimal(4000), condition: "GOOD",
          }],
        },
      },
    });
    console.log(`✅ Purchase Order: PO-20260621-001`);
  }

  // ─── 9. Sale Order ─────────────────────────────────────
  if (feLot) {
    await prisma.saleOrder.create({
      data: {
        orderCode: "SO-20260621-001",
        customerName: "ร้านก่อสร้างทองเจริญ",
        customerPhone: "082-345-6789",
        totalAmount: new Prisma.Decimal(960),
        netAmount: new Prisma.Decimal(960),
        paymentMethod: "BANK_TRANSFER",
        status: "COMPLETED",
        createdById: admin.id,
        items: {
          create: [{
            productId: "prod-fe", lotId: feLot.id,
            quantity: 80, unitPrice: new Prisma.Decimal(12),
            totalPrice: new Prisma.Decimal(960),
          }],
        },
      },
    });
    console.log(`✅ Sale Order: SO-20260621-001`);
  }
  console.log("\n🎉 Seeding complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
