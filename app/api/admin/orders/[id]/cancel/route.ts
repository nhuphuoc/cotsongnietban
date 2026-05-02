import { requireAdminActor } from "@/lib/api/auth";
import { ok, fail } from "@/lib/api/http";
import { createAdminClient } from "@/utils/supabase/admin";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminActor();
  if (!auth.actor) return fail(auth.message ?? "Forbidden", auth.status);

  try {
    const { id } = await params;
    const client = createAdminClient();

    const { data: order, error: readError } = await client
      .from("orders")
      .select("id, status")
      .eq("id", id)
      .maybeSingle();

    if (readError || !order) return fail("Không tìm thấy đơn hàng.", 404);
    if (order.status === "approved" || order.status === "cancelled" || order.status === "refunded") {
      return fail("Đơn hàng không thể hủy ở trạng thái hiện tại.", 400);
    }

    const { data: updated, error: updateError } = await client
      .from("orders")
      .update({
        status: "cancelled",
        note: "Admin hủy đơn.",
      })
      .eq("id", id)
      .select("*")
      .single();

    if (updateError) return fail("Không thể hủy đơn hàng.", 400, updateError);
    return ok(updated);
  } catch (error) {
    return fail("Không thể hủy đơn hàng.", 500, error);
  }
}
