import { requireAdminActor } from "@/lib/api/auth";
import { parsePageParams } from "@/lib/api/admin-query";
import { ok, fail } from "@/lib/api/http";
import { listProfilesPaginated } from "@/lib/api/repositories";

const SORTS = new Set(["created_at", "full_name", "role", "is_active"]);
const ROLES = new Set(["all", "admin", "coach", "student"]);

export async function GET(request: Request) {
  const auth = await requireAdminActor();
  if (!auth.actor) return fail(auth.message ?? "Forbidden", auth.status);

  try {
    const url = new URL(request.url);
    const { page, pageSize } = parsePageParams(url);
    const roleRaw = url.searchParams.get("role") || "all";
    const role = ROLES.has(roleRaw) ? (roleRaw as "all" | "admin" | "coach" | "student") : "all";
    const search = url.searchParams.get("q") ?? undefined;
    const sortRaw = url.searchParams.get("sort") || "created_at";
    const sortBy = SORTS.has(sortRaw) ? (sortRaw as "created_at" | "full_name" | "role" | "is_active") : "created_at";
    const dirRaw = url.searchParams.get("dir");
    const sortDir = dirRaw === "asc" ? "asc" : "desc";

    const result = await listProfilesPaginated({
      page,
      pageSize,
      role,
      search: search?.trim() || undefined,
      sortBy,
      sortDir,
    });
    return ok(result);
  } catch (error) {
    return fail("Không thể tải danh sách người dùng.", 500, error);
  }
}
