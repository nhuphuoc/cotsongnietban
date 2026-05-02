"use client";

import Link from "next/link";
import { useState, useMemo, useEffect, useCallback, useRef, useLayoutEffect } from "react";
import { useParams } from "next/navigation";
import { SITE_CONTACT } from "@/lib/site-contact";
import type { DemoCourse, DemoLesson } from "@/lib/demo-courses";
import {
  getNextPlayableLesson,
  getCompletedLessonCount,
  getCourseProgressPercent,
  getCoursePhases,
  getLessonsForPhase,
  isPhaseComplete,
} from "@/lib/demo-courses";
import { getLmsCourseHref, getLmsHomeHref, getLmsLessonHref } from "@/lib/learning-hub";
import { LessonVideoPlayer } from "@/components/lms/lesson-video-player";
import { ArrowLeft, CheckCircle2, Clock, Lock, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

/** Nội dung Tổng quan: tối đa ~4 dòng, có Xem thêm / Thu gọn khi dài. */
function LessonOverviewRichText({ html, lessonKey }: { html: string; lessonKey: string }) {
  const [expanded, setExpanded] = useState(false);
  const [showToggle, setShowToggle] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setExpanded(false);
  }, [lessonKey, html]);

  const measureClamp = useCallback(() => {
    const el = bodyRef.current;
    if (!el || expanded) return;
    setShowToggle(el.scrollHeight > el.clientHeight + 2);
  }, [expanded]);

  useLayoutEffect(() => {
    measureClamp();
    const id = requestAnimationFrame(measureClamp);
    return () => cancelAnimationFrame(id);
  }, [html, expanded, measureClamp]);

  useEffect(() => {
    const el = bodyRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      if (!expanded) measureClamp();
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [expanded, measureClamp, html]);

  const toggleVisible = expanded || showToggle;

  return (
    <div>
      <div
        ref={bodyRef}
        className={cn(
          "prose prose-neutral max-w-none text-neutral-800 [&_p]:my-3 [&_ul]:list-disc [&_ol]:list-decimal [&_ul]:pl-6 [&_ol]:pl-6",
          !expanded && "line-clamp-4"
        )}
        dangerouslySetInnerHTML={{ __html: html }}
      />
      {toggleVisible ? (
        <button
          type="button"
          className="mt-2 font-sans text-sm font-medium text-[#004E4B] hover:underline"
          onClick={() => setExpanded((v) => !v)}
        >
          {expanded ? "Thu gọn" : "Xem thêm"}
        </button>
      ) : null}
    </div>
  );
}

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
        <Link href={getLmsHomeHref()} className="text-sm font-semibold text-[#004E4B] hover:underline">
          Về phòng học
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
        <header className="relative z-20 border-b border-white/15 bg-[#004E4B] px-4 py-3">
          <Link
            href={getLmsCourseHref(courseId)}
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
            href={getLmsCourseHref(courseId)}
            className="rounded-md bg-[#004E4B] px-5 py-2.5 font-sans text-sm font-semibold text-white hover:bg-[#003835]"
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
      getLessonHref={(lid) => getLmsLessonHref(courseId, lid)}
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
  getLessonHref,
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
  getLessonHref: (lessonId: string) => string;
}) {
  const completed = lesson.completed;

  const phases = getCoursePhases(course);

  return (
    <div className="flex min-h-[100dvh] flex-col bg-white">
      {/* Top nav */}
      <header className="relative z-20 flex shrink-0 items-center justify-between gap-3 border-b border-white/15 bg-[#004E4B] px-4 py-3 sm:px-5">
        <Link
          href={getLmsCourseHref(courseId)}
          className="inline-flex min-w-0 max-w-[min(100%,28rem)] items-center gap-2 text-xs font-medium text-white/90 no-underline hover:text-white hover:no-underline sm:text-sm"
        >
          <ArrowLeft className="size-4 shrink-0" />
          <span className="truncate font-semibold">{course.title}</span>
        </Link>
        <a
          href={SITE_CONTACT.zaloUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden shrink-0 items-center gap-1.5 font-sans text-xs font-medium text-white/60 no-underline hover:text-white sm:inline-flex"
        >
          <MessageCircle className="size-3.5" />
          Tư vấn
        </a>
      </header>

      {/* Lesson title */}
      <div className="shrink-0 border-b border-neutral-100 bg-white px-4 py-4 sm:px-6 sm:py-5">
        <div className="mx-auto max-w-5xl">
          <h1 className="font-sans text-xl font-bold text-neutral-900 sm:text-2xl">{lesson.title}</h1>
          {lesson.summary?.trim() ? (
            <p className="mt-2 max-w-3xl font-sans text-sm leading-relaxed text-neutral-600 sm:text-[15px]">
              {lesson.summary.trim()}
            </p>
          ) : null}
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 font-sans text-xs text-neutral-400">
            <span className="flex items-center gap-1">
              <Clock className="size-3.5" />
              {lesson.duration}
            </span>
            <span>Bài {currentIndex + 1} / {course.lessons.length}</span>
            <span className="tabular-nums">Tiến độ: {courseProgress}%</span>
            <span>{doneCount}/{course.lessons.length} đã xong</span>
          </div>
        </div>
      </div>

      {/* Video — bài có video; nội dung chi tiết nằm trong khối Tổng quan (content_html) */}
      {!lesson.isArticle ? (
        <div className="shrink-0">
          <LessonVideoPlayer
            variant="embed"
            src={lesson.videoUrl}
            provider={lesson.videoProvider}
            poster={course.thumbnail}
            title={lesson.title}
            className="mx-auto w-full max-w-5xl"
            hideTitle
          />
        </div>
      ) : null}

      {/* Tổng quan = Nội dung chi tiết (content_html trong admin) + hoàn thành + bài tiếp */}
      <div className="shrink-0 border-b border-neutral-200 bg-white">
        <div className="mx-auto max-w-5xl">
          <div className="border-b border-neutral-200 px-4 pt-3 sm:px-6">
            <h2 className="pb-2.5 font-sans text-sm font-semibold text-neutral-900 sm:pb-3">Tổng quan</h2>
          </div>

          <div className="px-4 py-5 sm:px-6">
            {lesson.contentHtml?.trim() ? (
              <LessonOverviewRichText lessonKey={lesson.id} html={lesson.contentHtml} />
            ) : (
              <p className="font-sans text-sm text-neutral-500">Chưa có nội dung chi tiết.</p>
            )}
            {saveError ? (
              <p className="mt-4 font-sans text-sm text-red-600" role="alert">{saveError}</p>
            ) : null}
            <div className="mt-6 flex flex-row flex-wrap items-center justify-between gap-x-4 gap-y-3 sm:mt-5">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2">
                {!completed ? (
                  <button
                    type="button"
                    onClick={() => void onApplyProgress(true)}
                    disabled={saving}
                    className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-md bg-[#004E4B] px-4 py-2 font-sans text-sm font-semibold text-white hover:bg-[#003835] disabled:cursor-not-allowed disabled:opacity-60 sm:min-h-9 sm:w-auto"
                  >
                    <CheckCircle2 className="size-4" />
                    {saving ? "Đang lưu…" : "Đánh dấu hoàn thành"}
                  </button>
                ) : (
                  <>
                    <span className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 font-sans text-sm font-semibold text-emerald-800 sm:min-h-9 sm:w-auto sm:px-3">
                      <CheckCircle2 className="size-4" />
                      Đã hoàn thành
                    </span>
                    <button
                      type="button"
                      onClick={() => void onApplyProgress(false)}
                      disabled={saving}
                      className="inline-flex min-h-10 w-full items-center justify-center rounded-md border border-neutral-300 bg-white px-3 py-2 font-sans text-sm font-medium text-neutral-700 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-60 sm:min-h-9 sm:w-auto"
                    >
                      {saving ? "Đang lưu…" : "Bỏ hoàn thành"}
                    </button>
                  </>
                )}
              </div>
              {nextLesson ? (
                <Link
                  href={getLmsLessonHref(courseId, nextLesson.id)}
                  className="ml-auto inline-flex min-h-10 shrink-0 items-center font-sans text-sm font-medium text-[#004E4B] hover:underline sm:min-h-9"
                >
                  Bài tiếp theo →
                </Link>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {/* Curriculum — phases with horizontal scroll per phase */}
      <div className="border-t border-neutral-100 bg-white py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        <div className="mx-auto max-w-5xl">
          <div className="mb-5 flex items-center justify-between px-4 sm:px-6">
            <h2 className="font-sans text-base font-bold text-neutral-900">Nội dung khóa học</h2>
            <span className="font-sans text-xs text-neutral-400">{doneCount}/{course.lessons.length} hoàn thành</span>
          </div>
          <div className="space-y-7">
            {phases.map((phase) => {
              const phaseLessons = getLessonsForPhase(course, phase);
              const completedInPhase = phaseLessons.filter((l) => l.completed).length;
              const phaseComplete = isPhaseComplete(course, phase);
              return (
                <div key={phase.id}>
                  {/* Phase header */}
                  <div className="mb-3 flex items-center gap-2 px-4 sm:px-6">
                    <span className="font-sans text-sm font-semibold text-neutral-800">{phase.title}</span>
                    <span className="font-sans text-xs text-neutral-400">{completedInPhase}/{phaseLessons.length}</span>
                    {phaseComplete && <CheckCircle2 className="size-3.5 text-emerald-500" />}
                  </div>
                  {/* Horizontal scroll row */}
                  <div className="flex gap-3 overflow-x-auto px-4 pb-2 sm:px-6 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    {phaseLessons.map((l) => {
                      const active = l.id === lesson.id;
                      const cardClass = cn(
                        "group relative w-44 shrink-0 overflow-hidden rounded-xl border transition-shadow hover:shadow-md sm:w-52",
                        active ? "border-[#004E4B]/40 ring-2 ring-[#004E4B]/20" : "border-neutral-200"
                      );
                      const cardInner = (
                        <>
                          <div className="relative aspect-video w-full overflow-hidden bg-neutral-100">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={l.thumbnail || phase.thumbnail || course.thumbnail}
                              alt={l.title}
                              className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                            {l.completed && (
                              <span className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-emerald-500 px-2 py-0.5 font-sans text-[10px] font-semibold text-white">
                                <CheckCircle2 className="size-3" />
                                Xong
                              </span>
                            )}
                            {active && !l.completed && (
                              <span className="absolute right-2 top-2 rounded-full bg-[#004E4B] px-2 py-0.5 font-sans text-[10px] font-semibold text-white">
                                Đang học
                              </span>
                            )}
                            {l.locked && (
                              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                <Lock className="size-5 text-white/80" />
                              </div>
                            )}
                            <span className="absolute bottom-2 left-2 rounded bg-black/60 px-1.5 py-0.5 font-sans text-[10px] tabular-nums text-white">
                              {l.duration}
                            </span>
                          </div>
                          <div className="bg-white p-2.5">
                            <p className={cn(
                              "line-clamp-2 font-sans text-xs leading-snug",
                              active ? "font-semibold text-[#0d403e]" : "font-medium text-neutral-800"
                            )}>
                              {l.title}
                            </p>
                          </div>
                        </>
                      );
                      if (l.locked) {
                        return <div key={l.id} className={cn(cardClass, "cursor-default opacity-50")}>{cardInner}</div>;
                      }
                      return (
                        <Link key={l.id} href={getLessonHref(l.id)} className={cn(cardClass, "no-underline hover:no-underline")}>
                          {cardInner}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
