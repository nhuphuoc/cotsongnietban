import { NextResponse } from "next/server";
import { requireAdminActor } from "@/lib/api/auth";
import { ok, fail } from "@/lib/api/http";
import { createAdminClient } from "@/utils/supabase/admin";
import { toUtcIso } from "@/lib/api/vouchers";

const ALLOWED_SCOPES = ["sitewide", "specific_courses", "specific_user"];
const ALLOWED_DISCOUNT_TYPES = ["percentage", "fixed_amount", "free"];
const ALLOWED_TARGET_TYPES = ["all", "new_users"];
const ALLOWED_STATUSES = ["draft", "active", "paused", "expired"];

// ============================================================
// GET /api/admin/vouchers/[id] — chi tiết
// ============================================================
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminActor();
  if (!auth.actor) return fail(auth.message ?? "Forbidden", auth.status);

  try {
    const { id } = await params;
    const client = createAdminClient();

    const { data, error } = await client
      .from("vouchers")
      .select("*, voucher_courses(course_id)")
      .eq("id", id)
      .single();

    if (error || !data) return fail("Không tìm thấy voucher.", 404, error);
    return ok(data);
  } catch (error) {
    return fail("Không thể tải voucher.", 500, error);
  }
}

// ============================================================
// PATCH /api/admin/vouchers/[id] — cập nhật
// ============================================================
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminActor();
  if (!auth.actor) return fail(auth.message ?? "Forbidden", auth.status);

  try {
    const { id } = await params;
    const body = await request.json();
    const client = createAdminClient();

    // Kiểm tra tồn tại
    const { data: existing } = await client.from("vouchers").select("id, code").eq("id", id).single();
    if (!existing) return fail("Không tìm thấy voucher.", 404);

    const updates: Record<string, unknown> = {};

    // Description
    if (typeof body.description === "string") {
      updates.description = body.description.trim() || null;
    }

    // Terms
    if (typeof body.terms === "string") {
      updates.terms = body.terms.trim() || null;
    }

    // Discount type
    if (typeof body.discount_type === "string" && ALLOWED_DISCOUNT_TYPES.includes(body.discount_type)) {
      updates.discount_type = body.discount_type;
    }

    // Discount value
    if (body.discount_value !== undefined) {
      const val = Number(body.discount_value);
      if (Number.isFinite(val) && val > 0) {
        const dt = (updates.discount_type ?? existing.code ? body.discount_type : null) as string | null;
        if (dt === "percentage" && val > 100) {
          return fail("Phần trăm giảm không được vượt quá 100%.", 400);
        }
        updates.discount_value = val;
      }
    }

    // Max discount
    if (body.max_discount_vnd !== undefined) {
      const val = Number(body.max_discount_vnd);
      updates.max_discount_vnd = Number.isFinite(val) && val > 0 ? val : null;
    }

    // Min order
    if (body.min_order_vnd !== undefined) {
      const val = Number(body.min_order_vnd);
      if (Number.isFinite(val) && val >= 0) updates.min_order_vnd = val;
    }

    // Max uses
    if (body.max_uses !== undefined) {
      const val = Number(body.max_uses);
      updates.max_uses = Number.isFinite(val) && val > 0 ? val : null;
    }

    // Max uses per user
    if (body.max_uses_per_user !== undefined) {
      const val = Number(body.max_uses_per_user);
      if (Number.isFinite(val) && val > 0) updates.max_uses_per_user = val;
    }

    // Target type
    if (typeof body.target_type === "string" && ALLOWED_TARGET_TYPES.includes(body.target_type)) {
      updates.target_type = body.target_type;
    }

    // Scope
    if (typeof body.scope === "string" && ALLOWED_SCOPES.includes(body.scope)) {
      updates.scope = body.scope;
    }

    // User
    if (body.user_id !== undefined) {
      updates.user_id = typeof body.user_id === "string" && body.user_id.trim() ? body.user_id.trim() : null;
    }

    // Is public
    if (typeof body.is_public === "boolean") {
      updates.is_public = body.is_public;
    }

    // Status
    if (typeof body.status === "string" && ALLOWED_STATUSES.includes(body.status)) {
      updates.status = body.status;
    }

    // Dates — convert datetime-local to UTC
    if (typeof body.starts_at === "string") {
      updates.starts_at = toUtcIso(body.starts_at.trim());
    }
    if (typeof body.expires_at === "string") {
      const val = toUtcIso(body.expires_at.trim());
      if (val) updates.expires_at = val;
    }

    const { data: updated, error } = await client
      .from("vouchers")
      .update(updates)
      .eq("id", id)
      .select("*, voucher_courses(course_id)")
      .single();

    if (error) return fail("Không thể cập nhật voucher.", 400, error);

    // Update voucher_courses
    if (Array.isArray(body.course_ids)) {
      // Xóa cũ
      await client.from("voucher_courses").delete().eq("voucher_id", id);
      // Thêm mới
      const courseIds = body.course_ids.filter(
        (cid: unknown) => typeof cid === "string" && cid.trim()
      );
      if (courseIds.length > 0) {
        await client.from("voucher_courses").insert(
          courseIds.map((cid: string) => ({ voucher_id: id, course_id: cid }))
        );
      }
      // Fetch lại với courses
      const { data: reloaded } = await client
        .from("vouchers")
        .select("*, voucher_courses(course_id)")
        .eq("id", id)
        .single();
      return ok(reloaded ?? updated);
    }

    return ok(updated);
  } catch (error) {
    return fail("Không thể cập nhật voucher.", 500, error);
  }
}

// ============================================================
// DELETE /api/admin/vouchers/[id] — xóa (chỉ draft)
// ============================================================
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminActor();
  if (!auth.actor) return fail(auth.message ?? "Forbidden", auth.status);

  try {
    const { id } = await params;
    const client = createAdminClient();

    // Chỉ cho xóa voucher draft (chưa có usage)
    const { data: existing } = await client.from("vouchers").select("id, status, used_count").eq("id", id).single();

    if (!existing) return fail("Không tìm thấy voucher.", 404);
    if (existing.status !== "draft") {
      return fail("Chỉ có thể xóa voucher ở trạng thái nháp.", 400);
    }

    await client.from("voucher_courses").delete().eq("voucher_id", id);
    const { error } = await client.from("vouchers").delete().eq("id", id);

    if (error) return fail("Không thể xóa voucher.", 400, error);
    return ok({ deleted: true });
  } catch (error) {
    return fail("Không thể xóa voucher.", 500, error);
  }
}
