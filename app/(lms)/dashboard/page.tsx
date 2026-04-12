import Link from "next/link";
import Image from "next/image";
import { Clock, BookOpen, CheckCircle2, AlertCircle, Play } from "lucide-react";
import {
  demoCourses,
  getCourseProgressPercent,
  getCompletedLessonCount,
  getNextOpenLessonTitle,
} from "@/lib/demo-courses";

const recentActivity = [
  { lesson: "Bài 9: Posterior Chain Activation", course: "Phục hồi lưng cơ bản", time: "2 tiếng trước", completed: true },
  { lesson: "Bài 6: Breathing mechanics", course: "Corrective exercise nâng cao", time: "Hôm qua", completed: true },
  { lesson: "Bài 8: Hip mobility drill", course: "Phục hồi lưng cơ bản", time: "2 ngày trước", completed: true },
];

export default function DashboardPage() {
  const enrolled = demoCourses.slice(0, 2);
  const totalCompleted = demoCourses.reduce((acc, c) => acc + getCompletedLessonCount(c), 0);
  const avgDaysLeft = Math.round(
    demoCourses.reduce((acc, c) => acc + c.daysLeft, 0) / Math.max(demoCourses.length, 1)
  );

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="font-heading text-2xl font-black uppercase tracking-wide text-neutral-900">Xin chào, học viên!</h1>
        <p className="mt-1 font-sans text-sm text-neutral-600">Tiếp tục hành trình phục hồi của bạn hôm nay.</p>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: "Khóa đang học", value: String(enrolled.length), icon: BookOpen, color: "text-violet-600" },
          { label: "Bài đã hoàn thành", value: String(totalCompleted), icon: CheckCircle2, color: "text-emerald-600" },
          { label: "Khóa trong thư viện", value: String(demoCourses.length), icon: Clock, color: "text-neutral-700" },
          { label: "Ngày còn lại (TB)", value: String(avgDaysLeft), icon: AlertCircle, color: "text-sky-600" },
        ].map((stat, i) => (
          <div key={i} className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
            <stat.icon size={20} className={`${stat.color} mb-2`} />
            <div className="font-heading text-xl font-black text-neutral-900">{stat.value}</div>
            <div className="mt-0.5 font-sans text-xs text-neutral-500">{stat.label}</div>
          </div>
        ))}
      </div>

      <h2 className="mb-4 font-heading text-sm font-bold uppercase tracking-wider text-neutral-900">Khóa học của tôi</h2>
      <div className="mb-8 grid grid-cols-1 gap-5 lg:grid-cols-2">
        {enrolled.map((course) => {
          const progress = getCourseProgressPercent(course);
          const completedLessons = getCompletedLessonCount(course);
          const totalLessons = course.lessons.length;
          const nextLabel = getNextOpenLessonTitle(course);
          return (
            <div
              key={course.id}
              className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="relative aspect-video">
                <Image
                  src={course.thumbnail}
                  alt={course.title}
                  fill
                  sizes="(max-width: 1023px) 100vw, 50vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
                <div className="absolute right-3 bottom-3 left-3 flex items-center justify-between text-xs text-white">
                  <span className="font-heading font-bold">
                    {completedLessons}/{totalLessons} bài
                  </span>
                  <span
                    className={`rounded px-2 py-0.5 font-heading font-bold ${
                      course.daysLeft <= 30 ? "bg-orange-600" : "bg-sky-600"
                    }`}
                  >
                    Còn {course.daysLeft} ngày
                  </span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="mb-1 font-heading text-base font-bold text-neutral-900">{course.title}</h3>
                <p className="mb-3 line-clamp-2 font-sans text-xs text-neutral-600">{course.description}</p>
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
                    href={`/courses/${course.id}`}
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

      <h2 className="mb-4 font-heading text-sm font-bold uppercase tracking-wider text-neutral-900">Hoạt động gần đây</h2>
      <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
        {recentActivity.map((activity, i) => (
          <div
            key={i}
            className={`flex items-start gap-3 p-4 ${i < recentActivity.length - 1 ? "border-b border-neutral-100" : ""}`}
          >
            <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-600" />
            <div className="flex-1">
              <div className="font-heading text-sm font-semibold text-neutral-900">{activity.lesson}</div>
              <div className="mt-0.5 font-sans text-xs text-neutral-500">{activity.course}</div>
            </div>
            <span className="shrink-0 font-sans text-xs text-neutral-500">{activity.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
