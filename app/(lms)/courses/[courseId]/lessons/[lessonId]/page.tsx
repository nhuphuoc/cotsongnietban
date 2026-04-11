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
    <div className="flex flex-col lg:flex-row h-full">
      {/* Main Video Area */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Back */}
        <div className="px-6 py-3 border-b border-[#222] flex items-center gap-3">
          <Link
            href={`/courses/${params.courseId}`}
            className="flex items-center gap-1.5 text-[#a0a0a0] hover:text-white text-xs transition-colors font-heading"
          >
            <ArrowLeft size={14} /> Phục Hồi Lưng Cơ Bản
          </Link>
          <ChevronRight size={12} className="text-[#333]" />
          <span className="text-white text-xs font-heading truncate">{currentLesson.title}</span>
        </div>

        {/* Video Player */}
        <div className="relative bg-black" style={{ aspectRatio: "16/9", maxHeight: "calc(100vh - 200px)" }}>
          {/* Bunny.net placeholder */}
          <div
            className="w-full h-full flex items-center justify-center"
            onContextMenu={(e) => e.preventDefault()}
          >
            <div className="text-center">
              <div className="w-20 h-20 border-2 border-[#c0392b]/30 rounded-full flex items-center justify-center mx-auto mb-4 cursor-pointer hover:border-[#c0392b] transition-colors group">
                <div className="w-0 h-0 border-t-[14px] border-t-transparent border-l-[24px] border-l-[#c0392b] border-b-[14px] border-b-transparent ml-1 group-hover:border-l-white transition-colors" />
              </div>
              <div className="text-[#a0a0a0] text-sm">
                Bunny.net Video Player
              </div>
              <div className="text-[#333] text-xs mt-1">
                Video ID: bunny-video-placeholder
              </div>
            </div>
          </div>

          {/* Transparent overlay to prevent right-click download */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ userSelect: "none" }}
          />
        </div>

        {/* Lesson Info & CTA */}
        <div className="px-6 py-4 border-t border-[#222] bg-[#111]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="font-heading font-bold text-white text-base">{currentLesson.title}</h1>
              <div className="flex items-center gap-3 mt-1 text-[#a0a0a0] text-xs">
                <span className="flex items-center gap-1"><Clock size={11} /> {currentLesson.duration}</span>
                <span>Bài {currentIndex + 1} / {lessons.length}</span>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              {nextLesson && !nextLesson.locked && (
                <Link
                  href={`/courses/${params.courseId}/lessons/${nextLesson.id}`}
                  className="text-xs text-[#a0a0a0] hover:text-white transition-colors font-heading"
                >
                  Bài tiếp →
                </Link>
              )}
              <button
                onClick={() => setCompleted(true)}
                disabled={completed}
                className={`flex items-center gap-2 text-sm font-heading font-bold px-4 py-2 rounded-sm uppercase tracking-wide transition-colors ${
                  completed
                    ? "bg-green-600/20 text-green-400 border border-green-600/30 cursor-default"
                    : "bg-[#c0392b] hover:bg-[#96281b] text-white"
                }`}
              >
                <CheckCircle2 size={15} />
                {completed ? "Đã Hoàn Thành" : "Đánh Dấu Hoàn Thành"}
              </button>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="px-6 py-5 flex-1">
          <h2 className="font-heading font-bold text-white text-sm uppercase tracking-wide mb-3">
            Ghi Chú Bài Học
          </h2>
          <div className="bg-[#111] border border-[#222] rounded-sm p-4 text-[#a0a0a0] text-sm leading-relaxed">
            <p className="mb-2">
              <strong className="text-white">Corrective Hip Hinge</strong> là một trong những chuyển động cơ bản quan trọng nhất để bảo vệ cột sống thắt lưng.
            </p>
            <ul className="space-y-1 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-[#c0392b] mt-1">•</span>
                Giữ lưng thẳng, không cong vẹo
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#c0392b] mt-1">•</span>
                Tập trung vào việc gấp hông, không gấp lưng
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#c0392b] mt-1">•</span>
                Hít thở đúng nhịp: hít vào khi xuống, thở ra khi lên
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Lesson List Sidebar */}
      <div className="w-full lg:w-72 border-t lg:border-t-0 lg:border-l border-[#222] bg-[#111] flex flex-col">
        <div className="p-4 border-b border-[#222]">
          <h2 className="font-heading font-bold text-white text-xs uppercase tracking-wider">
            Nội Dung Khóa Học
          </h2>
          <div className="text-[#a0a0a0] text-xs mt-1">9/12 bài hoàn thành</div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {lessons.map((lesson, i) => (
            <div
              key={lesson.id}
              className={`${i < lessons.length - 1 ? "border-b border-[#222]" : ""}`}
            >
              {lesson.locked ? (
                <div className="flex items-center gap-3 px-4 py-3 opacity-40">
                  <Lock size={12} className="text-[#a0a0a0] shrink-0" />
                  <span className="text-[#a0a0a0] text-xs flex-1 line-clamp-2">{lesson.title}</span>
                </div>
              ) : (
                <Link
                  href={`/courses/${params.courseId}/lessons/${lesson.id}`}
                  className={`flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors group ${
                    lesson.id === params.lessonId ? "bg-[#c0392b]/10 border-r-2 border-[#c0392b]" : ""
                  }`}
                >
                  {lesson.completed ? (
                    <CheckCircle2 size={12} className="text-green-400 shrink-0" />
                  ) : lesson.id === params.lessonId ? (
                    <div className="w-3 h-3 bg-[#c0392b] rounded-full shrink-0" />
                  ) : (
                    <Circle size={12} className="text-[#333] shrink-0" />
                  )}
                  <span className={`text-xs flex-1 line-clamp-2 ${
                    lesson.id === params.lessonId
                      ? "text-white font-semibold"
                      : lesson.completed
                      ? "text-[#555]"
                      : "text-[#a0a0a0] group-hover:text-white"
                  }`}>
                    {lesson.title}
                  </span>
                </Link>
              )}
            </div>
          ))}
        </div>
        <div className="p-4 border-t border-[#222]">
          <a
            href={SITE_CONTACT.zaloUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full bg-[#0068FF] hover:bg-[#0051CC] text-white text-xs font-heading font-bold py-2.5 rounded-sm uppercase tracking-wide transition-colors"
          >
            <MessageCircle size={14} /> Hỗ Trợ Qua Zalo
          </a>
        </div>
      </div>

      {/* Floating Zalo */}
      <a
        href={SITE_CONTACT.zaloUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 bg-[#0068FF] hover:bg-[#0051CC] text-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-colors lg:hidden"
      >
        <MessageCircle size={20} />
      </a>
    </div>
  );
}
