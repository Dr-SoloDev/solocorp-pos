"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationBarProps {
  page: number;
  totalPages: number;
  total: number;
  onPageChange: (_: number) => void;
}

export function PaginationBar({
  page,
  totalPages,
  total,
  onPageChange,
}: PaginationBarProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-steel-200 rounded-b-lg">
      <span className="text-caption text-steel-500">
        ทั้งหมด {total} รายการ
      </span>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="min-h-touch min-w-touch flex items-center justify-center rounded-md text-steel-500 hover:bg-steel-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label="ก่อนหน้า"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-caption font-medium text-steel-700 px-2">
          {page} / {totalPages}
        </span>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="min-h-touch min-w-touch flex items-center justify-center rounded-md text-steel-500 hover:bg-steel-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label="ถัดไป"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
