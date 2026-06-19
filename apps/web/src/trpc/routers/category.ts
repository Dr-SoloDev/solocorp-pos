import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { prisma } from "@solocorp/db";

export const categoryRouter = router({
  getAll: protectedProcedure.query(async () => {
    return prisma.category.findMany({
      where: { isActive: true },
      include: {
        _count: { select: { products: true } },
      },
      orderBy: { name: "asc" },
    });
  }),
});
