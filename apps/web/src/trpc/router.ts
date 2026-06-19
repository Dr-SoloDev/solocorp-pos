import { router } from "./trpc";
import { productRouter } from "./routers/product";
import { authRouter } from "./routers/auth";
import { purchaseRouter } from "./routers/purchase";
import { saleRouter } from "./routers/sale";
import { inventoryRouter } from "./routers/inventory";
import { categoryRouter } from "./routers/category";

export const appRouter = router({
  auth: authRouter,
  product: productRouter,
  purchase: purchaseRouter,
  sale: saleRouter,
  inventory: inventoryRouter,
  category: categoryRouter,
});

export type AppRouter = typeof appRouter;
