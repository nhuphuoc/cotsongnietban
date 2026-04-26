import Link from "next/link";
import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Play, Clock } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { getEnrollmentCourseBundleForUser } from "@/lib/api/repositories";
import { buildLmsCourseViewModel } from "@/lib/lms/build-lms-course-view-model";
import {
  getCourseProgressPercent,
  getCompletedLessonCount,
  getCoursePhases,
  getLessonsForPhase,
  isPhaseComplete,
  firstPlayableLessonIdInPhase,
} from "@/lib/demo-courses";
import { getLmsHomeHref, getLmsLessonHref } from "@/lib/learning-hub";

function looksLikeHtml(s: string): boolean {
  return /<\w[\s\S]*>/.test(s);
}

export default async function CourseDetailPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId: routeCourseKey } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const bundle = await getEnrollmentCourseBundleForUser(user.id, routeCourseKey);
  if (!bundle) notFound();

  const course = buildLmsCourseViewModel({
    enrollment: bundle.enrollment as { id: string; expires_at: string | null },
    course: bundle.course,
    completedLessonIds: bundle.completedLessonIds,
  });

  const progress = getCourseProgressPercent(course);
  const completedCount = getCompletedLessonCount(course);
  const nextLesson = course.lessons.find((l) => !l.completed && !l.locked);
  const phases = getCoursePhases(course);
  const showExpiryBanner = course.daysLeft <= 60 && course.daysLeft < 9000;

  return (
    <div className="min-h-full bg-neutral-100 pb-10">
      <header className="sticky top-0 z-10 border-b border-neutral-200 bg-[#1c1d1f] px-4 py-3 sm:px-6">
        <div className="mx-auto flex max-w-6xl items-center gap-3">
          <Link
            href={getLmsHomeHref()}
            className="inline-flex shrink-0 items-center gap-1.5 text-xs font-medium text-white/80 transition-colors hover:text-white"
          >
            <ArrowLeft className="size-4" />
            <span className="hidden sm:inline">Phòng học</span>
          </Link>
          <span className="h-4 w-px shrink-0 bg-white/15" aria-hidden />
          <h1 className="min-w-0 truncate font-sans text-sm font-semibold text-white">{course.title}</h1>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-3 pt-4 sm:px-6 sm:pt-6">
        <div className="mb-6 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
          <div className="relative aspect-[16/10] bg-neutral-900 sm:aspect-video">
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
                  href={getLmsLessonHref(routeCourseKey, nextLesson.id)}
                  className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-[#1c1d1f] px-4 py-2.5 font-sans text-sm font-semibold text-white shadow-lg transition-colors hover:bg-black sm:min-h-11 sm:px-5"
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

          <div className="border-t border-neutral-100 p-4 sm:p-6">
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
            {looksLikeHtml(course.description) ? (
              <div
                className="prose prose-sm mt-2 max-w-3xl text-neutral-700 [&_p]:my-2 [&_ul]:list-disc [&_ol]:list-decimal [&_ul]:pl-6 [&_ol]:pl-6"
                dangerouslySetInnerHTML={{ __html: course.description }}
              />
            ) : (
              <p className="mt-2 max-w-3xl font-sans text-sm leading-relaxed text-neutral-600">{course.description}</p>
            )}
            <p className="mt-2 font-sans text-xs text-neutral-500">
              Truy cập đến <span className="font-medium text-neutral-700">{course.expiresAt}</span>
              {course.daysLeft < 9000 ? (
                <>
                  {" "}
                  — còn <span className="tabular-nums font-medium text-neutral-700">{course.daysLeft}</span> ngày
                </>
              ) : null}
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
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
            {phases.map((phase) => {
              const lessons = getLessonsForPhase(course, phase);
              const complete = isPhaseComplete(course, phase);
              const firstId = firstPlayableLessonIdInPhase(course, phase);
              const inner = (
                <div className="flex min-h-full items-stretch sm:block">
                  <div className="relative h-24 w-28 shrink-0 bg-neutral-100 sm:h-auto sm:w-auto sm:aspect-[16/10]">
                    <Image
                      src={phase.thumbnail}
                      alt=""
                      fill
                      sizes="(max-width: 640px) 100vw, 33vw"
                      className="object-cover"
                    />
                    {complete ? (
                      <span className="absolute top-1.5 right-1.5 rounded bg-emerald-600 px-2 py-0.5 font-sans text-[10px] font-semibold text-white sm:top-2 sm:right-2">
                        Hoàn thành
                      </span>
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1 p-3 sm:p-4">
                    <h4 className="line-clamp-2 font-sans text-[13px] font-bold leading-snug text-neutral-900 sm:text-sm">{phase.title}</h4>
                    <p className="mt-1 line-clamp-2 font-sans text-[11px] leading-relaxed text-neutral-600 sm:line-clamp-3 sm:text-xs">{phase.description}</p>
                    <span className="mt-2 inline-block rounded-full bg-emerald-50 px-2.5 py-0.5 font-sans text-[11px] font-medium text-emerald-800 sm:mt-3">
                      {lessons.length} bài
                    </span>
                  </div>
                </div>
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
                  href={getLmsLessonHref(routeCourseKey, firstId)}
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
