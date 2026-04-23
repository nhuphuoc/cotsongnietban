import { requireAdminActor } from "@/lib/api/auth";
import { ok, fail } from "@/lib/api/http";
import { slugify } from "@/lib/api/repositories";
import { createAdminClient } from "@/utils/supabase/admin";

export async function POST(request: Request) {
  const auth = await requireAdminActor();
  if (!auth.actor) return fail(auth.message ?? "Forbidden", auth.status);

  try {
    const body = (await request.json()) as {
      courseId?: string;
      title?: string;
      slug?: string;
    };

    const courseId = String(body.courseId ?? "").trim();
    const title = String(body.title ?? "").trim();
    if (!courseId) return fail("Thiếu courseId.", 400);
    if (!title) return fail("Tên phần học không được để trống.", 400);

    const client = createAdminClient();

    const { data: course, error: courseError } = await client
      .from("courses")
      .select("id")
      .eq("id", courseId)
      .maybeSingle();
    if (courseError) return fail("Không kiểm tra được khoá học.", 400, courseError);
    if (!course) return fail("Khoá học không tồn tại.", 404);

    const { data: latest, error: latestError } = await client
      .from("course_sections")
      .select("sort_order")
      .eq("course_id", courseId)
      .order("sort_order", { ascending: false })
      .limit(1);
    if (latestError) return fail("Không xác định được thứ tự phần học.", 400, latestError);
    const nextSortOrder = latest && latest.length > 0 ? Number(latest[0].sort_order ?? 0) + 1 : 1;

    const baseSlug = slugify(body.slug?.trim() || title);
    const { data: slugRows, error: slugRowsError } = await client
      .from("course_sections")
      .select("slug")
      .eq("course_id", courseId)
      .like("slug", `${baseSlug}%`);
    if (slugRowsError) return fail("Không kiểm tra được slug phần học.", 400, slugRowsError);

    const usedSlugs = new Set((slugRows ?? []).map((r) => String(r.slug)));
    let finalSlug = baseSlug;
    if (usedSlugs.has(finalSlug)) {
      let n = 2;
      while (usedSlugs.has(`${baseSlug}-${n}`)) n += 1;
      finalSlug = `${baseSlug}-${n}`;
    }

    const { data, error } = await client
      .from("course_sections")
      .insert({
        course_id: courseId,
        title,
        slug: finalSlug,
        sort_order: nextSortOrder,
      })
      .select("*")
      .single();

    if (error) return fail("Không thể tạo phần học.", 400, error);
    return ok(data, 201);
  } catch (error) {
    return fail("Không thể tạo phần học.", 500, error);
  }
}
