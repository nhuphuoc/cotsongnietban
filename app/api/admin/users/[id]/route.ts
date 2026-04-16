import { requireAdminActor } from "@/lib/api/auth";
import { ok, fail } from "@/lib/api/http";
import { compactPatch, getProfileById } from "@/lib/api/repositories";
import { createAdminClient } from "@/utils/supabase/admin";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminActor();
  if (!auth.actor) return fail(auth.message ?? "Forbidden", auth.status);

  try {
    const { id } = await params;
    const profile = await getProfileById(id);
    if (!profile) return fail("Không tìm thấy người dùng.", 404);
    return ok(profile);
  } catch (error) {
    return fail("Không thể tải người dùng.", 500, error);
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminActor();
  if (!auth.actor) return fail(auth.message ?? "Forbidden", auth.status);

  try {
    const { id } = await params;
    const body = await request.json();
    const patch = compactPatch({
      full_name: body.fullName,
      avatar_url: body.avatarUrl,
      phone: body.phone,
      role: body.role,
      is_active: body.isActive,
    });

    const client = createAdminClient();
    const { data, error } = await client.from("profiles").update(patch).eq("id", id).select("*").single();
    if (error) return fail("Không thể cập nhật người dùng.", 400, error);
    return ok(data);
  } catch (error) {
    return fail("Không thể cập nhật người dùng.", 500, error);
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminActor();
  if (!auth.actor) return fail(auth.message ?? "Forbidden", auth.status);

  try {
    const { id } = await params;
    const client = createAdminClient();
    const { error } = await client.from("profiles").delete().eq("id", id);
    if (error) return fail("Không thể xóa người dùng.", 400, error);
    return ok({ id, deleted: true });
  } catch (error) {
    return fail("Không thể xóa người dùng.", 500, error);
  }
}
