"use client";

import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import { SITE_CONTACT } from "@/lib/site-contact";
import {
  getDemoCourse,
  getNextPlayableLesson,
  getCompletedLessonCount,
  getCourseProgressPercent,
} from "@/lib/demo-courses";
import { LessonVideoPlayer } from "@/components/lms/lesson-video-player";
import { CourseCurriculumSidebar } from "@/components/lms/course-curriculum-sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, CheckCircle2, Clock, FileText, MessageCircle } from "lucide-react";

const dummyMaterials = [
  { title: "Checklist khởi động & an toàn (PDF)", meta: "240 KB · Demo" },
  { title: "Bảng theo dõi tiến độ buổi tập", meta: "Google Sheet · Demo" },
  { title: "Tham chiếu tư thế (ảnh minh họa)", meta: "1,2 MB · Demo" },
];

type Props = {
  courseId: string;
  lessonId: string;
};

export function PublicHocLessonClient({ courseId, lessonId }: Props) {
  const course = useMemo(() => getDemoCourse(courseId), [courseId]);
  const lesson = useMemo(() => course?.lessons.find((l) => l.id === lessonId), [course, lessonId]);

  const [completedLocal, setCompletedLocal] = useState(lesson?.completed ?? false);

  useEffect(() => {
    setCompletedLocal(lesson?.completed ?? false);
  }, [lesson?.completed, lesson?.id]);

  const lessonHref = useMemo(() => (lid: string) => `/hoc/${courseId}/${lid}`, [courseId]);

  if (!course || !lesson) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 bg-gradient-to-b from-white to-csnb-panel/40 px-8 pt-24 pb-8 text-center sm:pt-28">
        <p className="font-sans text-sm text-neutral-600">Không tìm thấy bài học hoặc khóa học.</p>
        <Link href="/hoc-cua-toi" className="font-sans text-sm font-semibold text-csnb-orange-deep hover:underline">
          Về Khóa học của tôi
        </Link>
      </div>
    );
  }

  const currentIndex = course.lessons.findIndex((l) => l.id === lesson.id);
  const nextLesson = getNextPlayableLesson(course, lesson.id);
  const doneCount = getCompletedLessonCount(course);
  const courseProgress = getCourseProgressPercent(course);

  if (lesson.locked) {
    return (
      <div className="flex min-h-full flex-col bg-gradient-to-b from-white to-csnb-panel/35 pt-16 sm:pt-[4.25rem]">
        <header className="border-b border-csnb-border bg-csnb-bg px-4 py-3 sm:px-6">
          <Link
            href="/hoc-cua-toi"
            className="inline-flex max-w-full items-center gap-2 font-sans text-xs font-medium text-csnb-muted hover:text-white"
          >
            <ArrowLeft className="size-4 shrink-0" />
            <span className="truncate text-white/95">Khóa học của tôi</span>
          </Link>
        </header>
        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-20">
          <p className="max-w-md text-center font-sans text-sm text-neutral-600">
            Bài <span className="font-semibold text-csnb-ink">{lesson.title}</span> đang khóa trong bản demo.
          </p>
          <Link
            href="/hoc-cua-toi"
            className="rounded-md bg-csnb-orange px-5 py-2.5 font-sans text-sm font-semibold text-white hover:bg-csnb-orange-deep"
          >
            Quay lại danh sách
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[100dvh] flex-col overflow-x-clip bg-gradient-to-b from-csnb-panel/30 via-white to-csnb-panel/40 pt-16 sm:pt-[4.25rem]">
      <header className="sticky top-16 z-30 flex shrink-0 items-center justify-between gap-3 border-b border-csnb-border bg-csnb-bg px-4 py-3 sm:top-[4.25rem] sm:px-6">
        <Link
          href="/hoc-cua-toi"
          className="inline-flex min-w-0 max-w-[min(100%,24rem)] items-center gap-2 font-sans text-xs font-medium text-csnb-muted hover:text-white sm:text-sm"
        >
          <ArrowLeft className="size-4 shrink-0" />
          <span className="truncate font-semibold text-white/95">{course.title}</span>
        </Link>
        <span className="hidden shrink-0 font-sans text-[11px] text-csnb-muted sm:block">Giao diện học (demo)</span>
      </header>

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row lg:items-stretch">
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <div className="shrink-0 border-b border-csnb-border/30 bg-black">
            <LessonVideoPlayer
              variant="embed"
              src={lesson.videoUrl}
              poster={course.thumbnail}
              title={lesson.title}
              className="mx-auto w-full max-w-5xl lg:max-w-none"
            />
            <p className="px-4 py-2 text-center font-sans text-xs text-white/70 sm:px-6">Nhấn để xem bài giảng</p>
          </div>

          <div className="flex min-h-0 flex-1 flex-col border-t border-csnb-border/20 bg-white">
            <Tabs defaultValue="overview" className="flex min-h-0 flex-1 flex-col">
              <div className="shrink-0 overflow-x-auto border-b border-csnb-border/20 px-4 pt-3 sm:px-6 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <TabsList variant="line" className="h-auto min-w-max justify-start gap-6 rounded-none bg-transparent p-0 sm:w-full sm:min-w-0">
                  <TabsTrigger
                    value="overview"
                    className="rounded-none border-0 px-0 pb-3 font-sans text-sm data-active:text-csnb-ink after:bg-csnb-orange-deep"
                  >
                    Tổng quan
                  </TabsTrigger>
                  <TabsTrigger
                    value="materials"
                    className="rounded-none border-0 px-0 pb-3 font-sans text-sm data-active:text-csnb-ink after:bg-csnb-orange-deep"
                  >
                    Tài liệu đính kèm
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="overview" className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6">
                <h1 className="font-sans text-lg font-bold text-csnb-ink sm:text-xl">{lesson.title}</h1>
                <p className="mt-2 font-sans text-sm text-neutral-500">
                  Coach CSNB · CSNB Academy · Bài {currentIndex + 1} / {course.lessons.length}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 font-sans text-xs text-neutral-500">
                  <span className="flex items-center gap-1">
                    <Clock className="size-3.5 text-csnb-orange-deep" />
                    {lesson.duration}
                  </span>
                  <span className="tabular-nums">Tiến độ: {courseProgress}%</span>
                  <span>
                    {doneCount}/{course.lessons.length} đã xong
                  </span>
                </div>
                <p className="mt-4 max-w-2xl font-sans text-sm leading-relaxed text-neutral-600">{course.description}</p>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                  <button
                    type="button"
                    onClick={() => setCompletedLocal(true)}
                    disabled={completedLocal}
                    className={
                      completedLocal
                        ? "inline-flex min-h-11 w-full cursor-default items-center justify-center gap-2 rounded-md border border-csnb-border/40 bg-csnb-panel px-4 py-2 font-sans text-sm font-semibold text-csnb-ink sm:w-auto"
                        : "inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-csnb-orange px-4 py-2 font-sans text-sm font-semibold text-white hover:bg-csnb-orange-deep sm:w-auto"
                    }
                  >
                    <CheckCircle2 className="size-4" />
                    {completedLocal ? "Đã hoàn thành (demo)" : "Đánh dấu hoàn thành"}
                  </button>
                  {nextLesson ? (
                    <Link
                      href={lessonHref(nextLesson.id)}
                      className="inline-flex min-h-11 items-center font-sans text-sm font-semibold text-csnb-orange-deep hover:underline sm:min-h-0"
                    >
                      Bài tiếp theo →
                    </Link>
                  ) : null}
                </div>
              </TabsContent>

              <TabsContent value="materials" className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6">
                <ul className="max-w-xl divide-y divide-csnb-border/20 rounded-xl border border-csnb-border/25 bg-csnb-panel/40">
                  {dummyMaterials.map((m) => (
                    <li key={m.title} className="flex items-start gap-3 p-4">
                      <FileText className="mt-0.5 size-4 shrink-0 text-csnb-orange-deep" aria-hidden />
                      <div className="min-w-0">
                        <p className="font-sans text-sm font-semibold text-csnb-ink">{m.title}</p>
                        <p className="mt-0.5 font-sans text-xs text-neutral-500">{m.meta}</p>
                        <button
                          type="button"
                          disabled
                          className="mt-2 font-sans text-xs font-medium text-csnb-orange-deep/60"
                        >
                          Tải xuống (demo)
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        <aside className="flex w-full shrink-0 flex-col border-t border-csnb-border/25 bg-white lg:w-[min(100%,380px)] lg:border-t-0 lg:border-l lg:border-csnb-border/25">
          <div className="flex max-h-[min(52vh,440px)] min-h-[min(44vh,320px)] flex-1 flex-col overflow-hidden lg:max-h-none lg:min-h-0 lg:flex-1">
            <CourseCurriculumSidebar
              course={course}
              courseId={courseId}
              activeLessonId={lesson.id}
              getLessonHref={lessonHref}
              accent="brand"
            />
          </div>
          <div className="shrink-0 border-t border-csnb-border/20 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            <a
              href={SITE_CONTACT.zaloUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-11 w-full items-center justify-center gap-2 rounded-md border border-csnb-border/35 bg-csnb-panel/60 px-3 py-2.5 font-sans text-xs font-semibold text-csnb-ink transition-colors hover:border-csnb-orange/40 hover:bg-csnb-orange/10"
            >
              <MessageCircle className="size-4 text-csnb-orange-deep" />
              Tư vấn trực tiếp
            </a>
          </div>
        </aside>
      </div>
    </div>
  );
}
