"use client";

import Link from "next/link";
import { useState, useMemo, useEffect } from "react";
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
import { ArrowLeft, CheckCircle2, Clock, MessageCircle } from "lucide-react";

export default function LessonViewPage({
  params,
}: {
  params: { courseId: string; lessonId: string };
}) {
  const course = useMemo(() => getDemoCourse(params.courseId), [params.courseId]);
  const lesson = useMemo(
    () => course?.lessons.find((l) => l.id === params.lessonId),
    [course, params.lessonId]
  );

  const [completedLocal, setCompletedLocal] = useState(lesson?.completed ?? false);

  useEffect(() => {
    setCompletedLocal(lesson?.completed ?? false);
  }, [lesson?.completed, lesson?.id]);

  if (!course || !lesson) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 bg-neutral-100 p-8 text-center">
        <p className="font-sans text-sm text-neutral-600">Không tìm thấy bài học hoặc khóa học.</p>
        <Link href="/dashboard" className="text-sm font-semibold text-violet-700 hover:underline">
          Về dashboard
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
      <div className="flex min-h-full flex-col bg-neutral-100">
        <header className="relative z-20 border-b border-neutral-800 bg-[#1c1d1f] px-4 py-3">
          <Link
            href={`/courses/${params.courseId}`}
            className="inline-flex max-w-full items-center gap-2 text-xs font-medium text-white/85 no-underline hover:text-white hover:no-underline"
          >
            <ArrowLeft className="size-4 shrink-0" />
            <span className="truncate">{course.title}</span>
          </Link>
        </header>
        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-20">
          <p className="max-w-md text-center font-sans text-sm text-neutral-600">
            Bài <span className="font-semibold text-neutral-900">{lesson.title}</span> đang khóa. Hoàn thành các bài
            trước để mở.
          </p>
          <Link
            href={`/courses/${params.courseId}`}
            className="rounded-md bg-[#1c1d1f] px-5 py-2.5 font-sans text-sm font-semibold text-white hover:bg-black"
          >
            Về trang khóa học
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-col bg-neutral-100">
      <header className="relative z-20 flex shrink-0 items-center justify-between gap-3 border-b border-neutral-800 bg-[#1c1d1f] px-4 py-3 sm:px-5">
        <Link
          href={`/courses/${params.courseId}`}
          className="inline-flex min-w-0 max-w-[min(100%,28rem)] items-center gap-2 text-xs font-medium text-white/90 no-underline hover:text-white hover:no-underline sm:text-sm"
        >
          <ArrowLeft className="size-4 shrink-0" />
          <span className="truncate font-semibold">{course.title}</span>
        </Link>
        <span className="hidden shrink-0 font-sans text-[11px] text-white/55 sm:block">Không có khu vực bình luận</span>
      </header>

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row lg:items-stretch">
        <div className="flex min-w-0 min-h-0 flex-1 flex-col">
          <div className="relative z-0 shrink-0 border-t border-neutral-800/80 bg-black">
            <LessonVideoPlayer
              variant="embed"
              src={lesson.videoUrl}
              poster={course.thumbnail}
              title={lesson.title}
              className="mx-auto w-full max-w-5xl lg:max-w-none"
            />
          </div>

          <div className="flex min-h-0 flex-1 flex-col border-t border-neutral-200 bg-white">
            <Tabs defaultValue="overview" className="flex min-h-0 flex-1 flex-col">
              <div className="shrink-0 border-b border-neutral-200 px-4 pt-3 sm:px-6">
                <TabsList variant="line" className="h-auto w-full justify-start gap-4 rounded-none bg-transparent p-0">
                  <TabsTrigger value="overview" className="rounded-none px-0 pb-3 text-sm">
                    Tổng quan
                  </TabsTrigger>
                  <TabsTrigger value="notes" className="rounded-none px-0 pb-3 text-sm">
                    Ghi chú
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="overview" className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6">
                <h1 className="font-sans text-lg font-bold text-neutral-900 sm:text-xl">{lesson.title}</h1>
                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 font-sans text-xs text-neutral-500">
                  <span className="flex items-center gap-1">
                    <Clock className="size-3.5" />
                    {lesson.duration}
                  </span>
                  <span>
                    Bài {currentIndex + 1} / {course.lessons.length}
                  </span>
                  <span className="tabular-nums">Tiến độ khóa: {courseProgress}%</span>
                  <span>
                    {doneCount}/{course.lessons.length} đã xong
                  </span>
                </div>
                <p className="mt-4 max-w-2xl font-sans text-sm leading-relaxed text-neutral-600">
                  {course.description}
                </p>
                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setCompletedLocal(true)}
                    disabled={completedLocal}
                    className={
                      completedLocal
                        ? "inline-flex cursor-default items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-2 font-sans text-sm font-semibold text-emerald-800"
                        : "inline-flex items-center gap-2 rounded-md bg-violet-600 px-4 py-2 font-sans text-sm font-semibold text-white hover:bg-violet-700"
                    }
                  >
                    <CheckCircle2 className="size-4" />
                    {completedLocal ? "Đã hoàn thành" : "Đánh dấu hoàn thành"}
                  </button>
                  {nextLesson ? (
                    <Link
                      href={`/courses/${params.courseId}/lessons/${nextLesson.id}`}
                      className="font-sans text-sm font-medium text-violet-700 hover:underline"
                    >
                      Bài tiếp theo →
                    </Link>
                  ) : null}
                </div>
              </TabsContent>

              <TabsContent value="notes" className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6">
                <div className="max-w-2xl rounded-lg border border-neutral-200 bg-neutral-50/80 p-4 font-sans text-sm leading-relaxed text-neutral-700">
                  {lesson.notesIntro ? <p className="mb-3 text-neutral-900">{lesson.notesIntro}</p> : null}
                  {lesson.noteBullets && lesson.noteBullets.length > 0 ? (
                    <ul className="space-y-2">
                      {lesson.noteBullets.map((line, i) => (
                        <li key={i} className="flex gap-2">
                          <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-violet-500" />
                          {line}
                        </li>
                      ))}
                    </ul>
                  ) : !lesson.notesIntro ? (
                    <ul className="space-y-2">
                      <li className="flex gap-2">
                        <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-violet-500" />
                        Khởi động nhẹ trước khi vào tải chính.
                      </li>
                      <li className="flex gap-2">
                        <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-violet-500" />
                        Giữ form trong tầm kiểm soát — chất lượng hơn số lần.
                      </li>
                    </ul>
                  ) : null}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        <aside className="flex w-full shrink-0 flex-col border-t border-neutral-200 bg-white lg:w-[min(100%,380px)] lg:border-t-0 lg:border-l lg:border-neutral-200">
          <div className="flex max-h-[min(52vh,440px)] min-h-[min(44vh,320px)] flex-1 flex-col overflow-hidden lg:max-h-none lg:min-h-0 lg:flex-1">
            <CourseCurriculumSidebar course={course} courseId={params.courseId} activeLessonId={lesson.id} />
          </div>
          <div className="shrink-0 border-t border-neutral-200 p-3">
            <a
              href={SITE_CONTACT.zaloUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-md border border-neutral-200 bg-neutral-50 py-2.5 font-sans text-xs font-semibold text-neutral-800 transition-colors hover:bg-neutral-100"
            >
              <MessageCircle className="size-4" />
              Tư vấn trực tiếp
            </a>
          </div>
        </aside>
      </div>
    </div>
  );
}
