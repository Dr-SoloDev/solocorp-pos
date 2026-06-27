"use client";

import { Search, Filter } from "lucide-react";
import { cn } from "@lekk/ui";
import type { SaleLotStatus } from "@/lib/api-bridge/types";

interface FilterBarProps {
  search: string;
  onSearchChange: (_: string) => void;
  statusFilter: SaleLotStatus | "";
  onStatusFilterChange: (_: SaleLotStatus | "") => void;
  dateFrom: string;
  onDateFromChange: (_: string) => void;
  dateTo: string;
  onDateToChange: (_: string) => void;
  showFilters: boolean;
  onToggleFilters: () => void;
}

export function FilterBar({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  dateFrom,
  onDateFromChange,
  dateTo,
  onDateToChange,
  showFilters,
  onToggleFilters,
}: FilterBarProps) {
  return (
    <div className="space-y-md">
      {/* Search Row */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-steel-400 pointer-events-none" />
          <input
            type="text"
            placeholder="ค้นหาเลขที่อ้างอิง, ผู้ซื้อ..."
            className="w-full h-10 pl-9 pr-3 rounded-md border border-steel-200 bg-white text-sm placeholder:text-steel-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <button
          onClick={onToggleFilters}
          className={cn(
            "min-h-touch min-w-touch flex items-center justify-center rounded-md border transition-colors",
            showFilters
              ? "bg-primary text-white border-primary"
              : "border-steel-200 text-steel-500 hover:bg-steel-100"
          )}
          aria-label="ตัวกรอง"
        >
          <Filter className="w-4 h-4" />
        </button>
      </div>

      {/* Expandable Filters */}
      {showFilters && (
        <div className="bg-white border border-steel-200 rounded-lg p-md space-y-md animate-slide-down">
          <div className="grid grid-cols-2 gap-md">
            {/* Status Filter */}
            <div>
              <label className="block text-caption font-medium text-steel-500 mb-1">
                สถานะ
              </label>
              <select
                className="w-full h-10 rounded-md border border-steel-200 bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                value={statusFilter}
                onChange={(e) =>
                  onStatusFilterChange(e.target.value as SaleLotStatus | "")
                }
              >
                <option value="">ทั้งหมด</option>
                <option value="draft">ร่าง</option>
                <option value="confirmed">ยืนยันแล้ว</option>
                <option value="cancelled">ยกเลิก</option>
              </select>
            </div>

            {/* Date From */}
            <div>
              <label className="block text-caption font-medium text-steel-500 mb-1">
                วันที่เริ่มต้น
              </label>
              <input
                type="date"
                className="w-full h-10 rounded-md border border-steel-200 bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                value={dateFrom}
                onChange={(e) => onDateFromChange(e.target.value)}
              />
            </div>

            {/* Date To */}
            <div>
              <label className="block text-caption font-medium text-steel-500 mb-1">
                วันที่สิ้นสุด
              </label>
              <input
                type="date"
                className="w-full h-10 rounded-md border border-steel-200 bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                value={dateTo}
                onChange={(e) => onDateToChange(e.target.value)}
              />
            </div>

            {/* Clear Filters */}
            <div className="flex items-end">
              <button
                onClick={() => {
                  onStatusFilterChange("");
                  onDateFromChange("");
                  onDateToChange("");
                  onSearchChange("");
                }}
                className="h-10 px-3 text-caption text-primary hover:text-primary-dark transition-colors font-medium"
              >
                ล้างตัวกรอง
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
