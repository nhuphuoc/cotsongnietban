import { requireAdminActor } from "@/lib/api/auth";
import { fail, ok } from "@/lib/api/http";
import { slugify } from "@/lib/api/repositories";
import { createAdminClient } from "@/utils/supabase/admin";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminActor();
  if (!auth.actor) return fail(auth.message ?? "Forbidden", auth.status);

  try {
    const { id } = await params;
    const body = (await request.json()) as {
      title?: string;
      slug?: string;
    };

    const title = body.title !== undefined ? String(body.title).trim() : undefined;
    if (title !== undefined && !title) {
      return fail("Tên phần học không được để trống.", 400);
    }

    const client = createAdminClient();
    const { data: current, error: currentError } = await client
      .from("course_sections")
      .select("id, course_id, title, slug")
      .eq("id", id)
      .maybeSingle();
    if (currentError) return fail("Không tải được phần học.", 400, currentError);
    if (!current) return fail("Không tìm thấy phần học.", 404);

    const nextTitle = title ?? String(current.title ?? "");
    const baseSlug = slugify(body.slug?.trim() || nextTitle);

    const { data: slugRows, error: slugRowsError } = await client
      .from("course_sections")
      .select("id, slug")
      .eq("course_id", current.course_id)
      .like("slug", `${baseSlug}%`);
    if (slugRowsError) return fail("Không kiểm tra được slug phần học.", 400, slugRowsError);

    const usedSlugs = new Set(
      (slugRows ?? [])
        .filter((r) => String(r.id) !== String(current.id))
        .map((r) => String(r.slug))
    );
    let finalSlug = baseSlug;
    if (usedSlugs.has(finalSlug)) {
      let n = 2;
      while (usedSlugs.has(`${baseSlug}-${n}`)) n += 1;
      finalSlug = `${baseSlug}-${n}`;
    }

    const patch: Record<string, unknown> = {};
    if (title !== undefined) patch.title = title;
    if (body.slug !== undefined || title !== undefined) patch.slug = finalSlug;
    if (Object.keys(patch).length === 0) return fail("Không có dữ liệu để cập nhật.", 400);

    const { data, error } = await client
      .from("course_sections")
      .update(patch)
      .eq("id", id)
      .select("*")
      .single();
    if (error) return fail("Không thể cập nhật phần học.", 400, error);
    return ok(data);
  } catch (error) {
    return fail("Không thể cập nhật phần học.", 500, error);
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

    const { data: lessonInSection, error: lessonError } = await client
      .from("lessons")
      .select("id")
      .eq("section_id", id)
      .limit(1);
    if (lessonError) return fail("Không kiểm tra được bài học trong phần.", 400, lessonError);

    if ((lessonInSection ?? []).length > 0) {
      return fail("Phần học đang chứa bài học. Vui lòng xoá hết bài học trong phần trước khi xoá phần học.", 400);
    }

    const { error } = await client.from("course_sections").delete().eq("id", id);
    if (error) return fail("Không thể xoá phần học.", 400, error);
    return ok({ id, deleted: true });
  } catch (error) {
    return fail("Không thể xoá phần học.", 500, error);
  }
}
