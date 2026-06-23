"use client";

import { useState, useEffect, useMemo } from "react";
import { apiBridge } from "@/lib/api-bridge";
import type { SellerDTO } from "@/lib/api-bridge/types";
import { User, Search, ChevronDown } from "lucide-react";

export function SellerSelector({
  sellerId,
  sellerName,
  onChange,
}: {
  sellerId: number | null;
  sellerName: string;
  onChange: (_: number | null, __: string) => void;
}) {
  const [sellers, setSellers] = useState<SellerDTO[]>([]);
  const [search, setSearch] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!show) return;
    setLoading(true);
    apiBridge.sellers
      .getAll({ limit: 100 })
      .then((res) => setSellers(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [show]);

  const filtered = useMemo(
    () =>
      search
        ? sellers.filter(
            (s) =>
              s.full_name.toLowerCase().includes(search.toLowerCase()) ||
              s.phone.includes(search)
          )
        : sellers,
    [sellers, search]
  );

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-steel-700">
        ผู้ขาย / ลูกค้า
      </label>

      {sellerId ? (
        <div className="flex items-center justify-between bg-white rounded-lg p-3 shadow-card">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-primary" />
            <span className="font-medium text-steel-800">{sellerName}</span>
          </div>
          <button
            onClick={() => onChange(null, "")}
            className="text-sm text-steel-400 hover:text-danger min-h-touch px-2"
          >
            เปลี่ยน
          </button>
        </div>
      ) : (
        <div className="relative">
          <button
            onClick={() => setShow(!show)}
            className="w-full flex items-center justify-between bg-white border border-steel-200 rounded-lg px-4 py-3 text-left text-steel-400 min-h-touch"
          >
            <span>เลือกผู้ขาย</span>
            <ChevronDown className="w-4 h-4" />
          </button>

          {show && (
            <div className="absolute top-full left-0 right-0 z-40 mt-1 bg-white border border-steel-200 rounded-lg shadow-lg max-h-64 overflow-hidden">
              {/* search */}
              <div className="sticky top-0 bg-white border-b border-steel-100 p-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-steel-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="ค้นหาชื่อหรือเบอร์โทร..."
                    className="w-full pl-9 pr-3 py-2 text-sm bg-steel-50 border border-steel-200 rounded-md focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div className="overflow-y-auto max-h-48">
                {loading ? (
                  <div className="p-4 text-center text-sm text-steel-400">
                    กำลังโหลด...
                  </div>
                ) : filtered.length === 0 ? (
                  <div className="p-4 text-center text-sm text-steel-400">
                    ไม่พบผู้ขาย
                  </div>
                ) : (
                  filtered.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => {
                        onChange(s.id, s.full_name);
                        setShow(false);
                        setSearch("");
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-steel-50 border-b border-steel-50 last:border-0"
                    >
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-steel-400 shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-steel-800 truncate">
                            {s.full_name}
                          </p>
                          <p className="text-xs text-steel-400">
                            {s.phone}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
