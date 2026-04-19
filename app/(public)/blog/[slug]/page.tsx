import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, Calendar } from "lucide-react";
import { getBlogPostByIdentifier, incrementBlogPostViewCount } from "@/lib/api/repositories";

export const dynamic = "force-dynamic";

function estimateReadMinutes(html: string) {
  const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  const words = text ? text.split(" ").length : 0;
  return Math.max(1, Math.round(words / 220));
}

function formatDateVi(iso: string | null) {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("vi-VN", { day: "2-digit", month: "long", year: "numeric" });
}

export default async function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getBlogPostByIdentifier(slug);

  if (!post || post.status !== "published") {
    notFound();
  }

  try {
    await incrementBlogPostViewCount(post.id);
  } catch {
    // Ignore view-count write failures.
  }

  const title = post.title || "Bài viết";
  const categoryName = post.category?.name || "Blog";
  const contentHtml = typeof post.content_html === "string" ? post.content_html : "<p>Nội dung đang cập nhật.</p>";
  const cover = typeof post.cover_image_url === "string" ? post.cover_image_url.trim() : "";
  const dateLabel = formatDateVi(post.published_at || post.created_at);
  const readMinutes = estimateReadMinutes(contentHtml);

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-white via-csnb-panel/40 to-csnb-panel pt-20">
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="csnb-ambient-mesh-surface absolute inset-0 opacity-40" aria-hidden />
      </div>

      <div className="relative z-10 border-b border-csnb-border/20 bg-white/90 backdrop-blur-md">
        <div className="mx-auto max-w-3xl px-4 py-3 sm:px-6">
          <nav className="flex flex-wrap items-center gap-2 font-sans text-xs text-neutral-500" aria-label="Breadcrumb">
            <Link href="/" className="transition-colors hover:text-csnb-orange-deep">
              Trang chủ
            </Link>
            <span className="text-csnb-border/60" aria-hidden>
              /
            </span>
            <Link href="/blog" className="transition-colors hover:text-csnb-orange-deep">
              Blog
            </Link>
            <span className="text-csnb-border/60" aria-hidden>
              /
            </span>
            <span className="text-csnb-ink line-clamp-1">{title}</span>
          </nav>
        </div>
      </div>

      <article className="relative z-10 mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:py-14">
        <div className="mb-6 flex flex-wrap items-center gap-3 sm:gap-4">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 font-sans text-sm font-semibold text-csnb-orange-deep transition-all hover:gap-3 hover:text-csnb-orange"
          >
            <ArrowLeft className="size-4 shrink-0" />
            Quay lại blog
          </Link>

          <span className="inline-block rounded-md bg-csnb-orange px-3 py-1 font-sans text-[10px] font-bold uppercase tracking-wide text-white">
            {categoryName}
          </span>
        </div>

        <h1 className="mb-4 font-sans text-3xl font-extrabold leading-tight tracking-normal text-csnb-ink sm:text-4xl">
          {title}
        </h1>

        <div className="mb-8 flex flex-wrap items-center gap-4 font-sans text-sm text-neutral-500">
          {dateLabel ? (
            <span className="flex items-center gap-1.5">
              <Calendar className="size-3.5 shrink-0 text-csnb-orange-deep" />
              {dateLabel}
            </span>
          ) : null}
          <span className="flex items-center gap-1.5">
            <Clock className="size-3.5 shrink-0 text-csnb-orange-deep" />
            {readMinutes} phút đọc
          </span>
        </div>

        {cover ? (
          <div className="relative mb-10 aspect-video overflow-hidden rounded-xl border border-csnb-border/25 bg-white shadow-md">
            <Image src={cover} alt={title} fill sizes="(max-width: 768px) 100vw, 768px" className="object-cover" priority />
          </div>
        ) : null}

        <div
          className="prose prose-neutral max-w-none prose-p:leading-relaxed prose-a:text-csnb-orange-deep prose-headings:text-csnb-ink"
          dangerouslySetInnerHTML={{ __html: contentHtml }}
        />
      </article>
    </div>
  );
}
