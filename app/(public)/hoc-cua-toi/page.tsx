import Link from "next/link";
import Image from "next/image";
import { Play, BookOpen, BarChart3, Calendar, Layers } from "lucide-react";
import {
  demoCourses,
  getCourseProgressPercent,
  getCompletedLessonCount,
  getNextPlayableLessonFromStart,
  getNextOpenLessonTitle,
} from "@/lib/demo-courses";

export default function HocCuaToiPage() {
  const totalLessons = demoCourses.reduce((acc, c) => acc + c.lessons.length, 0);
  const avgProgress = Math.round(
    demoCourses.reduce((acc, c) => acc + getCourseProgressPercent(c), 0) / Math.max(demoCourses.length, 1)
  );

  const stats = [
    { value: String(demoCourses.length), label: "Khóa đang học", icon: BookOpen, tone: "text-csnb-orange-deep" },
    { value: `${totalLessons}+`, label: "Bài giảng", icon: Layers, tone: "text-csnb-ink" },
    { value: `${avgProgress}%`, label: "Tiến độ TB (demo)", icon: BarChart3, tone: "text-sky-700" },
  ];

  return (
    <div className="relative min-h-screen overflow-x-clip bg-gradient-to-b from-white via-csnb-panel/35 to-csnb-panel pt-20">
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="csnb-ambient-mesh-surface absolute inset-0 opacity-[0.4]" aria-hidden />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 pb-16 sm:px-6 lg:px-8">
        <header className="border-b border-csnb-border/15 py-8 sm:py-10">
          <h1 className="font-sans text-2xl font-extrabold tracking-tight text-csnb-ink sm:text-3xl md:text-4xl">
            Khóa học của tôi
          </h1>
          <p className="mt-2 max-w-xl font-sans text-sm leading-relaxed text-neutral-600 sm:text-base">
            Theo dõi tiến độ và tiếp tục học các chương trình demo — giao diện thống nhất với hệ thống CSNB.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {stats.map((s) => (
              <div
                key={s.label}
                className="flex items-center gap-4 rounded-xl border border-csnb-border/25 bg-white p-5 shadow-sm"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-csnb-panel ring-1 ring-csnb-border/20">
                  <s.icon className={`size-5 ${s.tone}`} strokeWidth={2} />
                </span>
                <div>
                  <div className={`font-sans text-2xl font-extrabold tabular-nums ${s.tone}`}>{s.value}</div>
                  <div className="mt-0.5 font-sans text-xs font-medium text-neutral-500">{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        </header>

        <section className="mt-10" aria-labelledby="enrolled-heading">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <h2 id="enrolled-heading" className="font-sans text-lg font-bold text-csnb-ink sm:text-xl">
              Đang học
            </h2>
            <Link
              href="/courses"
              className="inline-flex min-h-11 items-center font-sans text-sm font-semibold text-csnb-orange-deep underline-offset-2 hover:underline"
            >
              Xem thêm khóa công khai →
            </Link>
          </div>

          <ul className="space-y-4">
            {demoCourses.map((course) => {
              const progress = getCourseProgressPercent(course);
              const done = getCompletedLessonCount(course);
              const total = course.lessons.length;
              const next = getNextPlayableLessonFromStart(course);
              const nextLabel = getNextOpenLessonTitle(course);
              const href = next ? `/hoc/${course.id}/${next.id}` : `/hoc/${course.id}/${course.lessons[0]?.id}`;

              return (
                <li key={course.id}>
                  <article className="flex flex-col gap-4 overflow-hidden rounded-xl border border-csnb-border/25 bg-white p-4 shadow-sm transition-shadow hover:border-csnb-orange/25 hover:shadow-md sm:flex-row sm:items-center sm:gap-5 sm:p-5">
                    <Link
                      href={href}
                      className="relative aspect-video w-full shrink-0 overflow-hidden rounded-lg sm:aspect-[16/10] sm:w-44 md:w-52"
                    >
                      <Image
                        src={course.thumbnail}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="(max-width: 639px) 100vw, 208px"
                      />
                    </Link>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <h3 className="font-sans text-base font-bold text-csnb-ink sm:text-lg">{course.title}</h3>
                        <span className="shrink-0 font-sans text-sm font-extrabold tabular-nums text-csnb-orange-deep">
                          {progress}%
                        </span>
                      </div>
                      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-csnb-panel ring-1 ring-csnb-border/15">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-csnb-orange-deep to-csnb-orange"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 font-sans text-xs text-neutral-500">
                        <span className="line-clamp-1">Tiếp theo: {nextLabel}</span>
                        <span className="text-csnb-border/60">·</span>
                        <span>
                          {done}/{total} bài
                        </span>
                        <span className="hidden items-center gap-1 sm:inline-flex">
                          <Calendar className="size-3.5 text-csnb-orange-deep/80" aria-hidden />
                          Cập nhật demo
                        </span>
                      </div>
                    </div>
                    <Link
                      href={href}
                      className="inline-flex shrink-0 items-center justify-center gap-2 self-stretch rounded-md bg-csnb-orange px-5 py-3 font-sans text-sm font-bold text-white transition-colors hover:bg-csnb-orange-deep sm:self-center"
                    >
                      <Play className="size-4 shrink-0 fill-current" />
                      Tiếp tục học
                    </Link>
                  </article>
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    </div>
  );
}
