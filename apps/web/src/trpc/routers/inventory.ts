import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { prisma } from "@solocorp/db";

export const inventoryRouter = router({
  getAll: protectedProcedure.query(async () => {
    return prisma.lot.findMany({
      where: { isActive: true },
      include: {
        product: true,
        branch: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }),

  getLowStock: protectedProcedure.query(async () => {
    const lots = await prisma.lot.findMany({
      where: { isActive: true },
      include: { product: true },
    });

    return lots.filter(
      (lot) => lot.availableQty <= lot.product.minStock,
    );
  }),
});
