import Link from "next/link";
import Image from "next/image";
import { CheckCircle2, Circle, Lock, Play, Clock, ArrowLeft } from "lucide-react";

const course = {
  id: "1",
  title: "Phục Hồi Lưng Cơ Bản",
  description:
    "Lộ trình khoa học 12 bài giảng từ nền tảng đến nâng cao. Bạn sẽ hiểu nguyên nhân đau lưng, cách vận động đúng và xây dựng thói quen chuyển động khỏe mạnh lâu dài.",
  thumbnail: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=450&fit=crop",
  progress: 75,
  completedLessons: 9,
  totalLessons: 12,
  expiresAt: "30/06/2024",
  daysLeft: 75,
};

const lessons = [
  { id: "1", title: "Giới thiệu khóa học & Tổng quan phương pháp", duration: "12:30", completed: true },
  { id: "2", title: "Giải phẫu cột sống và đĩa đệm", duration: "18:45", completed: true },
  { id: "3", title: "Đánh giá tư thế cơ bản", duration: "15:20", completed: true },
  { id: "4", title: "Breathing Mechanics - Nền tảng vận động", duration: "22:10", completed: true },
  { id: "5", title: "Foot & Ankle Mobility", duration: "19:30", completed: true },
  { id: "6", title: "Hip Flexor Release", duration: "25:00", completed: true },
  { id: "7", title: "Glute Activation Sequence", duration: "28:15", completed: true },
  { id: "8", title: "Hip Mobility Drill - Cấp độ 1", duration: "20:40", completed: true },
  { id: "9", title: "Posterior Chain Activation", duration: "32:00", completed: true },
  { id: "10", title: "Corrective Hip Hinge", duration: "24:30", completed: false },
  { id: "11", title: "Spinal Decompression Routine", duration: "21:15", completed: false, locked: true },
  { id: "12", title: "Lộ trình duy trì & phòng ngừa tái phát", duration: "18:00", completed: false, locked: true },
];

export default function CourseDetailPage({ params }: { params: { courseId: string } }) {
  const nextLesson = lessons.find((l) => !l.completed && !l.locked);

  return (
    <div className="p-6 lg:p-8">
      <Link
        href="/dashboard"
        className="mb-6 inline-flex items-center gap-2 font-sans text-sm text-csnb-muted transition-colors hover:text-white"
      >
        <ArrowLeft size={16} /> Quay lại Dashboard
      </Link>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="relative mb-6 aspect-video overflow-hidden rounded-xl border border-csnb-border ring-1 ring-white/5">
            <Image
              src={course.thumbnail}
              alt={course.title}
              fill
              sizes="(max-width: 1023px) 100vw, 66vw"
              className="object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-csnb-bg/55">
              {nextLesson && (
                <Link
                  href={`/courses/${course.id}/lessons/${nextLesson.id}`}
                  className="flex items-center gap-3 rounded-md bg-csnb-orange px-6 py-3 font-heading text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-csnb-orange-deep"
                >
                  <Play size={18} /> Tiếp tục học
                </Link>
              )}
            </div>
          </div>

          <h1 className="mb-2 font-heading text-2xl font-black uppercase text-white">{course.title}</h1>
          <p className="mb-6 font-sans text-sm leading-relaxed text-csnb-muted">{course.description}</p>

          <div className="mb-6 rounded-xl border border-csnb-border bg-csnb-surface/95 p-4 ring-1 ring-white/5">
            <div className="mb-2 flex items-center justify-between">
              <span className="font-heading text-sm font-bold text-white">Tiến độ học tập</span>
              <span className="font-heading font-black text-csnb-orange-bright">{course.progress}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-csnb-border">
              <div className="h-full rounded-full bg-csnb-orange" style={{ width: `${course.progress}%` }} />
            </div>
            <div className="mt-2 flex items-center justify-between font-sans text-xs text-csnb-muted">
              <span>
                {course.completedLessons}/{course.totalLessons} bài hoàn thành
              </span>
              <span>
                Hết hạn: {course.expiresAt} (còn {course.daysLeft} ngày)
              </span>
            </div>
          </div>
        </div>

        <div>
          <h2 className="mb-3 font-heading text-sm font-bold uppercase tracking-wider text-white">Danh sách bài giảng</h2>
          <div className="overflow-hidden rounded-xl border border-csnb-border bg-csnb-surface/95 ring-1 ring-white/5">
            {lessons.map((lesson, i) => (
              <div key={lesson.id} className={i < lessons.length - 1 ? "border-b border-csnb-border" : ""}>
                {lesson.locked ? (
                  <div className="flex items-center gap-3 px-4 py-3 opacity-40">
                    <Lock size={14} className="shrink-0 text-csnb-muted" />
                    <span className="flex-1 font-sans text-xs text-csnb-muted">{lesson.title}</span>
                    <span className="flex items-center gap-1 font-sans text-xs text-csnb-muted">
                      <Clock size={10} /> {lesson.duration}
                    </span>
                  </div>
                ) : (
                  <Link
                    href={`/courses/${course.id}/lessons/${lesson.id}`}
                    className="group flex items-center gap-3 px-4 py-3 transition-colors hover:bg-white/5"
                  >
                    {lesson.completed ? (
                      <CheckCircle2 size={14} className="shrink-0 text-emerald-400" />
                    ) : (
                      <Circle size={14} className="shrink-0 text-csnb-orange" />
                    )}
                    <span
                      className={`flex-1 font-sans text-xs transition-colors group-hover:text-white ${
                        lesson.completed ? "text-csnb-muted" : "text-white"
                      }`}
                    >
                      {lesson.title}
                    </span>
                    <span className="flex shrink-0 items-center gap-1 font-sans text-xs text-csnb-muted">
                      <Clock size={10} /> {lesson.duration}
                    </span>
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
