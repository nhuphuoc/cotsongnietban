"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { SITE_CONTACT } from "@/lib/site-contact";
import { LayoutDashboard, MessageCircle, LogOut, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { SiteLogoMark } from "@/components/brand/site-logo-mark";
import { getLmsCourseHref, getLmsHomeHref, parseLearningHubHosts } from "@/lib/learning-hub";

type Props = {
  className?: string;
  /** Gọi khi người dùng chọn liên kết (đóng drawer mobile). */
  onNavigate?: () => void;
};

type ApiEnrollmentRow = {
  id: string;
  progress_percent?: number;
  course?: {
    id: string;
    title?: string;
    slug?: string | null;
    lesson_count?: number | null;
  } | null;
};

export default function LmsSidebar({ className, onNavigate }: Props) {
  const pathname = usePathname();
  const [rows, setRows] = useState<ApiEnrollmentRow[]>([]);
  const [onLearningHubHost, setOnLearningHubHost] = useState(false);
  const nav = () => onNavigate?.();

  useEffect(() => {
    const h = window.location.host.toLowerCase();
    const patterns = parseLearningHubHosts();
    setOnLearningHubHost(patterns.some((p) => h === p || h.endsWith(`.${p}`)));
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/me/enrollments", { credentials: "same-origin" });
        const json = (await res.json()) as { data?: ApiEnrollmentRow[] };
        if (!res.ok || !Array.isArray(json.data)) return;
        if (!cancelled) setRows(json.data.slice(0, 8));
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

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
          href={getLmsHomeHref()}
          onClick={nav}
          className={`flex items-center gap-3 rounded-md px-3 py-2.5 font-heading text-sm font-semibold uppercase tracking-wide transition-colors ${
            pathname === "/phong-hoc" || (pathname === "/" && onLearningHubHost)
              ? "bg-neutral-900 text-white"
              : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
          }`}
        >
          <LayoutDashboard size={16} />
          Phòng học
        </Link>
      </nav>

      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        <div className="mb-3 px-1 font-heading text-xs uppercase tracking-wider text-neutral-500">Khóa học của tôi</div>
        <div className="space-y-2">
          {rows.length === 0 ? (
            <p className="px-1 font-sans text-xs text-neutral-500">Chưa có khóa hoạt động hoặc đang tải…</p>
          ) : (
            rows.map((row) => {
              const course = row.course;
              if (!course?.id) return null;
              const progress = Math.min(100, Math.max(0, row.progress_percent ?? 0));
              const hrefId = course.slug || course.id;
              const resumeHref = `${getLmsCourseHref(String(hrefId))}/resume`;
              const title = course.title ?? "Khóa học";
              const nLessons = course.lesson_count ?? 0;
              return (
                <Link
                  key={row.id}
                  href={resumeHref}
                  onClick={nav}
                  className="group block rounded-lg border border-neutral-200 bg-neutral-50/80 p-3 transition-colors hover:border-neutral-300 hover:bg-white"
                >
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <span className="font-heading text-xs font-bold leading-snug text-neutral-900 transition-colors group-hover:text-[#004E4B]">
                      {title}
                    </span>
                    <ChevronRight size={14} className="mt-0.5 shrink-0 text-neutral-400" />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-1 flex-1 overflow-hidden rounded-full bg-neutral-200">
                      <div className="h-full rounded-full bg-[#004E4B]" style={{ width: `${progress}%` }} />
                    </div>
                    <span className="font-heading text-xs tabular-nums text-neutral-500">{progress}%</span>
                  </div>
                  <div className="mt-1 font-sans text-xs text-neutral-500">{nLessons} bài giảng</div>
                </Link>
              );
            })
          )}
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
          prefetch={false}
          href="/auth/signout"
          onClick={nav}
          className="flex items-center gap-3 rounded-md px-3 py-2.5 font-heading text-sm font-semibold uppercase tracking-wide text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-[#004E4B]"
        >
          <LogOut size={16} />
          Đăng xuất
        </Link>
      </div>
    </div>
  );
}
