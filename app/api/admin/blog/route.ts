import { requireAdminActor } from "@/lib/api/auth";
import { ok, fail } from "@/lib/api/http";
import { listBlogPosts, resolveCategoryId, slugify } from "@/lib/api/repositories";
import { createAdminClient } from "@/utils/supabase/admin";

export async function GET() {
  const auth = await requireAdminActor();
  if (!auth.actor) return fail(auth.message ?? "Forbidden", auth.status);

  try {
    const posts = await listBlogPosts({ publishedOnly: false });
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
    if (!body.title || !body.contentHtml) {
      return fail("Thiếu title hoặc contentHtml.");
    }

    const client = createAdminClient();
    const categoryId = await resolveCategoryId("blog_categories", body.categoryId ?? body.categorySlug ?? null);
    const { data, error } = await client
      .from("blog_posts")
      .insert({
        author_id: auth.actor.id,
        category_id: categoryId,
        title: body.title,
        slug: body.slug ?? slugify(body.title),
        excerpt: body.excerpt ?? null,
        cover_image_url: body.coverImageUrl ?? null,
        content_html: body.contentHtml,
        status: body.status ?? "draft",
        published_at: body.status === "published" ? new Date().toISOString() : null,
      })
      .select("*")
      .single();

    if (error) return fail("Không thể tạo bài viết.", 400, error);
    return ok(data, 201);
  } catch (error) {
    return fail("Không thể tạo bài viết.", 500, error);
  }
}
