/** Dữ liệu demo khóa học video — LMS & public /courses */

/**
 * Nhà cung cấp video cho 1 bài học.
 * - `youtube`  : URL YouTube (auto-detect khi thiếu provider).
 * - `mp4`      : file MP4 (HTML5 <video>).
 * - `bunny_stream`: iframe Bunny Stream với URL đã được ký ở server.
 */
export type LessonVideoProvider = "youtube" | "mp4" | "bunny_stream";

export type DemoLesson = {
  id: string;
  title: string;
  duration: string;
  durationSeconds: number;
  completed: boolean;
  locked?: boolean;
  videoUrl: string;
  videoProvider?: LessonVideoProvider;
  notesIntro?: string;
  noteBullets?: string[];
  /** Nội dung chi tiết dạng HTML (soạn từ admin). */
  contentHtml?: string;
};

/** Phase / module — dùng trang tổng quan khóa (thẻ ngang) + nhóm trong sidebar */
export type DemoPhase = {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  lessonIds: string[];
};

export type DemoCourse = {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  level: string;
  totalDurationLabel: string;
  expiresAt: string;
  daysLeft: number;
  lessons: DemoLesson[];
  /** Nếu thiếu, `getCoursePhases` gom cả khóa thành một phase */
  phases?: DemoPhase[];
};

export const DEMO_VIDEO_MP4 =
  "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4";

