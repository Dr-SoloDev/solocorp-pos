"use client";

import { SessionProvider } from "next-auth/react";
import { TRPCProvider } from "@/trpc/provider";
import DashboardShell from "@/lib/components/shell/DashboardShell";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <TRPCProvider>
        <DashboardShell>{children}</DashboardShell>
      </TRPCProvider>
    </SessionProvider>
  );
}
