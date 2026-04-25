import { requireAdminActor } from "@/lib/api/auth";
import { ok, fail } from "@/lib/api/http";
import { compactPatch, getFeedbackById } from "@/lib/api/repositories";
import { createAdminClient } from "@/utils/supabase/admin";

const ALLOWED_TYPES = new Set(["before_after", "testimonial", "comment"]);

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

    if (body.type !== undefined && !ALLOWED_TYPES.has(body.type)) {
      return fail("type không hợp lệ.");
    }

    const patch = compactPatch({
      type: body.type,
      customer_name:
        typeof body.customerName === "string"
          ? body.customerName.trim() || null
          : body.customerName,
      customer_info:
        typeof body.customerInfo === "string"
          ? body.customerInfo.trim() || null
          : body.customerInfo,
      content:
        typeof body.content === "string"
          ? body.content.trim() || null
          : body.content,
      avatar_url:
        typeof body.avatarUrl === "string"
          ? body.avatarUrl.trim() || null
          : body.avatarUrl,
      image_url_1:
        typeof body.imageUrl1 === "string"
          ? body.imageUrl1.trim() || null
          : body.imageUrl1,
      image_url_2:
        typeof body.imageUrl2 === "string"
          ? body.imageUrl2.trim() || null
          : body.imageUrl2,
      is_active: body.isActive,
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

