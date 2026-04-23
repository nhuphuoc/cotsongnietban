"use client";

import Link from "next/link";
import { useState, useMemo, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { SITE_CONTACT } from "@/lib/site-contact";
import type { DemoCourse, DemoLesson } from "@/lib/demo-courses";
import {
  getNextPlayableLesson,
  getCompletedLessonCount,
  getCourseProgressPercent,
} from "@/lib/demo-courses";
import { LessonVideoPlayer } from "@/components/lms/lesson-video-player";
import { CourseCurriculumSidebar } from "@/components/lms/course-curriculum-sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, CheckCircle2, Clock, MessageCircle } from "lucide-react";

export default function LessonViewPage() {
  const params = useParams<{ courseId: string; lessonId: string }>();
  const courseId = typeof params.courseId === "string" ? params.courseId : params.courseId?.[0] ?? "";
  const lessonId = typeof params.lessonId === "string" ? params.lessonId : params.lessonId?.[0] ?? "";

  const [course, setCourse] = useState<DemoCourse | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const loadCourse = useCallback(async () => {
    if (!courseId) {
      setLoading(false);
      setLoadError("Thiếu mã khóa học.");
      return;
    }
    setLoading(true);
    setLoadError(null);
    try {
      const res = await fetch(`/api/me/courses/${encodeURIComponent(courseId)}`, { credentials: "same-origin" });
      const json = (await res.json()) as { data?: { course: DemoCourse }; error?: { message?: string } };
      if (!res.ok) {
        setCourse(null);
        setLoadError(json.error?.message ?? "Không tải được khóa học.");
        return;
      }
      const c = json.data?.course;
      if (!c) {
        setCourse(null);
        setLoadError("Dữ liệu khóa học không hợp lệ.");
        return;
      }
      setCourse(c);
    } catch {
      setCourse(null);
      setLoadError("Lỗi mạng hoặc máy chủ.");
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await loadCourse();
      if (cancelled) return;
    })();
    return () => {
      cancelled = true;
    };
  }, [loadCourse]);

  const lesson = useMemo(() => course?.lessons.find((l) => l.id === lessonId), [course, lessonId]);

  const applyProgress = useCallback(
    async (isCompleted: boolean) => {
      if (!courseId || !lessonId) return;
      setSaving(true);
      setSaveError(null);
      try {
        const res = await fetch(
          `/api/me/courses/${encodeURIComponent(courseId)}/lessons/${encodeURIComponent(lessonId)}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            credentials: "same-origin",
            body: JSON.stringify({ is_completed: isCompleted }),
          }
        );
        const json = (await res.json()) as { data?: { course: DemoCourse }; error?: { message?: string } };
        if (!res.ok) {
          setSaveError(json.error?.message ?? "Không lưu được tiến độ.");
          return;
        }
        const c = json.data?.course;
        if (c) setCourse(c);
      } catch {
        setSaveError("Lỗi mạng hoặc máy chủ.");
      } finally {
        setSaving(false);
      }
    },
    [courseId, lessonId]
  );

  if (loading) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 bg-neutral-100 p-8">
        <p className="font-sans text-sm text-neutral-600">Đang tải bài học…</p>
      </div>
    );
  }

  if (loadError || !course || !lesson) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 bg-neutral-100 p-8 text-center">
        <p className="font-sans text-sm text-neutral-600">{loadError ?? "Không tìm thấy bài học hoặc khóa học."}</p>
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
            href={`/courses/${courseId}`}
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
            href={`/courses/${courseId}`}
            className="rounded-md bg-[#1c1d1f] px-5 py-2.5 font-sans text-sm font-semibold text-white hover:bg-black"
          >
            Về trang khóa học
          </Link>
        </div>
      </div>
    );
  }

  return (
    <LessonViewLoaded
      course={course}
      lesson={lesson}
      courseId={courseId}
      currentIndex={currentIndex}
      nextLesson={nextLesson}
      doneCount={doneCount}
      courseProgress={courseProgress}
      saving={saving}
      saveError={saveError}
      onApplyProgress={applyProgress}
    />
  );
}

function LessonViewLoaded({
  course,
  lesson,
  courseId,
  currentIndex,
  nextLesson,
  doneCount,
  courseProgress,
  saving,
  saveError,
  onApplyProgress,
}: {
  course: DemoCourse;
  lesson: DemoLesson;
  courseId: string;
  currentIndex: number;
  nextLesson: DemoLesson | null;
  doneCount: number;
  courseProgress: number;
  saving: boolean;
  saveError: string | null;
  onApplyProgress: (isCompleted: boolean) => void | Promise<void>;
}) {
  const completed = lesson.completed;

  return (
    <div className="flex min-h-[100dvh] flex-col overflow-x-clip bg-neutral-100 lg:min-h-full">
      <header className="relative z-20 flex shrink-0 items-center justify-between gap-3 border-b border-neutral-800 bg-[#1c1d1f] px-4 py-3 sm:px-5">
        <Link
          href={`/courses/${courseId}`}
          className="inline-flex min-w-0 max-w-[min(100%,28rem)] items-center gap-2 text-xs font-medium text-white/90 no-underline hover:text-white hover:no-underline sm:text-sm"
        >
          <ArrowLeft className="size-4 shrink-0" />
          <span className="truncate font-semibold">{course.title}</span>
        </Link>
        <span className="hidden shrink-0 font-sans text-[11px] text-white/55 sm:block">Không có khu vực bình luận</span>
      </header>

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row lg:items-stretch">
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <div className="relative z-0 shrink-0 border-t border-neutral-800/80 bg-black">
            <LessonVideoPlayer
              variant="embed"
              src={lesson.videoUrl}
              provider={lesson.videoProvider}
              poster={course.thumbnail}
              title={lesson.title}
              className="mx-auto w-full max-w-5xl lg:max-w-none"
            />
          </div>

          <div className="flex min-h-0 flex-1 flex-col border-t border-neutral-200 bg-white">
            <Tabs defaultValue="overview" className="flex min-h-0 flex-1 flex-col">
              <div className="shrink-0 overflow-x-auto border-b border-neutral-200 px-4 pt-3 sm:px-6 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <TabsList variant="line" className="h-auto min-w-max justify-start gap-4 rounded-none bg-transparent p-0 sm:w-full sm:min-w-0">
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
                <p className="mt-4 max-w-2xl font-sans text-sm leading-relaxed text-neutral-600">{course.description}</p>

                {saveError ? (
                  <p className="mt-3 font-sans text-sm text-red-600" role="alert">
                    {saveError}
                  </p>
                ) : null}

                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                  {!completed ? (
                    <button
                      type="button"
                      onClick={() => void onApplyProgress(true)}
                      disabled={saving}
                      className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-violet-600 px-4 py-2 font-sans text-sm font-semibold text-white hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                    >
                      <CheckCircle2 className="size-4" />
                      {saving ? "Đang lưu…" : "Đánh dấu hoàn thành"}
                    </button>
                  ) : (
                    <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center sm:gap-3">
                      <span className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-2 font-sans text-sm font-semibold text-emerald-800 sm:w-auto">
                        <CheckCircle2 className="size-4" />
                        Đã hoàn thành
                      </span>
                      <button
                        type="button"
                        onClick={() => void onApplyProgress(false)}
                        disabled={saving}
                        className="inline-flex min-h-11 items-center justify-center rounded-md border border-neutral-300 bg-white px-4 py-2 font-sans text-sm font-medium text-neutral-700 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {saving ? "Đang lưu…" : "Bỏ hoàn thành"}
                      </button>
                    </div>
                  )}
                  {nextLesson ? (
                    <Link
                      href={`/courses/${courseId}/lessons/${nextLesson.id}`}
                      className="inline-flex min-h-11 items-center font-sans text-sm font-medium text-violet-700 hover:underline sm:min-h-0"
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
            <CourseCurriculumSidebar course={course} courseId={courseId} activeLessonId={lesson.id} />
          </div>
          <div className="shrink-0 border-t border-neutral-200 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            <a
              href={SITE_CONTACT.zaloUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-11 w-full items-center justify-center gap-2 rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2.5 font-sans text-xs font-semibold text-neutral-800 transition-colors hover:bg-neutral-100"
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
