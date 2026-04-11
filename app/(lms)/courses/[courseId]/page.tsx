import Link from "next/link";
import Image from "next/image";
import { CheckCircle2, Circle, Lock, Play, Clock, ArrowLeft } from "lucide-react";

const course = {
  id: "1",
  title: "Phục Hồi Lưng Cơ Bản",
  description: "Lộ trình khoa học 12 bài giảng từ nền tảng đến nâng cao. Bạn sẽ hiểu nguyên nhân đau lưng, cách vận động đúng và xây dựng thói quen chuyển động khỏe mạnh lâu dài.",
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
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-[#a0a0a0] hover:text-white text-sm mb-6 transition-colors">
        <ArrowLeft size={16} /> Quay lại Dashboard
      </Link>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main */}
        <div className="lg:col-span-2">
          {/* Thumbnail */}
          <div className="relative aspect-video rounded-sm overflow-hidden mb-6">
            <Image src={course.thumbnail} alt={course.title} fill className="object-cover" />
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              {nextLesson && (
                <Link
                  href={`/courses/${course.id}/lessons/${nextLesson.id}`}
                  className="flex items-center gap-3 bg-[#c0392b] hover:bg-[#96281b] text-white font-heading font-bold text-sm px-6 py-3 rounded-sm uppercase tracking-wide transition-colors"
                >
                  <Play size={18} /> Tiếp Tục Học
                </Link>
              )}
            </div>
          </div>

          <h1 className="font-heading font-black text-white text-2xl uppercase mb-2">{course.title}</h1>
          <p className="text-[#a0a0a0] text-sm leading-relaxed mb-6">{course.description}</p>

          {/* Progress */}
          <div className="bg-[#111] border border-[#222] rounded-sm p-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white font-heading font-bold text-sm">Tiến Độ Học Tập</span>
              <span className="text-[#e67e22] font-heading font-black">{course.progress}%</span>
            </div>
            <div className="h-2 bg-[#222] rounded-full overflow-hidden">
              <div className="h-full bg-[#c0392b] rounded-full" style={{ width: `${course.progress}%` }} />
            </div>
            <div className="flex items-center justify-between mt-2 text-xs text-[#a0a0a0]">
              <span>{course.completedLessons}/{course.totalLessons} bài hoàn thành</span>
              <span>Hết hạn: {course.expiresAt} (còn {course.daysLeft} ngày)</span>
            </div>
          </div>
        </div>

        {/* Lesson List */}
        <div>
          <h2 className="font-heading font-bold text-white text-sm uppercase tracking-wider mb-3">
            Danh Sách Bài Giảng
          </h2>
          <div className="bg-[#111] border border-[#222] rounded-sm overflow-hidden">
            {lessons.map((lesson, i) => (
              <div key={lesson.id} className={`${i < lessons.length - 1 ? "border-b border-[#222]" : ""}`}>
                {lesson.locked ? (
                  <div className="flex items-center gap-3 px-4 py-3 opacity-40">
                    <Lock size={14} className="text-[#a0a0a0] shrink-0" />
                    <span className="text-[#a0a0a0] text-xs flex-1">{lesson.title}</span>
                    <span className="text-[#a0a0a0] text-xs flex items-center gap-1">
                      <Clock size={10} /> {lesson.duration}
                    </span>
                  </div>
                ) : (
                  <Link
                    href={`/courses/${course.id}/lessons/${lesson.id}`}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors group"
                  >
                    {lesson.completed ? (
                      <CheckCircle2 size={14} className="text-green-400 shrink-0" />
                    ) : (
                      <Circle size={14} className="text-[#c0392b] shrink-0" />
                    )}
                    <span className={`text-xs flex-1 group-hover:text-white transition-colors ${lesson.completed ? "text-[#a0a0a0]" : "text-white"}`}>
                      {lesson.title}
                    </span>
                    <span className="text-[#a0a0a0] text-xs flex items-center gap-1 shrink-0">
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
