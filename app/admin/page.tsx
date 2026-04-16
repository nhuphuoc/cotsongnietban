import Link from "next/link";
import { BarChart3, BookOpen, DollarSign, MessageSquareQuote, ShoppingCart, Users, CheckCircle2, Clock } from "lucide-react";

const stats = [
  { label: "Doanh thu (demo)", value: "148,500,000đ", icon: DollarSign, trend: "+12.5%", color: "bg-green-50 text-green-700 border-green-200" },
  { label: "Người dùng", value: "1,247", icon: Users, trend: "+8.3%", color: "bg-blue-50 text-blue-700 border-blue-200" },
  { label: "Khóa học", value: "4", icon: BookOpen, trend: "+1", color: "bg-purple-50 text-purple-700 border-purple-200" },
  { label: "Feedback mới", value: "6", icon: MessageSquareQuote, trend: "+2", color: "bg-orange-50 text-[#c0392b] border-orange-200" },
];

const recentOrders = [
  { id: "ORD001", user: "Nguyễn Thị Lan", email: "lan@gmail.com", course: "Phục Hồi Lưng Cơ Bản", amount: "1,500,000đ", status: "pending", time: "5 phút trước" },
  { id: "ORD002", user: "Trần Minh Tuấn", email: "tuan@gmail.com", course: "Corrective Exercise Nâng Cao", amount: "3,500,000đ", status: "pending", time: "23 phút trước" },
  { id: "ORD003", user: "Lê Thu Hương", email: "huong@gmail.com", course: "VIP Coach 1-1", amount: "8,000,000đ", status: "approved", time: "1 tiếng trước" },
  { id: "ORD004", user: "Phạm Quốc Hùng", email: "hung@gmail.com", course: "Phục Hồi Lưng Cơ Bản", amount: "1,500,000đ", status: "approved", time: "2 tiếng trước" },
];

const quickLinks = [
  { href: "/admin/orders", label: "Duyệt đơn hàng", icon: ShoppingCart, desc: "Xem đơn chờ duyệt và xác nhận thanh toán" },
  { href: "/admin/courses", label: "Quản lý khóa học", icon: BookOpen, desc: "Thêm/sửa/xuất bản khóa học (demo)" },
  { href: "/admin/blog", label: "Quản lý blog", icon: BarChart3, desc: "Đăng bài & cập nhật nội dung" },
  { href: "/admin/feedback", label: "Quản lý feedback", icon: MessageSquareQuote, desc: "Duyệt, ghim, ẩn phản hồi" },
];

export default function AdminDashboardPage() {
  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="font-sans font-extrabold tracking-tight text-gray-900 text-2xl">Admin Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Tổng quan hệ thống Cột Sống Niết Bàn</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, i) => (
          <div key={i} className={`bg-white border rounded-sm p-5 ${stat.color}`}>
            <div className="flex items-center justify-between mb-3">
              <stat.icon size={20} />
              <span className="text-xs font-semibold">{stat.trend}</span>
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
                <div className="font-heading font-black text-gray-900 text-sm uppercase tracking-wide">
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
          <h2 className="font-heading font-bold text-gray-900 text-sm uppercase tracking-wide">
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
                <th className="text-left px-5 py-3 text-xs text-gray-400 font-semibold uppercase tracking-wide">Khách Hàng</th>
                <th className="text-left px-5 py-3 text-xs text-gray-400 font-semibold uppercase tracking-wide">Khóa Học</th>
                <th className="text-left px-5 py-3 text-xs text-gray-400 font-semibold uppercase tracking-wide">Số Tiền</th>
                <th className="text-left px-5 py-3 text-xs text-gray-400 font-semibold uppercase tracking-wide">Trạng Thái</th>
                <th className="text-left px-5 py-3 text-xs text-gray-400 font-semibold uppercase tracking-wide">Thời Gian</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-5 py-3">
                    <div className="font-semibold text-gray-900">{order.user}</div>
                    <div className="text-gray-400 text-xs">{order.email}</div>
                  </td>
                  <td className="px-5 py-3 text-gray-600">{order.course}</td>
                  <td className="px-5 py-3 font-semibold text-gray-900">{order.amount}</td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${
                      order.status === "approved"
                        ? "bg-green-50 text-green-600"
                        : "bg-orange-50 text-orange-600"
                    }`}>
                      {order.status === "approved" ? <CheckCircle2 size={11} /> : <Clock size={11} />}
                      {order.status === "approved" ? "Đã Duyệt" : "Chờ Duyệt"}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-400 text-xs">{order.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
