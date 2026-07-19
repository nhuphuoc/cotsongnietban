"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Search, Pencil, Trash2, Eye } from "lucide-react";
import { VoucherFormDialog } from "@/components/admin/voucher-form-dialog";

type VoucherItem = {
  id: string;
  code: string;
  description: string | null;
  discount_type: "percentage" | "fixed_amount" | "free";
  discount_value: number | null;
  max_uses: number | null;
  used_count: number;
  status: string;
  expires_at: string;
  starts_at: string | null;
  scope: string;
  is_public: boolean;
  created_at: string;
};

type PageData = {
  items: VoucherItem[];
  total: number;
  page: number;
  pageSize: number;
};

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  draft: { label: "Nháp", className: "bg-gray-100 text-gray-600" },
  active: { label: "Đang chạy", className: "bg-green-100 text-green-700" },
  paused: { label: "Tạm dừng", className: "bg-yellow-100 text-yellow-700" },
  expired: { label: "Hết hạn", className: "bg-red-100 text-red-600" },
};

const DISCOUNT_LABELS: Record<string, (v: number | null) => string> = {
  percentage: (v) => `${v ?? 0}%`,
  fixed_amount: (v) => `${(v ?? 0).toLocaleString("vi-VN")}₫`,
  free: () => "Miễn phí",
};

export default function AdminVouchersPage() {
  const [data, setData] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchVouchers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("pageSize", "20");
      if (search) params.set("search", search);
      if (statusFilter) params.set("status", statusFilter);

      const res = await fetch(`/api/admin/vouchers?${params}`);
      if (res.ok) {
        const json = await res.json();
        setData(json.data as PageData);
      }
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => {
    fetchVouchers();
  }, [fetchVouchers]);

  const totalPages = data ? Math.ceil(data.total / data.pageSize) : 1;

  async function handleDelete(id: string, code: string) {
    if (!confirm(`Xóa voucher "${code}"? Chỉ xóa được voucher nháp.`)) return;
    const res = await fetch(`/api/admin/vouchers/${id}`, { method: "DELETE" });
    if (res.ok) {
      fetchVouchers();
    } else {
      const json = await res.json();
      alert(json.error?.message ?? "Không thể xóa.");
    }
  }

  function formatDate(iso: string | null) {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">🎫 Quản lý Voucher</h1>
          <p className="text-sm text-gray-500 mt-1">Tạo và quản lý mã giảm giá cho khóa học.</p>
        </div>
        <button
          onClick={() => { setEditingId(null); setDialogOpen(true); }}
          className="flex items-center gap-2 rounded-md bg-[#c0392b] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#a93226] transition-colors"
        >
          <Plus size={16} /> Tạo voucher mới
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm theo mã code..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-3 py-2 rounded-md border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#c0392b]/20"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#c0392b]/20"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="draft">Nháp</option>
          <option value="active">Đang chạy</option>
          <option value="paused">Tạm dừng</option>
          <option value="expired">Hết hạn</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50 text-left">
                <th className="px-4 py-3 font-semibold text-gray-600">Code</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Giảm</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Đã dùng</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Hết hạn</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Trạng thái</th>
                <th className="px-4 py-3 font-semibold text-gray-600 w-20">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-gray-400">Đang tải...</td>
                </tr>
              )}
              {!loading && (!data || data.items.length === 0) && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-gray-400">
                    Chưa có voucher nào. Bấm &ldquo;Tạo voucher mới&rdquo; để bắt đầu.
                  </td>
                </tr>
              )}
              {data?.items.map((v) => {
                const st = STATUS_LABELS[v.status] ?? { label: v.status, className: "bg-gray-100" };
                const discountLabel = DISCOUNT_LABELS[v.discount_type]?.(v.discount_value) ?? "—";
                return (
                  <tr key={v.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-semibold text-gray-900">{v.code}</span>
                        {v.is_public && <Eye size={12} className="text-green-500" aria-label="Hiển thị công khai" />}
                      </div>
                      {v.description && <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[200px]">{v.description}</p>}
                    </td>
                    <td className="px-4 py-3 font-medium">{discountLabel}</td>
                    <td className="px-4 py-3 text-gray-500">
                      {v.used_count}{v.max_uses ? `/${v.max_uses}` : ""}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(v.expires_at)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${st.className}`}>
                        {st.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => { setEditingId(v.id); setDialogOpen(true); }}
                          className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600"
                          title="Sửa"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(v.id, v.code)}
                          disabled={v.status !== "draft"}
                          className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-500 disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Xóa"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <span className="text-xs text-gray-400">
              {data?.total ?? 0} voucher • Trang {page}/{totalPages}
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-3 py-1 text-xs rounded border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
              >
                Trước
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="px-3 py-1 text-xs rounded border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Dialog */}
      <VoucherFormDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditingId(null);
          fetchVouchers();
        }}
        editId={editingId}
      />
    </div>
  );
}
