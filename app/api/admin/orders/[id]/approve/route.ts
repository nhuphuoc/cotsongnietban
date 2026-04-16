import { requireAdminActor } from "@/lib/api/auth";
import { ok, fail } from "@/lib/api/http";
import { createAdminClient } from "@/utils/supabase/admin";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminActor();
  if (!auth.actor) return fail(auth.message ?? "Forbidden", auth.status);

  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const client = createAdminClient();

    const { data: order, error: orderError } = await client.from("orders").select("*").eq("id", id).single();
    if (orderError || !order) return fail("Không tìm thấy đơn hàng.", 404, orderError);
    if (!order.user_id) return fail("Đơn hàng chưa gắn user_id nên chưa thể cấp quyền học.", 400);

    const { data: items, error: itemsError } = await client.from("order_items").select("*").eq("order_id", id);
    if (itemsError) return fail("Không thể đọc order items.", 400, itemsError);
    if (!items?.length) return fail("Đơn hàng chưa có sản phẩm.", 400);

    const startsAt = body.startsAt ?? new Date().toISOString();

    const enrollments = items.map((item) => {
      const expiresAt =
        item.access_duration_days && item.access_duration_days > 0
          ? new Date(Date.now() + item.access_duration_days * 24 * 60 * 60 * 1000).toISOString()
          : null;

      return {
        user_id: order.user_id,
        course_id: item.course_id,
        order_item_id: item.id,
        status: "active",
        starts_at: startsAt,
        expires_at: expiresAt,
      };
    });

    const { error: enrollmentError } = await client
      .from("enrollments")
      .upsert(enrollments, { onConflict: "user_id,course_id" });

    if (enrollmentError) return fail("Không thể cấp quyền khóa học.", 400, enrollmentError);

    const { data: updated, error: updateError } = await client
      .from("orders")
      .update({
        status: "approved",
        approved_by: auth.actor.id,
        approved_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select("*")
      .single();

    if (updateError) return fail("Không thể cập nhật trạng thái đơn hàng.", 400, updateError);
    return ok(updated);
  } catch (error) {
    return fail("Không thể duyệt đơn hàng.", 500, error);
  }
}
