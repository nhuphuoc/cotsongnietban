"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SiteLogoMark } from "@/components/brand/site-logo-mark";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Users, ShoppingCart, FileText, LogOut, MessageSquareQuote, Clapperboard, Menu, X
} from "lucide-react";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Đơn Hàng", icon: ShoppingCart },
  { href: "/admin/course", label: "Khóa Học", icon: Clapperboard },
  { href: "/admin/blog", label: "Blog", icon: FileText },
  { href: "/admin/feedback", label: "Feedback", icon: MessageSquareQuote },
  { href: "/admin/users", label: "Người Dùng", icon: Users },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const renderNav = () => (
    <>
      <div className="p-5 border-b border-gray-200">
        <Link href="/admin" className="flex items-center gap-2">
          <SiteLogoMark boxClassName="block h-7 w-7" alt="" />
          <div className="flex flex-col leading-none">
            <span className="font-sans font-extrabold text-gray-900 text-xs uppercase tracking-wide">CSNB Admin</span>
            <span className="text-gray-400 text-[10px] mt-0.5">Quản Trị Viên</span>
          </div>
        </Link>
      </div>

      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm font-sans font-semibold transition-colors ${
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

      <div className="p-3 border-t border-gray-200 space-y-0.5">
        <Link href="/auth/signout" className="flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors font-sans font-semibold">
          <LogOut size={16} />
          Thoát Admin
        </Link>
      </div>
    </>
  );

  return (
    <>
      <div className="fixed inset-x-0 top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur md:hidden">
        <div className="flex h-14 items-center justify-between px-4">
          <Link href="/admin" className="flex items-center gap-2 min-w-0">
            <SiteLogoMark boxClassName="block h-6 w-6 shrink-0" alt="" />
            <span className="truncate text-xs font-extrabold uppercase tracking-wide text-gray-900">CSNB Admin</span>
          </Link>
          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            className="inline-flex size-9 items-center justify-center rounded-md border border-gray-200 text-gray-600 hover:bg-gray-100"
            aria-label={mobileOpen ? "Đóng menu" : "Mở menu"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {mobileOpen ? (
        <button
          type="button"
          aria-label="Đóng menu"
          className="fixed inset-0 z-40 bg-black/35 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col border-r border-gray-200 bg-white transition-transform md:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {renderNav()}
      </aside>

      <aside className="hidden h-full w-60 flex-col border-r border-gray-200 bg-white md:flex">
        {renderNav()}
      </aside>
    </>
  );
}
