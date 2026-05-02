import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { Clock, BookOpen, CheckCircle2, AlertCircle, Play } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { listAccessibleEnrollmentsForUser } from "@/lib/api/repositories";
import { getLmsCourseHref, getLmsHomeHref } from "@/lib/learning-hub";

type CourseSummary = {
  id: string;
  title: string;
  slug?: string | null;
  thumbnail_url?: string | null;
  lesson_count?: number | null;
  short_description?: string | null;
  description?: string | null;
};

type EnrollmentRow = {
  id: string;
  expires_at: string | null;
  progress_percent: number;
  completed_lessons: number;
  last_activity_at?: string | null;
  course: CourseSummary | null;
  last_lesson: { title: string } | null;
};

function daysLeft(iso: string | null): number {
  if (!iso) return 9999;
  const end = new Date(iso).getTime();
  return Math.max(0, Math.ceil((end - Date.now()) / 86400000));
}

const FALLBACK_THUMB =
  "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=450&fit=crop";

function formatRelativeVi(iso: string | null | undefined): string {
  if (!iso) return "";
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return "";
  const diff = Date.now() - t;
  const m = Math.floor(diff / 60000);
  if (m < 1) return "Vừa xong";
  if (m < 60) return `${m} phút trước`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} giờ trước`;
  const d = Math.floor(h / 24);
  if (d < 14) return `${d} ngày trước`;
  return new Date(iso).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export default async function StudentDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const enrollmentsRows = (await listAccessibleEnrollmentsForUser(user.id)) as EnrollmentRow[];

  const totalCompleted = enrollmentsRows.reduce((acc, e) => acc + (e.completed_lessons ?? 0), 0);
  const totalLessonsLib = enrollmentsRows.reduce((acc, e) => acc + (e.course?.lesson_count ?? 0), 0);
  const dlVals = enrollmentsRows.map((e) => daysLeft(e.expires_at)).filter((d) => d < 9000);
  const avgDaysLeft = dlVals.length ? Math.round(dlVals.reduce((a, b) => a + b, 0) / dlVals.length) : 0;

  const activityRows = [...enrollmentsRows]
    .filter((e) => e.last_activity_at)
    .sort((a, b) => new Date(b.last_activity_at!).getTime() - new Date(a.last_activity_at!).getTime())
    .slice(0, 6);

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="font-heading text-2xl font-black uppercase tracking-wide text-neutral-900">Phòng học</h1>
        <p className="mt-1 font-sans text-sm text-neutral-600">Tập trung vào việc học — tiếp tục đúng bài, đúng khóa.</p>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: "Khóa đang học", value: String(enrollmentsRows.length), icon: BookOpen, color: "text-[#004E4B]" },
          { label: "Bài đã hoàn thành", value: String(totalCompleted), icon: CheckCircle2, color: "text-emerald-600" },
          { label: "Tổng bài trong khóa", value: String(totalLessonsLib), icon: Clock, color: "text-neutral-700" },
          {
            label: "Ngày còn lại (TB)",
            value: enrollmentsRows.length ? String(avgDaysLeft) : "—",
            icon: AlertCircle,
            color: "text-sky-600",
          },
        ].map((stat, i) => (
          <div key={i} className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
            <stat.icon size={20} className={`${stat.color} mb-2`} />
            <div className="font-heading text-xl font-black text-neutral-900">{stat.value}</div>
            <div className="mt-0.5 font-sans text-xs text-neutral-500">{stat.label}</div>
          </div>
        ))}
      </div>

      <h2 className="mb-4 font-heading text-sm font-bold uppercase tracking-wider text-neutral-900">Khóa học của tôi</h2>

      {enrollmentsRows.length === 0 ? (
        <div className="mb-8 rounded-xl border border-dashed border-neutral-300 bg-white p-8 text-center font-sans text-sm text-neutral-600">
          Bạn chưa có khóa học đang hoạt động.{" "}
          <Link href="/courses" className="font-semibold text-[#004E4B] underline-offset-2 hover:underline">
            Xem các khoá học hiện có
          </Link>
        </div>
      ) : (
        <div className="mb-8 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {enrollmentsRows.map((row) => {
            const course = row.course;
            if (!course) return null;
            const progress = Math.min(100, Math.max(0, row.progress_percent ?? 0));
            const completedLessons = row.completed_lessons ?? 0;
            const totalLessons = course.lesson_count ?? 0;
            const dl = daysLeft(row.expires_at);
            const nextLabel = row.last_lesson?.title
              ? row.last_lesson.title.length > 48
                ? `${row.last_lesson.title.slice(0, 46)}…`
                : row.last_lesson.title
              : completedLessons >= totalLessons && totalLessons > 0
                ? "Đã hoàn thành chương trình"
                : "Tiếp tục học";
            const hrefId = course.slug || course.id;
            const resumeHref = `${getLmsCourseHref(String(hrefId))}/resume`;
            return (
              <div
                key={row.id}
                className="flex min-h-0 flex-col gap-3 overflow-hidden rounded-xl border border-neutral-200 bg-white p-3 shadow-sm transition-shadow hover:shadow-md md:flex-row md:items-center md:gap-3"
              >
                {/* Thumbnail */}
                <div className="relative mx-auto h-24 w-full max-w-xs shrink-0 overflow-hidden rounded-lg md:mx-0 md:h-20 md:w-32 lg:w-36">
                  <Image
                    src={course.thumbnail_url || FALLBACK_THUMB}
                    alt={course.title}
                    fill
                    sizes="(max-width: 767px) 320px, 144px"
                    className="object-cover"
                  />
                  {row.expires_at && (
                    <span className={`absolute bottom-1 right-1 rounded px-1.5 py-0.5 font-heading text-[10px] font-bold text-white ${dl <= 30 ? "bg-orange-600" : "bg-sky-600"}`}>
                      {dl}d
                    </span>
                  )}
                </div>

                <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-2 md:flex-row md:items-center md:gap-3">
                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <h3 className="line-clamp-2 font-heading text-sm font-bold text-neutral-900 md:truncate">{course.title}</h3>
                    <p className="mt-0.5 font-sans text-[11px] text-neutral-400">
                      {totalLessons > 0 ? `${Math.min(completedLessons, totalLessons)}/${totalLessons} bài` : "0 bài"}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-neutral-200">
                        <div className="h-full rounded-full bg-[#004E4B]" style={{ width: `${progress}%` }} />
                      </div>
                      <span className="shrink-0 font-heading text-[11px] font-bold tabular-nums text-[#004E4B]">{progress}%</span>
                    </div>
                    <p className="mt-1.5 line-clamp-2 font-sans text-[11px] text-neutral-500 md:truncate">Tiếp: {nextLabel}</p>
                  </div>

                  {/* CTA */}
                  <Link
                    href={resumeHref}
                    className="inline-flex shrink-0 items-center justify-center gap-1 rounded-lg bg-neutral-900 px-3 py-2 font-heading text-xs font-bold uppercase tracking-wide text-white transition-colors hover:bg-black md:self-center"
                  >
                    <Play size={11} /> Học
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <h2 className="mb-4 font-heading text-sm font-bold uppercase tracking-wider text-neutral-900">Hoạt động gần đây</h2>
      <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
        {activityRows.length === 0 ? (
          <div className="flex items-start gap-3 p-4">
            <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-neutral-400" />
            <div className="flex-1">
              <div className="font-heading text-sm font-semibold text-neutral-700">Chưa có hoạt động ghi nhận</div>
              <div className="mt-0.5 font-sans text-xs text-neutral-500">
                Khi bạn đánh dấu hoàn thành bài trên LMS, hoạt động sẽ hiển thị tại đây.
              </div>
            </div>
          </div>
        ) : (
          <ul className="divide-y divide-neutral-100">
            {activityRows.map((row) => {
              const c = row.course;
              const title = c?.title ?? "Khóa học";
              const lessonLine = row.last_lesson?.title ? `Bài: ${row.last_lesson.title}` : "Cập nhật tiến độ";
              const when = formatRelativeVi(row.last_activity_at);
              const hrefId = c?.slug || c?.id;
              return (
                <li key={row.id}>
                  <Link
                    href={hrefId ? getLmsCourseHref(String(hrefId)) : getLmsHomeHref()}
                    className="flex items-start gap-3 p-4 transition-colors hover:bg-neutral-50"
                  >
                    <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-600" />
                    <div className="min-w-0 flex-1">
                      <div className="font-heading text-sm font-semibold text-neutral-900">{title}</div>
                      <div className="mt-0.5 line-clamp-2 font-sans text-xs text-neutral-600">{lessonLine}</div>
                      {when ? <div className="mt-1 font-sans text-[11px] text-neutral-500">{when}</div> : null}
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

