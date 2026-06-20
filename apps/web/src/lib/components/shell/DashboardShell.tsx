/**
 * SoloCorp POS — Dashboard Shell Layout
 * =======================================
 * Mobile-first Shell Layout พร้อม Bottom Navigation + Header
 *
 * Design System: Industrial Modern
 * - Bottom Nav: 5 items แบบ mobile-first
 * - Header: logo + branch selector + user menu
 * - Content area: scrollable, pb-20 (space สำหรับ Bottom Nav)
 *
 * Responsive:
 *   320-639px  → Bottom Nav (labels ซ่อน หรือ condensed)
 *   640-768px  → Bottom Nav + Sidebar (collapsed)
 *   769px+     → Sidebar (ขยาย) + Bottom Nav (ซ่อน)
 *
 * @phase 1
 * @module app/(dashboard)/layout
 */

"use client";

import { Suspense } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SessionProvider } from "next-auth/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  BarChart3,
  MoreHorizontal,
  ChevronDown,
  User,
} from "lucide-react";

// ─── React Query Client ──────────────────────────────────────────────────────

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: any) => {
        if (error?.status === 401 || error?.status === 403) return false;
        return failureCount < 3;
      },
      staleTime: 30 * 1000,
      gcTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
});

// ─── Navigation Items ────────────────────────────────────────────────────────

interface NavItem {
  label: string;
  labelMobile?: string;
  path: string;
  icon: React.ReactNode;
  auth?: "admin" | "manager" | "cashier" | "any";
  badge?: boolean;
}

const bottomNavItems: NavItem[] = [
  {
    label: "หน้าแรก",
    path: "/",
    icon: <LayoutDashboard className="w-6 h-6" />,
    auth: "any",
  },
  {
    label: "รับซื้อ",
    path: "/purchases",
    icon: <ShoppingCart className="w-6 h-6" />,
    auth: "manager",
  },
  {
    label: "คลัง",
    path: "/inventory",
    icon: <Package className="w-6 h-6" />,
    auth: "any",
    badge: true,
  },
  {
    label: "รายงาน",
    path: "/reports",
    icon: <BarChart3 className="w-6 h-6" />,
    auth: "any",
  },
  {
    label: "เพิ่มเติม",
    path: "/more",
    icon: <MoreHorizontal className="w-6 h-6" />,
    auth: "any",
  },
];

// ─── Shell Header ────────────────────────────────────────────────────────────

function ShellHeader() {
  return (
    <header className="sticky top-0 z-40 bg-steel-900 text-white h-12 flex items-center px-lg gap-md">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-sm shrink-0">
        <div className="w-8 h-8 rounded bg-primary-600 flex items-center justify-center">
          <span className="text-sm font-bold font-display">SC</span>
        </div>
        <h1 className="text-sm font-semibold font-display hidden sm:block">
          SoloCorp POS
        </h1>
      </Link>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Branch Selector */}
      <button
        type="button"
        className="flex items-center gap-xs text-steel-200 hover:text-white transition-colors text-xs px-sm py-1 rounded hover:bg-steel-800 min-h-touch"
      >
        <span className="hidden sm:inline">สาขาหลัก</span>
        <span className="sm:hidden">หลัก</span>
        <ChevronDown className="w-3.5 h-3.5" />
      </button>

      {/* User Menu */}
      <button
        type="button"
        className="flex items-center gap-xs text-steel-200 hover:text-white transition-colors text-xs px-sm py-1 rounded hover:bg-steel-800 min-h-touch"
      >
        <User className="w-4 h-4" />
        <span className="hidden sm:inline">ผู้ใช้</span>
      </button>
    </header>
  );
}

// ─── Bottom Navigation ───────────────────────────────────────────────────────

function BottomNav() {
  const pathname = usePathname();

  const isActive = (item: NavItem) => {
    if (item.path === "/") return pathname === "/";
    return pathname.startsWith(item.path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-steel-200 safe-area-bottom">
      <ul className="flex items-center justify-around h-16">
        {bottomNavItems.map((item) => {
          const active = isActive(item);
          return (
            <li key={item.path}>
              <Link
                href={item.path}
                className={`
                  flex flex-col items-center justify-center min-w-[72px] min-h-touch
                  text-[10px] font-medium transition-all duration-200
                  px-2 py-1 rounded-sm
                  ${
                    active
                      ? "text-primary-600 bg-primary-50"
                      : "text-steel-500 hover:text-steel-700 hover:bg-steel-50"
                  }
                `}
              >
                <span className="relative">
                  {item.icon}
                  {item.badge && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-danger-500 rounded-full" />
                  )}
                </span>
                <span className="mt-0.5 truncate max-w-[60px]">
                  {item.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

// ─── Dashboard Loading Skeleton ──────────────────────────────────────────────

function DashboardSkeleton() {
  return (
    <div className="animate-pulse p-lg space-y-xl">
      <div className="h-8 bg-steel-200 rounded w-1/3" />
      <div className="grid grid-cols-2 gap-md">
        <div className="h-24 bg-steel-200 rounded-lg" />
        <div className="h-24 bg-steel-200 rounded-lg" />
      </div>
      <div className="h-48 bg-steel-200 rounded-lg" />
    </div>
  );
}

// ─── Main Shell Layout ───────────────────────────────────────────────────────

interface DashboardShellProps {
  children: React.ReactNode;
}

export default function DashboardShell({ children }: DashboardShellProps) {
  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <div className="min-h-screen bg-steel-50 font-sans">
          {/* Header */}
          <ShellHeader />

          {/* Content Area */}
          <main className="pb-20 max-w-screen-sm mx-auto">
            <Suspense fallback={<DashboardSkeleton />}>
              {children}
            </Suspense>
          </main>

          {/* Bottom Navigation */}
          <BottomNav />
        </div>
      </QueryClientProvider>
    </SessionProvider>
  );
}
