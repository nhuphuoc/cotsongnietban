import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { BookOpen, CalendarRange, Clock, GraduationCap, Layers, Star, User } from "lucide-react";
import { CourseEnrollmentCheckout } from "@/components/marketing/course-enrollment-checkout";
import { getSessionActor } from "@/lib/api/auth";
import {
  enrollmentGrantsCourseAccess,
  getCoursePurchaseStateForUser,
  getPublicCourseByIdentifier,
} from "@/lib/api/repositories";
import { formatVnd } from "@/lib/format-vnd";
import { getLmsCourseHref } from "@/lib/learning-hub";

const FALLBACK_THUMB =
  "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=450&fit=crop";

function looksLikeHtml(s: string): boolean {
  const t = String(s ?? "").trim();
  if (!t) return false;
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

const CHECKOUT_SUMMARY_MAX = 500;

function checkoutCourseSummary(course: {
  short_description?: string | null;
  description?: string | null;
}): string | null {
  const short =
    typeof course.short_description === "string" && course.short_description.trim()
      ? course.short_description.trim()
      : "";
  const long =
    typeof course.description === "string" && course.description.trim() ? course.description.trim() : "";
  let text = short || long;
  if (!text) return null;
  if (looksLikeHtml(text)) text = stripHtmlToText(text);
  if (!text) return null;
  if (text.length > CHECKOUT_SUMMARY_MAX) return `${text.slice(0, CHECKOUT_SUMMARY_MAX - 1).trimEnd()}…`;
  return text;
}

function formatCourseDurationFromSeconds(sec: number | null | undefined): string {
  if (sec == null || Number.isNaN(sec) || sec <= 0) return "—";
  const h = sec / 3600;
  if (h >= 1) return `~${h.toFixed(1)} giờ`.replace(".0", "");
  return `~${Math.round(sec / 60)} phút`;
}

function accessDurationLabel(days: number | null | undefined): string {
  if (days == null || Number.isNaN(days)) return "Không giới hạn thời hạn";
  if (days >= 365) {
    const y = days / 365;
    if (Math.abs(y - Math.round(y)) < 0.05) return `${Math.round(y)} năm từ lúc kích hoạt`;
  }
  return `${days} ngày từ lúc kích hoạt`;
}

export const dynamic = "force-dynamic";

export default async function CheckoutPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;

  const actor = await getSessionActor();
  if (!actor) {
    redirect("/login?mode=signin");
  }

  const course = await getPublicCourseByIdentifier(courseId);
  if (!course) notFound();

  const courseEx = course as typeof course & Record<string, unknown>;
  const purchaseState = await getCoursePurchaseStateForUser(actor.id, String(course.id));
  const hasAccess = enrollmentGrantsCourseAccess(purchaseState.enrollment);
  const lo = purchaseState.latestOrder;
  const cancellableOrderId =
    !hasAccess && lo && (lo.status === "pending" || lo.status === "paid") ? lo.id : null;
  const courseSummary = checkoutCourseSummary(course);

  const title = String(course.title ?? "Khóa học");
  const viewHref = `/courses/view/${course.slug || course.id}`;
  const thumbnail =
    (typeof course.thumbnail_url === "string" && course.thumbnail_url.trim()) || FALLBACK_THUMB;
  const hero =
    (typeof course.hero_image_url === "string" && course.hero_image_url.trim()) || thumbnail;
  const lessons = Array.isArray(course.lessons) ? course.lessons : [];
  const lessonCount =
    Number(courseEx.lesson_count ?? 0) > 0 ? Number(courseEx.lesson_count) : lessons.length;
  const totalDurationSeconds = lessons.reduce((sum: number, l: { duration_seconds?: number | null }) => {
    const sec = typeof l.duration_seconds === "number" ? l.duration_seconds : Number(l.duration_seconds ?? 0);
    return sum + (Number.isFinite(sec) ? sec : 0);
  }, 0);
  const durationLabel = formatCourseDurationFromSeconds(totalDurationSeconds);
  const sectionCount = Array.isArray(course.sections) ? course.sections.length : 0;
  const level =
    (typeof courseEx.level_label === "string" && courseEx.level_label.trim()) || "Trực tuyến";
  const instructorName =
    (typeof courseEx.instructor_name === "string" && courseEx.instructor_name.trim()) || null;
  const instructorTitle =
    (typeof courseEx.instructor_title === "string" && courseEx.instructor_title.trim()) || null;
  const ratingAvg = courseEx.rating_avg != null ? Number(courseEx.rating_avg) : 0;
  const ratingLabel = ratingAvg > 0 ? `${ratingAvg.toFixed(1)} / 5` : null;
  const accessLabel = accessDurationLabel(
    typeof course.access_duration_days === "number" ? course.access_duration_days : null,
  );
  const priceVnd = typeof course.price_vnd === "number" ? course.price_vnd : Number(course.price_vnd);
  const priceLabel = formatVnd(priceVnd);

  const metaPills: { key: string; icon: LucideIcon; text: string }[] = [
    { key: "level", icon: GraduationCap, text: level },
    { key: "lessons", icon: BookOpen, text: `${lessonCount} bài học` },
    { key: "duration", icon: Clock, text: totalDurationSeconds > 0 ? durationLabel : "Thời lượng cập nhật" },
  ];
  if (sectionCount > 0) {
    metaPills.push({ key: "sections", icon: Layers, text: `${sectionCount} phần` });
  }
  if (ratingLabel) {
    metaPills.push({ key: "rating", icon: Star, text: `Đánh giá ${ratingLabel}` });
  }
  metaPills.push({ key: "access", icon: CalendarRange, text: accessLabel });

  const accessShort =
    typeof course.access_duration_days === "number" && !Number.isNaN(course.access_duration_days)
      ? `${course.access_duration_days} ngày`
      : "Không giới hạn";
  const compactMetaLine = [
    level,
    `${lessonCount} bài`,
    totalDurationSeconds > 0 ? durationLabel : null,
    accessShort,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-csnb-panel/40 to-csnb-panel/80 pt-20 pb-12 sm:pt-24">
      <div className="mx-auto max-w-lg px-4 sm:px-6">
        <Link
          href={viewHref}
          className="inline-flex items-center gap-1 text-xs font-semibold text-csnb-orange-deep transition-colors hover:text-csnb-orange sm:text-sm"
        >
          <span aria-hidden>←</span> Quay lại khóa học
        </Link>

        <article className="mt-3 overflow-hidden rounded-xl border border-csnb-border/20 bg-white shadow-sm ring-1 ring-black/[0.03]">
          <div className="p-4 sm:p-5">
            <div className="flex gap-3">
              <div className="relative h-[4.5rem] w-20 shrink-0 overflow-hidden rounded-lg bg-neutral-100 sm:h-24 sm:w-28">
                <Image
                  src={hero}
                  alt=""
                  fill
                  priority
                  className="object-cover"
                  sizes="112px"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-500">
                  Checkout khóa học
                </p>
                <h1 className="mt-0.5 font-sans text-base font-extrabold leading-snug tracking-tight text-csnb-ink sm:text-lg">
                  {title}
                </h1>
                <p className="mt-1 line-clamp-2 font-sans text-[11px] leading-snug text-neutral-600 sm:line-clamp-1">
                  {compactMetaLine}
                </p>
              </div>
            </div>

            {hasAccess ? (
              <div className="mt-4 space-y-3 border-t border-csnb-border/15 pt-4">
                <div className="space-y-1.5 rounded-lg border border-emerald-200 bg-emerald-50/90 px-3 py-2.5">
                  <p className="font-sans text-sm font-bold text-emerald-900">Bạn đã có quyền học khóa này.</p>
                  <p className="font-sans text-xs leading-snug text-emerald-800">
                    Không cần thanh toán thêm. Liên hệ admin qua Zalo nếu cần hỗ trợ.
                  </p>
                </div>
                <Link
                  href={getLmsCourseHref(String(course.slug || course.id))}
                  className="flex min-h-10 w-full items-center justify-center rounded-lg bg-emerald-700 px-4 py-2.5 text-center text-sm font-bold text-white transition-colors hover:bg-emerald-800"
                >
                  Vào khóa học
                </Link>
              </div>
            ) : null}
          </div>

          {!hasAccess ? (
            <>
              <div className="border-t border-csnb-border/15 bg-csnb-panel/20 px-4 py-3 sm:px-5">
                {instructorName ? (
                  <p className="flex items-center gap-1.5 font-sans text-xs text-neutral-600">
                    <User className="size-3.5 shrink-0 text-neutral-400" aria-hidden />
                    <span>
                      <span className="font-semibold text-csnb-ink">{instructorName}</span>
                      {instructorTitle ? <span className="text-neutral-500"> · {instructorTitle}</span> : null}
                    </span>
                  </p>
                ) : null}

                <ul className="mt-2 flex flex-wrap gap-1.5">
                  {metaPills.map(({ key, icon: Icon, text }) => (
                    <li
                      key={key}
                      className="inline-flex items-center gap-1 rounded-full border border-csnb-border/25 bg-white/80 px-2 py-0.5 font-sans text-[10px] font-medium text-neutral-600"
                    >
                      <Icon className="size-3 shrink-0 text-csnb-orange-deep/85" aria-hidden />
                      {text}
                    </li>
                  ))}
                </ul>

                {courseSummary ? (
                  <p className="mt-2 line-clamp-3 font-sans text-xs leading-relaxed text-neutral-600">{courseSummary}</p>
                ) : null}

                <p className="mt-2 font-sans text-[11px] text-neutral-400">
                  <Link href={viewHref} className="font-semibold text-csnb-orange-deep hover:underline">
                    Xem đầy đủ mô tả và chương trình
                  </Link>
                </p>
              </div>

              <div className="border-t border-csnb-border/15 bg-white px-4 py-4 sm:px-5">
                <div className="flex flex-wrap items-end justify-between gap-2">
                  <div>
                    <p className="font-sans text-[10px] font-semibold uppercase tracking-wide text-neutral-500">
                      Thanh toán
                    </p>
                    <p className="font-sans text-2xl font-extrabold tabular-nums tracking-tight text-csnb-orange-deep sm:text-[1.65rem]">
                      {priceLabel}
                    </p>
                  </div>
                  <p className="max-w-[12rem] text-right font-sans text-[10px] text-neutral-500 sm:text-xs">
                    Một lần để kích hoạt quyền học
                  </p>
                </div>
                <CourseEnrollmentCheckout
                  paymentOnly
                  compact
                  courseId={String(course.id)}
                  courseTitle={title}
                  priceLabel={priceLabel}
                  priceVnd={priceVnd}
                  cancellableOrderId={cancellableOrderId}
                  courseSummary={courseSummary}
                />
              </div>
            </>
          ) : null}
        </article>
      </div>
    </div>
  );
}
