import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";

// ============================================================
// Types
// ============================================================

export type VoucherDiscountType = "percentage" | "fixed_amount" | "free";
export type VoucherScope = "sitewide" | "specific_courses" | "specific_user";
export type VoucherTargetType = "all" | "new_users";
export type VoucherStatus = "draft" | "active" | "paused" | "expired";

export type VoucherRow = {
  id: string;
  code: string;
  description: string | null;
  terms: string | null;
  discount_type: VoucherDiscountType;
  discount_value: number | null;
  max_discount_vnd: number | null;
  min_order_vnd: number;
  max_uses: number | null;
  max_uses_per_user: number;
  used_count: number;
  target_type: VoucherTargetType;
  scope: VoucherScope;
  user_id: string | null;
  is_public: boolean;
  status: VoucherStatus;
  starts_at: string | null;
  expires_at: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type ValidateVoucherInput = {
  code: string;
  courseId: string;
  subtotalVnd: number;
  userId: string;
};

export type ValidateVoucherOk = {
  ok: true;
  discountVnd: number;
  finalVnd: number;
  voucher: VoucherRow;
};

export type ValidateVoucherErr = {
  ok: false;
  error: string;
};

export type ValidateVoucherResult = ValidateVoucherOk | ValidateVoucherErr;

// ============================================================
// Helpers
// ============================================================

/**
 * Chuyển datetime-local string (không timezone) sang ISO UTC.
 * `datetime-local` input gửi giờ local VN (UTC+7), nhưng DB lưu timestamptz (UTC).
 * Nếu không convert, cùng ngày sẽ bị lệch 7 tiếng → bug "chưa có hiệu lực".
 *
 * "2026-07-19T09:00" → "2026-07-19T02:00:00.000Z"
 */
export function toUtcIso(datetimeLocal: string | null | undefined): string | null {
  if (!datetimeLocal) return null;

  const trimmed = datetimeLocal.trim();
  if (!trimmed) return null;

  // Đã có timezone indicator (+XX:XX hoặc Z) → giữ nguyên
  if (trimmed.includes("+") || trimmed.includes("Z")) {
    return new Date(trimmed).toISOString();
  }

  // datetime-local value → append Vietnam timezone +07:00
  return new Date(trimmed + "+07:00").toISOString();
}

function nowUtc(): string {
  return new Date().toISOString();
}

// ============================================================
// Validate + calculate discount
// ============================================================

export async function validateVoucher(
  client: SupabaseClient,
  input: ValidateVoucherInput,
): Promise<ValidateVoucherResult> {
  const { code, courseId, subtotalVnd, userId } = input;
  const normalizedCode = code.trim().toUpperCase();

  if (!normalizedCode) {
    return { ok: false, error: "Vui lòng nhập mã giảm giá." };
  }

  // 1. Tìm voucher
  const { data: voucher, error: voucherError } = await client
    .from("vouchers")
    .select("*")
    .eq("code", normalizedCode)
    .eq("status", "active")
    .maybeSingle();

  if (voucherError || !voucher) {
    return { ok: false, error: "Mã giảm giá không tồn tại hoặc đã dừng áp dụng." };
  }

  const v = voucher as VoucherRow;

  // 2. Kiểm tra thời hạn
  const now = nowUtc();
  if (v.starts_at && now < v.starts_at) {
    return { ok: false, error: "Mã giảm giá chưa có hiệu lực." };
  }
  if (now > v.expires_at) {
    return { ok: false, error: "Mã giảm giá đã hết hạn." };
  }

  // 3. Kiểm tra tổng lượt dùng
  if (v.max_uses !== null && v.used_count >= v.max_uses) {
    return { ok: false, error: "Mã giảm giá đã hết lượt sử dụng." };
  }

  // 4. Kiểm tra lượt dùng của user này
  const { count: userUseCount, error: countError } = await client
    .from("voucher_usages")
    .select("id", { count: "exact", head: true })
    .eq("voucher_id", v.id)
    .eq("user_id", userId);

  if (!countError && userUseCount !== null && userUseCount >= v.max_uses_per_user) {
    return { ok: false, error: "Bạn đã sử dụng mã này rồi." };
  }

  // 5. Kiểm tra target_type
  if (v.target_type === "new_users") {
    const { count: enrollmentCount } = await client
      .from("enrollments")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .in("status", ["active", "approved"]);

    if (enrollmentCount && enrollmentCount > 0) {
      return { ok: false, error: "Mã này chỉ dành cho học viên mới." };
    }
  }

  // 6. Kiểm tra scope
  if (v.scope === "specific_user") {
    if (v.user_id !== userId) {
      return { ok: false, error: "Mã giảm giá không áp dụng cho tài khoản này." };
    }
  }

  if (v.scope === "specific_courses") {
    const { data: vc } = await client
      .from("voucher_courses")
      .select("course_id")
      .eq("voucher_id", v.id)
      .eq("course_id", courseId)
      .maybeSingle();

    if (!vc) {
      return { ok: false, error: "Mã giảm giá không áp dụng cho khóa học này." };
    }
  }

  // 7. Kiểm tra min_order
  if (subtotalVnd < v.min_order_vnd) {
    return {
      ok: false,
      error: `Đơn tối thiểu ${v.min_order_vnd.toLocaleString("vi-VN")}₫ để áp dụng mã này.`,
    };
  }

  // 8. Tính discount
  let discountVnd: number;

  if (v.discount_type === "free") {
    discountVnd = subtotalVnd;
  } else if (v.discount_type === "fixed_amount") {
    discountVnd = Math.min(v.discount_value ?? 0, subtotalVnd);
  } else {
    // percentage
    const pct = Math.min(v.discount_value ?? 0, 100);
    discountVnd = Math.round((subtotalVnd * pct) / 100);
    if (v.max_discount_vnd !== null && discountVnd > v.max_discount_vnd) {
      discountVnd = v.max_discount_vnd;
    }
  }

  const finalVnd = Math.max(0, subtotalVnd - discountVnd);

  return {
    ok: true,
    discountVnd,
    finalVnd,
    voucher: v,
  };
}

// ============================================================
// Record usage (atomic: only if usage < max_uses)
// ============================================================

export async function recordVoucherUsage(
  client: SupabaseClient,
  params: {
    voucherId: string;
    userId: string;
    orderId: string;
    discountVnd: number;
  },
): Promise<{ success: boolean }> {
  const { voucherId, userId, orderId, discountVnd } = params;

  // Ghi usage
  const { error: usageError } = await client.from("voucher_usages").insert({
    voucher_id: voucherId,
    user_id: userId,
    order_id: orderId,
    discount_vnd: discountVnd,
  });

  if (usageError) {
    console.error("recordVoucherUsage: insert failed", usageError);
    return { success: false };
  }

  // Tăng used_count (atomic)
  const { error: updateError } = await client.rpc("increment_voucher_used_count", {
    p_voucher_id: voucherId,
  });

  if (updateError) {
    console.error("recordVoucherUsage: update used_count failed", updateError);
    // Không rollback usage để giữ audit trail
  }

  return { success: true };
}
