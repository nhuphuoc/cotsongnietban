import { requireAdminActor } from "@/lib/api/auth";
import { ok, fail } from "@/lib/api/http";
import { compactPatch, getBlogPostByIdentifier, resolveCategoryId, slugify } from "@/lib/api/repositories";
import { createAdminClient } from "@/utils/supabase/admin";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminActor();
  if (!auth.actor) return fail(auth.message ?? "Forbidden", auth.status);

  try {
    const { id } = await params;
    const post = await getBlogPostByIdentifier(id);
    if (!post) return fail("Không tìm thấy bài viết.", 404);
    return ok(post);
  } catch (error) {
    return fail("Không thể tải bài viết.", 500, error);
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminActor();
  if (!auth.actor) return fail(auth.message ?? "Forbidden", auth.status);

  try {
    const { id } = await params;
    const body = await request.json();
    const categoryId = body.categoryId || body.categorySlug
      ? await resolveCategoryId("blog_categories", body.categoryId ?? body.categorySlug)
      : undefined;

    const patch = compactPatch({
      title: body.title,
      slug:
        body.slug !== undefined
          ? (typeof body.slug === "string" && body.slug.trim() ? body.slug : body.title ? slugify(body.title) : undefined)
          : undefined,
      excerpt: body.excerpt,
      cover_image_url: body.coverImageUrl,
      content_html: body.contentHtml,
      status: body.status,
      category_id: categoryId,
      published_at:
        body.status === "published"
          ? body.publishedAt ?? new Date().toISOString()
          : body.status
            ? null
            : undefined,
    });

    const client = createAdminClient();
    const { error } = await client.from("blog_posts").update(patch).eq("id", id);
    if (error) return fail("Không thể cập nhật bài viết.", 400, error);
    const updated = await getBlogPostByIdentifier(id);
    if (!updated) return fail("Không tìm thấy bài viết sau khi cập nhật.", 404);
    return ok(updated);
  } catch (error) {
    return fail("Không thể cập nhật bài viết.", 500, error);
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminActor();
  if (!auth.actor) return fail(auth.message ?? "Forbidden", auth.status);

  try {
    const { id } = await params;
    const client = createAdminClient();
    const { error } = await client.from("blog_posts").delete().eq("id", id);
    if (error) return fail("Không thể xóa bài viết.", 400, error);
    return ok({ id, deleted: true });
  } catch (error) {
    return fail("Không thể xóa bài viết.", 500, error);
  }
}
