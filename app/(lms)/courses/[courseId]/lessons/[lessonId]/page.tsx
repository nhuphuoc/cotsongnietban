"use client";

import Link from "next/link";
import { useState } from "react";
import { SITE_CONTACT } from "@/lib/site-contact";
import { ArrowLeft, CheckCircle2, Circle, Lock, Clock, ChevronRight, MessageCircle } from "lucide-react";

const lessons = [
  { id: "1", title: "Giới thiệu khóa học & Tổng quan phương pháp", duration: "12:30", completed: true },
  { id: "2", title: "Giải phẫu cột sống và đĩa đệm", duration: "18:45", completed: true },
  { id: "3", title: "Đánh giá tư thế cơ bản", duration: "15:20", completed: true },
  { id: "4", title: "Breathing Mechanics - Nền tảng vận động", duration: "22:10", completed: true },
  { id: "5", title: "Foot & Ankle Mobility", duration: "19:30", completed: true },
  { id: "6", title: "Hip Flexor Release", duration: "25:00", completed: true },
  { id: "7", title: "Glute Activation Sequence", duration: "28:15", completed: true },
  { id: "8", title: "Hip Mobility Drill - Cấp độ 1", duration: "20:40", completed: true },
  { id: "9", title: "Posterior Chain Activation", duration: "32:00", completed: true },
  { id: "10", title: "Corrective Hip Hinge", duration: "24:30", completed: false },
  { id: "11", title: "Spinal Decompression Routine", duration: "21:15", completed: false, locked: true },
  { id: "12", title: "Lộ trình duy trì & phòng ngừa tái phát", duration: "18:00", completed: false, locked: true },
];

