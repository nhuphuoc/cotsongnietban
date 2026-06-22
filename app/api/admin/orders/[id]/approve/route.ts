import { requireAdminActor } from "@/lib/api/auth";
import { ok, fail } from "@/lib/api/http";
import { createAdminClient } from "@/utils/supabase/admin";
import { activateEnrollmentForOrder } from "@/lib/api/enrollments";
import { sendEmailAsync } from "@/lib/email/send";
import { CourseActivatedEmail } from "@/lib/email/templates/course-activated";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminActor();
  if (!auth.actor) return fail(auth.message ?? "Forbidden", auth.status);

  try {
    const { id } = await params;
    const client = createAdminClient();

    const { data: order, error: orderError } = await client.from("orders").select("*").eq("id", id).single();
    if (orderError || !order) return fail("Không tìm thấy đơn hàng.", 404, orderError);

    await activateEnrollmentForOrder(client, id);

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

    // Gửi email khóa học đã kích hoạt (fire-and-forget)
    if (order.customer_email) {
      const origin = new URL(request.url).origin;
      sendEmailAsync({
        to: order.customer_email,
        subject: `Khóa học đã sẵn sàng — ${order.order_code}`,
        template: "course_activated",
        react: CourseActivatedEmail({
          customerName: order.customer_name || "Học viên",
          courseTitle: "khóa học",
          courseUrl: `${origin}/phong-hoc`,
        }),
        metadata: { orderId: id },
      });
    }

    return ok(updated);
  } catch (error) {
    return fail("Không thể duyệt đơn hàng.", 500, error);
  }
}
