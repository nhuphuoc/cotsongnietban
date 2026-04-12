import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Clock, BookOpen } from "lucide-react";
import { SITE_CONTACT } from "@/lib/site-contact";
import { demoCourses } from "@/lib/demo-courses";
import { getCatalogMarketingExtras } from "@/lib/marketing-course-dummies";

export default function CoursesPage() {
  return (
    <div className="relative min-h-screen overflow-x-clip bg-gradient-to-b from-white via-csnb-panel/35 to-csnb-panel pt-20">
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="csnb-ambient-mesh-surface absolute inset-0 opacity-[0.45]" aria-hidden />
      </div>

      <section id="chuong-trinh" className="relative z-10 scroll-mt-24 border-b border-csnb-border/15 py-10 sm:py-14 lg:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-10 max-w-2xl text-center">
            <span className="font-sans text-xs font-semibold uppercase tracking-widest text-csnb-orange-deep">
              Danh mục
            </span>
            <h1 className="mt-2 font-sans text-2xl font-extrabold text-csnb-ink sm:text-3xl">Chọn khóa học phù hợp</h1>
            <p className="mt-3 font-sans text-sm leading-relaxed text-neutral-600 sm:text-base">
              Xem chi tiết chương trình, nội dung từng module và giá tham khảo. Đăng nhập để vào phòng học LMS.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {demoCourses.map((c) => {
              const extras = getCatalogMarketingExtras(c.id);
              return (
                <article
                  key={c.id}
                  className="flex flex-col overflow-hidden rounded-xl border border-csnb-border/25 bg-white shadow-sm transition-shadow hover:border-csnb-orange/25 hover:shadow-md sm:flex-row"
                >
                  <Link
                    href={`/courses/view/${c.id}`}
                    className="relative aspect-[16/10] w-full shrink-0 sm:aspect-auto sm:h-auto sm:w-[min(42%,240px)] sm:min-h-[200px]"
                  >
                    <Image
                      src={c.thumbnail}
                      alt=""
                      fill
                      sizes="(max-width: 1023px) 100vw, 240px"
                      className="object-cover transition-transform duration-300 hover:scale-[1.02]"
                    />
                  </Link>
                  <div className="flex min-w-0 flex-1 flex-col p-4 sm:p-5">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
                      <h3 className="min-w-0 font-sans text-base font-bold leading-snug text-csnb-ink sm:text-lg">{c.title}</h3>
                      <span className="w-fit shrink-0 rounded-md border border-csnb-border/40 bg-csnb-panel/80 px-2 py-0.5 text-center font-sans text-[10px] font-bold uppercase tracking-wide text-csnb-ink">
                        {c.level}
                      </span>
                    </div>
                    <p className="mt-2 line-clamp-2 flex-1 font-sans text-sm leading-relaxed text-neutral-600">{c.description}</p>
                    <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 font-sans text-xs text-neutral-500">
                      <span className="inline-flex items-center gap-1.5">
                        <Clock className="size-3.5 shrink-0 text-csnb-orange-deep" strokeWidth={2} />
                        {c.totalDurationLabel}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <BookOpen className="size-3.5 shrink-0 text-csnb-orange-deep" strokeWidth={2} />
                        {c.lessons.length} bài
                      </span>
                    </div>
                    <div className="my-4 h-px bg-csnb-border/20" />
                    <div className="mt-auto flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
                      <span className="font-sans text-lg font-extrabold tabular-nums text-csnb-orange-deep sm:text-xl">
                        {extras.priceLabel}
                      </span>
                      <Link
                        href={`/courses/view/${c.id}`}
                        className="inline-flex min-h-11 w-full items-center justify-center gap-1.5 rounded-md border border-csnb-border/35 bg-white px-3 py-2 font-sans text-sm font-semibold text-csnb-ink transition-colors hover:border-csnb-orange/40 hover:text-csnb-orange-deep sm:w-auto sm:justify-start"
                      >
                        Chi tiết
                        <ArrowRight className="size-4 shrink-0" />
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
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
