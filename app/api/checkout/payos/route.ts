import { z } from "zod";
import { requireActiveActor } from "@/lib/api/auth";
import { fail, ok } from "@/lib/api/http";
import { createAdminClient } from "@/utils/supabase/admin";
import { getCoursePurchaseStateForUser, enrollmentGrantsCourseAccess } from "@/lib/api/repositories";
import { getPayos } from "@/lib/payos";

export const runtime = "nodejs";

const checkoutBodySchema = z.object({
  courseId: z.string().min(1, "Thiếu courseId"),
  amount: z.number().int().positive("Số tiền phải là số nguyên dương"),
});

export async function POST(request: Request) {
  const auth = await requireActiveActor();
  if (!auth.actor) return fail(auth.message ?? "Bạn chưa đăng nhập.", auth.status);

  try {
    const body = await request.json().catch(() => ({}));
    const parsed = checkoutBodySchema.safeParse(body);
    if (!parsed.success) {
      return fail("Dữ liệu không hợp lệ: thiếu courseId hoặc amount không đúng.", 400, parsed.error);
    }

    const { courseId, amount } = parsed.data;
    const client = createAdminClient();

    // Kiểm tra user đã có enrollment active hoặc order pending chưa
    const purchaseState = await getCoursePurchaseStateForUser(auth.actor.id, courseId);
    if (enrollmentGrantsCourseAccess(purchaseState.enrollment)) {
      return fail("Bạn đã có quyền truy cập khóa học này.", 409);
    }

    // Nếu có đơn bank_transfer pending cũ → tự động hủy để tạo đơn PayOS mới
    if (purchaseState.latestOrder && purchaseState.latestOrder.status !== "approved") {
      await client
        .from("orders")
        .update({ status: "cancelled", note: "Tự động hủy do user chọn PayOS" })
        .eq("id", purchaseState.latestOrder.id);
      // Cũng hủy enrollment nếu có (phòng trường hợp admin đã duyệt đơn cũ)
      if (purchaseState.enrollment?.id) {
        await client
          .from("enrollments")
          .update({ status: "cancelled" })
          .eq("id", purchaseState.enrollment.id);
      }    }

    // Verify course + amount
    const { data: course, error: courseError } = await client
      .from("courses")
      .select("id, title, price_vnd, status, access_duration_days")
      .eq("id", courseId)
      .eq("status", "published")
      .maybeSingle();

    if (courseError) return fail("Không thể tải thông tin khóa học.", 400, courseError);
    if (!course) return fail("Không tìm thấy khóa học hoặc khóa học chưa mở bán.", 404);
    if (amount !== Number(course.price_vnd)) {
      return fail("Số tiền không khớp với giá khóa học.", 400);
    }

    const { data: profile, error: profileError } = await client
      .from("profiles")
      .select("full_name, email, phone")
      .eq("id", auth.actor.id)
      .maybeSingle();

    if (profileError) return fail("Không thể tải thông tin học viên.", 400, profileError);

    const derivedName =
      (typeof profile?.full_name === "string" ? profile.full_name.trim() : "") ||
      (typeof profile?.email === "string" ? profile.email.split("@")[0] : "") ||
      (typeof auth.actor.email === "string" ? auth.actor.email.split("@")[0] : "") ||
      "Hoc vien";
    const customerEmail =
      (typeof profile?.email === "string" ? profile.email.trim() : "") ||
      (typeof auth.actor.email === "string" ? auth.actor.email.trim() : "");

    // Tạo orderCode từ timestamp (9 chữ số cuối)
    const generateOrderCode = () => {
      const ts = Date.now().toString();
      return Number(ts.slice(-9));
    };

    let orderCode: number;
    let createdOrder: Record<string, unknown> | null = null;

    for (let attempt = 0; attempt < 3; attempt++) {
      orderCode = generateOrderCode();
      const displayCode = `PAYOS-${orderCode}`;

      const { data: order, error: orderError } = await client
        .from("orders")
        .insert({
          order_code: displayCode,
          user_id: auth.actor.id,
          customer_name: derivedName,
          customer_email: customerEmail,
          customer_phone: profile?.phone ?? null,
          subtotal_vnd: amount,
          discount_vnd: 0,
          total_vnd: amount,
          status: "pending",
          payment_method: "payos",
          payos_order_code: orderCode,
        })
        .select("*")
        .single();

      if (orderError && orderError.code === "23505") {
        // Unique violation, retry
        continue;
      }
      if (orderError) return fail("Không thể tạo đơn hàng.", 400, orderError);
      createdOrder = order;
      break;
    }

    if (!createdOrder) {
      return fail("Không thể tạo mã đơn hàng duy nhất. Vui lòng thử lại.", 500);
    }

    const { error: itemError } = await client
      .from("order_items")
      .insert({
        order_id: String(createdOrder.id),
        course_id: course.id,
        course_title_snapshot: course.title,
        price_vnd: amount,
        access_duration_days: course.access_duration_days,
      });

    if (itemError) {
      await client.from("orders").delete().eq("id", String(createdOrder.id));
      return fail("Không thể tạo chi tiết đơn hàng.", 400, itemError);
    }

    const origin = new URL(request.url).origin;
    const description = `Khoa hoc ${course.title}`.slice(0, 25);

    try {
      const payos = getPayos();
      const paymentResult = await payos.paymentRequests.create({
        orderCode: Number(createdOrder.payos_order_code),
        amount,
        description,
        returnUrl: `${origin}/checkout/success?orderId=${createdOrder.id}`,
        cancelUrl: `${origin}/checkout/cancel?orderId=${createdOrder.id}`,
        items: [{ name: String(course.title).slice(0, 99), quantity: 1, price: amount }],
      });

      await client
        .from("orders")
        .update({ checkout_url: paymentResult.checkoutUrl })
        .eq("id", String(createdOrder.id));

      return ok({
        checkoutUrl: paymentResult.checkoutUrl,
        orderId: createdOrder.id,
        orderCode: createdOrder.payos_order_code,
      });
    } catch (payosError) {
      await client
        .from("orders")
        .update({ status: "cancelled" })
        .eq("id", String(createdOrder.id));

      return fail("Không tạo được link thanh toán PayOS. Vui lòng thử lại sau.", 502, payosError);
    }
  } catch (error) {
    return fail("Lỗi hệ thống khi tạo đơn thanh toán.", 500, error);
  }
}
