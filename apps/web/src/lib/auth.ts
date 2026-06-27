import { auth } from "@lekk/auth";

// Server-side helper to get current user in RSC
export async function getCurrentUser() {
  const session = await auth();
  return session?.user ?? null;
}
