/**
 * tRPC React Server Components client
 * This file is used for server-side tRPC calls in RSC
 */
import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "@/trpc/router";

export const api = createTRPCReact<AppRouter>();
