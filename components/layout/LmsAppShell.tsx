"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import LmsSidebar from "@/components/layout/LmsSidebar";

export function LmsAppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <div className="flex h-[100dvh] max-h-[100dvh] overflow-hidden bg-neutral-100">
      {open ? (
        <button
          type="button"
          className="fixed inset-0 z-[60] bg-black/45 lg:hidden"
          aria-label="Đóng menu điều hướng"
          onClick={() => setOpen(false)}
        />
      ) : null}

      <aside
        id="lms-sidebar-panel"
        className={cn(
          "fixed left-0 top-0 z-[70] flex h-full w-[min(20rem,88vw)] flex-col border-r border-neutral-200 bg-white shadow-xl transition-transform duration-200 ease-out lg:static lg:z-auto lg:w-64 lg:max-w-none lg:translate-x-0 lg:shadow-none",
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
        aria-label="Điều hướng LMS"
      >
        <div className="flex shrink-0 items-center justify-between gap-2 border-b border-neutral-200 px-3 py-2 lg:hidden">
          <span className="truncate font-heading text-xs font-black uppercase tracking-wide text-neutral-900">Menu</span>
          <button
            type="button"
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md text-neutral-700 hover:bg-neutral-100"
            aria-label="Đóng menu"
            onClick={() => setOpen(false)}
          >
            <X className="size-5" aria-hidden />
          </button>
        </div>
        <LmsSidebar onNavigate={() => setOpen(false)} className="min-h-0 flex-1 border-r-0" />
      </aside>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-14 shrink-0 items-center gap-2 border-b border-neutral-200 bg-white px-2 sm:px-3 lg:hidden">
          <button
            type="button"
            className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-md text-neutral-800 hover:bg-neutral-100"
            aria-expanded={open}
            aria-controls="lms-sidebar-panel"
            aria-label="Mở menu điều hướng"
            onClick={() => setOpen(true)}
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
