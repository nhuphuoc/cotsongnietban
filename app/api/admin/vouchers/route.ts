import { requireAdminActor } from "@/lib/api/auth";
import { parsePageParams } from "@/lib/api/admin-query";
import { ok, fail } from "@/lib/api/http";
import { createAdminClient } from "@/utils/supabase/admin";
import { toUtcIso } from "@/lib/api/vouchers";

const ALLOWED_SCOPES = ["sitewide", "specific_courses", "specific_user"];
const ALLOWED_DISCOUNT_TYPES = ["percentage", "fixed_amount", "free"];
const ALLOWED_TARGET_TYPES = ["all", "new_users"];
const ALLOWED_STATUSES = ["draft", "active", "paused", "expired"];

// ============================================================
// GET /api/admin/vouchers — danh sách (paginated)
// ============================================================
export async function GET(request: Request) {
  const auth = await requireAdminActor();
  if (!auth.actor) return fail(auth.message ?? "Forbidden", auth.status);

  try {
    const url = new URL(request.url);
    const { page, pageSize } = parsePageParams(url);
    const search = (url.searchParams.get("search") ?? "").trim();
    const statusFilter = url.searchParams.get("status");
    const sortBy = url.searchParams.get("sort") === "code" ? "code" : "created_at";
    const sortDir = url.searchParams.get("dir") === "asc" ? "asc" : "desc";

    const client = createAdminClient();

    let query = client
      .from("vouchers")
      .select("*", { count: "exact" })
      .order(sortBy, { ascending: sortDir === "asc" })
      .range((page - 1) * pageSize, page * pageSize - 1);

    if (search) {
      query = query.ilike("code", `%${search}%`);
    }
    if (statusFilter && ALLOWED_STATUSES.includes(statusFilter)) {
      query = query.eq("status", statusFilter);
    }

    const { data, error, count } = await query;

    if (error) return fail("Không thể tải danh sách voucher.", 400, error);

    return ok({
      items: data ?? [],
      total: count ?? 0,
      page,
      pageSize,
    });
  } catch (error) {
    return fail("Không thể tải danh sách voucher.", 500, error);
  }
}

