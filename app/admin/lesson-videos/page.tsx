"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  FileText,
  Loader2,
  Plus,
  Search,
  Trash2,
  Video,
  X,
} from "lucide-react";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

function formatMmSs(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, "0")}`;
}

type CourseRow = {
  id: string;
  title: string;
  slug: string;
  status: string;
  thumbnail_url: string | null;
  short_description: string | null;
  description: string | null;
  level_label: string | null;
  price_vnd: number | null;
  total_duration_seconds: number | null;
  lesson_count: number | null;
  instructor_name: string | null;
  instructor_title: string | null;
  is_featured: boolean;
  published_at: string | null;
};

type LessonRow = {
  id: string;
  course_id: string;
  section_id: string | null;
  title: string;
  sort_order: number;
  video_provider: string | null;
  video_url: string | null;
  duration_seconds: number | null;
  summary: string | null;
  content_html: string | null;
  notes_intro: string | null;
  notes_json: unknown;
  is_published: boolean;
};

type ContentDraft = {
  title: string;
  summary: string;
  contentHtml: string;
  notesIntro: string;
  notesBullets: string;
};

type CourseInfoDraft = {
  title: string;
  shortDescription: string;
  description: string;
  levelLabel: string;
  thumbnailUrl: string;
  priceVnd: string;
  totalDurationSeconds: string;
};

function bulletsFromNotesJson(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((x): x is string => typeof x === "string");
}

function contentDraftFromLesson(lesson: LessonRow): ContentDraft {
  return {
    title: lesson.title ?? "",
    summary: lesson.summary ?? "",
    contentHtml: lesson.content_html ?? "",
    notesIntro: lesson.notes_intro ?? "",
    notesBullets: bulletsFromNotesJson(lesson.notes_json).join("\n"),
  };
}

function courseInfoDraftFromDetail(detail: CourseDetail): CourseInfoDraft {
  return {
    title: detail.title ?? "",
    shortDescription: detail.short_description ?? "",
    description: detail.description ?? "",
    levelLabel: detail.level_label ?? "",
    thumbnailUrl: detail.thumbnail_url ?? "",
    priceVnd: detail.price_vnd != null ? String(detail.price_vnd) : "",
    totalDurationSeconds:
      detail.total_duration_seconds != null ? String(detail.total_duration_seconds) : "",
  };
}

function isCourseInfoDraftDirty(draft: CourseInfoDraft, detail: CourseDetail): boolean {
  const original = courseInfoDraftFromDetail(detail);
  return (
    draft.title !== original.title ||
    draft.shortDescription !== original.shortDescription ||
    draft.description !== original.description ||
    draft.levelLabel !== original.levelLabel ||
    draft.thumbnailUrl !== original.thumbnailUrl ||
    draft.priceVnd !== original.priceVnd ||
    draft.totalDurationSeconds !== original.totalDurationSeconds
  );
}

type SectionRow = {
  id: string;
  course_id: string;
  title: string | null;
  sort_order: number;
  lessons: LessonRow[];
};

type CourseDetail = {
  id: string;
  title: string;
  slug: string;
  status: string;
  thumbnail_url?: string | null;
  short_description?: string | null;
  description?: string | null;
  level_label?: string | null;
  price_vnd?: number | null;
  total_duration_seconds?: number | null;
  lesson_count?: number | null;
  instructor_name?: string | null;
  instructor_title?: string | null;
  is_featured?: boolean;
  published_at?: string | null;
  sections: SectionRow[];
  lessons: LessonRow[];
  ungroupedLessons: LessonRow[];
};

type LessonGroup = {
  /** section id hoặc '__ungrouped__' */
  id: string;
  title: string;
  lessons: LessonRow[];
};

type LessonDraft = {
  videoProvider: string;
  videoUrl: string;
  durationSeconds: string;
};

function toDraft(lesson: LessonRow): LessonDraft {
  return {
    videoProvider: lesson.video_provider ?? "",
    videoUrl: lesson.video_url ?? "",
    durationSeconds: lesson.duration_seconds != null ? String(lesson.duration_seconds) : "",
  };
}

function isDraftDirty(draft: LessonDraft, lesson: LessonRow): boolean {
  const original = toDraft(lesson);
  return (
    draft.videoProvider !== original.videoProvider ||
    draft.videoUrl !== original.videoUrl ||
    draft.durationSeconds !== original.durationSeconds
  );
}

function providerLabel(value: string | null): string {
  switch (value) {
    case "bunny_stream":
      return "Bunny Stream";
    case "youtube":
      return "YouTube";
    case "mp4":
      return "MP4";
    default:
      return "Chưa chọn";
  }
}

export default function LessonVideosPage() {
  const [courses, setCourses] = useState<CourseRow[]>([]);
  const [courseLoading, setCourseLoading] = useState(true);
  const [courseError, setCourseError] = useState<string | null>(null);

  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [view, setView] = useState<"list" | "detail">("list");
  const [activeTab, setActiveTab] = useState<"info" | "lessons">("info");


  const [detail, setDetail] = useState<CourseDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  const [drafts, setDrafts] = useState<Record<string, LessonDraft>>({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [rowError, setRowError] = useState<Record<string, string | null>>({});
  const [savedAt, setSavedAt] = useState<Record<string, number>>({});

  const [query, setQuery] = useState("");
  const [onlyMissing, setOnlyMissing] = useState(false);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  const [helpOpen, setHelpOpen] = useState(false);
  const [helpDismissed, setHelpDismissed] = useState(false);
  const [savingAll, setSavingAll] = useState(false);

  const [rowBusy, setRowBusy] = useState<Record<string, "publish" | "delete" | null>>({});
  const [contentDialogLessonId, setContentDialogLessonId] = useState<string | null>(null);
  const [contentDraft, setContentDraft] = useState<ContentDraft | null>(null);
  const [contentSaving, setContentSaving] = useState(false);
  const [contentError, setContentError] = useState<string | null>(null);
  const [courseInfoEdit, setCourseInfoEdit] = useState(false);
  const [courseInfoDraft, setCourseInfoDraft] = useState<CourseInfoDraft | null>(null);
  const [courseInfoSaving, setCourseInfoSaving] = useState(false);
  const [courseInfoError, setCourseInfoError] = useState<string | null>(null);
  const [courseInfoSavedAt, setCourseInfoSavedAt] = useState<number | null>(null);

  // Add-lesson dialog
  const [addLessonOpen, setAddLessonOpen] = useState(false);
  const [addLessonTitle, setAddLessonTitle] = useState("");
  const [addLessonSectionId, setAddLessonSectionId] = useState<string>("");
  const [addLessonProvider, setAddLessonProvider] = useState<string>("");
  const [addLessonUrl, setAddLessonUrl] = useState<string>("");
  const [addLessonDuration, setAddLessonDuration] = useState<string>("");
  const [addLessonSaving, setAddLessonSaving] = useState(false);
  const [addLessonError, setAddLessonError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    try {
      const dismissed = window.localStorage.getItem("csnb_admin_bunny_help_dismissed") === "1";
      setHelpDismissed(dismissed);
    } catch {
      // ignore
    }
    (async () => {
      setCourseLoading(true);
      setCourseError(null);
      try {
        const res = await fetch("/api/admin/courses", { cache: "no-store", credentials: "same-origin" });
        const json = (await res.json()) as {
          data?: CourseRow[];
          error?: { message?: string };
        };
        if (!res.ok) {
          throw new Error(json.error?.message ?? "Không tải được danh sách khóa học.");
        }
        if (!mounted) return;
        const list = (json.data ?? []).map((c) => ({
          id: String(c.id),
          title: String(c.title),
          slug: String(c.slug),
          status: String(c.status),
          thumbnail_url: (c.thumbnail_url as string) ?? null,
          short_description: (c.short_description as string) ?? null,
          description: (c.description as string) ?? null,
          level_label: (c.level_label as string) ?? null,
          price_vnd: (c.price_vnd as number) ?? null,
          total_duration_seconds: (c.total_duration_seconds as number) ?? null,
          lesson_count: (c.lesson_count as number) ?? null,
          instructor_name: (c.instructor_name as string) ?? null,
          instructor_title: (c.instructor_title as string) ?? null,
          is_featured: Boolean(c.is_featured),
          published_at: (c.published_at as string) ?? null,
        }));
        setCourses(list);
      } catch (error) {
        if (mounted) setCourseError(error instanceof Error ? error.message : "Không tải được khóa học.");
      } finally {
        if (mounted) setCourseLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadDetail = useCallback(async (courseId: string) => {
    setDetailLoading(true);
    setDetailError(null);
    setDetail(null);
    try {
      const res = await fetch(`/api/admin/courses/${encodeURIComponent(courseId)}`, {
        cache: "no-store",
        credentials: "same-origin",
      });
      const json = (await res.json()) as {
        data?: CourseDetail;
        error?: { message?: string };
      };
      if (!res.ok) {
        throw new Error(json.error?.message ?? "Không tải được chi tiết khóa học.");
      }
      setDetail(json.data ?? null);
      if (json.data) {
        setCourseInfoDraft(courseInfoDraftFromDetail(json.data));
      }
      setCourseInfoEdit(false);
      setCourseInfoError(null);
      setCourseInfoSavedAt(null);
      const initial: Record<string, LessonDraft> = {};
      for (const lesson of json.data?.lessons ?? []) {
        initial[lesson.id] = toDraft(lesson);
      }
      setDrafts(initial);
      setRowError({});
      setSavedAt({});
      setQuery("");
      setOnlyMissing(false);
      const nextOpen: Record<string, boolean> = {};
      for (const section of json.data?.sections ?? []) {
        nextOpen[section.id] = true;
      }
      nextOpen["__ungrouped__"] = true;
      setOpenSections(nextOpen);
    } catch (error) {
      setDetailError(error instanceof Error ? error.message : "Không tải được chi tiết khóa học.");
    } finally {
      setDetailLoading(false);
    }
  }, []);

  const openCourse = useCallback((courseId: string) => {
    setSelectedCourseId(courseId);
    setActiveTab("info");
    setView("detail");
    void loadDetail(courseId);
  }, [loadDetail]);

  const goBack = useCallback(() => {
    setView("list");
    setDetail(null);
    setDetailError(null);
    setCourseInfoDraft(null);
    setCourseInfoEdit(false);
    setCourseInfoError(null);
    setQuery("");
    setOnlyMissing(false);
  }, []);

  const lessonsBySection = useMemo<LessonGroup[]>(() => {
    if (!detail) return [];
    const groups: LessonGroup[] = [];
    for (const section of [...detail.sections].sort((a, b) => a.sort_order - b.sort_order)) {
      const ls = [...(section.lessons ?? [])].sort((a, b) => a.sort_order - b.sort_order);
      if (ls.length) {
        groups.push({
          id: section.id,
          title: section.title ?? "(Không tên)",
          lessons: ls,
        });
      }
    }
    const rootless = [...(detail.ungroupedLessons ?? [])].sort((a, b) => a.sort_order - b.sort_order);
    if (rootless.length) {
      groups.push({ id: "__ungrouped__", title: "Chưa xếp vào phần", lessons: rootless });
    }
    return groups;
  }, [detail]);

  const stats = useMemo(() => {
    const lessons = detail?.lessons ?? [];
    const total = lessons.length;
    const withVideo = lessons.filter((l) => Boolean(l.video_url)).length;
    return { total, withVideo, missing: Math.max(0, total - withVideo) };
  }, [detail]);

  const filteredGroups = useMemo(() => {
    const q = query.trim().toLowerCase();
    const match = (lesson: LessonRow) => {
      if (onlyMissing && lesson.video_url) return false;
      if (!q) return true;
      const hay = `${lesson.title} ${lesson.video_provider ?? ""} ${lesson.video_url ?? ""}`.toLowerCase();
      return hay.includes(q);
    };
    return lessonsBySection
      .map((g) => ({ ...g, lessons: g.lessons.filter(match) }))
      .filter((g) => g.lessons.length > 0);
  }, [lessonsBySection, query, onlyMissing]);

  const filteredLessonCount = useMemo(() => {
    return filteredGroups.reduce((acc, g) => acc + g.lessons.length, 0);
  }, [filteredGroups]);

  const dirtyLessonIds = useMemo(() => {
    if (!detail) return [] as string[];
    const out: string[] = [];
    for (const lesson of detail.lessons ?? []) {
      const draft = drafts[lesson.id];
      if (!draft) continue;
      if (isDraftDirty(draft, lesson)) out.push(lesson.id);
    }
    return out;
  }, [detail, drafts]);

  const expandAll = () => {
    const next: Record<string, boolean> = {};
    for (const g of filteredGroups) next[g.id] = true;
    setOpenSections(next);
  };

  const collapseAll = () => {
    const next: Record<string, boolean> = {};
    for (const g of filteredGroups) next[g.id] = false;
    setOpenSections(next);
  };

  const updateDraft = (lessonId: string, patch: Partial<LessonDraft>) => {
    setDrafts((prev) => ({ ...prev, [lessonId]: { ...prev[lessonId], ...patch } }));
  };

  const handleSave = async (lesson: LessonRow) => {
    const draft = drafts[lesson.id];
    if (!draft) return;

    setSaving((prev) => ({ ...prev, [lesson.id]: true }));
    setRowError((prev) => ({ ...prev, [lesson.id]: null }));

    const body: Record<string, unknown> = {
      videoProvider: draft.videoProvider ? draft.videoProvider : null,
      videoUrl: draft.videoUrl.trim() ? draft.videoUrl.trim() : null,
    };
    if (draft.durationSeconds.trim() !== "") {
      const n = Number(draft.durationSeconds);
      if (!Number.isFinite(n) || n < 0) {
        setRowError((prev) => ({ ...prev, [lesson.id]: "Thời lượng không hợp lệ." }));
        setSaving((prev) => ({ ...prev, [lesson.id]: false }));
        return;
      }
      body.durationSeconds = Math.floor(n);
    } else if (lesson.duration_seconds != null) {
      // Cho phép clear duration đã set trước đó (set về null)
      body.durationSeconds = null;
    }

    try {
      const res = await fetch(`/api/admin/lessons/${encodeURIComponent(lesson.id)}`, {
        method: "PATCH",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = (await res.json()) as { data?: LessonRow; error?: { message?: string } };
      if (!res.ok) {
        throw new Error(json.error?.message ?? "Không lưu được.");
      }
      const updated = json.data;
      if (updated && detail) {
        const patchLesson = (ls: LessonRow): LessonRow =>
          ls.id === lesson.id ? { ...ls, ...updated } : ls;
        setDetail({
          ...detail,
          sections: detail.sections.map((s) => ({ ...s, lessons: (s.lessons ?? []).map(patchLesson) })),
          lessons: detail.lessons.map(patchLesson),
          ungroupedLessons: (detail.ungroupedLessons ?? []).map(patchLesson),
        });
        setDrafts((prev) => ({ ...prev, [lesson.id]: toDraft(updated) }));
      }
      setSavedAt((prev) => ({ ...prev, [lesson.id]: Date.now() }));
    } catch (error) {
      setRowError((prev) => ({
        ...prev,
        [lesson.id]: error instanceof Error ? error.message : "Không lưu được.",
      }));
    } finally {
      setSaving((prev) => ({ ...prev, [lesson.id]: false }));
    }
  };

  const patchLessonInState = useCallback(
    (updated: LessonRow) => {
      if (!detail) return;
      const applyPatch = (ls: LessonRow): LessonRow =>
        ls.id === updated.id ? { ...ls, ...updated } : ls;
      setDetail({
        ...detail,
        sections: detail.sections.map((s) => ({ ...s, lessons: (s.lessons ?? []).map(applyPatch) })),
        lessons: detail.lessons.map(applyPatch),
        ungroupedLessons: (detail.ungroupedLessons ?? []).map(applyPatch),
      });
    },
    [detail]
  );

  const removeLessonFromState = useCallback(
    (lessonId: string) => {
      if (!detail) return;
      const filter = (ls: LessonRow) => ls.id !== lessonId;
      setDetail({
        ...detail,
        sections: detail.sections.map((s) => ({ ...s, lessons: (s.lessons ?? []).filter(filter) })),
        lessons: detail.lessons.filter(filter),
        ungroupedLessons: (detail.ungroupedLessons ?? []).filter(filter),
      });
      setDrafts((prev) => {
        const next = { ...prev };
        delete next[lessonId];
        return next;
      });
    },
    [detail]
  );

  const handleTogglePublished = async (lesson: LessonRow) => {
    if (rowBusy[lesson.id]) return;
    setRowBusy((prev) => ({ ...prev, [lesson.id]: "publish" }));
    setRowError((prev) => ({ ...prev, [lesson.id]: null }));
    try {
      const res = await fetch(`/api/admin/lessons/${encodeURIComponent(lesson.id)}`, {
        method: "PATCH",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: !lesson.is_published }),
      });
      const json = (await res.json()) as { data?: LessonRow; error?: { message?: string } };
      if (!res.ok) throw new Error(json.error?.message ?? "Không đổi được trạng thái.");
      if (json.data) patchLessonInState(json.data);
      setSavedAt((prev) => ({ ...prev, [lesson.id]: Date.now() }));
    } catch (error) {
      setRowError((prev) => ({
        ...prev,
        [lesson.id]: error instanceof Error ? error.message : "Không đổi được trạng thái.",
      }));
    } finally {
      setRowBusy((prev) => ({ ...prev, [lesson.id]: null }));
    }
  };

  const handleDeleteLesson = async (lesson: LessonRow) => {
    if (rowBusy[lesson.id]) return;
    const confirmed = window.confirm(
      `Xoá bài "${lesson.title}"?\n\nHành động này không thể hoàn tác và sẽ xoá luôn tiến độ học viên liên quan.`
    );
    if (!confirmed) return;

    setRowBusy((prev) => ({ ...prev, [lesson.id]: "delete" }));
    setRowError((prev) => ({ ...prev, [lesson.id]: null }));
    try {
      const res = await fetch(`/api/admin/lessons/${encodeURIComponent(lesson.id)}`, {
        method: "DELETE",
        credentials: "same-origin",
      });
      if (!res.ok) {
        const json = (await res.json().catch(() => ({}))) as { error?: { message?: string } };
        throw new Error(json.error?.message ?? "Không xoá được bài học.");
      }
      removeLessonFromState(lesson.id);
    } catch (error) {
      setRowError((prev) => ({
        ...prev,
        [lesson.id]: error instanceof Error ? error.message : "Không xoá được bài học.",
      }));
    } finally {
      setRowBusy((prev) => ({ ...prev, [lesson.id]: null }));
    }
  };

  const openContentDialog = (lesson: LessonRow) => {
    setContentDialogLessonId(lesson.id);
    setContentDraft(contentDraftFromLesson(lesson));
    setContentError(null);
  };

  const closeContentDialog = () => {
    if (contentSaving) return;
    setContentDialogLessonId(null);
    setContentDraft(null);
    setContentError(null);
  };

  const contentDialogLesson = useMemo(() => {
    if (!contentDialogLessonId || !detail) return null;
    return detail.lessons.find((l) => l.id === contentDialogLessonId) ?? null;
  }, [contentDialogLessonId, detail]);

  const handleSaveContent = async () => {
    if (!contentDialogLesson || !contentDraft) return;
    const title = contentDraft.title.trim();
    if (!title) {
      setContentError("Tên bài học không được để trống.");
      return;
    }

    const notesBullets = contentDraft.notesBullets
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    const body = {
      title,
      summary: contentDraft.summary,
      contentHtml: contentDraft.contentHtml,
      notesIntro: contentDraft.notesIntro,
      notesJson: notesBullets,
    };

    setContentSaving(true);
    setContentError(null);
    try {
      const res = await fetch(`/api/admin/lessons/${encodeURIComponent(contentDialogLesson.id)}`, {
        method: "PATCH",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = (await res.json()) as { data?: LessonRow; error?: { message?: string } };
      if (!res.ok) throw new Error(json.error?.message ?? "Không lưu được nội dung.");
      if (json.data) patchLessonInState(json.data);
      setSavedAt((prev) => ({ ...prev, [contentDialogLesson.id]: Date.now() }));
      setContentDialogLessonId(null);
      setContentDraft(null);
    } catch (error) {
      setContentError(error instanceof Error ? error.message : "Không lưu được nội dung.");
    } finally {
      setContentSaving(false);
    }
  };

  const handleSaveAll = async () => {
    if (!detail) return;
    const idSet = new Set(dirtyLessonIds);
    const toSave = (detail.lessons ?? []).filter((l) => idSet.has(l.id));
    if (toSave.length === 0) return;

    setSavingAll(true);
    try {
      // Lưu tuần tự để tránh bắn quá nhiều request cùng lúc.
      for (const lesson of toSave) {
        // eslint-disable-next-line no-await-in-loop
        await handleSave(lesson);
      }
    } finally {
      setSavingAll(false);
    }
  };

  const startEditCourseInfo = () => {
    if (!detail) return;
    setCourseInfoDraft(courseInfoDraftFromDetail(detail));
    setCourseInfoError(null);
    setCourseInfoEdit(true);
  };

  const cancelEditCourseInfo = () => {
    if (!detail || courseInfoSaving) return;
    setCourseInfoDraft(courseInfoDraftFromDetail(detail));
    setCourseInfoError(null);
    setCourseInfoEdit(false);
  };

  const handleSaveCourseInfo = async () => {
    if (!detail || !courseInfoDraft) return;

    const title = courseInfoDraft.title.trim();
    if (!title) {
      setCourseInfoError("Tiêu đề không được để trống.");
      return;
    }

    let priceVnd: number | null = null;
    if (courseInfoDraft.priceVnd.trim() !== "") {
      const n = Number(courseInfoDraft.priceVnd);
      if (!Number.isFinite(n) || n < 0) {
        setCourseInfoError("Giá không hợp lệ.");
        return;
      }
      priceVnd = Math.floor(n);
    }

    let totalDurationSeconds: number | null = null;
    if (courseInfoDraft.totalDurationSeconds.trim() !== "") {
      const n = Number(courseInfoDraft.totalDurationSeconds);
      if (!Number.isFinite(n) || n < 0) {
        setCourseInfoError("Tổng thời lượng không hợp lệ.");
        return;
      }
      totalDurationSeconds = Math.floor(n);
    }

    setCourseInfoSaving(true);
    setCourseInfoError(null);

    try {
      const res = await fetch(`/api/admin/courses/${encodeURIComponent(detail.id)}`, {
        method: "PATCH",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          shortDescription: courseInfoDraft.shortDescription.trim() || null,
          description: courseInfoDraft.description.trim() || null,
          levelLabel: courseInfoDraft.levelLabel.trim() || null,
          thumbnailUrl: courseInfoDraft.thumbnailUrl.trim() || null,
          priceVnd,
          totalDurationSeconds,
        }),
      });

      const json = (await res.json()) as { data?: Record<string, unknown>; error?: { message?: string } };
      if (!res.ok) throw new Error(json.error?.message ?? "Không lưu được thông tin khoá học.");

      const patch = json.data ?? {};
      setDetail((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          title: String((patch.title as string) ?? prev.title),
          slug: String((patch.slug as string) ?? prev.slug),
          status: String((patch.status as string) ?? prev.status),
          short_description: (patch.short_description as string) ?? prev.short_description ?? null,
          description: (patch.description as string) ?? prev.description ?? null,
          level_label: (patch.level_label as string) ?? prev.level_label ?? null,
          thumbnail_url: (patch.thumbnail_url as string) ?? prev.thumbnail_url ?? null,
          price_vnd: (patch.price_vnd as number) ?? prev.price_vnd ?? null,
          total_duration_seconds:
            (patch.total_duration_seconds as number) ?? prev.total_duration_seconds ?? null,
        };
      });

      setCourses((prev) =>
        prev.map((course) =>
          course.id === detail.id
            ? {
                ...course,
                title: String((patch.title as string) ?? course.title),
                short_description:
                  (patch.short_description as string) ?? course.short_description ?? null,
                description: (patch.description as string) ?? course.description ?? null,
                level_label: (patch.level_label as string) ?? course.level_label ?? null,
                thumbnail_url: (patch.thumbnail_url as string) ?? course.thumbnail_url ?? null,
                price_vnd: (patch.price_vnd as number) ?? course.price_vnd ?? null,
                total_duration_seconds:
                  (patch.total_duration_seconds as number) ?? course.total_duration_seconds ?? null,
              }
            : course
        )
      );

      const nextDetail = {
        ...detail,
        title: String((patch.title as string) ?? detail.title),
        short_description: (patch.short_description as string) ?? detail.short_description ?? null,
        description: (patch.description as string) ?? detail.description ?? null,
        level_label: (patch.level_label as string) ?? detail.level_label ?? null,
        thumbnail_url: (patch.thumbnail_url as string) ?? detail.thumbnail_url ?? null,
        price_vnd: (patch.price_vnd as number) ?? detail.price_vnd ?? null,
        total_duration_seconds:
          (patch.total_duration_seconds as number) ?? detail.total_duration_seconds ?? null,
      };
      setCourseInfoDraft(courseInfoDraftFromDetail(nextDetail));
      setCourseInfoSavedAt(Date.now());
      setCourseInfoEdit(false);
    } catch (error) {
      setCourseInfoError(error instanceof Error ? error.message : "Không lưu được thông tin khoá học.");
    } finally {
      setCourseInfoSaving(false);
    }
  };

  const openAddLessonDialog = () => {
    setAddLessonTitle("");
    setAddLessonSectionId(detail?.sections?.[0]?.id ?? "");
    setAddLessonProvider("");
    setAddLessonUrl("");
    setAddLessonDuration("");
    setAddLessonError(null);
    setAddLessonOpen(true);
  };

  const handleAddLesson = async () => {
    if (!detail) return;
    const title = addLessonTitle.trim();
    if (!title) {
      setAddLessonError("Tên bài học không được để trống.");
      return;
    }
    setAddLessonSaving(true);
    setAddLessonError(null);
    try {
      const body: Record<string, unknown> = {
        courseId: detail.id,
        title,
        sectionId: addLessonSectionId || null,
        videoProvider: addLessonProvider || null,
        videoUrl: addLessonUrl.trim() || null,
        durationSeconds: addLessonDuration.trim() !== "" ? Number(addLessonDuration) : 0,
      };
      const res = await fetch("/api/admin/lessons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(body),
      });
      const json = (await res.json()) as { data?: LessonRow; error?: { message?: string } };
      if (!res.ok) throw new Error(json.error?.message ?? "Không tạo được bài học.");
      const newLesson = json.data!;
      setDetail((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          lessons: [...prev.lessons, newLesson],
          ungroupedLessons: newLesson.section_id
            ? prev.ungroupedLessons
            : [...prev.ungroupedLessons, newLesson],
          sections: newLesson.section_id
            ? prev.sections.map((s) =>
                s.id === newLesson.section_id
                  ? { ...s, lessons: [...(s.lessons ?? []), newLesson] }
                  : s
              )
            : prev.sections,
        };
      });
      setDrafts((prev) => ({ ...prev, [newLesson.id]: toDraft(newLesson) }));
      setAddLessonOpen(false);
    } catch (error) {
      setAddLessonError(error instanceof Error ? error.message : "Không tạo được bài học.");
    } finally {
      setAddLessonSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      {/* ── LIST VIEW ── */}
      {view === "list" && (
        <>
          <div className="border-b border-gray-200 bg-white px-6 py-5 lg:px-8">
            <h1 className="font-sans font-bold text-gray-900 text-2xl">Quản lý khoá học</h1>
            <p className="mt-1 text-sm text-gray-500">Chọn khoá học để xem và chỉnh sửa bài giảng, video.</p>
          </div>
          <div className="flex-1 bg-gray-50 px-6 py-5 lg:px-8">
            {courseLoading ? (
              <div className="flex items-center gap-2 py-8 text-sm text-gray-500">
                <Loader2 className="size-4 animate-spin" /> Đang tải khóa học...
              </div>
            ) : courseError ? (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{courseError}</div>
            ) : courses.length === 0 ? (
              <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">Chưa có khóa học nào.</div>
            ) : (
              <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      <th className="px-5 py-3 text-left text-xs font-medium text-gray-500">Khoá học</th>
                      <th className="px-5 py-3 text-left text-xs font-medium text-gray-500">Trạng thái</th>
                      <th className="px-5 py-3 text-left text-xs font-medium text-gray-500">Bài học</th>
                      <th className="px-5 py-3 text-left text-xs font-medium text-gray-500">Giá</th>
                      <th className="px-5 py-3 text-right text-xs font-medium text-gray-500">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {courses.map((c) => (
                      <tr key={c.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            {c.thumbnail_url ? (
                              <img
                                src={c.thumbnail_url}
                                alt={c.title}
                                className="size-12 shrink-0 rounded-md object-cover"
                              />
                            ) : (
                              <div className="flex size-12 shrink-0 items-center justify-center rounded-md bg-gray-100 text-gray-400">
                                <Video size={18} />
                              </div>
                            )}
                            <div className="min-w-0">
                              <div className="font-medium text-gray-900">{c.title}</div>
                              {c.short_description && (
                                <div className="mt-0.5 line-clamp-1 text-xs text-gray-400">{c.short_description}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${
                            c.status === "published"
                              ? "bg-emerald-50 text-emerald-700"
                              : c.status === "draft"
                                ? "bg-gray-100 text-gray-500"
                                : "bg-orange-50 text-orange-600"
                          }`}>
                            {c.status === "published" ? "Đã xuất bản" : c.status === "draft" ? "Bản nháp" : c.status}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-gray-600">
                          {c.lesson_count != null ? `${c.lesson_count} bài` : <span className="text-gray-300">—</span>}
                        </td>
                        <td className="px-5 py-3 text-gray-600">
                          {c.price_vnd != null
                            ? c.price_vnd === 0
                              ? "Miễn phí"
                              : `${c.price_vnd.toLocaleString("vi-VN")}₫`
                            : <span className="text-gray-300">—</span>}
                        </td>
                        <td className="px-5 py-3 text-right">
                          <button
                            type="button"
                            onClick={() => openCourse(c.id)}
                            className="rounded-md bg-[#c0392b] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#96281b]"
                          >
                            Chỉnh sửa
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* ── DETAIL VIEW ── */}
      {view === "detail" && (
        <>
          {/* Header */}
          <div className="border-b border-gray-200 bg-white px-6 py-4 lg:px-8">
            <button
              type="button"
              onClick={goBack}
              className="mb-3 flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"
            >
              <ChevronDown className="size-4 rotate-90" /> Quay lại danh sách
            </button>
            {detailLoading ? (
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Loader2 className="size-4 animate-spin" /> Đang tải...
              </div>
            ) : detail ? (
              <div className="flex items-center gap-3">
                {detail.thumbnail_url ? (
                  <img src={detail.thumbnail_url} alt={detail.title} className="size-10 rounded-md object-cover" />
                ) : (
                  <div className="flex size-10 items-center justify-center rounded-md bg-gray-100 text-gray-400">
                    <Video size={16} />
                  </div>
                )}
                <div>
                  <h1 className="font-sans font-semibold text-gray-900 text-lg leading-tight">{detail.title}</h1>
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${
                    detail.status === "published" ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"
                  }`}>
                    {detail.status === "published" ? "Đã xuất bản" : "Bản nháp"}
                  </span>
                </div>
              </div>
            ) : null}
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 bg-white px-6 lg:px-8">
            <div className="flex gap-0">
              {(["info", "lessons"] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                    activeTab === tab
                      ? "border-[#c0392b] text-[#c0392b]"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {tab === "info" ? "Thông tin khoá học" : "Bài học & Video"}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 bg-gray-50 px-6 py-5 lg:px-8">
            {detailLoading ? (
              <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white p-8 text-sm text-gray-500">
                <Loader2 className="size-4 animate-spin" /> Đang tải...
              </div>
            ) : detailError ? (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{detailError}</div>
            ) : detail ? (
              <>
                {/* ── TAB: INFO ── */}
                {activeTab === "info" && (
                  <div className="w-full space-y-5">
                    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-5 py-3">
                        <h2 className="font-medium text-gray-800">Thông tin chung</h2>
                        <div className="flex items-center gap-2">
                          {!courseInfoEdit ? (
                            <button
                              type="button"
                              onClick={startEditCourseInfo}
                              className="rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50"
                            >
                              Chỉnh sửa
                            </button>
                          ) : (
                            <>
                              <button
                                type="button"
                                onClick={cancelEditCourseInfo}
                                disabled={courseInfoSaving}
                                className="rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-60"
                              >
                                Huỷ
                              </button>
                              <button
                                type="button"
                                onClick={handleSaveCourseInfo}
                                disabled={courseInfoSaving || !courseInfoDraft || !isCourseInfoDraftDirty(courseInfoDraft, detail)}
                                className="inline-flex items-center gap-1.5 rounded-md bg-[#c0392b] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#96281b] disabled:bg-gray-300 disabled:text-gray-500"
                              >
                                {courseInfoSaving ? <Loader2 className="size-3.5 animate-spin" /> : null}
                                Lưu thông tin
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="p-5">
                        {courseInfoEdit && courseInfoDraft ? (
                          <div className="space-y-4">
                            <div className="grid gap-4 lg:grid-cols-2">
                              <div>
                                <label className="mb-1 block text-xs font-medium text-gray-500">Tiêu đề</label>
                                <input
                                  type="text"
                                  value={courseInfoDraft.title}
                                  onChange={(e) =>
                                    setCourseInfoDraft((prev) => (prev ? { ...prev, title: e.target.value } : prev))
                                  }
                                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-sm focus:border-[#c0392b] focus:outline-none"
                                  disabled={courseInfoSaving}
                                />
                              </div>
                              <div>
                                <label className="mb-1 block text-xs font-medium text-gray-500">Cấp độ</label>
                                <input
                                  type="text"
                                  value={courseInfoDraft.levelLabel}
                                  onChange={(e) =>
                                    setCourseInfoDraft((prev) => (prev ? { ...prev, levelLabel: e.target.value } : prev))
                                  }
                                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-sm focus:border-[#c0392b] focus:outline-none"
                                  disabled={courseInfoSaving}
                                />
                              </div>
                              <div>
                                <label className="mb-1 block text-xs font-medium text-gray-500">Giá (VND)</label>
                                <input
                                  type="number"
                                  min={0}
                                  step={1000}
                                  value={courseInfoDraft.priceVnd}
                                  onChange={(e) =>
                                    setCourseInfoDraft((prev) => (prev ? { ...prev, priceVnd: e.target.value } : prev))
                                  }
                                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-sm focus:border-[#c0392b] focus:outline-none"
                                  disabled={courseInfoSaving}
                                />
                              </div>
                              <div>
                                <label className="mb-1 block text-xs font-medium text-gray-500">Tổng thời lượng (giây)</label>
                                <input
                                  type="number"
                                  min={0}
                                  step={1}
                                  value={courseInfoDraft.totalDurationSeconds}
                                  onChange={(e) =>
                                    setCourseInfoDraft((prev) =>
                                      prev ? { ...prev, totalDurationSeconds: e.target.value } : prev
                                    )
                                  }
                                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-sm focus:border-[#c0392b] focus:outline-none"
                                  disabled={courseInfoSaving}
                                />
                              </div>
                            </div>

                            <div>
                              <label className="mb-1 block text-xs font-medium text-gray-500">Mô tả ngắn</label>
                              <textarea
                                value={courseInfoDraft.shortDescription}
                                onChange={(e) =>
                                  setCourseInfoDraft((prev) =>
                                    prev ? { ...prev, shortDescription: e.target.value } : prev
                                  )
                                }
                                rows={2}
                                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-sm focus:border-[#c0392b] focus:outline-none"
                                disabled={courseInfoSaving}
                              />
                            </div>

                            <div>
                              <label className="mb-1 block text-xs font-medium text-gray-500">Mô tả đầy đủ</label>
                              <textarea
                                value={courseInfoDraft.description}
                                onChange={(e) =>
                                  setCourseInfoDraft((prev) =>
                                    prev ? { ...prev, description: e.target.value } : prev
                                  )
                                }
                                rows={6}
                                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-sm focus:border-[#c0392b] focus:outline-none"
                                disabled={courseInfoSaving}
                              />
                            </div>

                            <div>
                              <label className="mb-1 block text-xs font-medium text-gray-500">Ảnh bìa (URL)</label>
                              <input
                                type="url"
                                value={courseInfoDraft.thumbnailUrl}
                                onChange={(e) =>
                                  setCourseInfoDraft((prev) =>
                                    prev ? { ...prev, thumbnailUrl: e.target.value } : prev
                                  )
                                }
                                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-sm focus:border-[#c0392b] focus:outline-none"
                                disabled={courseInfoSaving}
                                spellCheck={false}
                              />
                            </div>

                            {courseInfoError ? (
                              <p className="text-sm text-red-600">{courseInfoError}</p>
                            ) : courseInfoSavedAt && Date.now() - courseInfoSavedAt < 5000 ? (
                              <p className="inline-flex items-center gap-1 text-sm font-medium text-green-700">
                                <CheckCircle2 className="size-4" /> Đã lưu thông tin khoá học.
                              </p>
                            ) : null}
                          </div>
                        ) : (
                          <div className="grid gap-4 lg:grid-cols-[320px,1fr]">
                            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                              {detail.thumbnail_url ? (
                                <img
                                  src={detail.thumbnail_url}
                                  alt={detail.title}
                                  className="h-52 w-full rounded-md object-cover"
                                />
                              ) : (
                                <div className="flex h-52 items-center justify-center rounded-md border border-dashed border-gray-300 text-sm text-gray-400">
                                  Chưa có ảnh bìa
                                </div>
                              )}
                            </div>
                            <div className="space-y-4 rounded-lg border border-gray-100 bg-white p-1">
                              <div>
                                <div className="text-xs font-medium text-gray-500">Tiêu đề</div>
                                <div className="mt-1 text-base font-semibold text-gray-900">{detail.title}</div>
                              </div>
                              <div>
                                <div className="text-xs font-medium text-gray-500">Mô tả ngắn</div>
                                <div className="mt-1 text-sm text-gray-700 whitespace-pre-line">
                                  {detail.short_description ?? <span className="text-gray-300">—</span>}
                                </div>
                              </div>
                              <div>
                                <div className="text-xs font-medium text-gray-500">Mô tả đầy đủ</div>
                                <div className="mt-1 text-sm text-gray-700 whitespace-pre-line">
                                  {detail.description ?? <span className="text-gray-300">—</span>}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid gap-3 md:grid-cols-4">
                      <div className="rounded-lg border border-gray-200 bg-white p-4">
                        <div className="text-xs font-medium text-gray-500">Cấp độ</div>
                        <div className="mt-1 text-sm font-medium text-gray-800">{detail.level_label ?? "—"}</div>
                      </div>
                      <div className="rounded-lg border border-gray-200 bg-white p-4">
                        <div className="text-xs font-medium text-gray-500">Giá (VND)</div>
                        <div className="mt-1 text-sm font-medium text-gray-800">
                          {detail.price_vnd != null ? `${detail.price_vnd.toLocaleString("vi-VN")}₫` : "—"}
                        </div>
                      </div>
                      <div className="rounded-lg border border-gray-200 bg-white p-4">
                        <div className="text-xs font-medium text-gray-500">Số bài học</div>
                        <div className="mt-1 text-sm font-medium text-gray-800">
                          {detail.lesson_count != null ? detail.lesson_count : "—"}
                        </div>
                      </div>
                      <div className="rounded-lg border border-gray-200 bg-white p-4">
                        <div className="text-xs font-medium text-gray-500">Tổng thời lượng</div>
                        <div className="mt-1 text-sm font-medium text-gray-800">
                          {detail.total_duration_seconds != null ? formatMmSs(detail.total_duration_seconds) : "—"}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── TAB: LESSONS ── */}
                {activeTab === "lessons" && (
                  <>
                    {/* Lessons toolbar */}
                    <div className="mb-4 flex flex-wrap items-center gap-2">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span className="font-medium text-gray-700">{stats.total} bài</span>
                        <span className="text-gray-300">·</span>
                        <span className="text-green-700">{stats.withVideo} có video</span>
                        {stats.missing > 0 && (
                          <>
                            <span className="text-gray-300">·</span>
                            <span className="font-semibold text-[#c0392b]">{stats.missing} thiếu video</span>
                          </>
                        )}
                      </div>
                      <div className="ml-auto flex flex-wrap items-center gap-2">
                        <div className="relative">
                          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
                          <input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Tìm bài học…"
                            className="h-9 w-48 rounded-lg border border-gray-200 bg-white pl-9 pr-3 text-sm focus:border-[#c0392b] focus:outline-none"
                          />
                        </div>
                        <label className="flex h-9 cursor-pointer items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-600 hover:bg-gray-50">
                          <input
                            type="checkbox"
                            checked={onlyMissing}
                            onChange={(e) => setOnlyMissing(e.target.checked)}
                            className="size-3.5 accent-[#c0392b]"
                          />
                          Chưa có video
                        </label>
                        <button type="button" onClick={expandAll} className="flex h-9 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-600 hover:bg-gray-50">
                          <ChevronDown className="size-4" /> Mở rộng
                        </button>
                        <button type="button" onClick={collapseAll} className="flex h-9 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-600 hover:bg-gray-50">
                          <ChevronUp className="size-4" /> Thu gọn
                        </button>
                        {!helpDismissed && (
                          <button type="button" onClick={() => setHelpOpen((v) => !v)} className="flex h-9 items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 text-sm text-blue-700 hover:bg-blue-100">
                            💡 Hướng dẫn
                          </button>
                        )}
                        {dirtyLessonIds.length > 0 && (
                          <button
                            type="button"
                            onClick={handleSaveAll}
                            disabled={savingAll}
                            className="flex h-9 items-center gap-2 rounded-lg bg-[#c0392b] px-4 text-sm font-semibold text-white hover:bg-[#96281b] disabled:bg-gray-300 disabled:text-gray-400"
                          >
                            {savingAll ? <Loader2 className="size-4 animate-spin" /> : null}
                            Lưu {dirtyLessonIds.length} thay đổi
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={openAddLessonDialog}
                          className="flex h-9 items-center gap-1.5 rounded-lg bg-[#c0392b] px-3 text-sm font-semibold text-white hover:bg-[#96281b]"
                        >
                          <Plus className="size-4" /> Thêm bài học
                        </button>
                      </div>
                    </div>

                    {/* Help panel */}
                    {!helpDismissed && helpOpen && (
                      <div className="mb-4 rounded-lg border border-blue-100 bg-blue-50 p-4 text-sm text-blue-900">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="font-semibold">Hướng dẫn lấy Bunny Video GUID</div>
                            <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-blue-800">
                              <li>Upload video trong <a className="underline" href="https://dash.bunny.net" target="_blank" rel="noreferrer">dash.bunny.net</a> → Stream → Library → Videos.</li>
                              <li>Bấm vào video đã upload, copy <strong>Video GUID</strong> (UUID).</li>
                              <li>Chọn <strong>Bunny Stream</strong> → dán GUID/URL → bấm <strong>Lưu</strong>.</li>
                            </ul>
                          </div>
                          <button
                            type="button"
                            onClick={() => { setHelpDismissed(true); try { window.localStorage.setItem("csnb_admin_bunny_help_dismissed", "1"); } catch { /* ignore */ } }}
                            className="rounded-sm p-1 text-blue-900/60 hover:bg-blue-100"
                            title="Ẩn hướng dẫn"
                          >
                            <X className="size-4" />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Lessons table */}
                    {detail.lessons.length === 0 ? (
                      <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">Khóa học chưa có bài nào.</div>
                    ) : filteredGroups.length === 0 ? (
                      <div className="rounded-lg border border-gray-200 bg-white p-6 text-center text-sm text-gray-500">Không tìm thấy bài phù hợp bộ lọc.</div>
                    ) : (
                      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
                        <div className="grid grid-cols-[minmax(180px,2fr)_150px_minmax(140px,1fr)_110px_160px] border-b border-gray-100 bg-gray-50 px-5 py-3">
                          <div className="text-xs font-medium text-gray-500">Bài học</div>
                          <div className="text-xs font-medium text-gray-500">Loại video</div>
                          <div className="text-xs font-medium text-gray-500">GUID / URL</div>
                          <div className="text-xs font-medium text-gray-500">Thời lượng</div>
                          <div className="text-right text-xs font-medium text-gray-500">Thao tác</div>
                        </div>
                        {filteredGroups.map((group, idx) => {
                          const isOpen = openSections[group.id] ?? true;
                          const missingInGroup = group.lessons.filter((l) => !l.video_url).length;
                          return (
                            <div key={idx}>
                              <button
                                type="button"
                                onClick={() => setOpenSections((prev) => ({ ...prev, [group.id]: !isOpen }))}
                                className="flex w-full items-center gap-2.5 border-b border-gray-100 bg-gray-50/70 px-5 py-2.5 text-left hover:bg-gray-100/60"
                              >
                                <ChevronDown className={`size-4 shrink-0 text-gray-400 transition-transform ${isOpen ? "" : "-rotate-90"}`} />
                                <span className="text-sm font-semibold text-gray-700">{group.title}</span>
                                <span className="text-xs text-gray-400">{group.lessons.length} bài</span>
                                {missingInGroup > 0 && (
                                  <span className="rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-semibold text-red-600">{missingInGroup} thiếu video</span>
                                )}
                              </button>
                              {isOpen && group.lessons.map((lesson) => {
                                const draft = drafts[lesson.id] ?? toDraft(lesson);
                                const dirty = isDraftDirty(draft, lesson);
                                const isSaving = saving[lesson.id];
                                const err = rowError[lesson.id];
                                const justSaved = savedAt[lesson.id] && Date.now() - savedAt[lesson.id] < 4000;
                                return (
                                  <div
                                    key={lesson.id}
                                    className={`grid grid-cols-[minmax(180px,2fr)_150px_minmax(140px,1fr)_110px_160px] items-start border-b border-gray-50 px-5 py-3.5 transition-colors hover:bg-gray-50/50 ${dirty ? "bg-amber-50/40" : ""}`}
                                  >
                                    <div className="min-w-0 pr-4">
                                      <div className="mb-1 flex flex-wrap items-center gap-1.5">
                                        <span className="text-sm font-medium text-gray-900">{lesson.title}</span>
                                        {dirty && <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700">chưa lưu</span>}
                                      </div>
                                      <div className="flex flex-wrap items-center gap-1.5">
                                        {lesson.is_published ? (
                                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700"><Eye size={10} /> Đã xuất bản</span>
                                        ) : (
                                          <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-500"><EyeOff size={10} /> Bản nháp</span>
                                        )}
                                        {lesson.video_url ? (
                                          <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-[11px] font-medium text-green-700"><Video size={10} /> {providerLabel(lesson.video_provider)}</span>
                                        ) : (
                                          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-400">Chưa có video</span>
                                        )}
                                        {lesson.duration_seconds != null && (
                                          <span className="text-[11px] text-gray-400">{formatMmSs(lesson.duration_seconds)}</span>
                                        )}
                                      </div>
                                      {err && <p className="mt-1 text-xs text-red-600">{err}</p>}
                                      {!err && justSaved && (
                                        <p className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-green-700"><CheckCircle2 size={12} /> Đã lưu</p>
                                      )}
                                    </div>
                                    <div className="pr-3 pt-0.5">
                                      <select
                                        value={draft.videoProvider}
                                        onChange={(e) => updateDraft(lesson.id, { videoProvider: e.target.value })}
                                        className="w-full rounded-md border border-gray-200 bg-white px-2.5 py-2 text-sm focus:border-[#c0392b] focus:outline-none"
                                        disabled={isSaving}
                                      >
                                        <option value="">— Chưa chọn —</option>
                                        <option value="bunny_stream">Bunny Stream</option>
                                        <option value="youtube">YouTube</option>
                                        <option value="mp4">MP4</option>
                                      </select>
                                    </div>
                                    <div className="pr-3 pt-0.5">
                                      <input
                                        type="text"
                                        value={draft.videoUrl}
                                        onChange={(e) => updateDraft(lesson.id, { videoUrl: e.target.value })}
                                        placeholder={draft.videoProvider === "bunny_stream" ? "Bunny Video GUID" : draft.videoProvider === "youtube" ? "YouTube URL" : draft.videoProvider === "mp4" ? "MP4 URL" : "GUID / URL"}
                                        className="w-full rounded-md border border-gray-200 bg-white px-2.5 py-2 font-mono text-xs focus:border-[#c0392b] focus:outline-none"
                                        disabled={isSaving}
                                        spellCheck={false}
                                      />
                                      {draft.videoProvider === "bunny_stream" && <p className="mt-0.5 text-[11px] text-gray-400">GUID hoặc URL embed/play đều được</p>}
                                    </div>
                                    <div className="pr-3 pt-0.5">
                                      <input
                                        type="number"
                                        min={0}
                                        step={1}
                                        value={draft.durationSeconds}
                                        onChange={(e) => updateDraft(lesson.id, { durationSeconds: e.target.value })}
                                        placeholder="Giây"
                                        className="w-full rounded-md border border-gray-200 bg-white px-2.5 py-2 text-sm focus:border-[#c0392b] focus:outline-none"
                                        disabled={isSaving}
                                      />
                                      <p className="mt-0.5 text-[11px] text-gray-400">
                                        {draft.durationSeconds.trim() !== "" && Number.isFinite(Number(draft.durationSeconds)) ? `~ ${formatMmSs(Number(draft.durationSeconds))}` : "VD: 750 → 12:30"}
                                      </p>
                                    </div>
                                    <div className="flex items-center justify-end gap-1.5 pt-0.5">
                                      <button type="button" onClick={() => handleSave(lesson)} disabled={!dirty || isSaving} className="h-8 rounded-md bg-[#c0392b] px-3 text-xs font-semibold text-white hover:bg-[#96281b] disabled:bg-gray-200 disabled:text-gray-400" title="Lưu video">
                                        {isSaving ? <Loader2 className="size-3.5 animate-spin" /> : "Lưu"}
                                      </button>
                                      <button type="button" onClick={() => openContentDialog(lesson)} disabled={Boolean(rowBusy[lesson.id])} className="flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50" title="Sửa nội dung">
                                        <FileText className="size-3.5" />
                                      </button>
                                      <button type="button" onClick={() => handleTogglePublished(lesson)} disabled={Boolean(rowBusy[lesson.id])} className="flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50" title={lesson.is_published ? "Ẩn bài" : "Xuất bản"}>
                                        {rowBusy[lesson.id] === "publish" ? <Loader2 className="size-3.5 animate-spin" /> : lesson.is_published ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                                      </button>
                                      <button type="button" onClick={() => handleDeleteLesson(lesson)} disabled={Boolean(rowBusy[lesson.id])} className="flex h-8 w-8 items-center justify-center rounded-md border border-red-100 bg-white text-red-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-50" title="Xoá bài">
                                        {rowBusy[lesson.id] === "delete" ? <Loader2 className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </>
                )}
              </>
            ) : null}
          </div>
        </>
      )}

      {/* ── ADD LESSON DIALOG ── */}
      <Dialog open={addLessonOpen} onOpenChange={(open) => { if (!addLessonSaving) setAddLessonOpen(open); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Thêm bài học mới</DialogTitle>
            <DialogDescription>Tạo bài học mới cho khoá học này. Có thể chỉnh sửa video sau.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div>
              <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                Tên bài học <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={addLessonTitle}
                onChange={(e) => setAddLessonTitle(e.target.value)}
                placeholder="VD: Bài 1 — Khởi động và thở cơ bản"
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-sm focus:border-[#c0392b] focus:outline-none"
                disabled={addLessonSaving}
                autoFocus
              />
            </div>
            {detail && detail.sections.length > 0 && (
              <div>
                <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                  Phần học
                </label>
                <select
                  value={addLessonSectionId}
                  onChange={(e) => setAddLessonSectionId(e.target.value)}
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-sm focus:border-[#c0392b] focus:outline-none"
                  disabled={addLessonSaving}
                >
                  <option value="">— Chưa xếp phần —</option>
                  {detail.sections.map((s) => (
                    <option key={s.id} value={s.id}>{s.title ?? "(Không tên)"}</option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                Loại video
              </label>
              <select
                value={addLessonProvider}
                onChange={(e) => setAddLessonProvider(e.target.value)}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-sm focus:border-[#c0392b] focus:outline-none"
                disabled={addLessonSaving}
              >
                <option value="">— Chưa chọn —</option>
                <option value="bunny_stream">Bunny Stream</option>
                <option value="youtube">YouTube</option>
                <option value="mp4">MP4</option>
              </select>
            </div>
            {addLessonProvider && (
              <div>
                <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                  GUID / URL
                </label>
                <input
                  type="text"
                  value={addLessonUrl}
                  onChange={(e) => setAddLessonUrl(e.target.value)}
                  placeholder={addLessonProvider === "bunny_stream" ? "Bunny Video GUID" : addLessonProvider === "youtube" ? "YouTube URL" : "MP4 URL"}
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 font-mono text-xs focus:border-[#c0392b] focus:outline-none"
                  disabled={addLessonSaving}
                  spellCheck={false}
                />
              </div>
            )}
            {addLessonError && (
              <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{addLessonError}</p>
            )}
          </div>
          <DialogFooter className="mt-2">
            <DialogClose asChild>
              <button
                type="button"
                disabled={addLessonSaving}
                className="rounded-md border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Huỷ
              </button>
            </DialogClose>
            <button
              type="button"
              onClick={handleAddLesson}
              disabled={addLessonSaving || !addLessonTitle.trim()}
              className="flex items-center gap-2 rounded-md bg-[#c0392b] px-4 py-2 text-sm font-semibold text-white hover:bg-[#96281b] disabled:bg-gray-300 disabled:text-gray-400"
            >
              {addLessonSaving ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
              Tạo bài học
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(contentDialogLessonId)}
        onOpenChange={(open) => {
          if (!open) closeContentDialog();
        }}
      >
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa nội dung bài học</DialogTitle>
            <DialogDescription>
              Cập nhật tên, tóm tắt, nội dung chi tiết và ghi chú bài học. Video được quản lý ở form bên ngoài.
            </DialogDescription>
          </DialogHeader>

          {contentDraft && contentDialogLesson ? (
            <div className="grid gap-4">
              <div>
                <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                  Tên bài học
                </label>
                <input
                  type="text"
                  value={contentDraft.title}
                  onChange={(e) =>
                    setContentDraft((prev) => (prev ? { ...prev, title: e.target.value } : prev))
                  }
                  className="w-full rounded-sm border border-gray-300 bg-white px-3 py-2.5 text-sm focus:border-[#c0392b] focus:outline-none"
                  disabled={contentSaving}
                />
              </div>

              <div>
                <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                  Tóm tắt (hiển thị ở sidebar / mô tả ngắn)
                </label>
                <textarea
                  value={contentDraft.summary}
                  onChange={(e) =>
                    setContentDraft((prev) => (prev ? { ...prev, summary: e.target.value } : prev))
                  }
                  rows={2}
                  className="w-full rounded-sm border border-gray-300 bg-white px-3 py-2.5 text-sm focus:border-[#c0392b] focus:outline-none"
                  placeholder="1-2 câu giới thiệu ngắn về bài học"
                  disabled={contentSaving}
                />
              </div>

              <div>
                <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                  Nội dung chi tiết (HTML)
                </label>
                <textarea
                  value={contentDraft.contentHtml}
                  onChange={(e) =>
                    setContentDraft((prev) => (prev ? { ...prev, contentHtml: e.target.value } : prev))
                  }
                  rows={6}
                  className="w-full rounded-sm border border-gray-300 bg-white px-3 py-2.5 font-mono text-xs focus:border-[#c0392b] focus:outline-none"
                  placeholder="Cho phép HTML: <p>, <ul>, <li>, <strong>…"
                  disabled={contentSaving}
                  spellCheck={false}
                />
                <p className="mt-1 text-xs text-gray-500">
                  Có thể để trống — nếu trống, tab &ldquo;Nội dung&rdquo; sẽ dùng phần ghi chú ở dưới.
                </p>
              </div>

              <div>
                <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                  Ghi chú — đoạn giới thiệu
                </label>
                <textarea
                  value={contentDraft.notesIntro}
                  onChange={(e) =>
                    setContentDraft((prev) => (prev ? { ...prev, notesIntro: e.target.value } : prev))
                  }
                  rows={2}
                  className="w-full rounded-sm border border-gray-300 bg-white px-3 py-2.5 text-sm focus:border-[#c0392b] focus:outline-none"
                  placeholder="VD: Trong bài này bạn sẽ học…"
                  disabled={contentSaving}
                />
              </div>

              <div>
                <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                  Ghi chú — danh sách (mỗi dòng 1 ý)
                </label>
                <textarea
                  value={contentDraft.notesBullets}
                  onChange={(e) =>
                    setContentDraft((prev) => (prev ? { ...prev, notesBullets: e.target.value } : prev))
                  }
                  rows={5}
                  className="w-full rounded-sm border border-gray-300 bg-white px-3 py-2.5 text-sm focus:border-[#c0392b] focus:outline-none"
                  placeholder={"Ý 1\nÝ 2\nÝ 3"}
                  disabled={contentSaving}
                />
                <p className="mt-1 text-xs text-gray-500">
                  Dòng trống sẽ được bỏ qua khi lưu.
                </p>
              </div>

              {contentError ? (
                <p className="text-sm text-red-600">{contentError}</p>
              ) : null}
            </div>
          ) : null}

          <DialogFooter>
            <DialogClose
              disabled={contentSaving}
              render={
                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-sm border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                />
              }
            >
              Huỷ
            </DialogClose>
            <button
              type="button"
              onClick={handleSaveContent}
              disabled={contentSaving || !contentDraft}
              className="inline-flex items-center justify-center gap-2 rounded-sm bg-[#c0392b] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#96281b] disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500"
            >
              {contentSaving ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" /> Đang lưu
                </>
              ) : (
                "Lưu nội dung"
              )}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