export const demoCourses: DemoCourse[] = [
  {
    id: "1",
    title: "Phục hồi lưng cơ bản",
    description:
      "Lộ trình 12 bài từ nền tảng đến nâng cao: hiểu đau lưng, thở, mobility hông–cột sống và hip hinge an toàn. Không có khu vực bình luận — chỉ nội dung và tiến độ học.",
    thumbnail: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=450&fit=crop",
    level: "Cơ bản",
    totalDurationLabel: "~4 giờ 30",
    expiresAt: "30/06/2026",
    daysLeft: 75,
    phases: [
      {
        id: "p1",
        title: "Myofascial release & nhận thức",
        description:
          "Giải phóng căng nông, thở và đánh giá tư thế — chuẩn bị cơ thể trước khi vào tải nhẹ.",
        thumbnail: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&h=340&fit=crop",
        lessonIds: ["1", "2", "3", "4"],
      },
      {
        id: "p2",
        title: "Posture training & mobility",
        description: "Chân–hông–lõi: mobility cổ chân, hip flexor, glute và chuỗi activation an toàn.",
        thumbnail: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=340&fit=crop",
        lessonIds: ["5", "6", "7", "8", "9"],
      },
      {
        id: "p3",
        title: "Integrated corrective exercise",
        description: "Posterior chain, hip hinge chỉnh hướng và chuỗi duy trì — khi đã có nền từ hai phase trước.",
        thumbnail: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&h=340&fit=crop",
        lessonIds: ["10", "11", "12"],
      },
    ],
    lessons: [
      {
        id: "1",
        title: "Giới thiệu khóa học & tổng quan phương pháp",
        duration: "12:30",
        durationSeconds: 750,
        completed: true,
        videoUrl: DEMO_VIDEO_MP4,
        notesIntro: "Nắm khung chương trình và cách theo dõi tiến độ an toàn.",
        noteBullets: ["Mục tiêu từng phase", "Khi nào cần dừng và báo coach", "Chuẩn bị không gian tập tại nhà"],
      },
      {
        id: "2",
        title: "Giải phẫu cột sống và đĩa đệm",
        duration: "18:45",
        durationSeconds: 1125,
        completed: true,
        videoUrl: DEMO_VIDEO_MP4,
        notesIntro: "Hiểu đĩa đệm, rễ thần kinh và tại sao đau không đồng nghĩa phải nằm bất động.",
        noteBullets: ["Vùng LPHC liên quan thế nào", "Đau vs. tổn thương cấu trúc", "Khi nào cần hình ảnh học"],
      },
      {
        id: "3",
        title: "Đánh giá tư thế cơ bản",
        duration: "15:20",
        durationSeconds: 920,
        completed: true,
        videoUrl: DEMO_VIDEO_MP4,
        noteBullets: ["Quan sát từ phía sau và nghiêng", "Ghi chú cho buổi coaching tiếp theo"],
      },
      {
        id: "4",
        title: "Breathing mechanics — nền tảng vận động",
        duration: "22:10",
        durationSeconds: 1330,
        completed: true,
        videoUrl: DEMO_VIDEO_MP4,
        noteBullets: ["Thở hoành", "Tránh hyperventilation khi bracing nhẹ"],
      },
      {
        id: "5",
        title: "Foot & ankle mobility",
        duration: "19:30",
        durationSeconds: 1170,
        completed: true,
        videoUrl: DEMO_VIDEO_MP4,
      },
      {
        id: "6",
        title: "Hip flexor release",
        duration: "25:00",
        durationSeconds: 1500,
        completed: true,
        videoUrl: DEMO_VIDEO_MP4,
      },
      {
        id: "7",
        title: "Glute activation sequence",
        duration: "28:15",
        durationSeconds: 1695,
        completed: true,
        videoUrl: DEMO_VIDEO_MP4,
      },
      {
        id: "8",
        title: "Hip mobility drill — cấp độ 1",
        duration: "20:40",
        durationSeconds: 1240,
        completed: true,
        videoUrl: DEMO_VIDEO_MP4,
      },
      {
        id: "9",
        title: "Posterior chain activation",
        duration: "32:00",
        durationSeconds: 1920,
        completed: true,
        videoUrl: DEMO_VIDEO_MP4,
      },
      {
        id: "10",
        title: "Corrective hip hinge",
        duration: "24:30",
        durationSeconds: 1470,
        completed: false,
        videoUrl: DEMO_VIDEO_MP4,
        notesIntro:
          "Corrective hip hinge là một trong những chuyển động cơ bản quan trọng nhất để bảo vệ cột sống thắt lưng.",
        noteBullets: [
          "Giữ lưng thẳng, không cong vẹo",
          "Tập trung vào việc gấp hông, không gấp lưng",
          "Hít thở đúng nhịp: hít vào khi xuống, thở ra khi lên",
        ],
      },
      {
        id: "11",
        title: "Spinal decompression routine",
        duration: "21:15",
        durationSeconds: 1275,
        completed: false,
        locked: true,
        videoUrl: DEMO_VIDEO_MP4,
      },
      {
        id: "12",
        title: "Lộ trình duy trì & phòng ngừa tái phát",
        duration: "18:00",
        durationSeconds: 1080,
        completed: false,
        locked: true,
        videoUrl: DEMO_VIDEO_MP4,
      },
    ],
  },
  {
    id: "2",
    title: "Corrective exercise nâng cao",
    description: "Tải tiến, T-spine, phối hợp toàn thân — dành cho học viên đã quen hip hinge và activation cơ bản.",
    thumbnail: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&h=450&fit=crop",
    level: "Trung cấp",
    totalDurationLabel: "~5 giờ 15",
    expiresAt: "31/12/2026",
    daysLeft: 42,
    phases: [
      {
        id: "p1",
        title: "Nền & T-spine",
        description: "Readiness, mở ngực và kiểm soát extension có kiểm soát.",
        thumbnail: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&h=340&fit=crop",
        lessonIds: ["1", "2"],
      },
      {
        id: "p2",
        title: "Tích hợp tải",
        description: "Single leg, carry và tự lập kế hoạch buổi tập.",
        thumbnail: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&h=340&fit=crop",
        lessonIds: ["3", "4", "5"],
      },
    ],
    lessons: [
      {
        id: "1",
        title: "Ôn tập nền & kiểm tra readiness",
        duration: "14:00",
        durationSeconds: 840,
        completed: true,
        videoUrl: DEMO_VIDEO_MP4,
      },
      {
        id: "2",
        title: "T-spine extension có kiểm soát",
        duration: "26:20",
        durationSeconds: 1580,
        completed: true,
        videoUrl: DEMO_VIDEO_MP4,
      },
      {
        id: "3",
        title: "Single-leg pattern — level 2",
        duration: "30:10",
        durationSeconds: 1810,
        completed: false,
        videoUrl: DEMO_VIDEO_MP4,
        notesIntro:
          "Single-leg là bài kiểm tra thực tế cho ổn định hông–gối và khả năng chống xoay của lõi. Giữ tempo chậm, ưu tiên chất lượng khớp.",
        noteBullets: [
          "Khớp gối hướng theo ngón chân cái, tránh valgus khi mệt",
          "Hông thấp hơn vai — tránh nghiêng hông sang một bên",
          "Dừng nếu đau sắc hoặc tê lan xuống chân",
        ],
      },
      {
        id: "4",
        title: "Carry & anti-rotation",
        duration: "22:45",
        durationSeconds: 1365,
        completed: false,
        locked: true,
        videoUrl: DEMO_VIDEO_MP4,
      },
      {
        id: "5",
        title: "Chuỗi buổi tự lập kế hoạch",
        duration: "16:00",
        durationSeconds: 960,
        completed: false,
        locked: true,
        videoUrl: DEMO_VIDEO_MP4,
      },
    ],
  },
  {
    id: "3",
    title: "Vai gáy & tư thế văn phòng",
    description: "Giảm căng cổ–vai từ ngồi máy; kết hợp thở, scapular và micro-break trong ngày làm việc.",
    thumbnail: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&h=450&fit=crop",
    level: "Cơ bản",
    totalDurationLabel: "~2 giờ 40",
    expiresAt: "15/08/2026",
    daysLeft: 120,
    phases: [
      {
        id: "p1",
        title: "Workspace & cổ",
        description: "Chỉnh màn hình, ghế và chuỗi mobilization nhẹ.",
        thumbnail: "https://images.unsplash.com/photo-1520085601670-ee14aa5fa3e8?w=600&h=340&fit=crop",
        lessonIds: ["1", "2"],
      },
      {
        id: "p2",
        title: "Scapular & thói quen ngày",
        description: "Vai bả vai, wall angel và micro-break trong ca 8 tiếng.",
        thumbnail: "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=600&h=340&fit=crop",
        lessonIds: ["3", "4"],
      },
    ],
    lessons: [
      {
        id: "1",
        title: "Đánh giá workspace & màn hình",
        duration: "11:20",
        durationSeconds: 680,
        completed: true,
        videoUrl: DEMO_VIDEO_MP4,
      },
      {
        id: "2",
        title: "Chuỗi mobilization cổ — nhẹ",
        duration: "18:00",
        durationSeconds: 1080,
        completed: true,
        videoUrl: DEMO_VIDEO_MP4,
      },
      {
        id: "3",
        title: "Scapular slide & wall angel",
        duration: "20:30",
        durationSeconds: 1230,
        completed: false,
        videoUrl: DEMO_VIDEO_MP4,
      },
      {
        id: "4",
        title: "Kế hoạch micro-break 8 tiếng",
        duration: "12:00",
        durationSeconds: 720,
        completed: false,
        locked: true,
        videoUrl: DEMO_VIDEO_MP4,
      },
    ],
  },
  {
    id: "4",
    title: "Hông–khớp & chạy bền",
    description: "Single leg stability, ankle rocker và tiến tới chạy nhẹ không tái phát đau hông–gối.",
    thumbnail: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=450&fit=crop",
    level: "Trung cấp",
    totalDurationLabel: "~3 giờ 10",
    expiresAt: "01/05/2026",
    daysLeft: 40,
    phases: [
      {
        id: "p1",
        title: "Toàn bộ chương trình",
        description: "Đánh giá dáng đứng, ankle rocker và tiến tới jog có kiểm soát.",
        thumbnail: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&h=340&fit=crop",
        lessonIds: ["1", "2", "3"],
      },
    ],
    lessons: [
      {
        id: "1",
        title: "Đánh giá dáng đứng & squat pattern",
        duration: "16:40",
        durationSeconds: 1000,
        completed: true,
        videoUrl: DEMO_VIDEO_MP4,
      },
      {
        id: "2",
        title: "Ankle rocker & calf tolerance",
        duration: "19:15",
        durationSeconds: 1155,
        completed: false,
        videoUrl: DEMO_VIDEO_MP4,
      },
      {
        id: "3",
        title: "Tiến tới jog 10 phút",
        duration: "24:00",
        durationSeconds: 1440,
        completed: false,
        locked: true,
        videoUrl: DEMO_VIDEO_MP4,
      },
    ],
  },
];

