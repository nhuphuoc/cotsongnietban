import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";
import { CheckCircle2, Star, User, Layers, Clock, BookOpen, Infinity, Smartphone, Lock } from "lucide-react";
import { getDemoCourse, getCoursePhases, getLessonsForPhase } from "@/lib/demo-courses";
import { getCatalogMarketingExtras, getDetailMarketingMeta } from "@/lib/marketing-course-dummies";
import { CourseProgramAccordion, type ProgramPhase } from "@/components/marketing/course-program-accordion";
import { getSessionActor } from "@/lib/api/auth";
import {
  enrollmentGrantsCourseAccess,
  getCoursePurchaseStateForUser,
  getPublicCourseByIdentifier,
} from "@/lib/api/repositories";
import { formatVnd } from "@/lib/format-vnd";
import { getLmsCourseHref } from "@/lib/learning-hub";
import { CancelPendingRegistrationButton } from "@/components/marketing/cancel-pending-registration-button";

const FALLBACK_THUMB =
  "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=450&fit=crop";

function looksLikeHtml(s: string): boolean {
  const t = String(s ?? "").trim();
  if (!t) return false;
  // TipTap / typical HTML: opening or closing tags (not confused with "a < b" in short plain text)
  return /<\/[a-z][\w-]*>|<[a-z][\s\S]*?>/i.test(t);
}

