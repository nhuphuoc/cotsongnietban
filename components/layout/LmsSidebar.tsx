"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SITE_CONTACT } from "@/lib/site-contact";
import { BookOpen, LayoutDashboard, MessageCircle, LogOut, ChevronRight, CheckCircle2 } from "lucide-react";

const courses = [
  { id: "1", title: "Phục Hồi Lưng Cơ Bản", progress: 75, lessons: 12 },
  { id: "2", title: "Corrective Exercise Nâng Cao", progress: 30, lessons: 20 },
];

export default function LmsSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-[#111] border-r border-[#222] flex flex-col h-full">
      {/* Logo */}
      <div className="p-5 border-b border-[#222]">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-[#c0392b] rounded flex items-center justify-center">
            <span className="text-white font-black text-xs font-heading">C</span>
          </div>
          <span className="font-heading font-black text-white text-sm uppercase tracking-wide">CSNB</span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="p-3 border-b border-[#222]">
        <Link
          href="/dashboard"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm font-heading font-semibold uppercase tracking-wide transition-colors ${
            pathname === "/dashboard"
              ? "bg-[#c0392b] text-white"
              : "text-[#a0a0a0] hover:text-white hover:bg-white/5"
          }`}
        >
          <LayoutDashboard size={16} />
          Dashboard
        </Link>
      </nav>

      {/* My Courses */}
      <div className="flex-1 overflow-y-auto p-3">
        <div className="text-[#a0a0a0] text-xs font-heading uppercase tracking-wider mb-3 px-1">
          Khóa Học Của Tôi
        </div>
        <div className="space-y-2">
          {courses.map((course) => (
            <Link
              key={course.id}
              href={`/courses/${course.id}`}
              className="block bg-[#0a0a0a] border border-[#222] rounded-sm p-3 hover:border-[#c0392b]/40 transition-colors group"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="font-heading font-bold text-white text-xs leading-snug group-hover:text-[#c0392b] transition-colors">
                  {course.title}
                </span>
                <ChevronRight size={14} className="text-[#a0a0a0] shrink-0 mt-0.5" />
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1 bg-[#222] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#c0392b] rounded-full"
                    style={{ width: `${course.progress}%` }}
                  />
                </div>
                <span className="text-[#a0a0a0] text-xs font-heading">{course.progress}%</span>
              </div>
              <div className="text-[#a0a0a0] text-xs mt-1">{course.lessons} bài giảng</div>
            </Link>
          ))}
        </div>
      </div>

      {/* Bottom */}
      <div className="p-3 border-t border-[#222] space-y-1">
        <a
          href={SITE_CONTACT.zaloUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm text-[#a0a0a0] hover:text-white hover:bg-white/5 transition-colors font-heading font-semibold uppercase tracking-wide"
        >
          <MessageCircle size={16} />
          Hỗ Trợ Zalo
        </a>
        <Link
          href="/login"
          className="flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm text-[#a0a0a0] hover:text-[#c0392b] hover:bg-white/5 transition-colors font-heading font-semibold uppercase tracking-wide"
        >
          <LogOut size={16} />
          Đăng Xuất
        </Link>
      </div>
    </aside>
  );
}
