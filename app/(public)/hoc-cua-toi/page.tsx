import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { Play, BookOpen, BarChart3, Calendar, Layers } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { listAccessibleEnrollmentsForUser } from "@/lib/api/repositories";

const FALLBACK_THUMB =
  "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=450&fit=crop";

type EnrollmentRow = {
  id: string;
  progress_percent: number;
  completed_lessons: number;
  expires_at: string | null;
  course: {
    id: string;
    title?: string | null;
    slug?: string | null;
    thumbnail_url?: string | null;
    lesson_count?: number | null;
    short_description?: string | null;
  } | null;
  last_lesson: { id: string; title?: string | null } | null;
};

export default async function HocCuaToiPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const enrollments = (await listAccessibleEnrollmentsForUser(user.id)) as EnrollmentRow[];

  const totalLessons = enrollments.reduce((acc, e) => acc + (e.course?.lesson_count ?? 0), 0);
  const avgProgress = enrollments.length
    ? Math.round(enrollments.reduce((acc, e) => acc + (e.progress_percent ?? 0), 0) / enrollments.length)
    : 0;

  const stats = [
    { value: String(enrollments.length), label: "Khóa đang học", icon: BookOpen, tone: "text-csnb-orange-deep" },
    { value: `${totalLessons || 0}`, label: "Bài trong các khóa", icon: Layers, tone: "text-csnb-ink" },
    { value: enrollments.length ? `${avgProgress}%` : "—", label: "Tiến độ trung bình", icon: BarChart3, tone: "text-sky-700" },
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
            Theo dõi tiến độ và mở phòng học LMS — dữ liệu theo tài khoản của bạn.
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

          {enrollments.length === 0 ? (
            <p className="rounded-xl border border-dashed border-csnb-border/35 bg-white p-8 text-center font-sans text-sm text-neutral-600">
              Bạn chưa có khóa học đang hoạt động.{" "}
              <Link href="/courses" className="font-semibold text-csnb-orange-deep underline-offset-2 hover:underline">
                Xem danh mục
              </Link>
            </p>
          ) : (
            <ul className="space-y-4">
              {enrollments.map((row) => {
                const course = row.course;
                if (!course) return null;
                const progress = Math.min(100, Math.max(0, row.progress_percent ?? 0));
                const done = row.completed_lessons ?? 0;
                const total = Math.max(course.lesson_count ?? 0, 1);
                const hrefId = (typeof course.slug === "string" && course.slug.trim()) || course.id;
                const nextLabel = row.last_lesson?.title?.trim()
                  ? row.last_lesson.title.length > 52
                    ? `${row.last_lesson.title.slice(0, 50)}…`
                    : row.last_lesson.title
                  : "Vào khóa học";
                const href = row.last_lesson
                  ? `/courses/${hrefId}/lessons/${row.last_lesson.id}`
                  : `/courses/${hrefId}`;
                const thumb =
                  (typeof course.thumbnail_url === "string" && course.thumbnail_url.trim()) || FALLBACK_THUMB;
                const title = (typeof course.title === "string" && course.title) || "Khóa học";

                return (
                  <li key={row.id}>
                    <article className="flex flex-col gap-4 overflow-hidden rounded-xl border border-csnb-border/25 bg-white p-4 shadow-sm transition-shadow hover:border-csnb-orange/25 hover:shadow-md sm:flex-row sm:items-center sm:gap-5 sm:p-5">
                      <Link href={href} className="relative aspect-video w-full shrink-0 overflow-hidden rounded-lg sm:aspect-[16/10] sm:w-44 md:w-52">
                        <Image src={thumb} alt="" fill className="object-cover" sizes="(max-width: 639px) 100vw, 208px" />
                      </Link>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <h3 className="font-sans text-base font-bold text-csnb-ink sm:text-lg">{title}</h3>
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
                            LMS
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
          )}
        </section>
      </div>
    </div>
  );
}