function stripHtmlToText(html: string): string {
  return String(html ?? "")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<\/?[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function formatLessonDurationMmSs(seconds: number | null | undefined): string {
  const s = Math.max(0, Math.floor(Number(seconds ?? 0)));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, "0")}`;
}

function formatCourseDurationFromSeconds(sec: number | null | undefined): string {
  if (sec == null || Number.isNaN(sec) || sec <= 0) return "—";
  const h = sec / 3600;
  if (h >= 1) return `~${h.toFixed(1)} giờ`.replace(".0", "");
  return `~${Math.round(sec / 60)} phút`;
}

type MarketingVm = {
  title: string;
  description: string;
  extraInfoHtml: string;
  hero: string;
  thumbnail: string;
  level: string;
  totalDurationLabel: string;
  lessonCount: number;
  programPhases: ProgramPhase[];
  priceLabel: string;
  ratingLabel: string;
  instructorName: string;
  instructorTitle: string;
  outcomes: string[];
  trustLine: string;
  lmsHref: string;
  isDemo: boolean;
  purchasableCourseId: string | null;
};

type PublicLessonLoose = {
  id: string;
  title?: string | null;
  duration_seconds?: number | null;
};

async function loadMarketingVm(courseId: string): Promise<MarketingVm | null> {
  const pub = await getPublicCourseByIdentifier(courseId);
  if (pub) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pubEx = pub as typeof pub & Record<string, unknown>;
    const thumbnail =
      (typeof pub.thumbnail_url === "string" && pub.thumbnail_url.trim()) || FALLBACK_THUMB;
    const hero =
      (typeof pub.hero_image_url === "string" && pub.hero_image_url.trim()) || thumbnail;
    const description =
      (typeof pub.description === "string" && pub.description.trim()) ||
      (typeof pub.short_description === "string" && pub.short_description.trim()) ||
      "";
    const extraInfoHtml =
      typeof (pub as { extra_info?: unknown }).extra_info === "string"
        ? String((pub as { extra_info?: string }).extra_info ?? "")
        : typeof pubEx.extra_info === "string"
          ? String(pubEx.extra_info)
          : "";
    const level = (typeof pubEx.level_label === "string" && (pubEx.level_label as string).trim()) || "—";
    // total_duration_seconds đã bị drop khỏi courses → tính từ lessons array
    const totalDurationFromLessons = (Array.isArray(pub.lessons) ? pub.lessons : []).reduce(
      (sum: number, l: { duration_seconds?: number | null }) => sum + (l.duration_seconds ?? 0),
      0,
    );
    const totalDurationLabel =
      totalDurationFromLessons > 0 ? formatCourseDurationFromSeconds(totalDurationFromLessons) : "—";
    const lessonCount =
      Number(pubEx.lesson_count ?? 0) > 0
        ? Number(pubEx.lesson_count)
        : Array.isArray(pub.lessons)
          ? pub.lessons.length
          : 0;

    const sections = (pub.sections ?? []) as Array<{
      id: string;
      title?: string | null;
      lessons?: Array<{ id: string; title?: string | null; duration_seconds?: number | null }>;
    }>;

    let programPhases: ProgramPhase[] = sections
      .map((sec) => ({
        id: String(sec.id),
        title: String(sec.title ?? "Phần"),
        lessons: (sec.lessons ?? []).map((l) => ({
          id: String(l.id),
          title: String(l.title ?? ""),
          duration: formatLessonDurationMmSs(l.duration_seconds),
        })),
      }))
      .filter((p) => p.lessons.length > 0);

    if (programPhases.length === 0 && Array.isArray(pub.lessons) && pub.lessons.length > 0) {
      programPhases = [
        {
          id: "program",
          title: "Chương trình",
          lessons: (pub.lessons as PublicLessonLoose[]).map((l) => ({
            id: String(l.id),
            title: String(l.title ?? ""),
            duration: formatLessonDurationMmSs(l.duration_seconds),
          })),
        },
      ];
    }

    const slugOrId =
      (typeof pub.slug === "string" && pub.slug.trim()) || String(pub.id);
    const outcomeLines: string[] = description
      .split(/\n+/)
      .map((x: string) => x.trim())
      .filter((x: string) => x.length > 12)
      .slice(0, 6);
    const outcomes =
      outcomeLines.length > 0
        ? outcomeLines
        : [
            "Nội dung theo chương trình đã xuất bản trên CSNB",
            "Video hướng dẫn và phần tóm tắt từng bài",
            "Theo dõi tiến độ trên LMS sau khi đăng ký",
          ];

    const ratingAvg = pubEx.rating_avg != null ? Number(pubEx.rating_avg) : 0;
    const ratingLabel = ratingAvg > 0 ? ratingAvg.toFixed(1) : "Mới";
    const instructorName =
      (typeof pubEx.instructor_name === "string" && (pubEx.instructor_name as string).trim()) || "Đội ngũ CSNB";
    const instructorTitle =
      (typeof pubEx.instructor_title === "string" && (pubEx.instructor_title as string).trim()) || "Coach";

    return {
      title: String(pub.title ?? ""),
      description,
      extraInfoHtml,
      hero,
      thumbnail,
      level,
      totalDurationLabel,
      lessonCount,
      programPhases,
      priceLabel: formatVnd(typeof pub.price_vnd === "number" ? pub.price_vnd : Number(pub.price_vnd)),
      ratingLabel,
      instructorName,
      instructorTitle,
      outcomes,
      trustLine:
        "Thanh toán và quyền truy cập theo gói đăng ký. Liên hệ nếu bạn cần tư vấn trước khi mua.",
      lmsHref: getLmsCourseHref(slugOrId),
      isDemo: false,
      purchasableCourseId: String(pub.id),
    };
  }

  const demo = getDemoCourse(courseId);
  if (!demo) return null;

  const meta = getDetailMarketingMeta(courseId);
  const catalog = getCatalogMarketingExtras(courseId);
  const phases = getCoursePhases(demo);
  const programPhases: ProgramPhase[] = phases.map((p) => ({
    id: p.id,
    title: p.title,
    lessons: getLessonsForPhase(demo, p).map((l) => ({
      id: l.id,
      title: l.title,
      duration: l.duration,
    })),
  }));

  return {
    title: demo.title,
    description: demo.description,
    extraInfoHtml: "",
    hero: demo.thumbnail,
    thumbnail: demo.thumbnail,
    level: demo.level,
    totalDurationLabel: demo.totalDurationLabel,
    lessonCount: demo.lessons.length,
    programPhases,
    priceLabel: catalog.priceLabel,
    ratingLabel: meta.rating,
    instructorName: meta.instructorName,
    instructorTitle: meta.instructorTitle,
    outcomes: meta.outcomes,
    trustLine: meta.trustLine,
    lmsHref: getLmsCourseHref(demo.id),
    isDemo: true,
    purchasableCourseId: null,
  };
}

export default async function MarketingCourseDetailPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;
  const vm = await loadMarketingVm(courseId);
  if (!vm) notFound();

  const actor = await getSessionActor();
  const purchaseState = actor?.id && vm.purchasableCourseId
    ? await getCoursePurchaseStateForUser(actor.id, vm.purchasableCourseId)
    : null;
  const hasCourseAccess = enrollmentGrantsCourseAccess(purchaseState?.enrollment);
  const latestOrder = purchaseState?.latestOrder ?? null;
  const orderAwaitingAdmin = Boolean(
    latestOrder && (latestOrder.status === "pending" || latestOrder.status === "paid")
  );
  const checkoutHref = vm.purchasableCourseId ? `/checkout/${vm.purchasableCourseId}` : "#";
  const extraInfoText = stripHtmlToText(vm.extraInfoHtml);
  const hasExtraInfo = extraInfoText.length > 0;

  return (
    <div className="min-h-screen overflow-x-clip bg-gradient-to-b from-white via-csnb-panel/35 to-csnb-panel pb-16 pt-20 sm:pb-20">
      <section className="relative border-b border-csnb-border/20">
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-b-2xl sm:rounded-b-3xl">
            <div className="relative aspect-[21/9] min-h-[200px] w-full sm:aspect-[21/8] sm:min-h-[240px]">
              <Image
                src={vm.hero}
                alt=""
                fill
                priority
                className="object-cover"
                sizes="(max-width: 1152px) 100vw, 1152px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-csnb-ink/92 via-csnb-ink/55 to-csnb-ink/20" />
              <div className="absolute inset-0 flex flex-col justify-end p-5 sm:p-8 lg:p-10">
                <span className="mb-2 inline-flex w-fit rounded-full border border-white/25 bg-white/10 px-3 py-1 font-sans text-[11px] font-semibold uppercase tracking-wide text-white/95 backdrop-blur-sm">
                  {vm.level}
                </span>
                <h1 className="max-w-3xl font-sans text-2xl font-extrabold leading-tight tracking-tight text-white sm:text-3xl lg:text-4xl">
                  {vm.title}
                </h1>
                <p className="mt-2 max-w-2xl font-sans text-sm leading-relaxed text-white/85 sm:text-base">
                  {looksLikeHtml(vm.description) ? stripHtmlToText(vm.description) : vm.description}
                </p>
                <div className="mt-4 flex flex-col gap-2 font-sans text-xs text-white/80 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-5 sm:gap-y-2 sm:text-sm">
                  <span className="inline-flex items-center gap-1.5">
                    <Star className="size-4 shrink-0 text-csnb-orange-bright" aria-hidden />
                    <span className="font-semibold text-white">{vm.ratingLabel}</span>
                    <span className="text-white/60">đánh giá</span>
                  </span>
                  <span className="hidden h-4 w-px bg-white/25 sm:block" aria-hidden />
                  <span className="inline-flex items-center gap-1.5">
                    <User className="size-4 shrink-0 text-white/70" aria-hidden />
                    <span>{vm.instructorName}</span>
                    <span className="text-white/55">· {vm.instructorTitle}</span>
                  </span>
                  <span className="hidden h-4 w-px bg-white/25 sm:block" aria-hidden />
                  <span className="inline-flex items-center gap-1.5">
                    <Layers className="size-4 shrink-0 text-white/70" aria-hidden />
                    {vm.lessonCount} bài học
                  </span>
                  <span className="hidden h-4 w-px bg-white/25 sm:block" aria-hidden />
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="size-4 shrink-0 text-white/70" aria-hidden />
                    {vm.totalDurationLabel}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto mt-8 max-w-6xl px-4 sm:px-6 lg:px-8">
        <nav className="mb-6 flex flex-wrap items-center gap-x-1 gap-y-1 font-sans text-xs text-neutral-500">
          <Link href="/" className="shrink-0 transition-colors hover:text-csnb-orange-deep">
            Trang chủ
          </Link>
          <span className="shrink-0 text-csnb-border/80">/</span>
          <Link href="/courses" className="shrink-0 transition-colors hover:text-csnb-orange-deep">
            Khóa học
          </Link>
          <span className="shrink-0 text-csnb-border/80">/</span>
          <span className="min-w-0 font-medium leading-snug text-csnb-ink sm:line-clamp-2">{vm.title}</span>
        </nav>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
          <div className="min-w-0 space-y-10">
            <section>
              <h2 className="mb-3 font-sans text-lg font-bold text-csnb-ink">Mô tả khóa học</h2>
              <div className="rounded-xl border border-csnb-border/25 bg-white p-5 shadow-sm sm:p-6">
                {looksLikeHtml(vm.description) ? (
                  <div
                    className="prose prose-neutral max-w-none prose-p:leading-relaxed prose-a:text-csnb-orange-deep prose-headings:text-csnb-ink"
                    dangerouslySetInnerHTML={{ __html: vm.description }}
                  />
                ) : (
                  <p className="font-sans text-sm leading-relaxed text-neutral-700 sm:text-[0.9375rem]">{vm.description}</p>
                )}
                {vm.isDemo ? (
                  <p className="mt-4 font-sans text-sm leading-relaxed text-neutral-600">
                    Chương trình được thiết kế theo từng module, có video minh họa và gợi ý chỉnh tư thế an toàn. Bạn có thể
                    học theo tốc độ của riêng mình; phần demo trên website dùng dữ liệu mẫu để minh họa giao diện.
                  </p>
                ) : (
                  <p className="mt-4 font-sans text-sm leading-relaxed text-neutral-600">
                    Sau khi đăng ký, bạn học trên LMS với tiến độ được lưu theo tài khoản và thời hạn gói.
                  </p>
                )}
              </div>
            </section>

            {hasExtraInfo ? (
              <section>
                <h2 className="mb-3 font-sans text-lg font-bold text-csnb-ink">Bạn sẽ học được gì?</h2>
                <div className="rounded-xl border border-csnb-border/25 bg-white p-5 shadow-sm sm:p-6">
                  {looksLikeHtml(vm.extraInfoHtml) ? (
                    <div
                      className="prose prose-neutral max-w-none prose-p:leading-relaxed prose-a:text-csnb-orange-deep prose-headings:text-csnb-ink"
                      dangerouslySetInnerHTML={{ __html: vm.extraInfoHtml }}
                    />
                  ) : (
                    <p className="font-sans text-sm leading-relaxed text-neutral-700 sm:text-[0.9375rem]">
                      {vm.extraInfoHtml}
                    </p>
                  )}
                </div>
              </section>
            ) : vm.isDemo ? (
              <section>
                <h2 className="mb-3 font-sans text-lg font-bold text-csnb-ink">Bạn sẽ học được gì?</h2>
                <div className="rounded-xl border border-csnb-border/25 bg-white p-5 shadow-sm sm:p-6">
                  <ul className="grid gap-3 sm:grid-cols-2">
                    {vm.outcomes.map((line, i) => (
                      <li key={i} className="flex gap-2.5 font-sans text-sm leading-snug text-neutral-700">
                        <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-csnb-orange" aria-hidden />
                        <span>{line}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </section>
            ) : null}

            <section>
              <h2 className="mb-3 font-sans text-lg font-bold text-csnb-ink">Nội dung chương trình</h2>
              {vm.programPhases.length > 0 ? (
                <CourseProgramAccordion phases={vm.programPhases} />
              ) : (
                <p className="font-sans text-sm text-neutral-600">Chương trình đang được cập nhật.</p>
              )}
            </section>
          </div>

          <aside className="lg:sticky lg:top-24">
            <div className="overflow-hidden rounded-xl border border-csnb-border/25 bg-white shadow-md">
              <div className="relative aspect-video w-full">
                <Image src={vm.thumbnail} alt="" fill className="object-cover" sizes="340px" />
                <div className="absolute inset-0 flex items-center justify-center bg-csnb-ink/35">
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/95 text-csnb-orange-deep shadow-lg ring-1 ring-csnb-border/20">
                    <span className="sr-only">Xem giới thiệu</span>
                    <svg viewBox="0 0 24 24" className="ml-0.5 size-7" fill="currentColor" aria-hidden>
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </span>
                </div>
              </div>
              <div className="p-5 sm:p-6">
                <p className="font-sans text-2xl font-extrabold tabular-nums text-csnb-orange-deep">{vm.priceLabel}</p>
                {vm.purchasableCourseId ? (
                  actor ? (
                    hasCourseAccess ? (
                      <div className="mt-4 space-y-3 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-3 font-sans text-sm text-emerald-900">
                        <p className="font-semibold">Bạn đã được kích hoạt khóa học này.</p>
                        <p className="text-emerald-800">
                          Vào Phòng học để học theo tiến độ; nội dung bài giảng nằm trong không gian học tập.
                        </p>
                        <Link
                          href={vm.lmsHref}
                          className="flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-emerald-700 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-emerald-800"
                        >
                          <span className="text-lg leading-none">▶</span>
                          Vào khóa học
                        </Link>
                      </div>
                    ) : orderAwaitingAdmin ? (
                      <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-3 font-sans text-sm text-amber-950">
                        <p className="font-semibold text-amber-900">Đang chờ xác nhận thanh toán</p>
                        <p className="mt-1 text-amber-900/90">
                          Bạn đã tạo đơn hoặc đang chờ duyệt. Sau khi admin xác nhận chuyển khoản, quyền học sẽ được bật tự động — hãy tải lại trang này hoặc vào Phòng học.
                        </p>
                        {latestOrder?.id ? (
                          <div className="mt-3 border-t border-amber-200/70 pt-3">
                            <CancelPendingRegistrationButton
                              orderId={latestOrder.id}
                              variant="button"
                              className="[&_button]:w-full"
                            />
                          </div>
                        ) : null}
                      </div>
                    ) : (
                      <Link
                        href={checkoutHref}
                        className="mt-4 flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-csnb-orange px-4 py-3 font-sans text-sm font-bold text-white transition-colors hover:bg-csnb-orange-deep"
                      >
                        <span className="text-lg leading-none">▶</span>
                        Đăng ký & đi tới checkout
                      </Link>
                    )
                  ) : (
                    <Link
                      href="/login?mode=signin"
                      className="mt-4 flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-csnb-orange px-4 py-3 font-sans text-sm font-bold text-white transition-colors hover:bg-csnb-orange-deep"
                    >
                      <span className="text-lg leading-none">▶</span>
                      Đăng nhập để đăng ký khóa học
                    </Link>
                  )
                ) : (
                  <div className="mt-4 rounded-md border border-csnb-border/35 bg-csnb-panel/45 px-3 py-3 font-sans text-sm text-neutral-700">
                    Khóa học demo chưa bật checkout trực tiếp.
                  </div>
                )}

                <ul className="mt-6 space-y-3 border-t border-csnb-border/15 pt-5 font-sans text-sm text-neutral-600">
                  <li className="flex gap-3">
                    <BookOpen className="mt-0.5 size-4 shrink-0 text-csnb-orange-deep" aria-hidden />
                    <span>{vm.lessonCount} bài giảng video</span>
                  </li>
                  <li className="flex gap-3">
                    <Clock className="mt-0.5 size-4 shrink-0 text-csnb-orange-deep" aria-hidden />
                    <span>{vm.totalDurationLabel} học tập</span>
                  </li>
                  <li className="flex gap-3">
                    <Infinity className="mt-0.5 size-4 shrink-0 text-csnb-orange-deep" aria-hidden />
                    <span>{vm.isDemo ? "Truy cập theo thời hạn gói (demo)" : "Truy cập theo thời hạn gói đã mua"}</span>
                  </li>
                  <li className="flex gap-3">
                    <Smartphone className="mt-0.5 size-4 shrink-0 text-csnb-orange-deep" aria-hidden />
                    <span>Học trên mọi thiết bị</span>
                  </li>
                </ul>

                <p className="mt-5 flex gap-2 border-t border-csnb-border/15 pt-4 font-sans text-[11px] leading-relaxed text-neutral-500">
                  <Lock className="mt-0.5 size-3.5 shrink-0 text-neutral-400" aria-hidden />
                  {vm.trustLine}
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
