"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Clock, Loader2, Search } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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

export default function OrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "pending" | "approved">("all");
  const [confirmOrder, setConfirmOrder] = useState<AdminOrder | null>(null);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadOrders() {
      setLoading(true);
      setError(null);
      try {
        const data = await apiFetch<AdminOrder[]>("/api/admin/orders");
        if (!cancelled) setOrders(data);
      } catch (err) {
        const message = err instanceof ApiError ? err.message : "Không thể tải danh sách đơn hàng.";
        if (!cancelled) setError(message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadOrders();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    return orders.filter((order) => {
      const haystack = [
        order.order_code,
        order.customer_name,
        order.customer_email,
        order.user?.full_name ?? "",
        order.user?.email ?? "",
      ]
        .join(" ")
        .toLowerCase();

      const matchSearch = haystack.includes(search.toLowerCase().trim());
      const normalizedStatus = order.status === "approved" ? "approved" : "pending";
      const matchFilter = filter === "all" || normalizedStatus === filter;
      return matchSearch && matchFilter;
    });
  }, [orders, search, filter]);

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
        label: "Đã báo CK",
        cls: "bg-blue-50 text-blue-700",
        icon: <Clock size={11} />,
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

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="font-heading font-black text-2xl text-gray-900">Quản Lý Đơn Hàng</h1>
        <p className="mt-1 text-sm text-gray-500">Xem xét và duyệt đơn hàng chuyển khoản của học viên</p>
      </div>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm mã đơn, tên, email..."
            className="w-full rounded-sm border border-gray-200 bg-white py-2.5 pl-9 pr-4 text-sm focus:border-[#c0392b] focus:outline-none"
          />
        </div>
        <div className="flex gap-2">
          {[
            { value: "all", label: "Tất Cả" },
            { value: "pending", label: "Chờ Duyệt" },
            { value: "approved", label: "Đã Duyệt" },
          ].map((item) => (
            <button
              key={item.value}
              onClick={() => setFilter(item.value as typeof filter)}
              className={`rounded-sm border px-4 py-2.5 text-xs font-semibold transition-colors ${
                filter === item.value
                  ? "border-[#c0392b] bg-[#c0392b] text-white"
                  : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
              }`}
            >
              {item.label}
            </button>
          ))}
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
                {["Mã Đơn", "Khách Hàng", "Khóa Học", "Số Tiền", "Trạng Thái", "Thời Gian", "Hành Động"].map((h) => (
                  <th key={h} className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">
                    {h}
                  </th>
                ))}
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
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-sm text-gray-500">
                    Không có đơn hàng phù hợp.
                  </td>
                </tr>
              ) : (
                filtered.map((order) => {
                  const isApproved = order.status === "approved";
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
                        {!isApproved ? (
                          <button
                            onClick={() => setConfirmOrder(order)}
                            className="whitespace-nowrap rounded-sm bg-[#c0392b] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#96281b]"
                          >
                            Duyệt Đơn
                          </button>
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
      </div>

      <Dialog open={!!confirmOrder} onOpenChange={() => setConfirmOrder(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-heading font-bold text-gray-900">Xác Nhận Duyệt Đơn</DialogTitle>
          </DialogHeader>
          {confirmOrder ? (
            <div className="space-y-4">
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
