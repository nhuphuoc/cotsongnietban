import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, Play, Clock } from "lucide-react";
import {
  getDemoCourse,
  getCourseProgressPercent,
  getCompletedLessonCount,
  getCoursePhases,
  getLessonsForPhase,
  isPhaseComplete,
  firstPlayableLessonIdInPhase,
} from "@/lib/demo-courses";

export default function CourseDetailPage({ params }: { params: { courseId: string } }) {
  const course = getDemoCourse(params.courseId);
  if (!course) notFound();

  const progress = getCourseProgressPercent(course);
  const completedCount = getCompletedLessonCount(course);
  const nextLesson = course.lessons.find((l) => !l.completed && !l.locked);
  const phases = getCoursePhases(course);
  const showExpiryBanner = course.daysLeft <= 60;

  return (
    <div className="min-h-full bg-neutral-100 pb-10">
      <header className="sticky top-0 z-10 border-b border-neutral-200 bg-[#1c1d1f] px-4 py-3 sm:px-6">
        <div className="mx-auto flex max-w-6xl items-center gap-3">
          <Link
            href="/dashboard"
            className="inline-flex shrink-0 items-center gap-1.5 text-xs font-medium text-white/80 transition-colors hover:text-white"
          >
            <ArrowLeft className="size-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </Link>
          <span className="h-4 w-px shrink-0 bg-white/15" aria-hidden />
          <h1 className="min-w-0 truncate font-sans text-sm font-semibold text-white">{course.title}</h1>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 pt-6 sm:px-6">
        <div className="mb-6 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
          <div className="relative aspect-video bg-neutral-900">
            <Image
              src={course.thumbnail}
              alt={course.title}
              fill
              sizes="(max-width: 1024px) 100vw, 896px"
              className="object-cover"
              priority
            />
            {showExpiryBanner ? (
              <div className="absolute inset-x-0 top-0 bg-sky-600 px-4 py-2 text-center font-sans text-xs font-semibold text-white sm:text-sm">
                Quyền truy cập chương trình còn {course.daysLeft} ngày — hết hạn {course.expiresAt}
              </div>
            ) : null}
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              {nextLesson ? (
                <Link
                  href={`/courses/${course.id}/lessons/${nextLesson.id}`}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[#1c1d1f] px-5 py-2.5 font-sans text-sm font-semibold text-white shadow-lg transition-colors hover:bg-black"
                >
                  <Play className="size-4 shrink-0 fill-current" />
                  Tiếp tục học
                </Link>
              ) : (
                <span className="rounded-md bg-white/90 px-4 py-2 font-sans text-sm text-neutral-700">
                  Đã hoàn thành các bài mở hoặc chờ mở khóa
                </span>
              )}
            </div>
          </div>

          <div className="border-t border-neutral-100 p-5 sm:p-6">
            <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-neutral-500">
              <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 font-medium text-emerald-800">{course.level}</span>
              <span className="flex items-center gap-1">
                <Clock className="size-3.5" />
                {course.totalDurationLabel}
              </span>
              <span>
                {completedCount}/{course.lessons.length} bài
              </span>
              {phases.length > 1 ? (
                <span className="rounded-full bg-violet-50 px-2.5 py-0.5 font-medium text-violet-800">
                  {phases.length} giai đoạn
                </span>
              ) : null}
            </div>
            <h2 className="font-sans text-xl font-bold tracking-tight text-neutral-900 sm:text-2xl">{course.title}</h2>
            <p className="mt-2 max-w-3xl font-sans text-sm leading-relaxed text-neutral-600">{course.description}</p>
            <p className="mt-2 font-sans text-xs text-neutral-500">
              Truy cập đến <span className="font-medium text-neutral-700">{course.expiresAt}</span> — còn{" "}
              <span className="tabular-nums font-medium text-neutral-700">{course.daysLeft}</span> ngày
            </p>

            <div className="mt-5">
              <div className="mb-1.5 flex items-center justify-between text-xs font-medium text-neutral-600">
                <span>Tiến độ</span>
                <span className="tabular-nums text-neutral-900">{progress}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-neutral-200">
                <div className="h-full rounded-full bg-violet-600 transition-[width]" style={{ width: `${progress}%` }} />
              </div>
            </div>
          </div>
        </div>

        <section>
          <h3 className="mb-4 font-sans text-lg font-bold text-neutral-900">Giai đoạn</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {phases.map((phase) => {
              const lessons = getLessonsForPhase(course, phase);
              const complete = isPhaseComplete(course, phase);
              const firstId = firstPlayableLessonIdInPhase(course, phase);
              const inner = (
                <>
                  <div className="relative aspect-[16/10] bg-neutral-100">
                    <Image
                      src={phase.thumbnail}
                      alt=""
                      fill
                      sizes="(max-width: 640px) 100vw, 33vw"
                      className="object-cover"
                    />
                    {complete ? (
                      <span className="absolute top-2 right-2 rounded bg-emerald-600 px-2 py-0.5 font-sans text-[10px] font-semibold text-white">
                        Hoàn thành
                      </span>
                    ) : null}
                  </div>
                  <div className="p-4">
                    <h4 className="font-sans text-sm font-bold text-neutral-900">{phase.title}</h4>
                    <p className="mt-1 line-clamp-3 font-sans text-xs leading-relaxed text-neutral-600">{phase.description}</p>
                    <span className="mt-3 inline-block rounded-full bg-emerald-50 px-2.5 py-0.5 font-sans text-[11px] font-medium text-emerald-800">
                      {lessons.length} bài
                    </span>
                  </div>
                </>
              );

              if (!firstId) {
                return (
                  <div
                    key={phase.id}
                    className="overflow-hidden rounded-xl border border-neutral-200 bg-white opacity-60 shadow-sm"
                  >
                    {inner}
                  </div>
                );
              }

              return (
                <Link
                  key={phase.id}
                  href={`/courses/${course.id}/lessons/${firstId}`}
                  className="block overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm transition-shadow hover:shadow-md"
                >
                  {inner}
                </Link>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
