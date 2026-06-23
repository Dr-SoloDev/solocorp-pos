"use client";

import { useState, useEffect, useMemo } from "react";
import { apiBridge } from "@/lib/api-bridge";
import type { CatalogItemDTO, TierPriceDTO } from "@/lib/api-bridge/types";
import { formatCurrency } from "@/lib/utils";
import { Search, X } from "lucide-react";

export function CatalogItemPicker({
  onSelect,
  onClose,
}: {
  onSelect: (_: CatalogItemDTO) => void;
  onClose: () => void;
}) {
  const [catalog, setCatalog] = useState<CatalogItemDTO[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    apiBridge.catalog
      .getAllItems({ limit: 200 })
      .then((res) => setCatalog(res.data))
      .catch(() => setError("ไม่สามารถโหลดรายการสินค้าได้"))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(
    () =>
      search
        ? catalog.filter(
            (c) =>
              c.name.toLowerCase().includes(search.toLowerCase()) ||
              c.code.toLowerCase().includes(search.toLowerCase())
          )
        : catalog,
    [catalog, search]
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex items-end sm:items-center sm:justify-center">
      <div className="bg-white w-full sm:max-w-md sm:rounded-xl rounded-t-xl max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-steel-200">
          <h3 className="text-sm font-semibold text-steel-800">เลือกสินค้า</h3>
          <button
            onClick={onClose}
            className="text-steel-400 hover:text-steel-600 p-1 min-h-touch min-w-touch flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-3 border-b border-steel-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-steel-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ค้นหาสินค้า..."
              className="w-full pl-9 pr-3 py-2 text-sm bg-steel-50 border border-steel-200 rounded-lg focus:border-primary focus:outline-none"
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-8 text-center text-sm text-steel-400">
              กำลังโหลด...
            </div>
          ) : error ? (
            <div className="p-8 text-center text-sm text-danger">{error}</div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-sm text-steel-400">
              ไม่พบสินค้า
            </div>
          ) : (
            <div className="divide-y divide-steel-50">
              {filtered.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelect(item);
                    onClose();
                  }}
                  className="w-full text-left px-4 py-3.5 hover:bg-steel-50 active:bg-steel-100 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1 mr-2">
                      <p className="text-sm font-medium text-steel-800 truncate">
                        {item.name}
                      </p>
                      <p className="text-xs text-steel-400 mt-0.5">
                        {item.category_name || "ทั่วไป"} · {item.default_unit}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-semibold text-primary">
                        {formatCurrency(item.default_price)}
                      </p>
                      <p className="text-[10px] text-steel-400">/{item.default_unit}</p>
                    </div>
                  </div>

                  {/* Tier prices */}
                  {item.tier_prices && item.tier_prices.length > 0 && (
                    <div className="flex gap-1.5 mt-2 flex-wrap">
                      {item.tier_prices.map((tier: TierPriceDTO) => (
                        <span
                          key={tier.label}
                          className="text-[10px] px-1.5 py-0.5 bg-steel-100 text-steel-500 rounded"
                        >
                          {tier.label}: {formatCurrency(tier.price)}
                        </span>
                      ))}
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
