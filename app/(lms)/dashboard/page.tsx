import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { Clock, BookOpen, CheckCircle2, AlertCircle, Play } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { listAccessibleEnrollmentsForUser } from "@/lib/api/repositories";

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

export default async function DashboardPage() {
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
        <h1 className="font-heading text-2xl font-black uppercase tracking-wide text-neutral-900">Xin chào, học viên!</h1>
        <p className="mt-1 font-sans text-sm text-neutral-600">Tiếp tục hành trình phục hồi của bạn hôm nay.</p>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: "Khóa đang học", value: String(enrollmentsRows.length), icon: BookOpen, color: "text-violet-600" },
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
          <Link href="/courses" className="font-semibold text-violet-700 underline-offset-2 hover:underline">
            Xem chương trình công khai
          </Link>
        </div>
      ) : (
        <div className="mb-8 grid grid-cols-1 gap-5 lg:grid-cols-2">
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
            const desc =
              (course.short_description && course.short_description.trim()) ||
              (course.description && course.description.trim()) ||
              "";
            const hrefId = course.slug || course.id;
            return (
              <div
                key={row.id}
                className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="relative aspect-video">
                  <Image
                    src={course.thumbnail_url || FALLBACK_THUMB}
                    alt={course.title}
                    fill
                    sizes="(max-width: 1023px) 100vw, 50vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
                  <div className="absolute right-3 bottom-3 left-3 flex items-center justify-between text-xs text-white">
                    <span className="font-heading font-bold">
                      {totalLessons > 0
                        ? `${Math.min(completedLessons, totalLessons)}/${totalLessons} bài`
                        : "0 bài"}
                    </span>
                    {row.expires_at ? (
                      <span
                        className={`rounded px-2 py-0.5 font-heading font-bold ${
                          dl <= 30 ? "bg-orange-600" : "bg-sky-600"
                        }`}
                      >
                        Còn {dl} ngày
                      </span>
                    ) : (
                      <span className="rounded bg-sky-600 px-2 py-0.5 font-heading font-bold">Không giới hạn</span>
                    )}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="mb-1 font-heading text-base font-bold text-neutral-900">{course.title}</h3>
                  <p className="mb-3 line-clamp-2 font-sans text-xs text-neutral-600">{desc || "Khóa học trực tuyến"}</p>
                  <div className="mb-3">
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="text-neutral-500">Tiến độ</span>
                      <span className="font-heading font-bold tabular-nums text-violet-700">{progress}%</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-neutral-200">
                      <div className="h-full rounded-full bg-violet-600" style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <span className="line-clamp-2 font-sans text-xs text-neutral-600">Tiếp: {nextLabel}</span>
                    <Link
                      href={`/courses/${hrefId}`}
                      className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-md bg-neutral-900 px-3 py-1.5 font-heading text-xs font-bold uppercase tracking-wide text-white transition-colors hover:bg-black"
                    >
                      <Play size={12} /> Học ngay
                    </Link>
                  </div>
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
                  <Link href={hrefId ? `/courses/${hrefId}` : "/dashboard"} className="flex items-start gap-3 p-4 transition-colors hover:bg-neutral-50">
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
