import { z } from "zod";
import { requireActiveActor } from "@/lib/api/auth";
import { fail, ok } from "@/lib/api/http";
import { createAdminClient } from "@/utils/supabase/admin";
import { validateVoucher } from "@/lib/api/vouchers";

const validateVoucherBodySchema = z.object({
  code: z.string().min(1, "Thiếu mã giảm giá"),
  courseId: z.string().min(1, "Thiếu courseId"),
  subtotalVnd: z.number().int().positive("Số tiền phải là số nguyên dương"),
});

export async function POST(request: Request) {
  const auth = await requireActiveActor();
  if (!auth.actor) return fail(auth.message ?? "Bạn chưa đăng nhập.", auth.status);

  try {
    const body = await request.json().catch(() => ({}));
    const parsed = validateVoucherBodySchema.safeParse(body);
    if (!parsed.success) {
      return fail("Dữ liệu không hợp lệ.", 400, parsed.error);
    }

    const { code, courseId, subtotalVnd } = parsed.data;
    const client = createAdminClient();

    const result = await validateVoucher(client, {
      code,
      courseId,
      subtotalVnd,
      userId: auth.actor.id,
    });

    if (!result.ok) {
      return fail(result.error, 400);
    }

    // Chỉ trả về thông tin cần thiết cho UI (không expose internal)
    return ok({
      code: result.voucher.code,
      discountType: result.voucher.discount_type,
      discountValue: result.voucher.discount_value,
      description: result.voucher.description,
      terms: result.voucher.terms,
      expiresAt: result.voucher.expires_at,
      discountVnd: result.discountVnd,
      finalVnd: result.finalVnd,
      originalVnd: subtotalVnd,
    });
  } catch (error) {
    return fail("Không thể kiểm tra mã giảm giá.", 500, error);
  }
}
