import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { prisma } from "@solocorp/db";

export const saleRouter = router({
  getAll: protectedProcedure.query(async () => {
    return prisma.saleOrder.findMany({
      include: {
        items: {
          include: { product: true },
        },
        createdBy: {
          select: { id: true, name: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }),
});
