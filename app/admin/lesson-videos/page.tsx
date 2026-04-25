"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  CirclePlay,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  FileText,
  ImageIcon,
  Loader2,
  Plus,
  Search,
  Trash2,
  Upload,
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
import { notify } from "@/lib/ui/notify";
import { uploadAdminImage } from "@/lib/admin/upload-image";

function isValidUrl(s: string): boolean {
  try { new URL(s); return true; } catch { return false; }
}

function formatMmSs(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, "0")}`;
}

function formatDateOnly(value: string | null | undefined): string {
  if (!value) return "Chưa đăng";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "Chưa đăng";
  return d.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function toYouTubeEmbedUrl(raw: string): string | null {
  const input = raw.trim();
  if (!input) return null;
  const directId = /^[a-zA-Z0-9_-]{11}$/;
  if (directId.test(input)) return `https://www.youtube.com/embed/${input}`;

  try {
    const u = new URL(input);
    const host = u.hostname.toLowerCase();
    if (host === "youtu.be") {
      const id = u.pathname.split("/").filter(Boolean)[0];
      return id && directId.test(id) ? `https://www.youtube.com/embed/${id}` : null;
    }
    if (host.includes("youtube.com")) {
      const v = u.searchParams.get("v");
      if (v && directId.test(v)) return `https://www.youtube.com/embed/${v}`;
      const parts = u.pathname.split("/").filter(Boolean);
      const idx = parts.findIndex((p) => p === "embed" || p === "shorts");
      const id = idx >= 0 ? parts[idx + 1] : null;
      return id && directId.test(id) ? `https://www.youtube.com/embed/${id}` : null;
    }
  } catch {
    return null;
  }
  return null;
}

type CourseRow = {
  id: string;
  title: string;
  slug: string;
  status: string;
  thumbnail_url: string | null;
  hero_image_url: string | null;
  trailer_url: string | null;
  short_description: string | null;
  description: string | null;
  extra_info: string | null;
  price_vnd: number | null;
  access_duration_days: number | null;
  access_note: string | null;
  is_featured: boolean;
  published_at: string | null;
  created_at: string | null;
  updated_at: string | null;
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
  is_preview: boolean;
  is_published: boolean;
  created_at: string | null;
  updated_at: string | null;
};

type ContentDraft = {
  title: string;
  summary: string;
  contentHtml: string;
  isPreview: boolean;
};

type CourseInfoDraft = {
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  extraInfo: string;
  thumbnailUrl: string;
  heroImageUrl: string;
  trailerUrl: string;
  priceVnd: string;
  accessDurationDays: string;
  accessNote: string;
  status: "draft" | "published" | "archived";
  isFeatured: boolean;
};

function contentDraftFromLesson(lesson: LessonRow): ContentDraft {
  return {
    title: lesson.title ?? "",
    summary: lesson.summary ?? "",
    contentHtml: lesson.content_html ?? "",
    isPreview: lesson.is_preview ?? false,
  };
}

function courseInfoDraftFromDetail(detail: CourseDetail): CourseInfoDraft {
  return {
    title: detail.title ?? "",
    slug: detail.slug ?? "",
    shortDescription: detail.short_description ?? "",
    description: detail.description ?? "",
    extraInfo: detail.extra_info ?? "",
    thumbnailUrl: detail.thumbnail_url ?? "",
    heroImageUrl: detail.hero_image_url ?? "",
    trailerUrl: detail.trailer_url ?? "",
    priceVnd: detail.price_vnd != null ? String(detail.price_vnd) : "",
    accessDurationDays:
      detail.access_duration_days != null ? String(detail.access_duration_days) : "",
    accessNote: detail.access_note ?? "",
    status: (detail.status as "draft" | "published" | "archived") ?? "draft",
    isFeatured: Boolean(detail.is_featured),
  };
}

