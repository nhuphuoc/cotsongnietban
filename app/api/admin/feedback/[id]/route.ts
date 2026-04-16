import { requireAdminActor } from "@/lib/api/auth";
import { ok, fail } from "@/lib/api/http";
import { compactPatch, getFeedbackById } from "@/lib/api/repositories";
import { createAdminClient } from "@/utils/supabase/admin";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminActor();
  if (!auth.actor) return fail(auth.message ?? "Forbidden", auth.status);

  try {
    const { id } = await params;
    const item = await getFeedbackById(id);
    if (!item) return fail("Không tìm thấy feedback.", 404);
    return ok(item);
  } catch (error) {
    return fail("Không thể tải feedback.", 500, error);
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
    const status = body.status as string | undefined;
    const markReviewed =
      status !== undefined && status !== "new" && ["reviewed", "pinned", "hidden"].includes(status);

    const patch = compactPatch({
      user_id: body.userId,
      course_id: body.courseId,
      source: body.source,
      name: body.name,
      email: body.email,
      avatar_url: body.avatarUrl,
      rating: body.rating,
      message_html: body.messageHtml,
      internal_note_html: body.internalNoteHtml,
      status: body.status,
      is_public: body.isPublic,
      reviewed_by: markReviewed ? auth.actor.id : undefined,
      reviewed_at: markReviewed ? new Date().toISOString() : undefined,
    });

    const client = createAdminClient();
    const { error } = await client.from("feedbacks").update(patch).eq("id", id);
    if (error) return fail("Không thể cập nhật feedback.", 400, error);
    const updated = await getFeedbackById(id);
    if (!updated) return fail("Không tìm thấy feedback sau khi cập nhật.", 404);
    return ok(updated);
  } catch (error) {
    return fail("Không thể cập nhật feedback.", 500, error);
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
    const { error } = await client.from("feedbacks").delete().eq("id", id);
    if (error) return fail("Không thể xóa feedback.", 400, error);
    return ok({ id, deleted: true });
  } catch (error) {
    return fail("Không thể xóa feedback.", 500, error);
  }
}
