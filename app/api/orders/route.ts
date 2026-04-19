import { requireActiveActor } from "@/lib/api/auth";
import { fail, ok } from "@/lib/api/http";
import { getCoursePurchaseStateForUser } from "@/lib/api/repositories";
import { createAdminClient } from "@/utils/supabase/admin";

const BANK_INFO = {
  bankName: "VCB / Vietcombank",
  accountNumber: "1234567890",
  accountName: "NGUYEN VAN A",
} as const;

function normalizeText(input: unknown) {
  return typeof input === "string" ? input.trim() : "";
}

function randomSuffix() {
  return Math.random().toString(36).slice(2, 7).toUpperCase();
}

function createOrderCode() {
  const now = new Date();
  const datePart = `${now.getUTCFullYear()}${String(now.getUTCMonth() + 1).padStart(2, "0")}${String(now.getUTCDate()).padStart(2, "0")}`;
  return `ORD-${datePart}-${randomSuffix()}`;
}

export async function POST(request: Request) {
  const auth = await requireActiveActor();
  if (!auth.actor) return fail(auth.message ?? "Bạn chưa đăng nhập.", auth.status);

  try {
    const body = await request.json().catch(() => ({}));
    const courseId = normalizeText((body as { courseId?: unknown }).courseId);

    if (!courseId) return fail("Thiếu courseId.", 400);

    const client = createAdminClient();

    const purchaseState = await getCoursePurchaseStateForUser(auth.actor.id, courseId);
    if (purchaseState.hasEnrollment) {
      return fail("Bạn đã có quyền truy cập khóa học này.", 409);
    }

    if (purchaseState.latestOrder) {
      return ok({
        orderId: purchaseState.latestOrder.id,
        orderCode: purchaseState.latestOrder.order_code,
        status: purchaseState.latestOrder.status,
        totalVnd: purchaseState.latestOrder.total_vnd,
        paymentMethod: "bank_transfer",
        paymentReference: purchaseState.latestOrder.payment_reference,
        alreadyExists: true,
        bankInfo: BANK_INFO,
      });
    }

    const { data: course, error: courseError } = await client
      .from("courses")
      .select("id, title, price_vnd, access_duration_days, status")
      .eq("id", courseId)
      .eq("status", "published")
      .maybeSingle();

    if (courseError) return fail("Không thể tải thông tin khóa học.", 400, courseError);
    if (!course) return fail("Không tìm thấy khóa học hoặc khóa học chưa mở bán.", 404);

    const { data: profile, error: profileError } = await client
      .from("profiles")
      .select("full_name, email, phone")
      .eq("id", auth.actor.id)
      .maybeSingle();

    if (profileError) return fail("Không thể tải thông tin học viên.", 400, profileError);

    const derivedName =
      normalizeText(profile?.full_name) ||
      normalizeText(profile?.email).split("@")[0] ||
      "Hoc vien";
    const customerEmail = normalizeText(profile?.email) || normalizeText(auth.actor.email);
    const customerPhone = normalizeText(profile?.phone) || null;

    if (!customerEmail) {
      return fail("Tài khoản chưa có email hợp lệ để tạo đơn hàng.", 400);
    }

    const totalVnd = Number(course.price_vnd ?? 0);
    const transferPrefix = "CSNB";
    let createdOrder: Record<string, unknown> | null = null;
    let orderCode = "";

    for (let attempt = 0; attempt < 5; attempt += 1) {
      orderCode = createOrderCode();
      const transferNote = `${transferPrefix} ${orderCode}`;

      const { data: order, error: orderError } = await client
        .from("orders")
        .insert({
          order_code: orderCode,
          user_id: auth.actor.id,
          customer_name: derivedName,
          customer_email: customerEmail,
          customer_phone: customerPhone,
          subtotal_vnd: totalVnd,
          discount_vnd: 0,
          total_vnd: totalVnd,
          status: "pending",
          payment_method: "bank_transfer",
          payment_reference: transferNote,
        })
        .select("*")
        .single();

      if (orderError && orderError.code === "23505") {
        continue;
      }
      if (orderError) return fail("Không thể tạo đơn hàng.", 400, orderError);
      createdOrder = order;
      break;
    }

    if (!createdOrder) return fail("Không thể tạo mã đơn hàng duy nhất. Vui lòng thử lại.", 500);

    const { error: itemError } = await client
      .from("order_items")
      .insert({
        order_id: String(createdOrder.id),
        course_id: course.id,
        course_title_snapshot: course.title,
        price_vnd: totalVnd,
        access_duration_days: course.access_duration_days,
      });

    if (itemError) {
      await client.from("orders").delete().eq("id", String(createdOrder.id));
      return fail("Không thể tạo chi tiết đơn hàng.", 400, itemError);
    }

    return ok(
      {
        orderId: createdOrder.id,
        orderCode,
        status: createdOrder.status,
        totalVnd,
        paymentMethod: "bank_transfer",
        paymentReference: createdOrder.payment_reference,
        alreadyExists: false,
        bankInfo: BANK_INFO,
      },
      201
    );
  } catch (error) {
    return fail("Không thể tạo đơn hàng.", 500, error);
  }
}
