import type { DemoCourse, DemoLesson, DemoPhase, LessonVideoProvider } from "@/lib/demo-courses";
import { DEMO_VIDEO_MP4 } from "@/lib/demo-courses";
import { signBunnyStreamEmbedUrl, getBunnyStreamConfig } from "@/lib/bunny/stream-signing";

type DbLesson = Record<string, unknown>;
type DbSection = Record<string, unknown> & { lessons?: DbLesson[] };
type FullCourse = Record<string, unknown> & {
  id: string;
  title: string;
  description?: string | null;
  short_description?: string | null;
  thumbnail_url?: string | null;
  level_label?: string | null;
  sections: DbSection[];
  lessons: DbLesson[];
  ungroupedLessons?: DbLesson[];
};

function formatMmSs(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, "0")}`;
}

function formatDurationLabel(totalSeconds: number): string {
  const hours = totalSeconds / 3600;
  if (hours >= 1) return `~${hours.toFixed(1)} giờ`.replace(".0", "");
  const m = Math.round(totalSeconds / 60);
  return `~${m} phút`;
}

function daysLeftFromExpires(expiresAt: string | null): number {
  if (!expiresAt) return 9999;
  const end = new Date(expiresAt).getTime();
  const now = Date.now();
  return Math.max(0, Math.ceil((end - now) / (86400 * 1000)));
}

function formatExpiresVi(iso: string | null): string {
  if (!iso) return "Không giới hạn";
  return new Date(iso).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function notesFromLesson(lesson: DbLesson): { notesIntro?: string; noteBullets?: string[] } {
  const intro = typeof lesson.notes_intro === "string" ? lesson.notes_intro.trim() : "";
  let bullets: string[] = [];
  if (Array.isArray(lesson.notes_json)) {
    bullets = lesson.notes_json.filter((x): x is string => typeof x === "string");
  }
  const out: { notesIntro?: string; noteBullets?: string[] } = {};
  if (intro) out.notesIntro = intro;
  if (bullets.length) out.noteBullets = bullets;
  return out;
}

function isLessonPublished(lesson: DbLesson): boolean {
  // Default to false if field missing (safer: không lộ bài nháp).
  return Boolean((lesson as { is_published?: boolean | null }).is_published);
}

/** Danh sách bài hiển thị trong LMS theo thứ tự section -> bài */
function orderedPublishedLessons(course: FullCourse): DbLesson[] {
  const flat: DbLesson[] = [];
  const sections = [...(course.sections ?? [])].sort(
    (a, b) => Number(a.sort_order ?? 0) - Number(b.sort_order ?? 0)
  );
  for (const sec of sections) {
    const ls = [...(sec.lessons ?? [])].sort(
      (a, b) => Number(a.sort_order ?? 0) - Number(b.sort_order ?? 0)
    );
    for (const l of ls) {
      const lesson = l as DbLesson;
      if (!isLessonPublished(lesson)) continue;
      flat.push(lesson);
    }
  }
  const roots = [...(course.lessons ?? [])]
    .filter((l) => !l.section_id)
    .filter((l) => isLessonPublished(l as DbLesson))
    .sort((a, b) => Number(a.sort_order ?? 0) - Number(b.sort_order ?? 0));
  for (const l of roots) {
    if (flat.some((x) => String(x.id) === String(l.id))) continue;
    flat.push(l as DbLesson);
  }
  
  return flat;
}

/** Danh sách id bài đã publish (cùng thứ tự với LMS). Dùng khi validate / đồng bộ tiến độ. */
export function listPublishedLessonIdsInCourse(course: unknown): string[] {
  return orderedPublishedLessons(course as FullCourse).map((l) => String(l.id));
}

export type EnrollmentCourseBundle = {
  enrollment: Record<string, unknown> & { id: string; expires_at: string | null };
  /** Kết quả `getCourseByIdentifier` */
  course: unknown;
  completedLessonIds: Set<string>;
};

/**
 * Chuyển khóa học DB + enrollment + tiến độ sang hình DemoCourse để tái dùng UI LMS hiện tại.
 * Người đã mua: không khóa bài (locked luôn false); completed lấy từ lesson_progress.
 */
export function buildLmsCourseViewModel(bundle: EnrollmentCourseBundle): DemoCourse {
  const { enrollment, completedLessonIds } = bundle;
  const course = bundle.course as FullCourse;
  const flatLessons = orderedPublishedLessons(course);
  const totalSec = flatLessons.reduce((acc, l) => acc + Number(l.duration_seconds ?? 0), 0);

  const lessons: DemoLesson[] = flatLessons.map((l) => {
    const id = String(l.id);
    const sec = Number(l.duration_seconds ?? 0);
    const rawUrl = typeof l.video_url === "string" ? l.video_url.trim() : "";
    const rawProvider =
      typeof l.video_provider === "string" ? l.video_provider.trim().toLowerCase() : "";

    const contentHtml =
      typeof (l as { content_html?: unknown }).content_html === "string"
        ? String((l as { content_html?: string }).content_html ?? "")
        : undefined;

    /** Bài dạng blog — không video, chỉ nội dung HTML */
    if (rawProvider === "article") {
      return {
        id,
        title: String(l.title ?? ""),
        duration: formatMmSs(sec),
        durationSeconds: sec,
        completed: completedLessonIds.has(id),
        locked: false,
        videoUrl: "",
        isArticle: true,
        ...notesFromLesson(l),
        ...(contentHtml !== undefined ? { contentHtml } : {}),
      };
    }

    let videoProvider: LessonVideoProvider | undefined;
    let videoUrl = rawUrl || DEMO_VIDEO_MP4;
    let thumbnail: string | undefined;

    if (rawProvider === "bunny_stream") {
      videoProvider = "bunny_stream";
      const signed = signBunnyStreamEmbedUrl(rawUrl);
      if (signed) {
        videoUrl = signed.url;
        const cdnHostname = getBunnyStreamConfig()?.cdnHostname;
        if (cdnHostname) {
          thumbnail = `https://${cdnHostname}/${signed.videoGuid}/thumbnail.jpg`;
        }
      } else {
        // Thiếu env hoặc GUID không hợp lệ: fallback sang MP4 demo để không break UI.
        videoProvider = undefined;
        videoUrl = DEMO_VIDEO_MP4;
      }
    } else if (rawProvider === "youtube") {
      videoProvider = "youtube";
      // YouTube thumbnail từ video ID
      const ytMatch = rawUrl.match(/(?:v=|youtu\.be\/)([A-Za-z0-9_-]{11})/);
      if (ytMatch) thumbnail = `https://img.youtube.com/vi/${ytMatch[1]}/mqdefault.jpg`;
    } else if (rawProvider === "mp4") {
      videoProvider = "mp4";
    }

    return {
      id,
      title: String(l.title ?? ""),
      duration: formatMmSs(sec),
      durationSeconds: sec,
      completed: completedLessonIds.has(id),
      locked: false,
      videoUrl,
      ...(videoProvider ? { videoProvider } : {}),
      ...(thumbnail ? { thumbnail } : {}),
      ...notesFromLesson(l),
      ...(contentHtml !== undefined ? { contentHtml } : {}),
    };
  });

  const phases: DemoPhase[] = (course.sections ?? [])
    .slice()
    .sort((a, b) => Number(a.sort_order ?? 0) - Number(b.sort_order ?? 0))
    .map((sec) => {
      const ls = [...(sec.lessons ?? [])]
        .filter((l) => isLessonPublished(l as DbLesson))
        .sort((a, b) => Number(a.sort_order ?? 0) - Number(b.sort_order ?? 0));
      return {
        id: String(sec.id),
        title: String(sec.title ?? "Phần"),
        description: String(sec.description ?? course.short_description ?? ""),
        thumbnail:
          (typeof sec.thumbnail_url === "string" && sec.thumbnail_url) ||
          (typeof course.thumbnail_url === "string" && course.thumbnail_url) ||
          "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=340&fit=crop",
        lessonIds: ls.map((l) => String(l.id)),
      };
    })
    .filter((p) => p.lessonIds.length > 0);

  const desc =
    (typeof course.description === "string" && course.description.trim()) ||
    (typeof course.short_description === "string" && course.short_description.trim()) ||
    "";

  const expiresAt = enrollment.expires_at as string | null;
  const dl = daysLeftFromExpires(expiresAt);

  return {
    id: String(course.id),
    title: String(course.title ?? ""),
    description: desc,
    thumbnail:
      (typeof course.thumbnail_url === "string" && course.thumbnail_url) ||
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=450&fit=crop",
    level: String(course.level_label ?? "—"),
    totalDurationLabel: formatDurationLabel(totalSec),
    expiresAt: formatExpiresVi(expiresAt),
    daysLeft: dl,
    lessons,
    phases: phases.length ? phases : undefined,
  };
}
