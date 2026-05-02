import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Tạo enrollment active cho tất cả order_items của một đơn hàng đã thanh toán.
 * Tái dùng chung giữa admin approve (thủ công) và webhook PayOS (tự động).
 *
 * Trả về danh sách enrollment ID đã tạo/cập nhật.
 */
export async function activateEnrollmentForOrder(
  admin: SupabaseClient,
  orderId: string,
): Promise<{ enrollmentIds: string[] }> {
  // Đọc order + order_items
  const { data: order, error: orderError } = await admin
    .from("orders")
    .select("id, user_id")
    .eq("id", orderId)
    .single();

  if (orderError || !order) {
    throw new Error("Không tìm thấy đơn hàng để cấp quyền học.");
  }
  if (!order.user_id) {
    throw new Error("Đơn hàng chưa gắn user_id nên chưa thể cấp quyền học.");
  }

  const { data: items, error: itemsError } = await admin
    .from("order_items")
    .select("*")
    .eq("order_id", orderId);

  if (itemsError) throw new Error("Không thể đọc order items.");
  if (!items?.length) return { enrollmentIds: [] };

  const now = new Date().toISOString();
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
      starts_at: now,
      expires_at: expiresAt,
    };
  });

  const { data: upserted, error: enrollmentError } = await admin
    .from("enrollments")
    .upsert(enrollments, { onConflict: "user_id,course_id" })
    .select("id");

  if (enrollmentError) {
    throw new Error("Không thể cấp quyền khóa học.");
  }

  const enrollmentIds = (upserted ?? []).map((row: { id: string }) => row.id);
  return { enrollmentIds };
}
