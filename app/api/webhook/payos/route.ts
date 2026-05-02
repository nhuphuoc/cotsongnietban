import { createAdminClient } from "@/utils/supabase/admin";
import { getPayos } from "@/lib/payos";
import { activateEnrollmentForOrder } from "@/lib/api/enrollments";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Verify PayOS signature — throw 400 nếu sai để PayOS retry
    const payos = getPayos();
    let data: { orderCode: number };
    try {
      const verified = await payos.webhooks.verify(body);
      data = verified;
    } catch {
      return Response.json({ error: "Invalid signature" }, { status: 400 });
    }

    if (!data?.orderCode) {
      return Response.json({ success: true });
    }

    const admin = createAdminClient();

    const { data: orders, error: orderError } = await admin
      .from("orders")
      .select("*")
      .eq("payos_order_code", data.orderCode);

    if (orderError) {
      console.error("[payos-webhook] DB error:", orderError);
      return Response.json({ success: true });
    }

    const order = orders?.[0];
    if (!order) {
      console.warn(`[payos-webhook] Không tìm thấy đơn hàng với payos_order_code=${data.orderCode}`);
      return Response.json({ success: true });
    }

    // Idempotent / terminal: không ghi đè đơn đã xử lý hoặc đã hủy (tránh webhook muộn sau khi user hủy)
    if (order.status === "paid" || order.status === "approved") {
      return Response.json({ success: true });
    }
    if (order.status === "cancelled" || order.status === "refunded") {
      console.warn(`[payos-webhook] Bỏ qua order=${order.id} (status=${order.status})`);
      return Response.json({ success: true });
    }

    // Cập nhật trạng thái paid (chỉ từ pending)
    const { error: updateError } = await admin
      .from("orders")
      .update({
        status: "paid",
        paid_at: new Date().toISOString(),
      })
      .eq("id", order.id);

    if (updateError) {
      console.error("[payos-webhook] Update error:", updateError);
      return Response.json({ success: true });
    }

    // Tự động cấp enrollment
    try {
      const result = await activateEnrollmentForOrder(admin, order.id);
      console.log(`[payos-webhook] Đã cấp enrollment cho order=${order.id}: ${result.enrollmentIds.join(", ")}`);
    } catch (enrollError) {
      console.error("[payos-webhook] Enrollment error:", enrollError);
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error("[payos-webhook] Unexpected error:", error);
    return Response.json({ success: true });
  }
}
