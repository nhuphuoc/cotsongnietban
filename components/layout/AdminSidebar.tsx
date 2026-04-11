"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Users, BookOpen, ShoppingCart, FileText, LogOut, Settings
} from "lucide-react";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Đơn Hàng", icon: ShoppingCart },
  { href: "/admin/courses", label: "Khóa Học", icon: BookOpen },
  { href: "/admin/blog", label: "Blog", icon: FileText },
  { href: "/admin/users", label: "Người Dùng", icon: Users },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-60 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Logo */}
      <div className="p-5 border-b border-gray-200">
        <Link href="/admin" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-[#c0392b] rounded flex items-center justify-center">
            <span className="text-white font-black text-xs font-heading">C</span>
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-heading font-black text-gray-900 text-xs uppercase tracking-wide">CSNB Admin</span>
            <span className="text-gray-400 text-[10px] mt-0.5">Quản Trị Viên</span>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5">
        {navItems.map((item) => {
          const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm font-heading font-semibold transition-colors ${
                active
                  ? "bg-[#c0392b] text-white"
                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              <item.icon size={16} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="p-3 border-t border-gray-200 space-y-0.5">
        <Link href="/" className="flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors font-heading font-semibold">
          <LogOut size={16} />
          Thoát Admin
        </Link>
      </div>
    </aside>
  );
}
