"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SITE_CONTACT } from "@/lib/site-contact";
import { demoCourses, getCourseProgressPercent } from "@/lib/demo-courses";
import { LayoutDashboard, MessageCircle, LogOut, ChevronRight } from "lucide-react";

export default function LmsSidebar() {
  const pathname = usePathname();
  const sidebarCourses = demoCourses.slice(0, 4);

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-neutral-200 bg-white">
      <div className="border-b border-neutral-200 p-5">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#1c1d1f]">
            <span className="font-heading text-xs font-black text-white">C</span>
          </div>
          <span className="font-heading text-sm font-black uppercase tracking-wide text-neutral-900">CSNB</span>
        </Link>
      </div>

      <nav className="border-b border-neutral-200 p-3">
        <Link
          href="/dashboard"
          className={`flex items-center gap-3 rounded-md px-3 py-2.5 font-heading text-sm font-semibold uppercase tracking-wide transition-colors ${
            pathname === "/dashboard"
              ? "bg-neutral-900 text-white"
              : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
          }`}
        >
          <LayoutDashboard size={16} />
          Dashboard
        </Link>
      </nav>

      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        <div className="mb-3 px-1 font-heading text-xs uppercase tracking-wider text-neutral-500">Khóa học của tôi</div>
        <div className="space-y-2">
          {sidebarCourses.map((course) => {
            const progress = getCourseProgressPercent(course);
            return (
              <Link
                key={course.id}
                href={`/courses/${course.id}`}
                className="group block rounded-lg border border-neutral-200 bg-neutral-50/80 p-3 transition-colors hover:border-neutral-300 hover:bg-white"
              >
                <div className="mb-2 flex items-start justify-between gap-2">
                  <span className="font-heading text-xs font-bold leading-snug text-neutral-900 transition-colors group-hover:text-violet-700">
                    {course.title}
                  </span>
                  <ChevronRight size={14} className="mt-0.5 shrink-0 text-neutral-400" />
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-1 flex-1 overflow-hidden rounded-full bg-neutral-200">
                    <div className="h-full rounded-full bg-violet-600" style={{ width: `${progress}%` }} />
                  </div>
                  <span className="font-heading text-xs tabular-nums text-neutral-500">{progress}%</span>
                </div>
                <div className="mt-1 font-sans text-xs text-neutral-500">{course.lessons.length} bài giảng</div>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="space-y-1 border-t border-neutral-200 p-3">
        <a
          href={SITE_CONTACT.zaloUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 rounded-md px-3 py-2.5 font-heading text-sm font-semibold uppercase tracking-wide text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
        >
          <MessageCircle size={16} />
          Tư vấn trực tiếp
        </a>
        <Link
          href="/auth/signout"
          className="flex items-center gap-3 rounded-md px-3 py-2.5 font-heading text-sm font-semibold uppercase tracking-wide text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-violet-700"
        >
          <LogOut size={16} />
          Đăng xuất
        </Link>
      </div>
    </aside>
  );
}
