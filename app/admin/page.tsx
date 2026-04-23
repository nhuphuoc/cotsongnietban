import Link from "next/link";
import { BarChart3, BookOpen, DollarSign, MessageSquareQuote, ShoppingCart, Users, CheckCircle2, Clock } from "lucide-react";
import { listCourses, listFeedbacks, listOrders, listProfiles } from "@/lib/api/repositories";
import { formatVnd } from "@/lib/format-vnd";

type AdminOrder = {
  id: string;
  order_code: string;
  customer_name: string;
  customer_email: string;
  total_vnd: number;
  status: "pending" | "paid" | "approved" | "cancelled" | "refunded";
  created_at: string;
  items?: Array<{ course_title_snapshot?: string | null }>;
};

function formatRelativeVi(iso: string) {
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return "—";
  const diff = Date.now() - t;
  const m = Math.floor(diff / 60000);
  if (m < 1) return "Vừa xong";
  if (m < 60) return `${m} phút trước`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} giờ trước`;
  const d = Math.floor(h / 24);
  if (d < 14) return `${d} ngày trước`;
  return new Date(iso).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function statusLabel(status: AdminOrder["status"]) {
  if (status === "approved") return "Đã Duyệt";
  if (status === "paid") return "Đã báo CK";
  if (status === "cancelled") return "Đã Hủy";
  if (status === "refunded") return "Hoàn tiền";
  return "Chờ Duyệt";
}

function statusClass(status: AdminOrder["status"]) {
  if (status === "approved") return "bg-green-50 text-green-600";
  if (status === "paid") return "bg-blue-50 text-blue-700";
  if (status === "cancelled" || status === "refunded") return "bg-neutral-100 text-neutral-600";
  return "bg-orange-50 text-orange-600";
}

const quickLinks = [
  { href: "/admin/orders", label: "Duyệt đơn hàng", icon: ShoppingCart, desc: "Xem đơn chờ duyệt và xác nhận thanh toán" },
  { href: "/admin/courses", label: "Quản lý khóa học", icon: BookOpen, desc: "Thêm/sửa/xuất bản khóa học" },
  { href: "/admin/blog", label: "Quản lý blog", icon: BarChart3, desc: "Đăng bài & cập nhật nội dung" },
  { href: "/admin/feedback", label: "Quản lý feedback", icon: MessageSquareQuote, desc: "Duyệt, ghim, ẩn phản hồi" },
];

export default async function AdminDashboardPage() {
  const [ordersRaw, profiles, courses, feedbacks] = await Promise.all([
    listOrders(),
    listProfiles(),
    listCourses(),
    listFeedbacks(),
  ]);

  const orders = ordersRaw as unknown as AdminOrder[];
  const recentOrders = orders.slice(0, 6);
  const revenue = orders
    .filter((order) => order.status === "approved")
    .reduce((sum, order) => sum + (Number(order.total_vnd) || 0), 0);
  const newFeedbackCount = (feedbacks as Array<{ status?: string }>).filter((fb) => fb.status === "new").length;

  const stats = [
    { label: "Doanh thu đã duyệt", value: formatVnd(revenue), icon: DollarSign, hint: `${orders.filter((o) => o.status === "approved").length} đơn`, color: "bg-green-50 text-green-700 border-green-200" },
    { label: "Người dùng", value: String(profiles.length), icon: Users, hint: "Tổng tài khoản", color: "bg-blue-50 text-blue-700 border-blue-200" },
    { label: "Khóa học", value: String(courses.length), icon: BookOpen, hint: "Tổng khóa học", color: "bg-purple-50 text-purple-700 border-purple-200" },
    { label: "Feedback mới", value: String(newFeedbackCount), icon: MessageSquareQuote, hint: `Tổng feedback: ${feedbacks.length}`, color: "bg-orange-50 text-[#c0392b] border-orange-200" },
  ];

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="font-sans font-bold text-gray-900 text-2xl">Admin Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Tổng quan hệ thống Cột Sống Niết Bàn</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, i) => (
          <div key={i} className={`bg-white border rounded-sm p-5 ${stat.color}`}>
            <div className="flex items-center justify-between mb-3">
              <stat.icon size={20} />
              <span className="text-xs font-semibold">{stat.hint}</span>
            </div>
            <div className="font-heading font-black text-gray-900 text-xl">{stat.value}</div>
            <div className="text-gray-500 text-xs mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {quickLinks.map((q) => (
          <Link
            key={q.href}
            href={q.href}
            className="group rounded-sm border border-gray-200 bg-white p-5 transition-colors hover:bg-gray-50"
          >
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-sm bg-gray-100 text-gray-700 group-hover:bg-white">
                <q.icon size={18} />
              </span>
              <div className="min-w-0">
                <div className="font-sans font-semibold text-gray-900 text-sm">
                  {q.label}
                </div>
                <div className="mt-1 text-sm text-gray-500">{q.desc}</div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-white border border-gray-200 rounded-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <h2 className="font-sans font-semibold text-gray-800 text-sm">
            Đơn Hàng Gần Đây
          </h2>
          <Link href="/admin/orders" className="text-[#c0392b] text-xs font-semibold hover:underline">
            Xem tất cả →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-5 py-3 text-xs text-gray-500 font-medium">Khách hàng</th>
                <th className="text-left px-5 py-3 text-xs text-gray-500 font-medium">Khóa học</th>
                <th className="text-left px-5 py-3 text-xs text-gray-500 font-medium">Số tiền</th>
                <th className="text-left px-5 py-3 text-xs text-gray-500 font-medium">Trạng thái</th>
                <th className="text-left px-5 py-3 text-xs text-gray-500 font-medium">Thời gian</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-sm text-gray-500">
                    Chưa có đơn hàng nào.
                  </td>
                </tr>
              ) : (
                recentOrders.map((order) => (
                  <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-5 py-3">
                      <div className="font-semibold text-gray-900">{order.customer_name}</div>
                      <div className="text-gray-400 text-xs">{order.customer_email}</div>
                    </td>
                    <td className="px-5 py-3 text-gray-600 line-clamp-2">
                      {order.items?.map((item) => item.course_title_snapshot).filter(Boolean).join(", ") || "—"}
                    </td>
                    <td className="px-5 py-3 font-semibold text-gray-900">{formatVnd(order.total_vnd)}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${statusClass(order.status)}`}>
                        {order.status === "approved" ? <CheckCircle2 size={11} /> : <Clock size={11} />}
                        {statusLabel(order.status)}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-400 text-xs">{formatRelativeVi(order.created_at)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
