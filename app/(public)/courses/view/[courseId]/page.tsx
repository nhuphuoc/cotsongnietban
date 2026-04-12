import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, Star, User, Layers, Clock, BookOpen, Infinity, Smartphone, Lock } from "lucide-react";
import {
  getDemoCourse,
  getCoursePhases,
  getLessonsForPhase,
} from "@/lib/demo-courses";
import { getCatalogMarketingExtras, getDetailMarketingMeta } from "@/lib/marketing-course-dummies";
import { CourseProgramAccordion, type ProgramPhase } from "@/components/marketing/course-program-accordion";

export default async function MarketingCourseDetailPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;
  const course = getDemoCourse(courseId);
  if (!course) notFound();

  const meta = getDetailMarketingMeta(courseId);
  const catalog = getCatalogMarketingExtras(courseId);
  const phases = getCoursePhases(course);
  const programPhases: ProgramPhase[] = phases.map((p) => ({
    id: p.id,
    title: p.title,
    lessons: getLessonsForPhase(course, p).map((l) => ({
      id: l.id,
      title: l.title,
      duration: l.duration,
    })),
  }));

  const lessonCount = course.lessons.length;

  return (
    <div className="min-h-screen overflow-x-clip bg-gradient-to-b from-white via-csnb-panel/35 to-csnb-panel pb-16 pt-20 sm:pb-20">
      <section className="relative border-b border-csnb-border/20">
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-b-2xl sm:rounded-b-3xl">
            <div className="relative aspect-[21/9] min-h-[200px] w-full sm:aspect-[21/8] sm:min-h-[240px]">
              <Image
                src={course.thumbnail}
                alt=""
                fill
                priority
                className="object-cover"
                sizes="(max-width: 1152px) 100vw, 1152px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-csnb-ink/92 via-csnb-ink/55 to-csnb-ink/20" />
              <div className="absolute inset-0 flex flex-col justify-end p-5 sm:p-8 lg:p-10">
                <span className="mb-2 inline-flex w-fit rounded-full border border-white/25 bg-white/10 px-3 py-1 font-sans text-[11px] font-semibold uppercase tracking-wide text-white/95 backdrop-blur-sm">
                  {course.level}
                </span>
                <h1 className="max-w-3xl font-sans text-2xl font-extrabold leading-tight tracking-tight text-white sm:text-3xl lg:text-4xl">
                  {course.title}
                </h1>
                <p className="mt-2 max-w-2xl font-sans text-sm leading-relaxed text-white/85 sm:text-base">
                  {course.description}
                </p>
                <div className="mt-4 flex flex-col gap-2 font-sans text-xs text-white/80 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-5 sm:gap-y-2 sm:text-sm">
                  <span className="inline-flex items-center gap-1.5">
                    <Star className="size-4 shrink-0 text-csnb-orange-bright" aria-hidden />
                    <span className="font-semibold text-white">{meta.rating}</span>
                    <span className="text-white/60">đánh giá</span>
                  </span>
                  <span className="hidden h-4 w-px bg-white/25 sm:block" aria-hidden />
                  <span className="inline-flex items-center gap-1.5">
                    <User className="size-4 shrink-0 text-white/70" aria-hidden />
                    <span>{meta.instructorName}</span>
                    <span className="text-white/55">· {meta.instructorTitle}</span>
                  </span>
                  <span className="hidden h-4 w-px bg-white/25 sm:block" aria-hidden />
                  <span className="inline-flex items-center gap-1.5">
                    <Layers className="size-4 shrink-0 text-white/70" aria-hidden />
                    {lessonCount} bài học
                  </span>
                  <span className="hidden h-4 w-px bg-white/25 sm:block" aria-hidden />
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="size-4 shrink-0 text-white/70" aria-hidden />
                    {course.totalDurationLabel}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto mt-8 max-w-6xl px-4 sm:px-6 lg:px-8">
        <nav className="mb-6 flex flex-wrap items-center gap-x-1 gap-y-1 font-sans text-xs text-neutral-500">
          <Link href="/" className="shrink-0 transition-colors hover:text-csnb-orange-deep">
            Trang chủ
          </Link>
          <span className="shrink-0 text-csnb-border/80">/</span>
          <Link href="/courses" className="shrink-0 transition-colors hover:text-csnb-orange-deep">
            Khóa học
          </Link>
          <span className="shrink-0 text-csnb-border/80">/</span>
          <span className="min-w-0 font-medium leading-snug text-csnb-ink sm:line-clamp-2">{course.title}</span>
        </nav>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
          <div className="min-w-0 space-y-10">
            <section>
              <h2 className="mb-3 font-sans text-lg font-bold text-csnb-ink">Mô tả khóa học</h2>
              <div className="rounded-xl border border-csnb-border/25 bg-white p-5 shadow-sm sm:p-6">
                <p className="font-sans text-sm leading-relaxed text-neutral-700 sm:text-[0.9375rem]">{course.description}</p>
                <p className="mt-4 font-sans text-sm leading-relaxed text-neutral-600">
                  Chương trình được thiết kế theo từng module, có video minh họa và gợi ý chỉnh tư thế an toàn. Bạn có thể
                  học theo tốc độ của riêng mình; phần demo trên website dùng dữ liệu mẫu để minh họa giao diện.
                </p>
              </div>
            </section>

            <section>
              <h2 className="mb-3 font-sans text-lg font-bold text-csnb-ink">Bạn sẽ học được gì?</h2>
              <div className="rounded-xl border border-csnb-border/25 bg-white p-5 shadow-sm sm:p-6">
                <ul className="grid gap-3 sm:grid-cols-2">
                  {meta.outcomes.map((line, i) => (
                    <li key={i} className="flex gap-2.5 font-sans text-sm leading-snug text-neutral-700">
                      <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-csnb-orange" aria-hidden />
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            <section>
              <h2 className="mb-3 font-sans text-lg font-bold text-csnb-ink">Nội dung chương trình</h2>
              {programPhases.length > 0 ? (
                <CourseProgramAccordion phases={programPhases} />
              ) : null}
            </section>
          </div>

          <aside className="lg:sticky lg:top-24">
            <div className="overflow-hidden rounded-xl border border-csnb-border/25 bg-white shadow-md">
              <div className="relative aspect-video w-full">
                <Image src={course.thumbnail} alt="" fill className="object-cover" sizes="340px" />
                <div className="absolute inset-0 flex items-center justify-center bg-csnb-ink/35">
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/95 text-csnb-orange-deep shadow-lg ring-1 ring-csnb-border/20">
                    <span className="sr-only">Xem giới thiệu</span>
                    <svg viewBox="0 0 24 24" className="ml-0.5 size-7" fill="currentColor" aria-hidden>
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </span>
                </div>
              </div>
              <div className="p-5 sm:p-6">
                <p className="font-sans text-2xl font-extrabold tabular-nums text-csnb-orange-deep">{catalog.priceLabel}</p>
                <Link
                  href="/login"
                  className="mt-4 flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-csnb-orange px-4 py-3 font-sans text-sm font-bold text-white transition-colors hover:bg-csnb-orange-deep"
                >
                  <span className="text-lg leading-none">▶</span>
                  Bắt đầu học ngay
                </Link>
                <Link
                  href={`/courses/${course.id}`}
                  className="mt-2 flex min-h-11 w-full items-center justify-center rounded-md border border-csnb-border/40 px-4 py-2.5 font-sans text-sm font-semibold text-csnb-ink transition-colors hover:border-csnb-orange/40 hover:text-csnb-orange-deep"
                >
                  Đã có tài khoản — vào LMS
                </Link>

                <ul className="mt-6 space-y-3 border-t border-csnb-border/15 pt-5 font-sans text-sm text-neutral-600">
                  <li className="flex gap-3">
                    <BookOpen className="mt-0.5 size-4 shrink-0 text-csnb-orange-deep" aria-hidden />
                    <span>{lessonCount} bài giảng video</span>
                  </li>
                  <li className="flex gap-3">
                    <Clock className="mt-0.5 size-4 shrink-0 text-csnb-orange-deep" aria-hidden />
                    <span>{course.totalDurationLabel} học tập</span>
                  </li>
                  <li className="flex gap-3">
                    <Infinity className="mt-0.5 size-4 shrink-0 text-csnb-orange-deep" aria-hidden />
                    <span>Truy cập theo thời hạn gói (demo)</span>
                  </li>
                  <li className="flex gap-3">
                    <Smartphone className="mt-0.5 size-4 shrink-0 text-csnb-orange-deep" aria-hidden />
                    <span>Học trên mọi thiết bị</span>
                  </li>
                </ul>

                <p className="mt-5 flex gap-2 border-t border-csnb-border/15 pt-4 font-sans text-[11px] leading-relaxed text-neutral-500">
                  <Lock className="mt-0.5 size-3.5 shrink-0 text-neutral-400" aria-hidden />
                  {meta.trustLine}
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
