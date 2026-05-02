"use client";

import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, ChevronDown, ChevronUp, Clock, Loader2, Search, XCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { apiFetch, ApiError } from "@/lib/admin/api-client";

type OrderItem = {
  id: string;
  order_id: string;
  course_id: string;
  course_title_snapshot: string;
  price_vnd: number;
  access_duration_days: number | null;
};

type OrderUser = {
  id: string;
  full_name: string | null;
  email: string | null;
} | null;

type AdminOrder = {
  id: string;
  order_code: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  total_vnd: number;
  status: "pending" | "paid" | "approved" | "cancelled" | "refunded";
  created_at: string;
  payment_method: string | null;
  payment_reference: string | null;
  items: OrderItem[];
  user: OrderUser;
};

function formatVnd(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(value: string) {
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? value : d.toLocaleString("vi-VN");
}

type OrdersPagePayload = {
  items: AdminOrder[];
  total: number;
  page: number;
  pageSize: number;
};

function ordersListUrl(
  page: number,
  pageSize: number,
  filter: "all" | "pending" | "approved",
  q: string,
  sortBy: "created_at" | "total_vnd" | "customer_name" | "status",
  sortDir: "asc" | "desc",
) {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("pageSize", String(pageSize));
  params.set("status", filter);
  const trimmed = q.trim();
  if (trimmed) params.set("q", trimmed);
  params.set("sort", sortBy);
  params.set("dir", sortDir);
  return `/api/admin/orders?${params.toString()}`;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "pending" | "approved">("all");
  const [sortBy, setSortBy] = useState<"created_at" | "total_vnd" | "customer_name" | "status">("created_at");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [confirmOrder, setConfirmOrder] = useState<AdminOrder | null>(null);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [cancelTargetId, setCancelTargetId] = useState<string | null>(null);
  const [cancelDialogError, setCancelDialogError] = useState<string | null>(null);

  useEffect(() => {
    if (searchInput === debouncedSearch) return;
    const t = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setPage(1);
    }, 350);
    return () => clearTimeout(t);
  }, [searchInput, debouncedSearch]);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<OrdersPagePayload>(
        ordersListUrl(page, pageSize, filter, debouncedSearch, sortBy, sortDir),
      );
      setOrders(data.items as AdminOrder[]);
      setTotal(data.total);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Không thể tải danh sách đơn hàng.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, filter, debouncedSearch, sortBy, sortDir]);

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  const handleSort = (next: "created_at" | "total_vnd" | "customer_name" | "status") => {
    if (sortBy === next) {
      setSortDir((dir) => (dir === "asc" ? "desc" : "asc"));
      return;
    }
    setSortBy(next);
    setSortDir("desc");
    setPage(1);
  };

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const SortMark = ({ active }: { active: boolean }) => (
    <span className={`ml-1 inline-flex flex-col leading-none ${active ? "text-[#c0392b]" : "text-gray-300"}`}>
      <ChevronUp size={10} className={active && sortDir === "asc" ? "opacity-100" : "opacity-50"} />
      <ChevronDown size={10} className={`-mt-0.5 ${active && sortDir === "desc" ? "opacity-100" : "opacity-50"}`} />
    </span>
  );

  function getStatusMeta(status: AdminOrder["status"]) {
    if (status === "approved") {
      return {
        label: "Đã Duyệt",
        cls: "bg-green-50 text-green-600",
        icon: <CheckCircle2 size={11} />,
      };
    }
    if (status === "paid") {
      return {
        label: "Đã Thanh Toán",
        cls: "bg-blue-50 text-blue-700",
        icon: <CheckCircle2 size={11} />,
      };
    }
    if (status === "cancelled" || status === "refunded") {
      return {
        label: status === "cancelled" ? "Đã Hủy" : "Đã Hoàn Tiền",
        cls: "bg-red-50 text-red-600",
        icon: <XCircle size={11} />,
      };
    }
    return {
      label: "Chờ Duyệt",
      cls: "bg-orange-50 text-orange-600",
      icon: <Clock size={11} />,
    };
  }

  async function handleApprove(order: AdminOrder) {
    setApprovingId(order.id);
    setError(null);

    try {
      const updated = await apiFetch<AdminOrder>(`/api/admin/orders/${order.id}/approve`, {
        method: "POST",
      });

      setOrders((prev) => prev.map((item) => (item.id === order.id ? { ...item, ...updated, status: "approved" } : item)));
      setConfirmOrder(null);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Không thể duyệt đơn hàng.";
      setError(message);
    } finally {
      setApprovingId(null);
    }
  }

  async function executeCancelOrder(orderId: string) {
    setCancellingId(orderId);
    setError(null);
    setCancelDialogError(null);

    try {
      await apiFetch(`/api/admin/orders/${orderId}/cancel`, { method: "POST" });
      setOrders((prev) => prev.map((item) => (item.id === orderId ? { ...item, status: "cancelled" } : item)));
      setCancelTargetId(null);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Không thể hủy đơn hàng.";
      setCancelDialogError(message);
    } finally {
      setCancellingId(null);
    }
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="font-heading font-black text-2xl text-gray-900">Quản Lý Đơn Hàng</h1>
        <p className="mt-1 text-sm text-gray-500">
          Đơn PayOS được kích hoạt tự động. Duyệt / hủy phía dưới chủ yếu phục vụ đơn chuyển khoản cũ (sẽ gỡ khi chỉ còn PayOS).
        </p>
      </div>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Tìm mã đơn, tên, email..."
            className="w-full rounded-sm border border-gray-200 bg-white py-2.5 pl-9 pr-4 text-sm focus:border-[#c0392b] focus:outline-none"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {[
            { value: "all", label: "Tất Cả" },
            { value: "pending", label: "Chờ Duyệt" },
            { value: "approved", label: "Đã Duyệt" },
          ].map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => {
                setFilter(item.value as typeof filter);
                setPage(1);
              }}
              className={`rounded-sm border px-4 py-2.5 text-xs font-semibold transition-colors ${
                filter === item.value
                  ? "border-[#c0392b] bg-[#c0392b] text-white"
                  : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
              }`}
            >
              {item.label}
            </button>
          ))}
          <label className="ml-auto flex items-center gap-2 text-xs text-gray-500">
            <span className="hidden sm:inline">Hiển thị</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              className="rounded-sm border border-gray-200 bg-white py-2 pl-2 pr-8 text-xs font-semibold text-gray-700"
            >
              <option value={10}>10 / trang</option>
              <option value={20}>20 / trang</option>
              <option value={50}>50 / trang</option>
              <option value={100}>100 / trang</option>
            </select>
          </label>
        </div>
      </div>

      {error ? (
        <div className="mb-4 rounded-sm border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      ) : null}

      <div className="overflow-hidden rounded-sm border border-gray-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Mã Đơn
                </th>
                <th className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">
                  <button type="button" onClick={() => handleSort("customer_name")} className="inline-flex w-full items-center justify-start hover:text-gray-600">
                    Khách Hàng
                    <SortMark active={sortBy === "customer_name"} />
                  </button>
                </th>
                <th className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Khóa Học
                </th>
                <th className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">
                  <button type="button" onClick={() => handleSort("total_vnd")} className="inline-flex w-full items-center justify-start hover:text-gray-600">
                    Số Tiền
                    <SortMark active={sortBy === "total_vnd"} />
                  </button>
                </th>
                <th className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">
                  <button type="button" onClick={() => handleSort("status")} className="inline-flex w-full items-center justify-start hover:text-gray-600">
                    Trạng Thái
                    <SortMark active={sortBy === "status"} />
                  </button>
                </th>
                <th className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">
                  <button type="button" onClick={() => handleSort("created_at")} className="inline-flex w-full items-center justify-start hover:text-gray-600">
                    Thời Gian
                    <SortMark active={sortBy === "created_at"} />
                  </button>
                </th>
                <th className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Hành Động
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-sm text-gray-500">
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="size-4 animate-spin" />
                      Đang tải đơn hàng...
                    </span>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-sm text-gray-500">
                    Không có đơn hàng phù hợp.
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const isApproved = order.status === "approved";
                  // PayOS paid = đã tự động cấp enrollment, không cần admin duyệt
                  const isPayosPaid = order.status === "paid" && order.payment_method === "payos";
                  const isFinished = isApproved || isPayosPaid || order.status === "cancelled" || order.status === "refunded";
                  const statusMeta = getStatusMeta(order.status);
                  const courseTitle = order.items.map((i) => i.course_title_snapshot).join(", ") || "—";
                  return (
                    <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="px-5 py-3 font-mono text-xs text-gray-500">{order.order_code}</td>
                      <td className="px-5 py-3">
                        <div className="font-semibold text-gray-900">{order.customer_name}</div>
                        <div className="text-xs text-gray-400">{order.customer_email}</div>
                      </td>
                      <td className="px-5 py-3 text-xs text-gray-600">{courseTitle}</td>
                      <td className="whitespace-nowrap px-5 py-3 font-semibold text-gray-900">{formatVnd(order.total_vnd)}</td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-1 text-xs font-semibold ${statusMeta.cls}`}>
                          {statusMeta.icon}
                          {statusMeta.label}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-5 py-3 text-xs text-gray-400">{formatDate(order.created_at)}</td>
                      <td className="px-5 py-3">
                        {!isFinished ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setConfirmOrder(order)}
                              className="whitespace-nowrap rounded-sm bg-[#c0392b] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#96281b]"
                            >
                              Duyệt Đơn
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setCancelDialogError(null);
                                setCancelTargetId(order.id);
                              }}
                              disabled={cancellingId === order.id}
                              className="whitespace-nowrap rounded-sm border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
                            >
                              Hủy
                            </button>
                          </div>
                        ) : isPayosPaid ? (
                          <span className="text-xs text-emerald-600 font-medium">Đã thanh toán PayOS</span>
                        ) : order.status === "cancelled" ? (
                          <span className="text-xs text-red-400">Đã hủy</span>
                        ) : order.status === "refunded" ? (
                          <span className="text-xs text-red-400">Đã hoàn tiền</span>
                        ) : (
                          <span className="text-xs text-gray-300">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 px-5 py-3 text-sm text-gray-600">
          <span>
            {total === 0
              ? "0 đơn"
              : `${(page - 1) * pageSize + 1}–${Math.min(page * pageSize, total)} / ${total} đơn`}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1 || loading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-sm border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 disabled:opacity-40"
            >
              Trước
            </button>
            <span className="tabular-nums text-xs">
              Trang {page} / {totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages || loading}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-sm border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 disabled:opacity-40"
            >
              Sau
            </button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={cancelTargetId !== null}
        onOpenChange={(open) => {
          if (!open) {
            setCancelTargetId(null);
            setCancelDialogError(null);
          }
        }}
        title="Hủy đơn hàng?"
        description="Bạn có chắc muốn hủy đơn này? Hành động không thể hoàn tác; học viên sẽ không còn trạng thái chờ thanh toán trên đơn này."
        confirmLabel="Hủy đơn"
        cancelLabel="Quay lại"
        tone="danger"
        loading={cancelTargetId !== null && cancellingId === cancelTargetId}
        error={cancelDialogError}
        onConfirm={async () => {
          if (cancelTargetId) await executeCancelOrder(cancelTargetId);
        }}
      />

      <Dialog open={!!confirmOrder} onOpenChange={() => setConfirmOrder(null)}>
        <DialogContent className="max-w-sm gap-6 p-6 sm:p-8">
          <DialogHeader className="space-y-1 pb-1">
            <DialogTitle className="font-heading font-bold text-gray-900">Xác Nhận Duyệt Đơn</DialogTitle>
          </DialogHeader>
          {confirmOrder ? (
            <div className="space-y-5">
              <div className="space-y-2 rounded-sm border border-gray-200 bg-gray-50 p-4 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-gray-500">Mã đơn:</span>
                  <span className="font-mono text-xs font-semibold text-gray-900">{confirmOrder.order_code}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-gray-500">Học viên:</span>
                  <span className="text-right font-semibold text-gray-900">{confirmOrder.customer_name}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-gray-500">Số tiền:</span>
                  <span className="font-bold text-[#c0392b]">{formatVnd(confirmOrder.total_vnd)}</span>
                </div>
              </div>
              <p className="text-sm text-gray-500">
                Sau khi duyệt, học viên sẽ được <strong className="text-gray-900">tự động cấp quyền truy cập</strong> vào khóa học.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setConfirmOrder(null)}
                  disabled={approvingId === confirmOrder.id}
                  className="flex-1 rounded-sm border border-gray-200 py-2.5 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  onClick={() => void handleApprove(confirmOrder)}
                  disabled={approvingId === confirmOrder.id}
                  className="flex flex-1 items-center justify-center gap-2 rounded-sm bg-[#c0392b] py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#96281b] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {approvingId === confirmOrder.id ? <Loader2 className="size-4 animate-spin" /> : null}
                  Duyệt Đơn
                </button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
