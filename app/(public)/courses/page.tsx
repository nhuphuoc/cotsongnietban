import Link from "next/link";
import Image from "next/image";
import { ArrowRight, BookOpen, Calendar, Clock } from "lucide-react";

export const dynamic = "force-dynamic";
import { SITE_CONTACT } from "@/lib/site-contact";
import {
  type CourseCatalogUiState,
  getCourseCatalogUiStatesForUser,
  listCourses,
} from "@/lib/api/repositories";
import { formatVnd } from "@/lib/format-vnd";
import { getSessionActor } from "@/lib/api/auth";
import { getLmsCourseHref } from "@/lib/learning-hub";
import { CancelPendingRegistrationButton } from "@/components/marketing/cancel-pending-registration-button";

const FALLBACK_THUMB =
  "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=450&fit=crop";

function formatCatalogDuration(sec: number | null | undefined): string {
  if (sec == null || Number.isNaN(sec) || sec <= 0) return "—";
  const h = sec / 3600;
  if (h >= 1) return `~${h.toFixed(1)} giờ`.replace(".0", "");
  return `~${Math.round(sec / 60)} phút`;
}

export default async function CoursesPage() {
  const rows = await listCourses({ publishedOnly: true });
  const actor = await getSessionActor();
  const catalogStates = actor
    ? await getCourseCatalogUiStatesForUser(
        actor.id,
        rows.map((row) => String((row as { id: string }).id))
      )
    : new Map<string, CourseCatalogUiState>();

  return (
    <div className="relative min-h-screen overflow-x-clip bg-gradient-to-b from-white via-csnb-panel/35 to-csnb-panel pt-20">
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="csnb-ambient-mesh-surface absolute inset-0 opacity-[0.45]" aria-hidden />
      </div>

      <section id="chuong-trinh" className="relative z-10 scroll-mt-24 border-b border-csnb-border/15 py-12 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <header className="mx-auto mb-12 max-w-2xl text-center lg:mb-14">
            <span className="font-sans text-xs font-semibold uppercase tracking-[0.2em] text-csnb-orange-deep">
              Danh mục
            </span>
            <h1 className="mt-3 font-sans text-3xl font-extrabold tracking-tight text-csnb-ink sm:text-4xl">
              Chọn khóa học phù hợp
            </h1>
            <p className="mt-4 font-sans text-sm leading-relaxed text-neutral-600 sm:text-base">
              Chương trình rõ ràng, học theo tiến độ trên LMS. Xem nội dung và học phí trước khi đăng ký.
            </p>
          </header>

          <ul className="mx-auto grid list-none grid-cols-1 gap-8 sm:grid-cols-2 sm:gap-6 lg:gap-8 xl:grid-cols-3">
            {rows.length === 0 ? (
              <li className="col-span-full text-center font-sans text-sm text-neutral-600">
                Hiện chưa có khóa học công khai. Vui lòng quay lại sau.
              </li>
            ) : (
              rows.map((raw) => {
                const c = raw as {
                  id: string;
                  slug?: string | null;
                  title?: string | null;
                  short_description?: string | null;
                  description?: string | null;
                  thumbnail_url?: string | null;
                  total_duration_seconds?: number | null;
                  lesson_count?: number | null;
                  price_vnd?: number | null;
                  access_duration_days?: number | null;
                  published_at?: string | null;
                };
                const viewSlug = (typeof c.slug === "string" && c.slug.trim()) || c.id;
                const catalogState = catalogStates.get(String(c.id)) ?? {
                  hasAccess: false,
                  awaitingPayment: false,
                  pendingOrderId: null,
                };
                const { hasAccess, awaitingPayment, pendingOrderId } = catalogState;
                const title = (typeof c.title === "string" && c.title) || "Khóa học";
                const desc =
                  (typeof c.short_description === "string" && c.short_description.trim()) ||
                  (typeof c.description === "string" && c.description.trim()) ||
                  "";
                const thumb = (typeof c.thumbnail_url === "string" && c.thumbnail_url.trim()) || FALLBACK_THUMB;
                const nLessons = Math.max(0, Number(c.lesson_count ?? 0));
                const durationLabel = formatCatalogDuration(
                  typeof c.total_duration_seconds === "number" ? c.total_duration_seconds : null
                );
                const priceLabel = formatVnd(typeof c.price_vnd === "number" ? c.price_vnd : null);
                const publishedLabel =
                  c.published_at && !Number.isNaN(new Date(c.published_at).getTime())
                    ? new Date(c.published_at).toLocaleDateString("vi-VN")
                    : "Chưa xuất bản";
                const accessLabel =
                  typeof c.access_duration_days === "number" && c.access_duration_days > 0
                    ? `${c.access_duration_days} ngày`
                    : "Theo gói đã mua";
                const detailHref = `/courses/view/${viewSlug}`;
                const primaryHref = hasAccess ? getLmsCourseHref(viewSlug) : detailHref;

                return (
                  <li key={c.id} className="min-w-0">
                    <article className="group/card flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-[0_1px_3px_rgba(6,38,44,0.06)] ring-1 ring-csnb-border/20 transition-[box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_40px_-12px_rgba(6,38,44,0.18)] hover:ring-csnb-border/35">
                      <Link
                        href={detailHref}
                        className="relative isolate aspect-[16/10] w-full shrink-0 overflow-hidden bg-csnb-panel"
                      >
                        <Image
                          src={thumb}
                          alt=""
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                          className="object-cover transition duration-500 ease-out group-hover/card:scale-[1.04]"
                        />
                        <div
                          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-csnb-ink/50 via-transparent to-transparent opacity-80"
                          aria-hidden
                        />
                        {(hasAccess || awaitingPayment) && (
                          <div className="absolute left-3 top-3 z-10 max-w-[calc(100%-1.5rem)]">
                            {hasAccess ? (
                              <span className="inline-flex items-center rounded-md bg-white/95 px-2 py-1 text-[11px] font-medium text-emerald-800 shadow-sm ring-1 ring-emerald-200/80 backdrop-blur-sm">
                                Đã kích hoạt
                              </span>
                            ) : (
                              <span className="inline-flex items-center rounded-md bg-white/95 px-2 py-1 text-[11px] font-medium text-amber-900 shadow-sm ring-1 ring-amber-200/90 backdrop-blur-sm">
                                Chờ thanh toán
                              </span>
                            )}
                          </div>
                        )}
                      </Link>

                      <div className="flex min-h-0 flex-1 flex-col px-5 pb-5 pt-4 sm:px-6 sm:pb-6 sm:pt-5">
                        <h2 className="font-sans text-lg font-bold leading-snug tracking-tight text-csnb-ink sm:text-xl">
                          <Link
                            href={detailHref}
                            className="line-clamp-2 text-balance transition-colors hover:text-csnb-orange-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-csnb-orange/40 focus-visible:ring-offset-2"
                          >
                            {title}
                          </Link>
                        </h2>

                        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-neutral-500">
                          <span className="inline-flex items-center gap-1.5">
                            <Clock className="size-3.5 shrink-0 text-csnb-orange-deep/80" strokeWidth={2} aria-hidden />
                            {durationLabel}
                          </span>
                          <span className="hidden text-neutral-300 sm:inline" aria-hidden>
                            ·
                          </span>
                          <span className="inline-flex items-center gap-1.5">
                            <BookOpen className="size-3.5 shrink-0 text-csnb-orange-deep/80" strokeWidth={2} aria-hidden />
                            {nLessons} bài
                          </span>
                          <span className="hidden text-neutral-300 sm:inline" aria-hidden>
                            ·
                          </span>
                          <span className="inline-flex items-center gap-1.5">
                            <Calendar className="size-3.5 shrink-0 text-csnb-orange-deep/80" strokeWidth={2} aria-hidden />
                            {accessLabel}
                          </span>
                        </div>

                        <p className="mt-3 line-clamp-2 flex-1 font-sans text-sm leading-relaxed text-neutral-600">
                          {desc || "Khóa học trực tuyến, học theo tiến độ cá nhân."}
                        </p>

                        <p className="mt-3 font-sans text-[11px] tabular-nums text-neutral-400">
                          {c.published_at && !Number.isNaN(new Date(c.published_at).getTime())
                            ? `Cập nhật danh mục: ${publishedLabel}`
                            : publishedLabel}
                        </p>

                        <div className="mt-5 flex flex-col gap-4 border-t border-neutral-200/80 pt-5 sm:flex-row sm:items-end sm:justify-between">
                          <div>
                            <p className="font-sans text-xs font-medium text-neutral-500">Học phí</p>
                            <p className="mt-0.5 font-sans text-xl font-extrabold tabular-nums tracking-tight text-csnb-orange-deep sm:text-2xl">
                              {priceLabel}
                            </p>
                          </div>
                          <Link
                            href={primaryHref}
                            className={`inline-flex h-10 w-full shrink-0 items-center justify-center gap-2 rounded-xl px-4 font-sans text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-csnb-orange/50 focus-visible:ring-offset-2 sm:h-10 sm:w-auto sm:min-w-[10.5rem] ${
                              hasAccess
                                ? "bg-emerald-600 text-white hover:bg-emerald-700"
                                : awaitingPayment
                                  ? "border-2 border-amber-500/90 bg-white text-amber-950 hover:bg-amber-50"
                                  : "bg-csnb-orange text-white hover:bg-csnb-orange-deep"
                            }`}
                          >
                            {hasAccess ? "Vào học ngay" : awaitingPayment ? "Thanh toán tiếp" : "Xem chi tiết"}
                            <ArrowRight className="size-4 shrink-0 opacity-90" strokeWidth={2} />
                          </Link>
                        </div>
                        {awaitingPayment && pendingOrderId ? (
                          <div className="mt-3 border-t border-dashed border-neutral-200/90 pt-3">
                            <CancelPendingRegistrationButton orderId={pendingOrderId} />
                          </div>
                        ) : null}
                      </div>
                    </article>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      </section>

      <section className="relative z-10 border-t border-csnb-orange/20 bg-gradient-to-br from-csnb-orange to-csnb-orange-deep py-12 text-center lg:py-14">
        <div className="mx-auto max-w-2xl px-4">
          <h2 className="font-sans text-xl font-extrabold text-white sm:text-2xl">Chưa chọn được gói?</h2>
          <p className="mt-2 font-sans text-sm leading-relaxed text-white/90">
            Tư vấn trực tiếp — team hỗ trợ theo tình trạng, lịch và ngân sách của bạn.
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href={SITE_CONTACT.zaloUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center justify-center rounded-md bg-white px-6 py-3 font-sans text-sm font-bold text-csnb-orange-deep transition-colors hover:bg-csnb-panel"
            >
              Tư vấn trực tiếp
            </a>
            <Link
              href="/"
              className="inline-flex min-h-11 items-center justify-center rounded-md border border-white/40 px-6 py-3 font-sans text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              Về trang chủ
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
