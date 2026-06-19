const { env } = process;

export default {
  DATABASE_URL: env.DATABASE_URL ?? "postgresql://solocorp:solocorp@localhost:5432/solocorp_pos",
  NEXTAUTH_URL: env.NEXTAUTH_URL ?? "http://localhost:3000",
  NEXTAUTH_SECRET: env.NEXTAUTH_SECRET ?? "change-me-in-production-solocorp-pos-secret-key",
  NEXT_PUBLIC_APP_URL: env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  NEXT_PUBLIC_API_URL: env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000/api",
};
