import Link from "next/link";
import Image from "next/image";
import { Clock, ArrowRight } from "lucide-react";
import { listBlogPosts } from "@/lib/api/repositories";

export const dynamic = "force-dynamic";

const ALL_CATEGORY_KEY = "all";

function estimateReadMinutes(html: string) {
  const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  const words = text ? text.split(" ").length : 0;
  return Math.max(1, Math.round(words / 220));
}

function formatDateVi(iso: string | null) {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

type BlogRow = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  cover_image_url: string | null;
  content_html: string;
  created_at: string;
  published_at: string | null;
  category: { name: string } | null;
};

function categoryKey(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/đ/g, "d")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string | string[] }>;
}) {
  const sp = await searchParams;
  const raw = (await listBlogPosts({ publishedOnly: true })) as unknown as BlogRow[];
  const posts = raw.filter((p) => p.slug && p.title);

  const selectedCategoryRaw = Array.isArray(sp.category) ? sp.category[0] : sp.category;
  const selectedCategory = selectedCategoryRaw ? categoryKey(selectedCategoryRaw) : ALL_CATEGORY_KEY;

  const categories = [
    { key: ALL_CATEGORY_KEY, label: "Tất cả" },
    ...Array.from(new Set(posts.map((p) => p.category?.name?.trim()).filter(Boolean) as string[])).map((name) => ({
      key: categoryKey(name),
      label: name,
    })),
  ];

  const activeCategory = categories.some((c) => c.key === selectedCategory) ? selectedCategory : ALL_CATEGORY_KEY;
  const filteredPosts =
    activeCategory === ALL_CATEGORY_KEY
      ? posts
      : posts.filter((p) => categoryKey(p.category?.name ?? "") === activeCategory);

  const hero = filteredPosts[0] ?? null;
  const rest = filteredPosts.slice(1);

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-white via-csnb-panel/35 to-csnb-panel pt-20">
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="csnb-ambient-mesh-surface absolute inset-0 opacity-[0.45]" aria-hidden />
      </div>

      <section className="relative z-10 border-b border-csnb-border/20 bg-white/80 py-14 backdrop-blur-sm lg:py-20">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <span className="font-sans text-xs font-semibold uppercase tracking-widest text-csnb-orange-deep">Kiến thức</span>
          <h1 className="mt-3 font-sans text-3xl font-extrabold leading-snug tracking-normal text-csnb-ink sm:text-4xl lg:text-5xl">
            Blog Cột Sống Niết Bàn
          </h1>
          <p className="mx-auto mt-4 max-w-lg font-sans text-[0.9375rem] leading-relaxed text-neutral-600 sm:text-base">
            Chia sẻ về phục hồi chức năng, chấn thương và vận động an toàn.
          </p>
        </div>
      </section>

      <div className="sticky top-16 z-40 border-b border-csnb-border/20 bg-white/90 backdrop-blur-md lg:top-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="scrollbar-hide flex items-center gap-2 overflow-x-auto py-3">
            {categories.map((cat) => (
              <Link
                key={cat.key}
                href={cat.key === ALL_CATEGORY_KEY ? "/blog" : `/blog?category=${encodeURIComponent(cat.key)}`}
                className={`shrink-0 rounded-full px-4 py-1.5 font-sans text-[11px] font-semibold uppercase tracking-wide transition-colors sm:text-xs ${
                  cat.key === activeCategory
                    ? "bg-csnb-orange text-white shadow-sm"
                    : "border border-csnb-border/30 bg-white text-neutral-600 hover:border-csnb-orange/40 hover:text-csnb-ink"
                }`}
              >
                {cat.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <section className="relative z-10 py-12 lg:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {hero ? (
            <Link
              href={`/blog/${hero.slug}`}
              className="group mb-10 grid gap-0 overflow-hidden rounded-xl border border-csnb-border/25 bg-white shadow-[0_8px_40px_-12px_rgba(6,38,44,0.12)] transition-shadow hover:shadow-[0_16px_48px_-14px_rgba(6,38,44,0.18)] lg:mb-12 lg:grid-cols-2"
            >
              {hero.cover_image_url ? (
                <div className="relative aspect-video min-h-[200px] lg:aspect-auto lg:min-h-[280px]">
                  <Image
                    src={hero.cover_image_url}
                    alt={hero.title}
                    fill
                    sizes="(max-width: 1023px) 100vw, 50vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                  />
                </div>
              ) : null}
              <div className="flex flex-col justify-center bg-white p-6 sm:p-8 lg:p-10">
                <span className="mb-3 inline-flex w-fit rounded-md bg-csnb-orange px-2.5 py-1 font-sans text-[10px] font-bold uppercase tracking-wide text-white">
                  {hero.category?.name || "Blog"}
                </span>
                <h2 className="mb-3 font-sans text-xl font-extrabold leading-snug text-csnb-ink sm:text-2xl lg:text-[1.65rem]">
                  {hero.title}
                </h2>
                <p className="mb-5 font-sans text-sm leading-relaxed text-neutral-600 sm:text-[0.9375rem]">
                  {hero.excerpt || "Bài viết đang được cập nhật nội dung mô tả."}
                </p>
                <div className="flex flex-wrap items-center gap-4 font-sans text-xs text-neutral-500">
                  <span>{formatDateVi(hero.published_at || hero.created_at)}</span>
                  <span className="flex items-center gap-1">
                    <Clock className="size-3.5 shrink-0 text-csnb-orange-deep" />
                    {estimateReadMinutes(hero.content_html || "")} phút đọc
                  </span>
                  <span className="inline-flex items-center gap-1 font-semibold text-csnb-orange-deep transition-all group-hover:gap-2">
                    Đọc bài
                    <ArrowRight className="size-3.5" />
                  </span>
                </div>
              </div>
            </Link>
          ) : (
            <div className="mb-8 rounded-xl border border-csnb-border/20 bg-white p-8 text-center text-sm text-neutral-600">
              {activeCategory === ALL_CATEGORY_KEY
                ? "Chưa có bài viết đã xuất bản."
                : "Không có bài viết thuộc danh mục đã chọn."}
            </div>
          )}

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
            {rest.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group flex flex-col overflow-hidden rounded-xl border border-csnb-border/25 bg-white shadow-sm transition-shadow hover:border-csnb-orange/25 hover:shadow-md"
              >
                {post.cover_image_url ? (
                  <div className="relative aspect-video overflow-hidden">
                    <Image
                      src={post.cover_image_url}
                      alt={post.title}
                      fill
                      sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                    />
                    <span className="absolute left-3 top-3 rounded-md bg-csnb-orange px-2 py-1 font-sans text-[10px] font-bold uppercase tracking-wide text-white shadow-sm">
                      {post.category?.name || "Blog"}
                    </span>
                  </div>
                ) : null}
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="mb-2 line-clamp-2 font-sans text-base font-bold leading-snug text-csnb-ink transition-colors group-hover:text-csnb-orange-deep">
                    {post.title}
                  </h3>
                  <p className="mb-4 line-clamp-2 flex-1 font-sans text-sm leading-relaxed text-neutral-600">
                    {post.excerpt || "Bài viết đang được cập nhật nội dung mô tả."}
                  </p>
                  <div className="flex items-center justify-between font-sans text-xs text-neutral-500">
                    <span>{formatDateVi(post.published_at || post.created_at)}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="size-3 text-csnb-orange-deep/90" />
                      {estimateReadMinutes(post.content_html || "")} phút đọc
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
