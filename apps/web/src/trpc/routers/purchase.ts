import { z } from "zod";
import { router, protectedProcedure, adminProcedure } from "../trpc";
import { prisma } from "@solocorp/db";

export const purchaseRouter = router({
  getAll: protectedProcedure.query(async () => {
    return prisma.purchaseOrder.findMany({
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

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      return prisma.purchaseOrder.findUnique({
        where: { id: input.id },
        include: {
          items: {
            include: { product: true, lot: true },
          },
          createdBy: {
            select: { id: true, name: true },
          },
        },
      });
    }),
});
