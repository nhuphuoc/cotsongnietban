import { requireActiveActor } from "@/lib/api/auth";
import { fail, ok } from "@/lib/api/http";
import { createAdminClient } from "@/utils/supabase/admin";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireActiveActor();
  if (!auth.actor) return fail(auth.message ?? "Bạn chưa đăng nhập.", auth.status);

  try {
    const { id: orderId } = await params;
    const client = createAdminClient();

    const { data: order, error: readError } = await client
      .from("orders")
      .select("id, user_id, status, note")
      .eq("id", orderId)
      .maybeSingle();

    if (readError) return fail("Không thể đọc đơn hàng.", 400, readError);
    if (!order) return fail("Không tìm thấy đơn hàng.", 404);
    if (order.user_id !== auth.actor.id) return fail("Bạn không có quyền với đơn hàng này.", 403);
    if (order.status === "cancelled") {
      return ok({ id: order.id, status: "cancelled", alreadyCancelled: true });
    }
    if (order.status === "approved" || order.status === "refunded") {
      return fail("Đơn hàng không thể hủy ở trạng thái hiện tại.", 400);
    }

    const { data: items, error: itemsError } = await client
      .from("order_items")
      .select("id")
      .eq("order_id", orderId);

    if (itemsError) return fail("Không thể đọc chi tiết đơn.", 400, itemsError);

    const itemIds = (items ?? []).map((row) => row.id).filter(Boolean);
    if (itemIds.length > 0) {
      await client.from("enrollments").update({ status: "cancelled" }).in("order_item_id", itemIds);
    }

    const prevNote = typeof order.note === "string" ? order.note.trim() : "";
    const noteLine = "Học viên hủy đăng ký (đăng ký lại).";
    const mergedNote = [prevNote, noteLine].filter(Boolean).join("\n");

    const { data: updated, error: updateError } = await client
      .from("orders")
      .update({
        status: "cancelled",
        note: mergedNote,
      })
      .eq("id", orderId)
      .select("id, status")
      .single();

    if (updateError) return fail("Không thể hủy đơn hàng.", 400, updateError);
    return ok(updated);
  } catch (error) {
    return fail("Không thể hủy đơn hàng.", 500, error);
  }
}
