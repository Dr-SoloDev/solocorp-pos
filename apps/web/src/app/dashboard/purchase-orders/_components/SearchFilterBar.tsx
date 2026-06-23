"use client";

import { useState } from "react";
import { Search, X, Filter } from "lucide-react";

export function SearchFilterBar({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
}: {
  searchQuery: string;
  onSearchChange: (_: string) => void;
  statusFilter: string;
  onStatusChange: (_: string) => void;
}) {
  const [showFilter, setShowFilter] = useState(false);

  return (
    <div className="sticky top-12 z-30 bg-steel-50 pt-3 pb-2 px-lg space-y-2">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-steel-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="ค้นหาเลขที่ใบรับซื้อ, ผู้ขาย..."
          className="w-full pl-9 pr-9 py-2.5 bg-white border border-steel-200 rounded-lg text-sm placeholder:text-steel-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary min-h-input"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 min-h-touch min-w-touch flex items-center justify-center"
          >
            <X className="w-4 h-4 text-steel-400" />
          </button>
        )}
      </div>

      {/* Filter Row */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setShowFilter(!showFilter)}
          className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-md border transition-colors min-h-touch ${
            statusFilter
              ? "bg-primary-50 border-primary text-primary"
              : "bg-white border-steel-200 text-steel-600 hover:bg-steel-50"
          }`}
        >
          <Filter className="w-3.5 h-3.5" />
          ตัวกรอง
          {statusFilter && <span className="ml-1 w-1.5 h-1.5 rounded-full bg-primary" />}
        </button>

        <div className="flex gap-1.5 flex-wrap">
          {["", "active", "cancelled"].map((s) => {
            const label =
              s === "" ? "ทั้งหมด" : s === "active" ? "ดำเนินการ" : "ยกเลิก";
            const isActive = statusFilter === s;
            return (
              <button
                key={s}
                onClick={() => onStatusChange(s)}
                className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors min-h-touch ${
                  isActive
                    ? "bg-primary text-white border-primary"
                    : "bg-white border-steel-200 text-steel-600 hover:bg-steel-50"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