export default function LessonViewPage({
  params,
}: {
  params: { courseId: string; lessonId: string };
}) {
  const [completed, setCompleted] = useState(false);
  const currentLesson = lessons.find((l) => l.id === params.lessonId) || lessons[9];
  const currentIndex = lessons.findIndex((l) => l.id === params.lessonId);
  const nextLesson = lessons[currentIndex + 1];

  return (
    <div className="flex h-full flex-col lg:flex-row">
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="flex items-center gap-3 border-b border-csnb-border px-6 py-3">
          <Link
            href={`/courses/${params.courseId}`}
            className="flex items-center gap-1.5 font-heading text-xs text-csnb-muted transition-colors hover:text-white"
          >
            <ArrowLeft size={14} /> Phục Hồi Lưng Cơ Bản
          </Link>
          <ChevronRight size={12} className="text-csnb-border" />
          <span className="truncate font-heading text-xs text-white">{currentLesson.title}</span>
        </div>

        <div
          className="relative bg-csnb-bg"
          style={{ aspectRatio: "16/9", maxHeight: "calc(100vh - 200px)" }}
        >
          <div className="flex h-full w-full items-center justify-center" onContextMenu={(e) => e.preventDefault()}>
            <div className="text-center">
              <div className="group mx-auto mb-4 flex h-20 w-20 cursor-pointer items-center justify-center rounded-full border-2 border-csnb-orange/35 transition-colors hover:border-csnb-orange">
                <div className="ml-1 h-0 w-0 border-b-[14px] border-l-[24px] border-t-[14px] border-b-transparent border-l-csnb-orange border-t-transparent transition-colors group-hover:border-l-white" />
              </div>
              <div className="font-sans text-sm text-csnb-muted">Bunny.net Video Player</div>
              <div className="mt-1 font-sans text-xs text-csnb-border">Video ID: bunny-video-placeholder</div>
            </div>
          </div>
          <div className="pointer-events-none absolute inset-0" style={{ userSelect: "none" }} />
        </div>

        <div className="border-t border-csnb-border bg-csnb-surface/95 px-6 py-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="font-heading text-base font-bold text-white">{currentLesson.title}</h1>
              <div className="mt-1 flex items-center gap-3 font-sans text-xs text-csnb-muted">
                <span className="flex items-center gap-1">
                  <Clock size={11} /> {currentLesson.duration}
                </span>
                <span>
                  Bài {currentIndex + 1} / {lessons.length}
                </span>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              {nextLesson && !nextLesson.locked && (
                <Link
                  href={`/courses/${params.courseId}/lessons/${nextLesson.id}`}
                  className="font-heading text-xs text-csnb-muted transition-colors hover:text-white"
                >
                  Bài tiếp →
                </Link>
              )}
              <button
                type="button"
                onClick={() => setCompleted(true)}
                disabled={completed}
                className={`flex items-center gap-2 rounded-md px-4 py-2 font-heading text-sm font-bold uppercase tracking-wide transition-colors ${
                  completed
                    ? "cursor-default border border-emerald-600/30 bg-emerald-600/20 text-emerald-400"
                    : "bg-csnb-orange text-white hover:bg-csnb-orange-deep"
                }`}
              >
                <CheckCircle2 size={15} />
                {completed ? "Đã hoàn thành" : "Đánh dấu hoàn thành"}
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 px-6 py-5">
          <h2 className="mb-3 font-heading text-sm font-bold uppercase tracking-wide text-white">Ghi chú bài học</h2>
          <div className="rounded-xl border border-csnb-border bg-csnb-surface/95 p-4 font-sans text-sm leading-relaxed text-csnb-muted ring-1 ring-white/5">
            <p className="mb-2">
              <strong className="text-white">Corrective Hip Hinge</strong> là một trong những chuyển động cơ bản quan trọng nhất để bảo vệ cột sống thắt lưng.
            </p>
            <ul className="space-y-1 text-sm">
              <li className="flex items-start gap-2">
                <span className="mt-1 text-csnb-orange">•</span>
                Giữ lưng thẳng, không cong vẹo
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 text-csnb-orange">•</span>
                Tập trung vào việc gấp hông, không gấp lưng
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 text-csnb-orange">•</span>
                Hít thở đúng nhịp: hít vào khi xuống, thở ra khi lên
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="flex w-full flex-col border-t border-csnb-border bg-csnb-surface/95 lg:w-72 lg:border-t-0 lg:border-l">
        <div className="border-b border-csnb-border p-4">
          <h2 className="font-heading text-xs font-bold uppercase tracking-wider text-white">Nội dung khóa học</h2>
          <div className="mt-1 font-sans text-xs text-csnb-muted">9/12 bài hoàn thành</div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {lessons.map((lesson, i) => (
            <div key={lesson.id} className={i < lessons.length - 1 ? "border-b border-csnb-border" : ""}>
              {lesson.locked ? (
                <div className="flex items-center gap-3 px-4 py-3 opacity-40">
                  <Lock size={12} className="shrink-0 text-csnb-muted" />
                  <span className="line-clamp-2 flex-1 font-sans text-xs text-csnb-muted">{lesson.title}</span>
                </div>
              ) : (
                <Link
                  href={`/courses/${params.courseId}/lessons/${lesson.id}`}
                  className={`group flex items-center gap-3 px-4 py-3 transition-colors hover:bg-white/5 ${
                    lesson.id === params.lessonId ? "border-r-2 border-csnb-orange bg-csnb-orange/10" : ""
                  }`}
                >
                  {lesson.completed ? (
                    <CheckCircle2 size={12} className="shrink-0 text-emerald-400" />
                  ) : lesson.id === params.lessonId ? (
                    <div className="h-3 w-3 shrink-0 rounded-full bg-csnb-orange" />
                  ) : (
                    <Circle size={12} className="shrink-0 text-csnb-border" />
                  )}
                  <span
                    className={`line-clamp-2 flex-1 font-sans text-xs ${
                      lesson.id === params.lessonId
                        ? "font-semibold text-white"
                        : lesson.completed
                          ? "text-csnb-muted/80"
                          : "text-csnb-muted group-hover:text-white"
                    }`}
                  >
                    {lesson.title}
                  </span>
                </Link>
              )}
            </div>
          ))}
        </div>
        <div className="border-t border-csnb-border p-4">
          <a
            href={SITE_CONTACT.zaloUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-2 rounded-md bg-csnb-orange py-2.5 font-heading text-xs font-bold uppercase tracking-wide text-white transition-colors hover:bg-csnb-orange-deep"
          >
            <MessageCircle size={14} /> Hỗ trợ qua Zalo
          </a>
        </div>
      </div>

      <a
        href={SITE_CONTACT.zaloUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed right-6 bottom-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-csnb-orange text-white shadow-lg transition-colors hover:bg-csnb-orange-deep lg:hidden"
        aria-label="Zalo hỗ trợ"
      >
        <MessageCircle size={20} />
      </a>
    </div>
  );
}
