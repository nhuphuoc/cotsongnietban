"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SITE_CONTACT } from "@/lib/site-contact";
import { LayoutDashboard, MessageCircle, LogOut, ChevronRight } from "lucide-react";

const courses = [
  { id: "1", title: "Phục Hồi Lưng Cơ Bản", progress: 75, lessons: 12 },
  { id: "2", title: "Corrective Exercise Nâng Cao", progress: 30, lessons: 20 },
];

export default function LmsSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-64 flex-col border-r border-csnb-border bg-csnb-surface">
      <div className="border-b border-csnb-border p-5">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-csnb-orange">
            <span className="font-heading text-xs font-black text-white">C</span>
          </div>
          <span className="font-heading text-sm font-black uppercase tracking-wide text-white">CSNB</span>
        </Link>
      </div>

      <nav className="border-b border-csnb-border p-3">
        <Link
          href="/dashboard"
          className={`flex items-center gap-3 rounded-md px-3 py-2.5 font-heading text-sm font-semibold uppercase tracking-wide transition-colors ${
            pathname === "/dashboard"
              ? "bg-csnb-orange text-white"
              : "text-csnb-muted hover:bg-white/5 hover:text-white"
          }`}
        >
          <LayoutDashboard size={16} />
          Dashboard
        </Link>
      </nav>

      <div className="flex-1 overflow-y-auto p-3">
        <div className="mb-3 px-1 font-heading text-xs uppercase tracking-wider text-csnb-muted">Khóa học của tôi</div>
        <div className="space-y-2">
          {courses.map((course) => (
            <Link
              key={course.id}
              href={`/courses/${course.id}`}
              className="group block rounded-md border border-csnb-border bg-csnb-bg p-3 transition-colors hover:border-csnb-orange/40"
            >
              <div className="mb-2 flex items-start justify-between gap-2">
                <span className="font-heading text-xs font-bold leading-snug text-white transition-colors group-hover:text-csnb-orange-bright">
                  {course.title}
                </span>
                <ChevronRight size={14} className="mt-0.5 shrink-0 text-csnb-muted" />
              </div>
              <div className="flex items-center gap-2">
                <div className="h-1 flex-1 overflow-hidden rounded-full bg-csnb-border">
                  <div className="h-full rounded-full bg-csnb-orange" style={{ width: `${course.progress}%` }} />
                </div>
                <span className="font-heading text-xs text-csnb-muted">{course.progress}%</span>
              </div>
              <div className="mt-1 font-sans text-xs text-csnb-muted">{course.lessons} bài giảng</div>
            </Link>
          ))}
        </div>
      </div>

      <div className="space-y-1 border-t border-csnb-border p-3">
        <a
          href={SITE_CONTACT.zaloUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 rounded-md px-3 py-2.5 font-heading text-sm font-semibold uppercase tracking-wide text-csnb-muted transition-colors hover:bg-white/5 hover:text-white"
        >
          <MessageCircle size={16} />
          Hỗ trợ Zalo
        </a>
        <Link
          href="/login"
          className="flex items-center gap-3 rounded-md px-3 py-2.5 font-heading text-sm font-semibold uppercase tracking-wide text-csnb-muted transition-colors hover:bg-white/5 hover:text-csnb-orange-bright"
        >
          <LogOut size={16} />
          Đăng xuất
        </Link>
      </div>
    </aside>
  );
}
