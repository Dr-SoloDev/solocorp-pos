"use client";

import { useState, useEffect, useMemo } from "react";
import { Search, X } from "lucide-react";
import { apiBridge } from "@/lib/api-bridge";
import type { ProductDTO } from "@/lib/api-bridge/types";

export default function ProductPicker({
  onSelect,
  onClose,
}: {
  onSelect: (_: ProductDTO) => void;
  onClose: () => void;
}) {
  const [items, setItems] = useState<ProductDTO[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    apiBridge.inventory
      .getProducts({ limit: 200 })
      .then((res) => setItems(res.data))
      .catch(() => setError("ไม่สามารถโหลดสินค้าได้"))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(
    () =>
      search
        ? items.filter(
            (i) =>
              (i.name || "").toLowerCase().includes(search.toLowerCase()) ||
              (i.category_name || "").toLowerCase().includes(search.toLowerCase())
          )
        : items,
    [items, search]
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex items-end sm:items-center sm:justify-center">
      <div className="bg-white w-full sm:max-w-md sm:rounded-xl rounded-t-xl max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-steel-200">
          <h3 className="text-sm font-semibold text-steel-800">
            เลือกสินค้าจากคลัง
          </h3>
          <button
            onClick={onClose}
            className="text-steel-400 hover:text-steel-600 p-1 min-h-touch"
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
              placeholder="ค้นหาสินค้าในคลัง..."
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
              ไม่พบสินค้าในคลัง
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
                  disabled={item.quantity <= 0}
                  className="w-full text-left px-4 py-3.5 hover:bg-steel-50 active:bg-steel-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1 mr-2">
                      <p className="text-sm font-medium text-steel-800 truncate">
                        {item.name}
                      </p>
                      <p className="text-xs text-steel-400 mt-0.5">
                        {item.category_name || "ทั่วไป"}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p
                        className={`text-sm font-semibold ${
                          item.quantity > 0
                            ? "text-primary"
                            : "text-steel-400"
                        }`}
                      >
                        คงเหลือ {item.quantity} {item.unit}
                      </p>
                      {item.quantity <= 0 && (
                        <p className="text-[10px] text-danger mt-0.5">
                          สินค้าหมด
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