// ============================================================
// POST /api/admin/vouchers — tạo mới
// ============================================================
export async function POST(request: Request) {
  const auth = await requireAdminActor();
  if (!auth.actor) return fail(auth.message ?? "Forbidden", auth.status);

  try {
    const body = await request.json();
    const client = createAdminClient();

    // Validate code
    const code = typeof body.code === "string" ? body.code.trim().toUpperCase() : "";
    if (!code || !/^[A-Z0-9_-]{3,30}$/.test(code)) {
      return fail("Mã code không hợp lệ (3-30 ký tự, chỉ chữ in hoa, số, -, _).", 400);
    }

    // Check unique
    const { data: existing } = await client.from("vouchers").select("id").eq("code", code).maybeSingle();
    if (existing) {
      return fail("Mã code đã tồn tại.", 409);
    }

    // Validate discount_type
    const discountType = body.discount_type;
    if (!ALLOWED_DISCOUNT_TYPES.includes(discountType)) {
      return fail("Loại giảm giá không hợp lệ.", 400);
    }

    // Validate discount_value
    let discountValue: number | null = null;
    if (discountType !== "free") {
      discountValue = Number(body.discount_value);
      if (!Number.isFinite(discountValue) || discountValue <= 0) {
        return fail("Giá trị giảm phải là số dương.", 400);
      }
      if (discountType === "percentage" && discountValue > 100) {
        return fail("Phần trăm giảm không được vượt quá 100%.", 400);
      }
    }

    // Validate max_discount_vnd (only for percentage)
    const maxDiscountVnd = discountType === "percentage" && body.max_discount_vnd != null
      ? Number(body.max_discount_vnd)
      : null;
    if (maxDiscountVnd !== null && (!Number.isFinite(maxDiscountVnd) || maxDiscountVnd <= 0)) {
      return fail("Giảm tối đa phải là số dương.", 400);
    }

    // Validate min_order_vnd
    const minOrderVnd = body.min_order_vnd != null ? Number(body.min_order_vnd) : 0;
    if (!Number.isFinite(minOrderVnd) || minOrderVnd < 0) {
      return fail("Đơn tối thiểu không hợp lệ.", 400);
    }

    // Validate max_uses
    const maxUses = body.max_uses != null ? Number(body.max_uses) : null;
    if (maxUses !== null && (!Number.isFinite(maxUses) || maxUses <= 0)) {
      return fail("Giới hạn lượt dùng không hợp lệ.", 400);
    }

    // Validate max_uses_per_user
    const maxUsesPerUser = body.max_uses_per_user != null ? Number(body.max_uses_per_user) : 1;
    if (!Number.isFinite(maxUsesPerUser) || maxUsesPerUser <= 0) {
      return fail("Giới hạn lượt/user không hợp lệ.", 400);
    }

    // Validate target_type
    const targetType = body.target_type ?? "all";
    if (!ALLOWED_TARGET_TYPES.includes(targetType)) {
      return fail("Đối tượng không hợp lệ.", 400);
    }

    // Validate scope
    const scope = body.scope ?? "sitewide";
    if (!ALLOWED_SCOPES.includes(scope)) {
      return fail("Phạm vi không hợp lệ.", 400);
    }

    // Validate user_id (required when scope = specific_user)
    let userId: string | null = null;
    if (scope === "specific_user") {
      userId = typeof body.user_id === "string" ? body.user_id.trim() : "";
      if (!userId) {
        return fail("Cần chọn user khi phạm vi là specific_user.", 400);
      }
      // Verify user exists
      const { data: userProfile } = await client.from("profiles").select("id").eq("id", userId).maybeSingle();
      if (!userProfile) {
        return fail("User không tồn tại.", 400);
      }
    }

    // Validate expires_at
    const expiresAtRaw = typeof body.expires_at === "string" ? body.expires_at.trim() : "";
    if (!expiresAtRaw) {
      return fail("Ngày hết hạn là bắt buộc.", 400);
    }
    const expiresAt = toUtcIso(expiresAtRaw);
    if (!expiresAt) return fail("Ngày hết hạn không hợp lệ.", 400);

    // Validate starts_at (optional)
    const startsAt = toUtcIso(typeof body.starts_at === "string" ? body.starts_at.trim() : null);

    // Validate status
    const status = body.status ?? "draft";
    if (!ALLOWED_STATUSES.includes(status)) {
      return fail("Trạng thái không hợp lệ.", 400);
    }

    const { data: voucher, error } = await client
      .from("vouchers")
      .insert({
        code,
        description: typeof body.description === "string" ? body.description.trim() : null,
        terms: typeof body.terms === "string" ? body.terms.trim() : null,
        discount_type: discountType,
        discount_value: discountValue,
        max_discount_vnd: maxDiscountVnd,
        min_order_vnd: minOrderVnd,
        max_uses: maxUses,
        max_uses_per_user: maxUsesPerUser,
        target_type: targetType,
        scope,
        user_id: userId,
        is_public: Boolean(body.is_public),
        status,
        starts_at: startsAt,
        expires_at: expiresAt,
        created_by: auth.actor.id,
      })
      .select("*")
      .single();

    if (error) return fail("Không thể tạo voucher.", 400, error);

    // Insert voucher_courses if scope = specific_courses
    if (scope === "specific_courses" && Array.isArray(body.course_ids)) {
      const courseIds = body.course_ids.filter(
        (id: unknown) => typeof id === "string" && id.trim()
      );
      if (courseIds.length > 0) {
        const rows = courseIds.map((cid: string) => ({
          voucher_id: voucher.id,
          course_id: cid,
        }));
        await client.from("voucher_courses").insert(rows);
      }
    }

    // Fetch full voucher with courses
    const { data: full } = await client
      .from("vouchers")
      .select("*, voucher_courses(course_id)")
      .eq("id", voucher.id)
      .single();

    return ok(full, 201);
  } catch (error) {
    return fail("Không thể tạo voucher.", 500, error);
  }
}
