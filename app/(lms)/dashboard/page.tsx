import Link from "next/link";
import Image from "next/image";
import { Clock, BookOpen, CheckCircle2, AlertCircle, Play } from "lucide-react";

const courses = [
  {
    id: "1",
    title: "Phục Hồi Lưng Cơ Bản",
    description: "Lộ trình 12 bài giảng từ nền tảng đến nâng cao cho người mới bắt đầu.",
    thumbnail: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=225&fit=crop",
    progress: 75,
    completedLessons: 9,
    totalLessons: 12,
    expiresAt: "30/06/2024",
    daysLeft: 75,
    lastLesson: "Bài 10: Corrective Hip Hinge",
    status: "active",
  },
  {
    id: "2",
    title: "Corrective Exercise Nâng Cao",
    description: "Khóa học chuyên sâu với 20 bài giảng cho học viên đã có nền tảng.",
    thumbnail: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&h=225&fit=crop",
    progress: 30,
    completedLessons: 6,
    totalLessons: 20,
    expiresAt: "31/12/2024",
    daysLeft: 258,
    lastLesson: "Bài 7: Scapular Control",
    status: "active",
  },
];

const recentActivity = [
  { lesson: "Bài 9: Posterior Chain Activation", course: "Phục Hồi Lưng Cơ Bản", time: "2 tiếng trước", completed: true },
  { lesson: "Bài 6: Breathing Mechanics", course: "Corrective Exercise Nâng Cao", time: "Hôm qua", completed: true },
  { lesson: "Bài 8: Hip Mobility Drill", course: "Phục Hồi Lưng Cơ Bản", time: "2 ngày trước", completed: true },
];

export default function DashboardPage() {
  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="font-heading text-2xl font-black uppercase tracking-wide text-white">Xin chào, học viên! 👋</h1>
        <p className="mt-1 font-sans text-sm text-csnb-muted">Tiếp tục hành trình phục hồi của bạn hôm nay.</p>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: "Khóa học đang học", value: "2", icon: BookOpen, color: "text-csnb-orange-bright" },
          { label: "Bài đã hoàn thành", value: "15", icon: CheckCircle2, color: "text-emerald-400" },
          { label: "Giờ đã học", value: "12.5h", icon: Clock, color: "text-csnb-orange" },
          { label: "Ngày còn lại (TB)", value: "165", icon: AlertCircle, color: "text-sky-400" },
        ].map((stat, i) => (
          <div key={i} className="rounded-xl border border-csnb-border bg-csnb-surface/95 p-4 ring-1 ring-white/5">
            <stat.icon size={20} className={`${stat.color} mb-2`} />
            <div className="font-heading text-xl font-black text-white">{stat.value}</div>
            <div className="mt-0.5 font-sans text-xs text-csnb-muted">{stat.label}</div>
          </div>
        ))}
      </div>

      <h2 className="mb-4 font-heading text-sm font-bold uppercase tracking-wider text-white">Khóa học của tôi</h2>
      <div className="mb-8 grid grid-cols-1 gap-5 lg:grid-cols-2">
        {courses.map((course) => (
          <div
            key={course.id}
            className="overflow-hidden rounded-xl border border-csnb-border bg-csnb-surface/95 ring-1 ring-white/5 transition-colors hover:border-csnb-orange/30"
          >
            <div className="relative aspect-video">
              <Image
                src={course.thumbnail}
                alt={course.title}
                fill
                sizes="(max-width: 1023px) 100vw, 50vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-csnb-bg/80 to-transparent" />
              <div className="absolute right-3 bottom-3 left-3 flex items-center justify-between text-xs text-white">
                <span className="font-heading font-bold">
                  {course.completedLessons}/{course.totalLessons} bài
                </span>
                <span
                  className={`rounded px-2 py-0.5 font-heading font-bold ${
                    course.daysLeft <= 30 ? "bg-csnb-orange-deep" : "bg-csnb-orange"
                  }`}
                >
                  Còn {course.daysLeft} ngày
                </span>
              </div>
            </div>
            <div className="p-4">
              <h3 className="mb-1 font-heading text-base font-bold text-white">{course.title}</h3>
              <p className="mb-3 font-sans text-xs text-csnb-muted">{course.description}</p>
              <div className="mb-3">
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="text-csnb-muted">Tiến độ</span>
                  <span className="font-heading font-bold text-csnb-orange-bright">{course.progress}%</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-csnb-border">
                  <div className="h-full rounded-full bg-csnb-orange" style={{ width: `${course.progress}%` }} />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-sans text-xs text-csnb-muted">Tiếp: {course.lastLesson}</span>
                <Link
                  href={`/courses/${course.id}`}
                  className="flex items-center gap-1.5 rounded-md bg-csnb-orange px-3 py-1.5 font-heading text-xs font-bold uppercase tracking-wide text-white transition-colors hover:bg-csnb-orange-deep"
                >
                  <Play size={12} /> Học ngay
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      <h2 className="mb-4 font-heading text-sm font-bold uppercase tracking-wider text-white">Hoạt động gần đây</h2>
      <div className="overflow-hidden rounded-xl border border-csnb-border bg-csnb-surface/95 ring-1 ring-white/5">
        {recentActivity.map((activity, i) => (
          <div
            key={i}
            className={`flex items-start gap-3 p-4 ${i < recentActivity.length - 1 ? "border-b border-csnb-border" : ""}`}
          >
            <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-400" />
            <div className="flex-1">
              <div className="font-heading text-sm font-semibold text-white">{activity.lesson}</div>
              <div className="mt-0.5 font-sans text-xs text-csnb-muted">{activity.course}</div>
            </div>
            <span className="shrink-0 font-sans text-xs text-csnb-muted">{activity.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