function isCourseInfoDraftDirty(draft: CourseInfoDraft, detail: CourseDetail): boolean {
  const original = courseInfoDraftFromDetail(detail);
  return (
    draft.title !== original.title ||
    draft.slug !== original.slug ||
    draft.shortDescription !== original.shortDescription ||
    draft.description !== original.description ||
    draft.extraInfo !== original.extraInfo ||
    draft.thumbnailUrl !== original.thumbnailUrl ||
    draft.heroImageUrl !== original.heroImageUrl ||
    draft.trailerUrl !== original.trailerUrl ||
    draft.priceVnd !== original.priceVnd ||
    draft.accessDurationDays !== original.accessDurationDays ||
    draft.accessNote !== original.accessNote ||
    draft.status !== original.status ||
    draft.isFeatured !== original.isFeatured
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
  hero_image_url?: string | null;
  trailer_url?: string | null;
  short_description?: string | null;
  description?: string | null;
  extra_info?: string | null;
  price_vnd?: number | null;
  access_duration_days?: number | null;
  access_note?: string | null;
  is_featured?: boolean;
  published_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
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

const COURSE_PAGE_SIZE = 10;

export default function LessonVideosPage() {
  const router = useRouter();
  const params = useParams<{ courseId?: string }>();
  const routeCourseId = typeof params?.courseId === "string" ? params.courseId : "";

  const [courses, setCourses] = useState<CourseRow[]>([]);
  const [courseLoading, setCourseLoading] = useState(true);
  const [courseError, setCourseError] = useState<string | null>(null);

  // List-view search / filter / pagination
  const [courseQuery, setCourseQuery] = useState("");
  const [courseStatusFilter, setCourseStatusFilter] = useState<"all" | "draft" | "published" | "archived">("all");
  const [courseSortBy, setCourseSortBy] = useState<"published_at" | "title" | "price_vnd" | "status" | "access_duration_days">("published_at");
  const [courseSortDir, setCourseSortDir] = useState<"asc" | "desc">("desc");
  const [coursePage, setCoursePage] = useState(1);

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
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [previewTitle, setPreviewTitle] = useState("");
  const [previewKind, setPreviewKind] = useState<"iframe" | "video">("iframe");
  const [previewUrl, setPreviewUrl] = useState("");
  const [contentDialogLessonId, setContentDialogLessonId] = useState<string | null>(null);
  const [contentDraft, setContentDraft] = useState<ContentDraft | null>(null);
  const [contentSaving, setContentSaving] = useState(false);
  const [contentError, setContentError] = useState<string | null>(null);
  const [courseInfoEdit, setCourseInfoEdit] = useState(false);
  const [courseInfoDraft, setCourseInfoDraft] = useState<CourseInfoDraft | null>(null);
  const [courseInfoSaving, setCourseInfoSaving] = useState(false);
  const [courseInfoError, setCourseInfoError] = useState<string | null>(null);
  const [courseInfoSavedAt, setCourseInfoSavedAt] = useState<number | null>(null);
  const [courseInfoErrors, setCourseInfoErrors] = useState<Record<string, string>>({});
  const [thumbnailUploading, setThumbnailUploading] = useState(false);

  // Create-course dialog
  const [createCourseOpen, setCreateCourseOpen] = useState(false);
  const [ccTitle, setCcTitle] = useState("");
  const [ccSlug, setCcSlug] = useState("");
  const [ccShortDescription, setCcShortDescription] = useState("");
  const [ccDescription, setCcDescription] = useState("");
  const [ccExtraInfo, setCcExtraInfo] = useState("");
  const [ccThumbnailUrl, setCcThumbnailUrl] = useState("");
  const [ccHeroImageUrl, setCcHeroImageUrl] = useState("");
  const [ccTrailerUrl, setCcTrailerUrl] = useState("");
  const [ccPriceVnd, setCcPriceVnd] = useState("0");
  const [ccAccessDurationDays, setCcAccessDurationDays] = useState("");
  const [ccAccessNote, setCcAccessNote] = useState("");
  const [ccStatus, setCcStatus] = useState<"draft" | "published" | "archived">("draft");
  const [ccIsFeatured, setCcIsFeatured] = useState(false);
  const [ccSaving, setCcSaving] = useState(false);
  const [ccError, setCcError] = useState<string | null>(null);

  // Add-lesson dialog
  const [addLessonOpen, setAddLessonOpen] = useState(false);
  const [addLessonTitle, setAddLessonTitle] = useState("");
  const [addLessonSectionId, setAddLessonSectionId] = useState<string>("");
  const [addLessonProvider, setAddLessonProvider] = useState<string>("");
  const [addLessonUrl, setAddLessonUrl] = useState<string>("");
  const [addLessonDuration, setAddLessonDuration] = useState<string>("");
  const [addLessonSummary, setAddLessonSummary] = useState<string>("");
  const [addLessonContentHtml, setAddLessonContentHtml] = useState<string>("");
  const [addLessonIsPreview, setAddLessonIsPreview] = useState(false);
  const [addLessonSaving, setAddLessonSaving] = useState(false);
  const [addLessonError, setAddLessonError] = useState<string | null>(null);

  // Add-section dialog
  const [addSectionOpen, setAddSectionOpen] = useState(false);
  const [addSectionTitle, setAddSectionTitle] = useState("");
  const [addSectionSaving, setAddSectionSaving] = useState(false);
  const [addSectionError, setAddSectionError] = useState<string | null>(null);
  const [editSectionOpen, setEditSectionOpen] = useState(false);
  const [editSectionId, setEditSectionId] = useState<string | null>(null);
  const [editSectionTitle, setEditSectionTitle] = useState("");
  const [editSectionSaving, setEditSectionSaving] = useState(false);
  const [editSectionError, setEditSectionError] = useState<string | null>(null);

  // Confirm dialog
  type ConfirmDialogState = { open: false } | { open: true; title: string; description: string; onConfirm: () => void };
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState>({ open: false });
  const showConfirm = (title: string, description: string, onConfirm: () => void) =>
    setConfirmDialog({ open: true, title, description, onConfirm });
  const closeConfirm = () => setConfirmDialog({ open: false });

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
          hero_image_url: (c.hero_image_url as string) ?? null,
          trailer_url: (c.trailer_url as string) ?? null,
          short_description: (c.short_description as string) ?? null,
          description: (c.description as string) ?? null,
          extra_info: (c.extra_info as string) ?? null,
          price_vnd: (c.price_vnd as number) ?? null,
          access_duration_days: (c.access_duration_days as number) ?? null,
          access_note: (c.access_note as string) ?? null,
          is_featured: Boolean(c.is_featured),
          published_at: (c.published_at as string) ?? null,
          created_at: (c.created_at as string) ?? null,
          updated_at: (c.updated_at as string) ?? null,
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

  useEffect(() => {
    const id = routeCourseId?.trim();
    if (!id) {
      setView("list");
      return;
    }
    setView("detail");
    setSelectedCourseId(id);
    setActiveTab("info");
    void loadDetail(id);
  }, [routeCourseId, loadDetail]);

  const openCourse = useCallback((courseId: string) => {
    setSelectedCourseId(courseId);
    setActiveTab("info");
    setView("detail");
    router.push(`/admin/course/${encodeURIComponent(courseId)}`);
  }, [router]);

  const goBack = useCallback(() => {
    setView("list");
    setDetail(null);
    setDetailError(null);
    setCourseInfoDraft(null);
    setCourseInfoEdit(false);
    setCourseInfoError(null);
    setQuery("");
    setOnlyMissing(false);
    router.push("/admin/course");
  }, [router]);

  const lessonsBySection = useMemo<LessonGroup[]>(() => {
    if (!detail) return [];
    const groups: LessonGroup[] = [];
    for (const section of [...detail.sections].sort((a, b) => a.sort_order - b.sort_order)) {
      const ls = [...(section.lessons ?? [])].sort((a, b) => a.sort_order - b.sort_order);
      groups.push({
        id: section.id,
        title: section.title ?? "(Không tên)",
        lessons: ls,
      });
    }
    const rootless = [...(detail.ungroupedLessons ?? [])].sort((a, b) => a.sort_order - b.sort_order);
    if (rootless.length) {
      groups.push({ id: "__ungrouped__", title: "Chưa xếp vào phần", lessons: rootless });
    }
    return groups;
  }, [detail]);

  // ── Course list filtering / pagination ──
  const filteredCourses = useMemo(() => {
    const q = courseQuery.trim().toLowerCase();
    return courses.filter((c) => {
      if (courseStatusFilter !== "all" && c.status !== courseStatusFilter) return false;
      if (!q) return true;
      return (
        c.title.toLowerCase().includes(q) ||
        (c.short_description ?? "").toLowerCase().includes(q)
      );
    });
  }, [courses, courseQuery, courseStatusFilter]);

  const sortedCourses = useMemo(() => {
    const toTs = (value: string | null) => {
      if (!value) return null;
      const ts = new Date(value).getTime();
      return Number.isNaN(ts) ? null : ts;
    };

    const list = [...filteredCourses];
    list.sort((a, b) => {
      let result = 0;
      if (courseSortBy === "title") {
        result = a.title.localeCompare(b.title, "vi");
      } else if (courseSortBy === "price_vnd") {
        result = Number(a.price_vnd ?? 0) - Number(b.price_vnd ?? 0);
      } else if (courseSortBy === "status") {
        result = a.status.localeCompare(b.status, "vi");
      } else if (courseSortBy === "access_duration_days") {
        result = Number(a.access_duration_days ?? 0) - Number(b.access_duration_days ?? 0);
      } else {
        const aTs = toTs(a.published_at);
        const bTs = toTs(b.published_at);
        if (aTs == null && bTs == null) {
          result = a.title.localeCompare(b.title, "vi");
        } else if (aTs == null) {
          result = 1;
        } else if (bTs == null) {
          result = -1;
        } else {
          result = aTs - bTs;
        }
      }
      return courseSortDir === "asc" ? result : -result;
    });
    return list;
  }, [filteredCourses, courseSortBy, courseSortDir]);

  const handleCourseSort = (next: "published_at" | "title" | "price_vnd" | "status" | "access_duration_days") => {
    if (courseSortBy === next) {
      setCourseSortDir((dir) => (dir === "asc" ? "desc" : "asc"));
      setCoursePage(1);
      return;
    }
    setCourseSortBy(next);
    setCourseSortDir("desc");
    setCoursePage(1);
  };

  const courseTotalPages = Math.max(1, Math.ceil(sortedCourses.length / COURSE_PAGE_SIZE));

  const pagedCourses = useMemo(() => {
    const start = (coursePage - 1) * COURSE_PAGE_SIZE;
    return sortedCourses.slice(start, start + COURSE_PAGE_SIZE);
  }, [sortedCourses, coursePage]);

  // Reset to page 1 whenever filter/query changes
  const handleCourseQueryChange = (val: string) => { setCourseQuery(val); setCoursePage(1); };
  const handleCourseStatusFilterChange = (val: "all" | "draft" | "published" | "archived") => { setCourseStatusFilter(val); setCoursePage(1); };

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
      .filter((g) => g.lessons.length > 0 || (g.id !== "__ungrouped__" && (lessonsBySection.find((orig) => orig.id === g.id)?.lessons.length ?? 0) === 0));
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

  const handleDeleteLesson = (lesson: LessonRow) => {
    if (rowBusy[lesson.id]) return;
    showConfirm(
      `Xoá bài "${lesson.title}"?`,
      "Hành động này không thể hoàn tác và sẽ xoá luôn tiến độ học viên liên quan.",
      () => { void doDeleteLesson(lesson); },
    );
  };

  const doDeleteLesson = async (lesson: LessonRow) => {
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
      notify.success("Đã xoá bài học.", lesson.title);
    } catch (error) {
      setRowError((prev) => ({
        ...prev,
        [lesson.id]: error instanceof Error ? error.message : "Không xoá được bài học.",
      }));
    } finally {
      setRowBusy((prev) => ({ ...prev, [lesson.id]: null }));
    }
  };

  const handlePreviewPlayback = async (lesson: LessonRow) => {
    const draft = drafts[lesson.id] ?? toDraft(lesson);
    const provider = draft.videoProvider || lesson.video_provider || "";
    const url = draft.videoUrl.trim() || lesson.video_url || "";

    if (!provider || !url) {
      setPreviewTitle(lesson.title);
      setPreviewError("Thiếu video provider hoặc URL để preview.");
      setPreviewOpen(true);
      return;
    }

    setPreviewTitle(lesson.title);
    setPreviewOpen(true);
    setPreviewLoading(true);
    setPreviewError(null);
    setPreviewUrl("");

    try {
      if (provider === "youtube") {
        const embedUrl = toYouTubeEmbedUrl(url);
        if (!embedUrl) throw new Error("YouTube URL/ID không hợp lệ để preview.");
        setPreviewKind("iframe");
        setPreviewUrl(embedUrl);
        return;
      }

      if (provider === "mp4") {
        setPreviewKind("video");
        setPreviewUrl(url);
        return;
      }

      const res = await fetch("/api/admin/lessons/preview", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          videoProvider: provider,
          videoUrl: url,
        }),
      });
      const json = (await res.json()) as {
        data?: { kind: "iframe" | "video"; url: string };
        error?: { message?: string };
      };
      if (!res.ok) throw new Error(json.error?.message ?? "Không tạo được playback preview.");
      if (!json.data?.url) throw new Error("Preview URL trống.");

      setPreviewKind(json.data.kind);
      setPreviewUrl(json.data.url);
    } catch (error) {
      setPreviewError(error instanceof Error ? error.message : "Không tạo được playback preview.");
    } finally {
      setPreviewLoading(false);
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

    setContentSaving(true);
    setContentError(null);

    try {
      const body: Record<string, unknown> = {
        title,
        summary: contentDraft.summary,
        contentHtml: contentDraft.contentHtml,
        isPreview: contentDraft.isPreview,
      };

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
      notify.success("Lưu nội dung thành công.");
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
      notify.success(`Đã lưu ${toSave.length} thay đổi.`);
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
    setCourseInfoErrors({});
    setCourseInfoEdit(false);
  };

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setThumbnailUploading(true);
    try {
      const url = await uploadAdminImage(file);
      setCourseInfoDraft((prev) => prev ? { ...prev, thumbnailUrl: url } : prev);
      setCourseInfoErrors((prev) => { const next = { ...prev }; delete next.thumbnailUrl; return next; });
    } catch (error) {
      notify.error("Upload ảnh thất bại.", error instanceof Error ? error.message : undefined);
    } finally {
      setThumbnailUploading(false);
      e.target.value = "";
    }
  };

  const handleSaveCourseInfo = async () => {
    if (!detail || !courseInfoDraft) return;

    const errs: Record<string, string> = {};

    const title = courseInfoDraft.title.trim();
    if (!title) errs.title = "Tiêu đề không được để trống.";

    const shortDescription = courseInfoDraft.shortDescription.trim();
    if (!shortDescription) errs.shortDescription = "Mô tả ngắn không được để trống.";

    const description = courseInfoDraft.description.trim();
    if (!description) errs.description = "Mô tả đầy đủ không được để trống.";

    const thumbnailUrl = courseInfoDraft.thumbnailUrl.trim();
    if (!thumbnailUrl) errs.thumbnailUrl = "Ảnh bìa không được để trống.";
    else if (!isValidUrl(thumbnailUrl)) errs.thumbnailUrl = "Ảnh bìa phải là URL hợp lệ.";

    const heroImageUrl = courseInfoDraft.heroImageUrl.trim();
    if (heroImageUrl && !isValidUrl(heroImageUrl)) errs.heroImageUrl = "Ảnh hero phải là URL hợp lệ.";

    const trailerUrl = courseInfoDraft.trailerUrl.trim();
    if (!trailerUrl) errs.trailerUrl = "Trailer URL không được để trống.";
    else if (!isValidUrl(trailerUrl)) errs.trailerUrl = "Trailer URL phải là URL hợp lệ.";

    let priceVnd: number | null = null;
    const priceStr = courseInfoDraft.priceVnd.trim();
    if (priceStr === "") {
      errs.priceVnd = "Giá không được để trống.";
    } else {
      const n = Number(priceStr);
      if (!Number.isFinite(n) || n < 0 || !Number.isInteger(n)) {
        errs.priceVnd = "Giá phải là số nguyên không âm.";
      } else {
        priceVnd = n;
      }
    }

    let accessDurationDays: number | null = null;
    const durationStr = courseInfoDraft.accessDurationDays.trim();
    if (durationStr === "") {
      errs.accessDurationDays = "Thời hạn truy cập không được để trống.";
    } else {
      const n = Number(durationStr);
      if (!Number.isFinite(n) || n <= 0 || !Number.isInteger(n)) {
        errs.accessDurationDays = "Thời hạn truy cập phải là số nguyên lớn hơn 0.";
      } else {
        accessDurationDays = n;
      }
    }

    if (Object.keys(errs).length > 0) {
      setCourseInfoErrors(errs);
      return;
    }
    setCourseInfoErrors({});

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
          extraInfo: courseInfoDraft.extraInfo.trim() || null,
          thumbnailUrl: courseInfoDraft.thumbnailUrl.trim() || null,
          heroImageUrl: courseInfoDraft.heroImageUrl.trim() || courseInfoDraft.thumbnailUrl.trim() || null,
          trailerUrl: courseInfoDraft.trailerUrl.trim() || null,
          priceVnd,
          accessDurationDays,
          accessNote: courseInfoDraft.accessNote.trim() || null,
          status: courseInfoDraft.status,
          isFeatured: courseInfoDraft.isFeatured,
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
          extra_info: (patch.extra_info as string) ?? prev.extra_info ?? null,
          thumbnail_url: (patch.thumbnail_url as string) ?? prev.thumbnail_url ?? null,
          hero_image_url: (patch.hero_image_url as string) ?? prev.hero_image_url ?? null,
          trailer_url: (patch.trailer_url as string) ?? prev.trailer_url ?? null,
          price_vnd: (patch.price_vnd as number) ?? prev.price_vnd ?? null,
          access_duration_days:
            (patch.access_duration_days as number) ?? prev.access_duration_days ?? null,
          access_note: (patch.access_note as string) ?? prev.access_note ?? null,
          is_featured: (patch.is_featured as boolean) ?? prev.is_featured ?? false,
          created_at: (patch.created_at as string) ?? prev.created_at ?? null,
          updated_at: (patch.updated_at as string) ?? prev.updated_at ?? null,
        };
      });

      setCourses((prev) =>
        prev.map((course) =>
          course.id === detail.id
            ? {
                ...course,
                title: String((patch.title as string) ?? course.title),
                slug: String((patch.slug as string) ?? course.slug),
                status: String((patch.status as string) ?? course.status),
                short_description:
                  (patch.short_description as string) ?? course.short_description ?? null,
                description: (patch.description as string) ?? course.description ?? null,
                extra_info: (patch.extra_info as string) ?? course.extra_info ?? null,
                thumbnail_url: (patch.thumbnail_url as string) ?? course.thumbnail_url ?? null,
                hero_image_url: (patch.hero_image_url as string) ?? course.hero_image_url ?? null,
                trailer_url: (patch.trailer_url as string) ?? course.trailer_url ?? null,
                price_vnd: (patch.price_vnd as number) ?? course.price_vnd ?? null,
                access_duration_days:
                  (patch.access_duration_days as number) ?? course.access_duration_days ?? null,
                access_note: (patch.access_note as string) ?? course.access_note ?? null,
                is_featured: (patch.is_featured as boolean) ?? course.is_featured ?? false,
                published_at: (patch.published_at as string) ?? course.published_at ?? null,
                created_at: (patch.created_at as string) ?? course.created_at ?? null,
                updated_at: (patch.updated_at as string) ?? course.updated_at ?? null,
              }
            : course
        )
      );

      const nextDetail = {
        ...detail,
        title: String((patch.title as string) ?? detail.title),
        slug: String((patch.slug as string) ?? detail.slug),
        status: String((patch.status as string) ?? detail.status),
        short_description: (patch.short_description as string) ?? detail.short_description ?? null,
        description: (patch.description as string) ?? detail.description ?? null,
        extra_info: (patch.extra_info as string) ?? detail.extra_info ?? null,
        thumbnail_url: (patch.thumbnail_url as string) ?? detail.thumbnail_url ?? null,
        hero_image_url: (patch.hero_image_url as string) ?? detail.hero_image_url ?? null,
        trailer_url: (patch.trailer_url as string) ?? detail.trailer_url ?? null,
        price_vnd: (patch.price_vnd as number) ?? detail.price_vnd ?? null,
        access_duration_days:
          (patch.access_duration_days as number) ?? detail.access_duration_days ?? null,
        access_note: (patch.access_note as string) ?? detail.access_note ?? null,
        is_featured: (patch.is_featured as boolean) ?? detail.is_featured ?? false,
        published_at: (patch.published_at as string) ?? detail.published_at ?? null,
        created_at: (patch.created_at as string) ?? detail.created_at ?? null,
        updated_at: (patch.updated_at as string) ?? detail.updated_at ?? null,
      };
      setCourseInfoDraft(courseInfoDraftFromDetail(nextDetail));
      setCourseInfoSavedAt(Date.now());
      notify.success("Lưu thông tin khoá học thành công.");
      setCourseInfoEdit(false);
    } catch (error) {
      setCourseInfoError(error instanceof Error ? error.message : "Không lưu được thông tin khoá học.");
    } finally {
      setCourseInfoSaving(false);
    }
  };

  const openCreateCourseDialog = () => {
    setCcTitle("");
    setCcSlug("");
    setCcShortDescription("");
    setCcDescription("");
    setCcExtraInfo("");
    setCcThumbnailUrl("");
    setCcHeroImageUrl("");
    setCcTrailerUrl("");
    setCcPriceVnd("0");
    setCcAccessDurationDays("");
    setCcAccessNote("");
    setCcStatus("draft");
    setCcIsFeatured(false);
    setCcError(null);
    setCreateCourseOpen(true);
  };

  const handleCreateCourse = async () => {
    const title = ccTitle.trim();
    if (!title) {
      setCcError("Tên khoá học không được để trống.");
      return;
    }

    let priceVnd = 0;
    if (ccPriceVnd.trim() !== "") {
      const n = Number(ccPriceVnd);
      if (!Number.isFinite(n) || n < 0) {
        setCcError("Giá không hợp lệ.");
        return;
      }
      priceVnd = Math.floor(n);
    }

    let accessDurationDays: number | null = null;
    if (ccAccessDurationDays.trim() !== "") {
      const n = Number(ccAccessDurationDays);
      if (!Number.isFinite(n) || n <= 0) {
        setCcError("Thời hạn truy cập phải lớn hơn 0.");
        return;
      }
      accessDurationDays = Math.floor(n);
    }

    setCcSaving(true);
    setCcError(null);
    try {
      const res = await fetch("/api/admin/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          title,
          slug: ccSlug.trim() || null,
          shortDescription: ccShortDescription.trim() || null,
          description: ccDescription.trim() || null,
          extraInfo: ccExtraInfo.trim() || null,
          thumbnailUrl: ccThumbnailUrl.trim() || null,
          heroImageUrl: ccHeroImageUrl.trim() || null,
          trailerUrl: ccTrailerUrl.trim() || null,
          priceVnd,
          accessDurationDays,
          accessNote: ccAccessNote.trim() || null,
          status: ccStatus,
          isFeatured: ccIsFeatured,
        }),
      });
      const json = (await res.json()) as { data?: CourseRow; error?: { message?: string } };
      if (!res.ok) throw new Error(json.error?.message ?? "Không tạo được khoá học.");
      const newCourse = json.data!;
      setCourses((prev) => [
        {
          id: String(newCourse.id),
          title: String(newCourse.title),
          slug: String(newCourse.slug),
          status: String(newCourse.status),
          thumbnail_url: (newCourse.thumbnail_url as string) ?? null,
          hero_image_url: (newCourse.hero_image_url as string) ?? null,
          trailer_url: (newCourse.trailer_url as string) ?? null,
          short_description: (newCourse.short_description as string) ?? null,
          description: (newCourse.description as string) ?? null,
          extra_info: (newCourse.extra_info as string) ?? null,
          price_vnd: (newCourse.price_vnd as number) ?? null,
          access_duration_days: (newCourse.access_duration_days as number) ?? null,
          access_note: (newCourse.access_note as string) ?? null,
          is_featured: Boolean(newCourse.is_featured),
          published_at: (newCourse.published_at as string) ?? null,
          created_at: (newCourse.created_at as string) ?? null,
          updated_at: (newCourse.updated_at as string) ?? null,
        },
        ...prev,
      ]);
      notify.success("Tạo khoá học thành công.", newCourse.title);
      setCreateCourseOpen(false);
    } catch (error) {
      setCcError(error instanceof Error ? error.message : "Không tạo được khoá học.");
    } finally {
      setCcSaving(false);
    }
  };

  const openAddLessonDialog = () => {
    setAddLessonTitle("");
    setAddLessonSectionId(detail?.sections?.[0]?.id ?? "");
    setAddLessonProvider("");
    setAddLessonUrl("");
    setAddLessonDuration("");
    setAddLessonSummary("");
    setAddLessonContentHtml("");
    setAddLessonIsPreview(false);
    setAddLessonError(null);
    setAddLessonOpen(true);
  };

  const openAddSectionDialog = () => {
    setAddSectionTitle("");
    setAddSectionError(null);
    setAddSectionOpen(true);
  };

  const openEditSectionDialog = (section: SectionRow) => {
    setEditSectionId(section.id);
    setEditSectionTitle(section.title ?? "");
    setEditSectionError(null);
    setEditSectionOpen(true);
  };

  const handleAddSection = async () => {
    if (!detail) return;
    const title = addSectionTitle.trim();
    if (!title) {
      setAddSectionError("Tên phần học không được để trống.");
      return;
    }

    setAddSectionSaving(true);
    setAddSectionError(null);
    try {
      const res = await fetch("/api/admin/course-sections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          courseId: detail.id,
          title,
        }),
      });

      const json = (await res.json()) as {
        data?: { id?: string; course_id?: string; title?: string | null; sort_order?: number | null };
        error?: { message?: string };
      };
      if (!res.ok) throw new Error(json.error?.message ?? "Không tạo được phần học.");

      const section = json.data;
      if (!section?.id) throw new Error("Dữ liệu phần học trả về không hợp lệ.");

      setDetail((prev) => {
        if (!prev) return prev;
        const nextSection: SectionRow = {
          id: String(section.id),
          course_id: String(section.course_id ?? prev.id),
          title: (section.title as string) ?? title,
          sort_order: Number(section.sort_order ?? 0),
          lessons: [],
        };
        const nextSections = [...prev.sections, nextSection].sort((a, b) => a.sort_order - b.sort_order);
        return {
          ...prev,
          sections: nextSections,
        };
      });
      setOpenSections((prev) => ({ ...prev, [String(section.id)]: true }));
      setAddLessonSectionId(String(section.id));
      notify.success("Tạo phần học thành công.", String(section.title ?? title));
      setAddSectionOpen(false);
    } catch (error) {
      setAddSectionError(error instanceof Error ? error.message : "Không tạo được phần học.");
    } finally {
      setAddSectionSaving(false);
    }
  };

  const handleEditSection = async () => {
    if (!detail || !editSectionId) return;
    const title = editSectionTitle.trim();
    if (!title) {
      setEditSectionError("Tên phần học không được để trống.");
      return;
    }

    setEditSectionSaving(true);
    setEditSectionError(null);
    try {
      const res = await fetch(`/api/admin/course-sections/${encodeURIComponent(editSectionId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ title }),
      });
      const json = (await res.json()) as {
        data?: { id?: string; title?: string | null };
        error?: { message?: string };
      };
      if (!res.ok) throw new Error(json.error?.message ?? "Không cập nhật được phần học.");
      const section = json.data;

      setDetail((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          sections: prev.sections.map((s) =>
            s.id === editSectionId ? { ...s, title: String(section?.title ?? title) } : s
          ),
        };
      });
      notify.success("Cập nhật phần học thành công.");
      setEditSectionOpen(false);
      setEditSectionId(null);
    } catch (error) {
      setEditSectionError(error instanceof Error ? error.message : "Không cập nhật được phần học.");
    } finally {
      setEditSectionSaving(false);
    }
  };

  const handleDeleteSection = (section: SectionRow) => {
    if (!detail) return;
    showConfirm(
      `Xoá phần học "${section.title ?? "(Không tên)"}"?`,
      "Chỉ xoá được khi phần học không còn bài học nào.",
      () => { void doDeleteSection(section); },
    );
  };

  const doDeleteSection = async (section: SectionRow) => {
    try {
      const res = await fetch(`/api/admin/course-sections/${encodeURIComponent(section.id)}`, {
        method: "DELETE",
        credentials: "same-origin",
      });
      const json = (await res.json().catch(() => ({}))) as { error?: { message?: string } };
      if (!res.ok) {
        throw new Error(
          json.error?.message ??
            "Phần học đang chứa bài học. Vui lòng xoá hết bài học trước khi xoá phần học."
        );
      }

      setDetail((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          sections: prev.sections.filter((s) => s.id !== section.id),
          ungroupedLessons: [...prev.ungroupedLessons, ...(section.lessons ?? [])].sort(
            (a, b) => a.sort_order - b.sort_order
          ),
          lessons: prev.lessons.map((l) => (l.section_id === section.id ? { ...l, section_id: null } : l)),
        };
      });
      notify.success("Đã xoá phần học.", section.title ?? undefined);
      setOpenSections((prev) => {
        const next = { ...prev };
        delete next[section.id];
        return next;
      });
      if (addLessonSectionId === section.id) {
        setAddLessonSectionId("");
      }
    } catch (error) {
      notify.error(
        "Không xoá được phần học.",
        error instanceof Error
          ? error.message
          : "Phần học đang chứa bài học. Vui lòng xoá hết bài học trước khi xoá phần học."
      );
    }
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
        summary: addLessonSummary.trim() || null,
        contentHtml: addLessonContentHtml.trim() || null,
        isPreview: addLessonIsPreview,
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
      notify.success("Tạo bài học thành công.", newLesson.title);
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
          <div className="border-b border-gray-200 bg-white px-4 py-5 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h1 className="font-sans font-bold text-gray-900 text-2xl">Quản lý khoá học</h1>
                <p className="mt-1 text-sm text-gray-500">Chọn khoá học để xem và chỉnh sửa bài giảng, video.</p>
              </div>
              <button
                type="button"
                onClick={openCreateCourseDialog}
                className="flex shrink-0 items-center gap-1.5 rounded-lg bg-[#c0392b] px-4 py-2 text-sm font-semibold text-white hover:bg-[#96281b]"
              >
                <Plus className="size-4" /> Tạo khoá học
              </button>
            </div>
          </div>
          {/* Search / Filter bar */}
          <div className="border-b border-gray-200 bg-white px-4 py-3 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-center gap-2">
              {/* Search */}
              <div className="relative basis-full sm:flex-1 sm:min-w-48">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={courseQuery}
                  onChange={(e) => handleCourseQueryChange(e.target.value)}
                  placeholder="Tìm tên khoá học, mô tả…"
                  className="h-9 w-full rounded-lg border border-gray-200 bg-white pl-9 pr-8 text-sm focus:border-[#c0392b] focus:outline-none"
                />
                {courseQuery && (
                  <button
                    type="button"
                    onClick={() => handleCourseQueryChange("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="size-3.5" />
                  </button>
                )}
              </div>

              {/* Status filter */}
              <div className="w-full sm:w-auto overflow-x-auto rounded-lg border border-gray-200 bg-white text-sm">
                <div className="flex min-w-max items-center overflow-hidden">
                  {(["all", "draft", "published", "archived"] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => handleCourseStatusFilterChange(s)}
                      className={`h-9 px-3.5 font-medium transition-colors ${
                        courseStatusFilter === s
                          ? "bg-[#c0392b] text-white"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {s === "all" ? "Tất cả" : s === "draft" ? "Bản nháp" : s === "published" ? "Đã xuất bản" : "Lưu trữ"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Result count */}
              {!courseLoading && (
                <span className="w-full text-xs text-gray-400 sm:w-auto">
                  {filteredCourses.length === courses.length
                    ? `${courses.length} khoá học`
                    : `${filteredCourses.length} / ${courses.length} khoá học`}
                </span>
              )}
            </div>
          </div>

          <div className="flex-1 bg-gray-50 px-4 py-5 sm:px-6 lg:px-8">
            {courseLoading ? (
              <div className="flex items-center gap-2 py-8 text-sm text-gray-500">
                <Loader2 className="size-4 animate-spin" /> Đang tải khóa học...
              </div>
            ) : courseError ? (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{courseError}</div>
            ) : courses.length === 0 ? (
              <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">Chưa có khóa học nào.</div>
            ) : filteredCourses.length === 0 ? (
              <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
                Không tìm thấy khoá học phù hợp.
                <button
                  type="button"
                  onClick={() => { handleCourseQueryChange(""); handleCourseStatusFilterChange("all"); }}
                  className="ml-2 text-[#c0392b] underline underline-offset-2"
                >
                  Xoá bộ lọc
                </button>
              </div>
            ) : (
              <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
                <div className="overflow-x-auto">
                <table className="min-w-[920px] w-full table-fixed text-sm">
                  <colgroup>
                    <col className="w-[38%]" />
                    <col className="w-[14%]" />
                    <col className="w-[12%]" />
                    <col className="w-[13%]" />
                    <col className="w-[11%]" />
                    <col className="w-[12%]" />
                  </colgroup>
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      <th className="px-5 py-3 text-left text-xs font-medium text-gray-500">
                        <button type="button" onClick={() => handleCourseSort("title")} className="inline-flex w-full items-center justify-start hover:text-gray-700">
                          Khoá học
                          <span className={`ml-1 inline-flex flex-col leading-none ${courseSortBy === "title" ? "text-[#c0392b]" : "text-gray-300"}`}>
                            <ChevronUp size={10} className={courseSortBy === "title" && courseSortDir === "asc" ? "opacity-100" : "opacity-50"} />
                            <ChevronDown size={10} className={`-mt-0.5 ${courseSortBy === "title" && courseSortDir === "desc" ? "opacity-100" : "opacity-50"}`} />
                          </span>
                        </button>
                      </th>
                      <th className="px-5 py-3 text-left text-xs font-medium text-gray-500">
                        <button type="button" onClick={() => handleCourseSort("status")} className="inline-flex w-full items-center justify-start hover:text-gray-700">
                          Trạng thái
                          <span className={`ml-1 inline-flex flex-col leading-none ${courseSortBy === "status" ? "text-[#c0392b]" : "text-gray-300"}`}>
                            <ChevronUp size={10} className={courseSortBy === "status" && courseSortDir === "asc" ? "opacity-100" : "opacity-50"} />
                            <ChevronDown size={10} className={`-mt-0.5 ${courseSortBy === "status" && courseSortDir === "desc" ? "opacity-100" : "opacity-50"}`} />
                          </span>
                        </button>
                      </th>
                      <th className="px-5 py-3 text-left text-xs font-medium text-gray-500">
                        <button type="button" onClick={() => handleCourseSort("access_duration_days")} className="inline-flex w-full items-center justify-start hover:text-gray-700">
                          Truy cập
                          <span className={`ml-1 inline-flex flex-col leading-none ${courseSortBy === "access_duration_days" ? "text-[#c0392b]" : "text-gray-300"}`}>
                            <ChevronUp size={10} className={courseSortBy === "access_duration_days" && courseSortDir === "asc" ? "opacity-100" : "opacity-50"} />
                            <ChevronDown size={10} className={`-mt-0.5 ${courseSortBy === "access_duration_days" && courseSortDir === "desc" ? "opacity-100" : "opacity-50"}`} />
                          </span>
                        </button>
                      </th>
                      <th className="px-5 py-3 text-left text-xs font-medium text-gray-500">
                        <button type="button" onClick={() => handleCourseSort("price_vnd")} className="inline-flex w-full items-center justify-start hover:text-gray-700">
                          Giá
                          <span className={`ml-1 inline-flex flex-col leading-none ${courseSortBy === "price_vnd" ? "text-[#c0392b]" : "text-gray-300"}`}>
                            <ChevronUp size={10} className={courseSortBy === "price_vnd" && courseSortDir === "asc" ? "opacity-100" : "opacity-50"} />
                            <ChevronDown size={10} className={`-mt-0.5 ${courseSortBy === "price_vnd" && courseSortDir === "desc" ? "opacity-100" : "opacity-50"}`} />
                          </span>
                        </button>
                      </th>
                      <th className="px-5 py-3 text-left text-xs font-medium text-gray-500">
                        <button type="button" onClick={() => handleCourseSort("published_at")} className="inline-flex w-full items-center justify-start hover:text-gray-700">
                          Ngày đăng
                          <span className={`ml-1 inline-flex flex-col leading-none ${courseSortBy === "published_at" ? "text-[#c0392b]" : "text-gray-300"}`}>
                            <ChevronUp size={10} className={courseSortBy === "published_at" && courseSortDir === "asc" ? "opacity-100" : "opacity-50"} />
                            <ChevronDown size={10} className={`-mt-0.5 ${courseSortBy === "published_at" && courseSortDir === "desc" ? "opacity-100" : "opacity-50"}`} />
                          </span>
                        </button>
                      </th>
                      <th className="px-5 py-3 text-right text-xs font-medium text-gray-500">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pagedCourses.map((c) => (
                      <tr
                        key={c.id}
                        className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60 cursor-pointer"
                        onClick={() => openCourse(c.id)}
                      >
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
                          {c.access_duration_days != null ? `${c.access_duration_days} ngày` : "Không giới hạn"}
                        </td>
                        <td className="px-5 py-3 text-gray-600">
                          {c.price_vnd != null
                            ? c.price_vnd === 0
                              ? "Miễn phí"
                              : `${c.price_vnd.toLocaleString("vi-VN")}₫`
                            : <span className="text-gray-300">—</span>}
                        </td>
                        <td className="px-5 py-3 text-xs text-gray-500 whitespace-nowrap">
                          {formatDateOnly(c.published_at)}
                        </td>
                        <td className="px-5 py-3 text-right">
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); openCourse(c.id); }}
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

                {/* Pagination */}
                {courseTotalPages > 1 && (
                  <div className="flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 px-4 py-3 sm:px-5">
                    <span className="text-xs text-gray-500">
                      Trang {coursePage} / {courseTotalPages} &nbsp;·&nbsp; {sortedCourses.length} khoá học
                    </span>
                    <div className="flex flex-wrap items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setCoursePage(1)}
                        disabled={coursePage === 1}
                        className="flex h-7 w-7 items-center justify-center rounded border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30"
                        title="Trang đầu"
                      >
                        <ChevronDown className="size-3.5 rotate-90" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setCoursePage((p) => Math.max(1, p - 1))}
                        disabled={coursePage === 1}
                        className="flex h-7 items-center gap-0.5 rounded border border-gray-200 px-2 text-xs text-gray-600 hover:bg-gray-50 disabled:opacity-30"
                      >
                        <ChevronDown className="size-3 rotate-90" /> Trước
                      </button>
                      {/* Page numbers */}
                      {Array.from({ length: courseTotalPages }, (_, i) => i + 1)
                        .filter((p) => p === 1 || p === courseTotalPages || Math.abs(p - coursePage) <= 1)
                        .reduce<(number | "…")[]>((acc, p, idx, arr) => {
                          if (idx > 0 && (arr[idx - 1] as number) < p - 1) acc.push("…");
                          acc.push(p);
                          return acc;
                        }, [])
                        .map((p, i) =>
                          p === "…" ? (
                            <span key={`ellipsis-${i}`} className="px-1 text-xs text-gray-400">…</span>
                          ) : (
                            <button
                              key={p}
                              type="button"
                              onClick={() => setCoursePage(p as number)}
                              className={`flex h-7 w-7 items-center justify-center rounded border text-xs font-medium transition-colors ${
                                coursePage === p
                                  ? "border-[#c0392b] bg-[#c0392b] text-white"
                                  : "border-gray-200 text-gray-600 hover:bg-gray-50"
                              }`}
                            >
                              {p}
                            </button>
                          )
                        )}
                      <button
                        type="button"
                        onClick={() => setCoursePage((p) => Math.min(courseTotalPages, p + 1))}
                        disabled={coursePage === courseTotalPages}
                        className="flex h-7 items-center gap-0.5 rounded border border-gray-200 px-2 text-xs text-gray-600 hover:bg-gray-50 disabled:opacity-30"
                      >
                        Tiếp <ChevronDown className="size-3 -rotate-90" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setCoursePage(courseTotalPages)}
                        disabled={coursePage === courseTotalPages}
                        className="flex h-7 w-7 items-center justify-center rounded border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30"
                        title="Trang cuối"
                      >
                        <ChevronDown className="size-3.5 -rotate-90" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}

      {/* ── DETAIL VIEW ── */}
      {view === "detail" && (
        <>
          {/* Header */}
          <div className="border-b border-gray-200 bg-white px-4 py-4 sm:px-6 lg:px-8">
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
                    detail.status === "published"
                      ? "bg-emerald-50 text-emerald-700"
                      : detail.status === "archived"
                        ? "bg-orange-50 text-orange-700"
                        : "bg-gray-100 text-gray-500"
                  }`}>
                    {detail.status === "published" ? "Đã xuất bản" : detail.status === "archived" ? "Lưu trữ" : "Bản nháp"}
                  </span>
                  <div className="mt-1 text-xs text-gray-400">
                    Đăng: {formatDateOnly(detail.published_at)}
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 bg-white px-4 sm:px-6 lg:px-8">
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

          <div className="flex-1 bg-gray-50 px-4 py-5 sm:px-6 lg:px-8">
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
                                <label className="mb-1 block text-xs font-medium text-gray-500">Tiêu đề <span className="text-red-500">*</span></label>
                                <input
                                  type="text"
                                  value={courseInfoDraft.title}
                                  onChange={(e) => {
                                    setCourseInfoDraft((prev) => (prev ? { ...prev, title: e.target.value } : prev));
                                    if (courseInfoErrors.title) setCourseInfoErrors((p) => { const n = { ...p }; delete n.title; return n; });
                                  }}
                                  className={`w-full rounded-md border ${courseInfoErrors.title ? "border-red-400" : "border-gray-300"} bg-white px-3 py-2.5 text-sm focus:border-[#c0392b] focus:outline-none`}
                                  disabled={courseInfoSaving}
                                />
                                {courseInfoErrors.title && <p className="mt-1 text-xs text-red-600">{courseInfoErrors.title}</p>}
                              </div>
                              <div>
                                <label className="mb-1 block text-xs font-medium text-gray-500">Giá (VND) <span className="text-red-500">*</span></label>
                                <input
                                  type="number"
                                  min={0}
                                  step={1000}
                                  value={courseInfoDraft.priceVnd}
                                  onChange={(e) => {
                                    setCourseInfoDraft((prev) => (prev ? { ...prev, priceVnd: e.target.value } : prev));
                                    if (courseInfoErrors.priceVnd) setCourseInfoErrors((p) => { const n = { ...p }; delete n.priceVnd; return n; });
                                  }}
                                  className={`w-full rounded-md border ${courseInfoErrors.priceVnd ? "border-red-400" : "border-gray-300"} bg-white px-3 py-2.5 text-sm focus:border-[#c0392b] focus:outline-none`}
                                  disabled={courseInfoSaving}
                                />
                                {courseInfoErrors.priceVnd && <p className="mt-1 text-xs text-red-600">{courseInfoErrors.priceVnd}</p>}
                              </div>
                              <div>
                                <label className="mb-1 block text-xs font-medium text-gray-500">Thời hạn truy cập (ngày) <span className="text-red-500">*</span></label>
                                <input
                                  type="number"
                                  min={1}
                                  step={1}
                                  value={courseInfoDraft.accessDurationDays}
                                  onChange={(e) => {
                                    setCourseInfoDraft((prev) => prev ? { ...prev, accessDurationDays: e.target.value } : prev);
                                    if (courseInfoErrors.accessDurationDays) setCourseInfoErrors((p) => { const n = { ...p }; delete n.accessDurationDays; return n; });
                                  }}
                                  className={`w-full rounded-md border ${courseInfoErrors.accessDurationDays ? "border-red-400" : "border-gray-300"} bg-white px-3 py-2.5 text-sm focus:border-[#c0392b] focus:outline-none`}
                                  disabled={courseInfoSaving}
                                />
                                {courseInfoErrors.accessDurationDays && <p className="mt-1 text-xs text-red-600">{courseInfoErrors.accessDurationDays}</p>}
                              </div>
                            </div>

                            <div>
                              <label className="mb-1 block text-xs font-medium text-gray-500">Mô tả ngắn <span className="text-red-500">*</span></label>
                              <textarea
                                value={courseInfoDraft.shortDescription}
                                onChange={(e) => {
                                  setCourseInfoDraft((prev) => prev ? { ...prev, shortDescription: e.target.value } : prev);
                                  if (courseInfoErrors.shortDescription) setCourseInfoErrors((p) => { const n = { ...p }; delete n.shortDescription; return n; });
                                }}
                                rows={2}
                                className={`w-full rounded-md border ${courseInfoErrors.shortDescription ? "border-red-400" : "border-gray-300"} bg-white px-3 py-2.5 text-sm focus:border-[#c0392b] focus:outline-none`}
                                disabled={courseInfoSaving}
                              />
                              {courseInfoErrors.shortDescription && <p className="mt-1 text-xs text-red-600">{courseInfoErrors.shortDescription}</p>}
                            </div>

                            <div>
                              <label className="mb-1 block text-xs font-medium text-gray-500">Mô tả đầy đủ <span className="text-red-500">*</span></label>
                              <textarea
                                value={courseInfoDraft.description}
                                onChange={(e) => {
                                  setCourseInfoDraft((prev) => prev ? { ...prev, description: e.target.value } : prev);
                                  if (courseInfoErrors.description) setCourseInfoErrors((p) => { const n = { ...p }; delete n.description; return n; });
                                }}
                                rows={6}
                                className={`w-full rounded-md border ${courseInfoErrors.description ? "border-red-400" : "border-gray-300"} bg-white px-3 py-2.5 text-sm focus:border-[#c0392b] focus:outline-none`}
                                disabled={courseInfoSaving}
                              />
                              {courseInfoErrors.description && <p className="mt-1 text-xs text-red-600">{courseInfoErrors.description}</p>}
                            </div>

                            <div>
                              <label className="mb-1 block text-xs font-medium text-gray-500">Thông tin thêm / Bạn sẽ học được gì?</label>
                              <textarea
                                value={courseInfoDraft.extraInfo}
                                onChange={(e) => setCourseInfoDraft((prev) =>
                                    prev ? { ...prev, extraInfo: e.target.value } : prev
                                  )
                                }
                                rows={4}
                                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-sm focus:border-[#c0392b] focus:outline-none"
                                disabled={courseInfoSaving}
                              />
                            </div>

                            <div>
                              <label className="mb-1 block text-xs font-medium text-gray-500">Ảnh bìa <span className="text-red-500">*</span></label>
                              <div className="flex items-start gap-3">
                                {courseInfoDraft.thumbnailUrl ? (
                                  <img
                                    src={courseInfoDraft.thumbnailUrl}
                                    alt="Ảnh bìa"
                                    className="h-20 w-32 shrink-0 rounded-md border border-gray-200 object-cover"
                                  />
                                ) : (
                                  <div className={`flex h-20 w-32 shrink-0 items-center justify-center rounded-md border-2 border-dashed ${courseInfoErrors.thumbnailUrl ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50"}`}>
                                    <ImageIcon className="size-6 text-gray-300" />
                                  </div>
                                )}
                                <div className="flex-1">
                                  <input
                                    id="thumbnail-upload-edit"
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleThumbnailUpload}
                                    disabled={courseInfoSaving || thumbnailUploading}
                                  />
                                  <label
                                    htmlFor="thumbnail-upload-edit"
                                    className={`inline-flex cursor-pointer items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 ${courseInfoSaving || thumbnailUploading ? "pointer-events-none opacity-50" : ""}`}
                                  >
                                    {thumbnailUploading ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
                                    {thumbnailUploading ? "Đang tải lên…" : courseInfoDraft.thumbnailUrl ? "Đổi ảnh" : "Chọn ảnh"}
                                  </label>
                                  {courseInfoErrors.thumbnailUrl && <p className="mt-1 text-xs text-red-600">{courseInfoErrors.thumbnailUrl}</p>}
                                </div>
                              </div>
                            </div>

                            <div className="grid gap-4 lg:grid-cols-2">
                              <div>
                                <label className="mb-1 block text-xs font-medium text-gray-500">Ảnh hero (URL)</label>
                                <input
                                  type="url"
                                  value={courseInfoDraft.heroImageUrl}
                                  onChange={(e) => {
                                    setCourseInfoDraft((prev) => prev ? { ...prev, heroImageUrl: e.target.value } : prev);
                                    if (courseInfoErrors.heroImageUrl) setCourseInfoErrors((p) => { const n = { ...p }; delete n.heroImageUrl; return n; });
                                  }}
                                  className={`w-full rounded-md border ${courseInfoErrors.heroImageUrl ? "border-red-400" : "border-gray-300"} bg-white px-3 py-2.5 text-sm focus:border-[#c0392b] focus:outline-none`}
                                  disabled={courseInfoSaving}
                                  spellCheck={false}
                                />
                                {courseInfoErrors.heroImageUrl && <p className="mt-1 text-xs text-red-600">{courseInfoErrors.heroImageUrl}</p>}
                              </div>
                              <div>
                                <label className="mb-1 block text-xs font-medium text-gray-500">Trailer URL <span className="text-red-500">*</span></label>
                                <input
                                  type="url"
                                  value={courseInfoDraft.trailerUrl}
                                  onChange={(e) => {
                                    setCourseInfoDraft((prev) => prev ? { ...prev, trailerUrl: e.target.value } : prev);
                                    if (courseInfoErrors.trailerUrl) setCourseInfoErrors((p) => { const n = { ...p }; delete n.trailerUrl; return n; });
                                  }}
                                  className={`w-full rounded-md border ${courseInfoErrors.trailerUrl ? "border-red-400" : "border-gray-300"} bg-white px-3 py-2.5 text-sm focus:border-[#c0392b] focus:outline-none`}
                                  disabled={courseInfoSaving}
                                  spellCheck={false}
                                />
                                {courseInfoErrors.trailerUrl && <p className="mt-1 text-xs text-red-600">{courseInfoErrors.trailerUrl}</p>}
                              </div>
                            </div>

                            <div className="grid gap-4 lg:grid-cols-2">
                              <div>
                                <label className="mb-1 block text-xs font-medium text-gray-500">Ghi chú truy cập</label>
                                <input
                                  type="text"
                                  value={courseInfoDraft.accessNote}
                                  onChange={(e) =>
                                    setCourseInfoDraft((prev) =>
                                      prev ? { ...prev, accessNote: e.target.value } : prev
                                    )
                                  }
                                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-sm focus:border-[#c0392b] focus:outline-none"
                                  disabled={courseInfoSaving}
                                />
                              </div>
                              <div>
                                <label className="mb-1 block text-xs font-medium text-gray-500">Trạng thái</label>
                                <select
                                  value={courseInfoDraft.status}
                                  onChange={(e) =>
                                    setCourseInfoDraft((prev) =>
                                      prev ? { ...prev, status: e.target.value as "draft" | "published" | "archived" } : prev
                                    )
                                  }
                                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-sm focus:border-[#c0392b] focus:outline-none"
                                  disabled={courseInfoSaving}
                                >
                                  <option value="draft">Bản nháp</option>
                                  <option value="published">Đã xuất bản</option>
                                  <option value="archived">Lưu trữ</option>
                                </select>
                              </div>
                            </div>

                            <label className="flex items-center gap-2 text-sm text-gray-700">
                              <input
                                type="checkbox"
                                checked={courseInfoDraft.isFeatured}
                                onChange={(e) =>
                                  setCourseInfoDraft((prev) =>
                                    prev ? { ...prev, isFeatured: e.target.checked } : prev
                                  )
                                }
                                className="size-4 accent-[#c0392b]"
                                disabled={courseInfoSaving}
                              />
                              Đánh dấu khoá học nổi bật
                            </label>

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
                        <div className="text-xs font-medium text-gray-500">Slug</div>
                        <div className="mt-1 text-sm font-medium text-gray-800">{detail.slug ?? "—"}</div>
                      </div>
                      <div className="rounded-lg border border-gray-200 bg-white p-4">
                        <div className="text-xs font-medium text-gray-500">Giá (VND)</div>
                        <div className="mt-1 text-sm font-medium text-gray-800">
                          {detail.price_vnd != null ? `${detail.price_vnd.toLocaleString("vi-VN")}₫` : "—"}
                        </div>
                      </div>
                      <div className="rounded-lg border border-gray-200 bg-white p-4">
                        <div className="text-xs font-medium text-gray-500">Thời hạn truy cập</div>
                        <div className="mt-1 text-sm font-medium text-gray-800">
                          {detail.access_duration_days != null ? `${detail.access_duration_days} ngày` : "Không giới hạn"}
                        </div>
                      </div>
                      <div className="rounded-lg border border-gray-200 bg-white p-4">
                        <div className="text-xs font-medium text-gray-500">Trạng thái</div>
                        <div className="mt-1 text-sm font-medium text-gray-800">
                          {detail.status === "published" ? "Đã xuất bản" : detail.status === "archived" ? "Lưu trữ" : "Bản nháp"}
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
                      <div className="w-full lg:ml-auto lg:w-auto flex flex-wrap items-center gap-2">
                        <div className="relative w-full sm:w-auto">
                          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
                          <input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Tìm bài học…"
                            className="h-9 w-full sm:w-48 rounded-lg border border-gray-200 bg-white pl-9 pr-3 text-sm focus:border-[#c0392b] focus:outline-none"
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
                          onClick={openAddSectionDialog}
                          className="flex h-9 items-center gap-1.5 rounded-lg border border-[#c0392b] bg-white px-3 text-sm font-semibold text-[#c0392b] hover:bg-red-50"
                        >
                          <Plus className="size-4" /> Thêm phần học
                        </button>
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
                        <div className="overflow-x-auto">
                        <div className="min-w-[980px]">
                        <div className="grid grid-cols-[minmax(180px,2fr)_150px_minmax(140px,1fr)_110px_200px] border-b border-gray-100 bg-gray-50 px-5 py-3">
                          <div className="text-xs font-medium text-gray-500">Bài học</div>
                          <div className="text-xs font-medium text-gray-500">Loại video</div>
                          <div className="text-xs font-medium text-gray-500">GUID / URL</div>
                          <div className="text-xs font-medium text-gray-500">Thời lượng</div>
                          <div className="text-right text-xs font-medium text-gray-500">Thao tác</div>
                        </div>
                        {filteredGroups.map((group, idx) => {
                          const isOpen = openSections[group.id] ?? true;
                          const missingInGroup = group.lessons.filter((l) => !l.video_url).length;
                          const sourceSection =
                            group.id === "__ungrouped__"
                              ? null
                              : detail.sections.find((s) => s.id === group.id) ?? null;
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
                                {sourceSection && (
                                  <span className="ml-auto flex items-center gap-1.5">
                                    <span
                                      role="button"
                                      tabIndex={0}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        openEditSectionDialog(sourceSection);
                                      }}
                                      onKeyDown={(e) => {
                                        if (e.key === "Enter" || e.key === " ") {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          openEditSectionDialog(sourceSection);
                                        }
                                      }}
                                      className="rounded-md border border-gray-200 bg-white px-2 py-1 text-[11px] font-medium text-gray-600 hover:bg-gray-50"
                                    >
                                      Sửa phần học
                                    </span>
                                    <span
                                      role="button"
                                      tabIndex={0}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        void handleDeleteSection(sourceSection);
                                      }}
                                      onKeyDown={(e) => {
                                        if (e.key === "Enter" || e.key === " ") {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          void handleDeleteSection(sourceSection);
                                        }
                                      }}
                                      className="rounded-md border border-red-100 bg-white px-2 py-1 text-[11px] font-medium text-red-600 hover:bg-red-50"
                                    >
                                      Xoá phần học
                                    </span>
                                  </span>
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
                                    className={`grid grid-cols-[minmax(180px,2fr)_150px_minmax(140px,1fr)_110px_200px] items-start border-b border-gray-50 px-5 py-3.5 transition-colors hover:bg-gray-50/50 ${dirty ? "bg-amber-50/40" : ""}`}
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
                                        {lesson.is_preview && (
                                          <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-700">Preview</span>
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
                                      <button
                                        type="button"
                                        onClick={() => void handlePreviewPlayback(lesson)}
                                        className="flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-500 hover:bg-gray-50"
                                        title="Playback preview"
                                      >
                                        <CirclePlay className="size-3.5" />
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
                        </div>
                      </div>
                    )}
                  </>
                )}
              </>
            ) : null}
          </div>
        </>
      )}

      <Dialog
        open={previewOpen}
        onOpenChange={(open) => {
          setPreviewOpen(open);
          if (!open) {
            setPreviewError(null);
            setPreviewUrl("");
            setPreviewLoading(false);
          }
        }}
      >
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Playback preview</DialogTitle>
            <DialogDescription>{previewTitle || "Xem thử video trong form chỉnh sửa."}</DialogDescription>
          </DialogHeader>
          {previewLoading ? (
            <div className="flex items-center gap-2 py-10 text-sm text-gray-500">
              <Loader2 className="size-4 animate-spin" /> Đang tải playback...
            </div>
          ) : previewError ? (
            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{previewError}</p>
          ) : previewUrl ? (
            <div className="overflow-hidden rounded-md border border-gray-200 bg-black">
              {previewKind === "iframe" ? (
                <iframe
                  src={previewUrl}
                  className="aspect-video w-full"
                  allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                  allowFullScreen
                  title="Playback preview"
                />
              ) : (
                <video src={previewUrl} controls className="aspect-video w-full" />
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-500">Chưa có URL preview.</p>
          )}
        </DialogContent>
      </Dialog>

      {/* ── CREATE COURSE DIALOG ── */}
      <Dialog open={createCourseOpen} onOpenChange={(open) => { if (!ccSaving) setCreateCourseOpen(open); }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Tạo khoá học mới</DialogTitle>
            <DialogDescription>Nhập thông tin khoá học theo schema mới. Có thể chỉnh sửa thêm sau khi tạo.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            <div>
              <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                Tên khoá học <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={ccTitle}
                onChange={(e) => setCcTitle(e.target.value)}
                placeholder="VD: Phục hồi lưng cơ bản"
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-sm focus:border-[#c0392b] focus:outline-none"
                disabled={ccSaving}
                autoFocus
              />
            </div>

            <div>
              <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                Slug
              </label>
              <input
                type="text"
                value={ccSlug}
                onChange={(e) => setCcSlug(e.target.value)}
                placeholder="tu-dong-theo-ten-khoa-hoc-neu-bo-trong"
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-sm font-mono focus:border-[#c0392b] focus:outline-none"
                disabled={ccSaving}
                spellCheck={false}
              />
              <p className="mt-1 text-xs text-gray-400">Để trống để hệ thống tự tạo từ tên khoá học.</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                  Trạng thái
                </label>
                <select
                  value={ccStatus}
                  onChange={(e) => setCcStatus(e.target.value as "draft" | "published" | "archived")}
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-sm focus:border-[#c0392b] focus:outline-none"
                  disabled={ccSaving}
                >
                  <option value="draft">Bản nháp</option>
                  <option value="published">Đã xuất bản</option>
                  <option value="archived">Lưu trữ</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                  Giá (VND)
                </label>
                <input
                  type="number"
                  min={0}
                  step={1000}
                  value={ccPriceVnd}
                  onChange={(e) => setCcPriceVnd(e.target.value)}
                  placeholder="0"
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-sm focus:border-[#c0392b] focus:outline-none"
                  disabled={ccSaving}
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                Thông tin thêm / Bạn sẽ học được gì?
              </label>
              <textarea
                value={ccExtraInfo}
                onChange={(e) => setCcExtraInfo(e.target.value)}
                placeholder="Nội dung mô tả bổ sung cho khoá học"
                rows={3}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-sm focus:border-[#c0392b] focus:outline-none"
                disabled={ccSaving}
              />
            </div>

            <div>
              <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                Mô tả ngắn
              </label>
              <textarea
                value={ccShortDescription}
                onChange={(e) => setCcShortDescription(e.target.value)}
                placeholder="1-2 câu giới thiệu hiển thị ở trang danh sách"
                rows={2}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-sm focus:border-[#c0392b] focus:outline-none"
                disabled={ccSaving}
              />
            </div>

            <div>
              <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                Mô tả đầy đủ
              </label>
              <textarea
                value={ccDescription}
                onChange={(e) => setCcDescription(e.target.value)}
                placeholder="Mô tả chi tiết về khoá học"
                rows={3}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-sm focus:border-[#c0392b] focus:outline-none"
                disabled={ccSaving}
              />
            </div>

            <div>
              <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                Ảnh bìa (URL)
              </label>
              <input
                type="url"
                value={ccThumbnailUrl}
                onChange={(e) => setCcThumbnailUrl(e.target.value)}
                placeholder="https://..."
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-sm focus:border-[#c0392b] focus:outline-none"
                disabled={ccSaving}
                spellCheck={false}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                  Hero image URL
                </label>
                <input
                  type="url"
                  value={ccHeroImageUrl}
                  onChange={(e) => setCcHeroImageUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-sm focus:border-[#c0392b] focus:outline-none"
                  disabled={ccSaving}
                  spellCheck={false}
                />
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                  Trailer URL
                </label>
                <input
                  type="url"
                  value={ccTrailerUrl}
                  onChange={(e) => setCcTrailerUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-sm focus:border-[#c0392b] focus:outline-none"
                  disabled={ccSaving}
                  spellCheck={false}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                  Thời hạn truy cập (ngày)
                </label>
                <input
                  type="number"
                  min={1}
                  step={1}
                  value={ccAccessDurationDays}
                  onChange={(e) => setCcAccessDurationDays(e.target.value)}
                  placeholder="Để trống nếu không giới hạn"
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-sm focus:border-[#c0392b] focus:outline-none"
                  disabled={ccSaving}
                />
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                  Ghi chú truy cập
                </label>
                <input
                  type="text"
                  value={ccAccessNote}
                  onChange={(e) => setCcAccessNote(e.target.value)}
                  placeholder="VD: Truy cập theo thời hạn gói đã mua"
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-sm focus:border-[#c0392b] focus:outline-none"
                  disabled={ccSaving}
                />
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={ccIsFeatured}
                onChange={(e) => setCcIsFeatured(e.target.checked)}
                className="size-4 accent-[#c0392b]"
                disabled={ccSaving}
              />
              Đánh dấu khoá học nổi bật
            </label>

            {ccError && (
              <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{ccError}</p>
            )}
          </div>

          <DialogFooter className="mt-2">
            <DialogClose
              disabled={ccSaving}
              render={
                <button
                  type="button"
                  className="rounded-md border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                />
              }
            >
              Huỷ
            </DialogClose>
            <button
              type="button"
              onClick={handleCreateCourse}
              disabled={ccSaving || !ccTitle.trim()}
              className="flex items-center gap-2 rounded-md bg-[#c0392b] px-4 py-2 text-sm font-semibold text-white hover:bg-[#96281b] disabled:bg-gray-300 disabled:text-gray-400"
            >
              {ccSaving ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
              Tạo khoá học
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
            <div>
              <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                Tóm tắt
              </label>
              <textarea
                value={addLessonSummary}
                onChange={(e) => setAddLessonSummary(e.target.value)}
                placeholder="Tóm tắt nội dung bài học (tuỳ chọn)"
                rows={2}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-sm focus:border-[#c0392b] focus:outline-none"
                disabled={addLessonSaving}
              />
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                Nội dung chi tiết (HTML)
              </label>
              <textarea
                value={addLessonContentHtml}
                onChange={(e) => setAddLessonContentHtml(e.target.value)}
                rows={4}
                placeholder="Ví dụ: <p>Nội dung chính của bài học...</p>"
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 font-mono text-xs focus:border-[#c0392b] focus:outline-none"
                disabled={addLessonSaving}
                spellCheck={false}
              />
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={addLessonIsPreview}
                onChange={(e) => setAddLessonIsPreview(e.target.checked)}
                className="size-4 accent-[#c0392b]"
                disabled={addLessonSaving}
              />
              Đánh dấu là bài preview
            </label>
            {addLessonError && (
              <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{addLessonError}</p>
            )}
          </div>
          <DialogFooter className="mt-2">
            <DialogClose
              disabled={addLessonSaving}
              render={
                <button
                  type="button"
                  className="rounded-md border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                />
              }
            >
              Huỷ
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

      {/* ── ADD SECTION DIALOG ── */}
      <Dialog open={addSectionOpen} onOpenChange={(open) => { if (!addSectionSaving) setAddSectionOpen(open); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Thêm phần học mới</DialogTitle>
            <DialogDescription>
              Tạo một phần học để nhóm các bài giảng theo module/chủ đề.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3">
            <div>
              <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                Tên phần học <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={addSectionTitle}
                onChange={(e) => setAddSectionTitle(e.target.value)}
                placeholder="VD: Module 1 - Nền tảng"
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-sm focus:border-[#c0392b] focus:outline-none"
                disabled={addSectionSaving}
                autoFocus
              />
            </div>
            {addSectionError && (
              <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{addSectionError}</p>
            )}
          </div>
          <DialogFooter className="mt-2">
            <DialogClose
              disabled={addSectionSaving}
              render={
                <button
                  type="button"
                  className="rounded-md border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                />
              }
            >
              Huỷ
            </DialogClose>
            <button
              type="button"
              onClick={handleAddSection}
              disabled={addSectionSaving || !addSectionTitle.trim()}
              className="flex items-center gap-2 rounded-md bg-[#c0392b] px-4 py-2 text-sm font-semibold text-white hover:bg-[#96281b] disabled:bg-gray-300 disabled:text-gray-400"
            >
              {addSectionSaving ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
              Tạo phần học
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── EDIT SECTION DIALOG ── */}
      <Dialog open={editSectionOpen} onOpenChange={(open) => { if (!editSectionSaving) setEditSectionOpen(open); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Sửa phần học</DialogTitle>
            <DialogDescription>
              Cập nhật tên phần học. Slug sẽ tự đồng bộ theo tên mới.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3">
            <div>
              <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                Tên phần học <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={editSectionTitle}
                onChange={(e) => setEditSectionTitle(e.target.value)}
                placeholder="VD: Module 1 - Nền tảng"
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-sm focus:border-[#c0392b] focus:outline-none"
                disabled={editSectionSaving}
                autoFocus
              />
            </div>
            {editSectionError && (
              <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{editSectionError}</p>
            )}
          </div>
          <DialogFooter className="mt-2">
            <DialogClose
              disabled={editSectionSaving}
              render={
                <button
                  type="button"
                  className="rounded-md border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                />
              }
            >
              Huỷ
            </DialogClose>
            <button
              type="button"
              onClick={handleEditSection}
              disabled={editSectionSaving || !editSectionTitle.trim()}
              className="flex items-center gap-2 rounded-md bg-[#c0392b] px-4 py-2 text-sm font-semibold text-white hover:bg-[#96281b] disabled:bg-gray-300 disabled:text-gray-400"
            >
              {editSectionSaving ? <Loader2 className="size-4 animate-spin" /> : null}
              Lưu phần học
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
              Cập nhật tên, tóm tắt, nội dung chi tiết và trạng thái preview của bài học.
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
                <p className="mt-1 text-xs text-gray-500">Có thể để trống.</p>
              </div>

              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={contentDraft.isPreview}
                  onChange={(e) =>
                    setContentDraft((prev) => (prev ? { ...prev, isPreview: e.target.checked } : prev))
                  }
                  className="size-4 accent-[#c0392b]"
                  disabled={contentSaving}
                />
                Bài preview (cho học viên chưa mua)
              </label>

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

      {/* ── CONFIRM DELETE DIALOG ── */}
      <Dialog open={confirmDialog.open} onOpenChange={(open) => { if (!open) closeConfirm(); }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base">
              {confirmDialog.open ? confirmDialog.title : ""}
            </DialogTitle>
            {confirmDialog.open && confirmDialog.description && (
              <DialogDescription>{confirmDialog.description}</DialogDescription>
            )}
          </DialogHeader>
          <DialogFooter className="mt-1">
            <DialogClose
              render={
                <button
                  type="button"
                  className="rounded-md border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                />
              }
            >
              Huỷ
            </DialogClose>
            <button
              type="button"
              onClick={() => {
                if (confirmDialog.open) confirmDialog.onConfirm();
                closeConfirm();
              }}
              className="flex items-center gap-2 rounded-md bg-[#c0392b] px-4 py-2 text-sm font-semibold text-white hover:bg-[#96281b]"
            >
              <Trash2 className="size-4" /> Xoá
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
