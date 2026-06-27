import { z } from "zod";
import { router, protectedProcedure, adminProcedure } from "../trpc";
import { prisma } from "@lekk/db";

export const productRouter = router({
  getAll: protectedProcedure.query(async () => {
    return prisma.product.findMany({
      where: { isActive: true },
      include: { category: true },
      orderBy: { name: "asc" },
    });
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      return prisma.product.findUnique({
        where: { id: input.id },
        include: { category: true, lots: true },
      });
    }),

  search: protectedProcedure
    .input(z.object({ query: z.string() }))
    .query(async ({ input }) => {
      return prisma.product.findMany({
        where: {
          isActive: true,
          OR: [
            { name: { contains: input.query, mode: "insensitive" } },
            { barcode: { contains: input.query } },
            { sku: { contains: input.query } },
          ],
        },
        take: 20,
      });
    }),

  create: adminProcedure
    .input(z.object({
      name: z.string(),
      barcode: z.string().optional(),
      sku: z.string().optional(),
      description: z.string().optional(),
      categoryId: z.string().optional(),
      unit: z.string().default("ชิ้น"),
      buyPrice: z.number().positive().optional(),
      sellPrice: z.number().positive().optional(),
      minStock: z.number().int().min(0).default(0),
    }))
    .mutation(async ({ input }) => {
      return prisma.product.create({ data: input });
    }),

  update: adminProcedure
    .input(z.object({
      id: z.string(),
      data: z.object({
        name: z.string().optional(),
        barcode: z.string().optional(),
        sku: z.string().optional(),
        description: z.string().optional(),
        categoryId: z.string().optional(),
        unit: z.string().optional(),
        buyPrice: z.number().positive().optional(),
        sellPrice: z.number().positive().optional(),
        minStock: z.number().int().min(0).optional(),
        isActive: z.boolean().optional(),
      }),
    }))
    .mutation(async ({ input }) => {
      return prisma.product.update({
        where: { id: input.id },
        data: input.data,
      });
    }),
});