export function getDemoCourse(courseId: string): DemoCourse | undefined {
  return demoCourses.find((c) => c.id === courseId);
}

export function getCoursePhases(course: DemoCourse): DemoPhase[] {
  if (course.phases?.length) return course.phases;
  return [
    {
      id: "all",
      title: "Nội dung khóa học",
      description: course.description,
      thumbnail: course.thumbnail,
      lessonIds: course.lessons.map((l) => l.id),
    },
  ];
}

export function getLessonsForPhase(course: DemoCourse, phase: DemoPhase): DemoLesson[] {
  return phase.lessonIds
    .map((id) => course.lessons.find((l) => l.id === id))
    .filter((l): l is DemoLesson => Boolean(l));
}

export function isPhaseComplete(course: DemoCourse, phase: DemoPhase): boolean {
  const ls = getLessonsForPhase(course, phase);
  if (!ls.length) return false;
  return ls.every((l) => l.completed);
}

export function firstPlayableLessonIdInPhase(course: DemoCourse, phase: DemoPhase): string | null {
  const ls = getLessonsForPhase(course, phase);
  const first = ls.find((l) => !l.locked);
  return first?.id ?? null;
}

export function getCourseProgressPercent(course: DemoCourse): number {
  const total = course.lessons.length;
  if (!total) return 0;
  const done = course.lessons.filter((l) => l.completed).length;
  return Math.round((done / total) * 100);
}

export function getCompletedLessonCount(course: DemoCourse): number {
  return course.lessons.filter((l) => l.completed).length;
}

export function getNextPlayableLesson(course: DemoCourse, currentLessonId: string): DemoLesson | null {
  const idx = course.lessons.findIndex((l) => l.id === currentLessonId);
  if (idx === -1) return null;
  for (let i = idx + 1; i < course.lessons.length; i++) {
    if (!course.lessons[i].locked) return course.lessons[i];
  }
  return null;
}

export function getNextOpenLessonTitle(course: DemoCourse): string {
  const n = course.lessons.find((l) => !l.completed && !l.locked);
  if (!n) return "Đã xong các bài mở";
  return n.title.length > 48 ? `${n.title.slice(0, 46)}…` : n.title;
}

export function getNextPlayableLessonFromStart(course: DemoCourse): DemoLesson | null {
  return course.lessons.find((l) => !l.locked) ?? null;
}
