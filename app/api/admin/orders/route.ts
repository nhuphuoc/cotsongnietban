import { requireAdminActor } from "@/lib/api/auth";
import { parsePageParams } from "@/lib/api/admin-query";
import { ok, fail } from "@/lib/api/http";
import { listOrdersPaginated } from "@/lib/api/repositories";

const SORTS = new Set(["created_at", "total_vnd", "customer_name", "status"]);
const FILTERS = new Set(["all", "pending", "approved"]);

export async function GET(request: Request) {
  const auth = await requireAdminActor();
  if (!auth.actor) return fail(auth.message ?? "Forbidden", auth.status);

  try {
    const url = new URL(request.url);
    const { page, pageSize } = parsePageParams(url);
    const statusRaw = url.searchParams.get("status") || "all";
    const statusFilter = FILTERS.has(statusRaw) ? (statusRaw as "all" | "pending" | "approved") : "all";
    const search = url.searchParams.get("q") ?? undefined;
    const sortRaw = url.searchParams.get("sort") || "created_at";
    const sortBy = SORTS.has(sortRaw) ? (sortRaw as "created_at" | "total_vnd" | "customer_name" | "status") : "created_at";
    const dirRaw = url.searchParams.get("dir");
    const sortDir = dirRaw === "asc" ? "asc" : "desc";

    const result = await listOrdersPaginated({
      page,
      pageSize,
      statusFilter,
      search: search?.trim() || undefined,
      sortBy,
      sortDir,
    });
    return ok(result);
  } catch (error) {
    return fail("Không thể tải đơn hàng.", 500, error);
  }
}
