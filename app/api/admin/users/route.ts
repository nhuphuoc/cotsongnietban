import { requireAdminActor } from "@/lib/api/auth";
import { ok, fail } from "@/lib/api/http";
import { listProfiles } from "@/lib/api/repositories";

export async function GET() {
  const auth = await requireAdminActor();
  if (!auth.actor) return fail(auth.message ?? "Forbidden", auth.status);

  try {
    return ok(await listProfiles());
  } catch (error) {
    return fail("Không thể tải danh sách người dùng.", 500, error);
  }
}
