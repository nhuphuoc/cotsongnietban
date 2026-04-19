import { requireActiveActor } from "@/lib/api/auth";
import { fail, ok } from "@/lib/api/http";
import { createAdminClient } from "@/utils/supabase/admin";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireActiveActor();
  if (!auth.actor) return fail(auth.message ?? "Bạn chưa đăng nhập.", auth.status);

  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const rawNote = (body as { note?: unknown }).note;
    const note = typeof rawNote === "string" ? rawNote.trim() : "";

    const client = createAdminClient();
    const { data: order, error: readError } = await client
      .from("orders")
      .select("id, user_id, status")
      .eq("id", id)
      .maybeSingle();

    if (readError) return fail("Không thể đọc đơn hàng.", 400, readError);
    if (!order) return fail("Không tìm thấy đơn hàng.", 404);
    if (order.user_id !== auth.actor.id) return fail("Bạn không có quyền với đơn hàng này.", 403);
    if (order.status === "approved") return fail("Đơn hàng đã được duyệt.", 400);
    if (order.status === "cancelled" || order.status === "refunded") {
      return fail("Đơn hàng đã hủy/hoàn tiền nên không thể xác nhận chuyển khoản.", 400);
    }

    const nextNote = [note || null, "User xác nhận đã chuyển khoản."].filter(Boolean).join("\n");

    const { data: updated, error: updateError } = await client
      .from("orders")
      .update({
        status: "paid",
        note: nextNote,
      })
      .eq("id", id)
      .select("id, status, note, updated_at")
      .single();

    if (updateError) return fail("Không thể xác nhận chuyển khoản.", 400, updateError);
    return ok(updated);
  } catch (error) {
    return fail("Không thể xác nhận chuyển khoản.", 500, error);
  }
}
