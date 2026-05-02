"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import LmsSidebar from "@/components/layout/LmsSidebar";

export function LmsAppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
    setHovered(false);
  }, [pathname]);

  /** Desktop (lg+): đẩy nội dung. Mobile: drawer overlay — tránh thu hẹp còn ~20% gây vỡ layout. */
  const sidebarVisible = mobileOpen || hovered;

  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  return (
    <div className="flex h-[100dvh] max-h-[100dvh] overflow-hidden bg-neutral-100">
      {/* Mobile: đóng menu khi chạm vùng tối phía sau drawer */}
      {mobileOpen && (
        <button
          type="button"
          className="fixed inset-0 z-[60] bg-black/45 lg:hidden"
          aria-label="Đóng menu điều hướng"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Desktop: vạt trái để mở sidebar — chỉ khi sidebar đang đóng */}
      {!sidebarVisible && (
        <div
          className="pointer-events-auto fixed left-0 top-0 z-30 hidden h-full w-3 lg:block"
          onMouseEnter={() => setHovered(true)}
          aria-hidden
        />
      )}

      {/* Sidebar — mobile: fixed + trượt (full width nội dung phía sau). lg+: trong layout, đẩy nội dung. */}
      <aside
        id="lms-sidebar-panel"
        className={cn(
          "flex h-full flex-col overflow-hidden border-neutral-200 bg-white",
          // Mobile drawer (không chiếm chỗ trong flex → main luôn full width)
          "fixed left-0 top-0 z-[70] w-[min(18rem,calc(100vw-2.5rem))] max-w-[85vw] transition-transform duration-200 ease-out lg:static lg:z-auto lg:max-w-none lg:translate-x-0 lg:transition-[width]",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          // Desktop: co giãn chiều ngang để đẩy main
          "lg:shrink-0",
          sidebarVisible ? "lg:w-64 lg:border-r" : "lg:w-0 lg:border-r-0"
        )}
        onMouseLeave={() => setHovered(false)}
        aria-label="Điều hướng LMS"
      >
        <div className="flex h-full w-[min(18rem,calc(100vw-2.5rem))] min-w-[min(18rem,calc(100vw-2.5rem))] max-w-[85vw] shrink-0 flex-col lg:max-w-none lg:w-64 lg:min-w-64">
          <div className="flex shrink-0 items-center justify-between gap-2 border-b border-neutral-200 px-3 py-2 lg:hidden">
            <span className="truncate font-heading text-xs font-black uppercase tracking-wide text-neutral-900">Menu</span>
            <button
              type="button"
              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md text-neutral-700 hover:bg-neutral-100"
              aria-label="Đóng menu"
              onClick={() => setMobileOpen(false)}
            >
              <X className="size-5" aria-hidden />
            </button>
          </div>
          <LmsSidebar
            onNavigate={() => { setMobileOpen(false); setHovered(false); }}
            className="min-h-0 flex-1 border-r-0"
          />
        </div>
      </aside>

      <div className="relative z-0 flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <header
          className={cn(
            "flex h-14 shrink-0 items-center gap-2 border-b border-neutral-200 bg-white px-2 sm:px-3 lg:hidden",
            mobileOpen && "relative z-[65]"
          )}
        >
          <button
            type="button"
            className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-md text-neutral-800 hover:bg-neutral-100"
            aria-expanded={mobileOpen}
            aria-controls="lms-sidebar-panel"
            aria-label={mobileOpen ? "Đóng menu điều hướng" : "Mở menu điều hướng"}
            onClick={() => setMobileOpen((o) => !o)}
          >
            <Menu className="size-5" aria-hidden />
          </button>
          <span className="min-w-0 truncate font-heading text-xs font-bold uppercase tracking-wide text-neutral-900">
            CSNB Academy
          </span>
        </header>
        <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden bg-neutral-100">{children}</main>
      </div>
    </div>
  );
}
