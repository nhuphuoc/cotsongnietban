import { requireAdminActor } from "@/lib/api/auth";
import { ok, fail } from "@/lib/api/http";
import { compactPatch, getCourseByIdentifier, resolveCategoryId, slugify } from "@/lib/api/repositories";
import { createAdminClient } from "@/utils/supabase/admin";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminActor();
  if (!auth.actor) return fail(auth.message ?? "Forbidden", auth.status);

  try {
    const { id } = await params;
    const course = await getCourseByIdentifier(id);
    if (!course) return fail("Không tìm thấy khóa học.", 404);
    return ok(course);
  } catch (error) {
    return fail("Không thể tải khóa học.", 500, error);
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
      ? await resolveCategoryId("course_categories", body.categoryId ?? body.categorySlug)
      : undefined;

    const patch = compactPatch({
      category_id: categoryId,
      title: body.title,
      slug: body.slug ?? (body.title ? slugify(body.title) : undefined),
      short_description: body.shortDescription,
      description: body.description,
      level_label: body.levelLabel,
      thumbnail_url: body.thumbnailUrl,
      trailer_url: body.trailerUrl,
      price_vnd: body.priceVnd,
      access_duration_days: body.accessDurationDays,
      total_duration_seconds: body.totalDurationSeconds,
      lesson_count: body.lessonCount,
      instructor_name: body.instructorName,
      instructor_title: body.instructorTitle,
      rating_avg: body.ratingAvg,
      rating_count: body.ratingCount,
      is_featured: body.isFeatured,
      status: body.status,
      published_at:
        body.status === "published"
          ? body.publishedAt ?? new Date().toISOString()
          : body.status
            ? null
            : undefined,
    });

    const client = createAdminClient();
    const { data, error } = await client.from("courses").update(patch).eq("id", id).select("*").single();
    if (error) return fail("Không thể cập nhật khóa học.", 400, error);
    return ok(data);
  } catch (error) {
    return fail("Không thể cập nhật khóa học.", 500, error);
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
    const { error } = await client.from("courses").delete().eq("id", id);
    if (error) return fail("Không thể xóa khóa học.", 400, error);
    return ok({ id, deleted: true });
  } catch (error) {
    return fail("Không thể xóa khóa học.", 500, error);
  }
}
