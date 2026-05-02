import { requireAdminActor } from "@/lib/api/auth";
import { parsePageParams } from "@/lib/api/admin-query";
import { ok, fail } from "@/lib/api/http";
import { listBlogPostsAdminPaginated, resolveCategoryId, slugify } from "@/lib/api/repositories";
import { createAdminClient } from "@/utils/supabase/admin";

const ALLOWED_STATUS = new Set(["draft", "published", "archived"]);

export async function GET(request: Request) {
  const auth = await requireAdminActor();
  if (!auth.actor) return fail(auth.message ?? "Forbidden", auth.status);

  try {
    const url = new URL(request.url);
    const { page, pageSize } = parsePageParams(url);
    const SORTS = new Set(["published_at", "view_count", "title", "status"]);
    const sortRaw = url.searchParams.get("sort") || "published_at";
    const sortBy = SORTS.has(sortRaw) ? (sortRaw as "published_at" | "view_count" | "title" | "status") : "published_at";
    const sortDir = url.searchParams.get("dir") === "asc" ? "asc" : "desc";
    const posts = await listBlogPostsAdminPaginated({
      page,
      pageSize,
      publishedOnly: false,
      sortBy,
      sortDir,
    });
    return ok(posts);
  } catch (error) {
    return fail("Không thể tải bài viết admin.", 500, error);
  }
}

export async function POST(request: Request) {
  const auth = await requireAdminActor();
  if (!auth.actor) return fail(auth.message ?? "Forbidden", auth.status);

  try {
    const body = await request.json();
    const title = typeof body.title === "string" ? body.title.trim() : "";
    const contentHtml = typeof body.contentHtml === "string" ? body.contentHtml.trim() : "";
    if (!title || !contentHtml) {
      return fail("Thiếu title hoặc contentHtml.");
    }
    const status = typeof body.status === "string" ? body.status.trim() : "draft";
    if (!ALLOWED_STATUS.has(status)) {
      return fail("status không hợp lệ (draft/published/archived).", 400);
    }
    const rawSlug = typeof body.slug === "string" ? body.slug.trim() : "";
    const finalSlug = slugify(rawSlug || title);
    if (!finalSlug) return fail("slug không hợp lệ.", 400);

    const client = createAdminClient();
    const categoryId = await resolveCategoryId("blog_categories", body.categoryId ?? body.categorySlug ?? null);
    const { data, error } = await client
      .from("blog_posts")
      .insert({
        author_id: auth.actor.id,
        category_id: categoryId,
        title,
        slug: finalSlug,
        excerpt: typeof body.excerpt === "string" ? body.excerpt.trim() || null : null,
        cover_image_url: typeof body.coverImageUrl === "string" ? body.coverImageUrl.trim() || null : null,
        content_html: contentHtml,
        status,
        published_at: status === "published" ? new Date().toISOString() : null,
      })
      .select("*")
      .single();

    if (error) return fail("Không thể tạo bài viết.", 400, error);
    return ok(data, 201);
  } catch (error) {
    return fail("Không thể tạo bài viết.", 500, error);
  }
}
