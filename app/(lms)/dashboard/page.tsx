import Link from "next/link";
import Image from "next/image";
import { Clock, BookOpen, CheckCircle2, AlertCircle, ArrowRight, Play } from "lucide-react";

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
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-heading font-black text-white text-2xl uppercase tracking-wide">
          Xin Chào, Học Viên! 👋
        </h1>
        <p className="text-[#a0a0a0] text-sm mt-1">Tiếp tục hành trình phục hồi của bạn hôm nay.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Khóa Học Đang Học", value: "2", icon: BookOpen, color: "text-[#c0392b]" },
          { label: "Bài Đã Hoàn Thành", value: "15", icon: CheckCircle2, color: "text-green-400" },
          { label: "Giờ Đã Học", value: "12.5h", icon: Clock, color: "text-[#e67e22]" },
          { label: "Ngày Còn Lại (TB)", value: "165", icon: AlertCircle, color: "text-blue-400" },
        ].map((stat, i) => (
          <div key={i} className="bg-[#111] border border-[#222] rounded-sm p-4">
            <stat.icon size={20} className={`${stat.color} mb-2`} />
            <div className="font-heading font-black text-white text-xl">{stat.value}</div>
            <div className="text-[#a0a0a0] text-xs mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* My Courses */}
      <h2 className="font-heading font-bold text-white text-sm uppercase tracking-wider mb-4">
        Khóa Học Của Tôi
      </h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-8">
        {courses.map((course) => (
          <div key={course.id} className="bg-[#111] border border-[#222] rounded-sm overflow-hidden hover:border-[#c0392b]/30 transition-colors">
            <div className="relative aspect-video">
              <Image
                src={course.thumbnail}
                alt={course.title}
                fill
                sizes="(max-width: 1023px) 100vw, 50vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-3 left-3 right-3">
                <div className="flex items-center justify-between text-white text-xs">
                  <span className="font-heading font-bold">{course.completedLessons}/{course.totalLessons} bài</span>
                  <span className={`px-2 py-0.5 rounded font-heading font-bold ${course.daysLeft <= 30 ? "bg-[#c0392b]" : "bg-[#e67e22]"}`}>
                    Còn {course.daysLeft} ngày
                  </span>
                </div>
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-heading font-bold text-white text-base mb-1">{course.title}</h3>
              <p className="text-[#a0a0a0] text-xs mb-3">{course.description}</p>
              <div className="mb-3">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-[#a0a0a0]">Tiến độ</span>
                  <span className="text-[#e67e22] font-heading font-bold">{course.progress}%</span>
                </div>
                <div className="h-1.5 bg-[#222] rounded-full overflow-hidden">
                  <div className="h-full bg-[#c0392b] rounded-full" style={{ width: `${course.progress}%` }} />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#a0a0a0] text-xs">Tiếp: {course.lastLesson}</span>
                <Link
                  href={`/courses/${course.id}`}
                  className="flex items-center gap-1.5 bg-[#c0392b] hover:bg-[#96281b] text-white text-xs font-heading font-bold px-3 py-1.5 rounded-sm transition-colors uppercase tracking-wide"
                >
                  <Play size={12} /> Học Ngay
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <h2 className="font-heading font-bold text-white text-sm uppercase tracking-wider mb-4">
        Hoạt Động Gần Đây
      </h2>
      <div className="bg-[#111] border border-[#222] rounded-sm overflow-hidden">
        {recentActivity.map((activity, i) => (
          <div key={i} className={`flex items-start gap-3 p-4 ${i < recentActivity.length - 1 ? "border-b border-[#222]" : ""}`}>
            <CheckCircle2 size={16} className="text-green-400 mt-0.5 shrink-0" />
            <div className="flex-1">
              <div className="font-heading font-semibold text-white text-sm">{activity.lesson}</div>
              <div className="text-[#a0a0a0] text-xs mt-0.5">{activity.course}</div>
            </div>
            <span className="text-[#a0a0a0] text-xs shrink-0">{activity.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
