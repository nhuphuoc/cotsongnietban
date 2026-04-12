"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SITE_CONTACT } from "@/lib/site-contact";
import { demoCourses, getCourseProgressPercent } from "@/lib/demo-courses";
import { LayoutDashboard, MessageCircle, LogOut, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { SiteLogoMark } from "@/components/brand/site-logo-mark";

type Props = {
  className?: string;
  /** Gọi khi người dùng chọn liên kết (đóng drawer mobile). */
  onNavigate?: () => void;
};

export default function LmsSidebar({ className, onNavigate }: Props) {
  const pathname = usePathname();
  const sidebarCourses = demoCourses.slice(0, 4);
  const nav = () => onNavigate?.();

  return (
    <div
      role="complementary"
      className={cn("flex h-full w-full shrink-0 flex-col border-r border-neutral-200 bg-white lg:w-64", className)}
    >
      <div className="border-b border-neutral-200 p-5">
        <Link href="/" className="flex items-center gap-2" onClick={nav}>
          <SiteLogoMark boxClassName="block h-7 w-7" alt="" />
          <span className="font-heading text-sm font-black uppercase tracking-wide text-neutral-900">CSNB</span>
        </Link>
      </div>

      <nav className="border-b border-neutral-200 p-3">
        <Link
          href="/dashboard"
          onClick={nav}
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
                onClick={nav}
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
          onClick={nav}
          className="flex items-center gap-3 rounded-md px-3 py-2.5 font-heading text-sm font-semibold uppercase tracking-wide text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
        >
          <MessageCircle size={16} />
          Tư vấn trực tiếp
        </a>
        <Link
          href="/auth/signout"
          onClick={nav}
          className="flex items-center gap-3 rounded-md px-3 py-2.5 font-heading text-sm font-semibold uppercase tracking-wide text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-violet-700"
        >
          <LogOut size={16} />
          Đăng xuất
        </Link>
      </div>
    </div>
  );
}
