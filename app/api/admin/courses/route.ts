import { requireAdminActor } from "@/lib/api/auth";
import { ok, fail } from "@/lib/api/http";
import { listCourses, resolveCategoryId, slugify } from "@/lib/api/repositories";
import { createAdminClient } from "@/utils/supabase/admin";

export async function GET() {
  const auth = await requireAdminActor();
  if (!auth.actor) return fail(auth.message ?? "Forbidden", auth.status);

  try {
    return ok(await listCourses({ publishedOnly: false }));
  } catch (error) {
    return fail("Không thể tải khóa học admin.", 500, error);
  }
}

export async function POST(request: Request) {
  const auth = await requireAdminActor();
  if (!auth.actor) return fail(auth.message ?? "Forbidden", auth.status);

  try {
    const body = await request.json();
    if (!body.title) return fail("Thiếu title.");

    const client = createAdminClient();
    const categoryId = await resolveCategoryId("course_categories", body.categoryId ?? body.categorySlug ?? null);
    const { data, error } = await client
      .from("courses")
      .insert({
        category_id: categoryId,
        title: body.title,
        slug: body.slug ?? slugify(body.title),
        short_description: body.shortDescription ?? null,
        description: body.description ?? null,
        level_label: body.levelLabel ?? null,
        thumbnail_url: body.thumbnailUrl ?? null,
        trailer_url: body.trailerUrl ?? null,
        price_vnd: body.priceVnd ?? 0,
        access_duration_days: body.accessDurationDays ?? null,
        total_duration_seconds: body.totalDurationSeconds ?? 0,
        lesson_count: body.lessonCount ?? 0,
        instructor_name: body.instructorName ?? null,
        instructor_title: body.instructorTitle ?? null,
        is_featured: body.isFeatured ?? false,
        status: body.status ?? "draft",
        published_at: body.status === "published" ? new Date().toISOString() : null,
        created_by: auth.actor.id,
      })
      .select("*")
      .single();

    if (error) return fail("Không thể tạo khóa học.", 400, error);
    return ok(data, 201);
  } catch (error) {
    return fail("Không thể tạo khóa học.", 500, error);
  }
}
