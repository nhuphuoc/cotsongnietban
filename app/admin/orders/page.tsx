"use client";

import { useState } from "react";
import { CheckCircle2, Clock, Search, Eye } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const orders = [
  { id: "ORD001", user: "Nguyễn Thị Lan", email: "lan@gmail.com", phone: "0901234567", course: "Phục Hồi Lưng Cơ Bản", amount: "1,500,000đ", status: "pending", createdAt: "15/04/2024 09:30" },
  { id: "ORD002", user: "Trần Minh Tuấn", email: "tuan@gmail.com", phone: "0912345678", course: "Corrective Exercise Nâng Cao", amount: "3,500,000đ", status: "pending", createdAt: "15/04/2024 09:07" },
  { id: "ORD003", user: "Lê Thu Hương", email: "huong@gmail.com", phone: "0923456789", course: "VIP Coach 1-1", amount: "8,000,000đ", status: "approved", createdAt: "15/04/2024 08:15" },
  { id: "ORD004", user: "Phạm Quốc Hùng", email: "hung@gmail.com", phone: "0934567890", course: "Phục Hồi Lưng Cơ Bản", amount: "1,500,000đ", status: "approved", createdAt: "14/04/2024 17:42" },
  { id: "ORD005", user: "Hoàng Thị Bảo Châu", email: "chau@gmail.com", phone: "0945678901", course: "Corrective Exercise Nâng Cao", amount: "3,500,000đ", status: "pending", createdAt: "14/04/2024 15:20" },
  { id: "ORD006", user: "Ngô Minh Đức", email: "duc@gmail.com", phone: "0956789012", course: "Phục Hồi Lưng Cơ Bản", amount: "1,500,000đ", status: "approved", createdAt: "14/04/2024 11:05" },
];

export default function OrdersPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [confirmOrder, setConfirmOrder] = useState<(typeof orders)[0] | null>(null);
  const [approvedIds, setApprovedIds] = useState<string[]>([]);

  const handleApprove = (order: (typeof orders)[0]) => {
    setApprovedIds((prev) => [...prev, order.id]);
    setConfirmOrder(null);
  };

  const filtered = orders.filter((o) => {
    const matchSearch = o.user.toLowerCase().includes(search.toLowerCase()) || o.email.toLowerCase().includes(search.toLowerCase());
    const status = approvedIds.includes(o.id) ? "approved" : o.status;
    const matchFilter = filter === "all" || status === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="font-heading font-black text-gray-900 text-2xl">Quản Lý Đơn Hàng</h1>
        <p className="text-gray-500 text-sm mt-1">Xem xét và duyệt đơn hàng của học viên</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm kiếm tên, email..."
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-sm text-sm focus:outline-none focus:border-[#c0392b] bg-white"
          />
        </div>
        <div className="flex gap-2">
          {[
            { value: "all", label: "Tất Cả" },
            { value: "pending", label: "Chờ Duyệt" },
            { value: "approved", label: "Đã Duyệt" },
          ].map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-4 py-2.5 text-xs font-semibold rounded-sm border transition-colors ${
                filter === f.value
                  ? "bg-[#c0392b] text-white border-[#c0392b]"
                  : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                {["Mã Đơn", "Khách Hàng", "Khóa Học", "Số Tiền", "Trạng Thái", "Thời Gian", "Hành Động"].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs text-gray-400 font-semibold uppercase tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((order) => {
                const isApproved = approvedIds.includes(order.id) || order.status === "approved";
                return (
                  <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-5 py-3 font-mono text-xs text-gray-500">{order.id}</td>
                    <td className="px-5 py-3">
                      <div className="font-semibold text-gray-900">{order.user}</div>
                      <div className="text-gray-400 text-xs">{order.email}</div>
                    </td>
                    <td className="px-5 py-3 text-gray-600 text-xs">{order.course}</td>
                    <td className="px-5 py-3 font-semibold text-gray-900 whitespace-nowrap">{order.amount}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full whitespace-nowrap ${
                        isApproved ? "bg-green-50 text-green-600" : "bg-orange-50 text-orange-600"
                      }`}>
                        {isApproved ? <CheckCircle2 size={11} /> : <Clock size={11} />}
                        {isApproved ? "Đã Duyệt" : "Chờ Duyệt"}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-400 text-xs whitespace-nowrap">{order.createdAt}</td>
                    <td className="px-5 py-3">
                      {!isApproved ? (
                        <button
                          onClick={() => setConfirmOrder(order)}
                          className="bg-[#c0392b] hover:bg-[#96281b] text-white text-xs font-semibold px-3 py-1.5 rounded-sm transition-colors whitespace-nowrap"
                        >
                          Duyệt Đơn
                        </button>
                      ) : (
                        <span className="text-gray-300 text-xs">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirm Dialog */}
      <Dialog open={!!confirmOrder} onOpenChange={() => setConfirmOrder(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-heading font-bold text-gray-900">Xác Nhận Duyệt Đơn</DialogTitle>
          </DialogHeader>
          {confirmOrder && (
            <div className="space-y-4">
              <div className="bg-gray-50 border border-gray-200 rounded-sm p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Học viên:</span>
                  <span className="font-semibold text-gray-900">{confirmOrder.user}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Khóa học:</span>
                  <span className="font-semibold text-gray-900 text-right text-xs">{confirmOrder.course}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Số tiền:</span>
                  <span className="font-bold text-[#c0392b]">{confirmOrder.amount}</span>
                </div>
              </div>
              <p className="text-gray-500 text-sm">
                Sau khi duyệt, học viên sẽ được <strong className="text-gray-900">tự động cấp quyền truy cập</strong> vào khóa học.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setConfirmOrder(null)}
                  className="flex-1 border border-gray-200 text-gray-600 text-sm font-semibold py-2.5 rounded-sm hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={() => handleApprove(confirmOrder)}
                  className="flex-1 bg-[#c0392b] hover:bg-[#96281b] text-white text-sm font-bold py-2.5 rounded-sm transition-colors"
                >
                  ✓ Duyệt Đơn
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
