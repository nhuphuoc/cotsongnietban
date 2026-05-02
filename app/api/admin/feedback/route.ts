import { requireAdminActor } from "@/lib/api/auth";
import { parsePageParams } from "@/lib/api/admin-query";
import { ok, fail } from "@/lib/api/http";
import { getFeedbackTabCounts, listFeedbacksPaginated } from "@/lib/api/repositories";
import { createAdminClient } from "@/utils/supabase/admin";

const ALLOWED_TYPES = new Set(["before_after", "testimonial", "comment"]);

export async function GET(request: Request) {
  const auth = await requireAdminActor();
  if (!auth.actor) return fail(auth.message ?? "Forbidden", auth.status);

  try {
    const url = new URL(request.url);
    if (url.searchParams.get("meta") === "1") {
      return ok(await getFeedbackTabCounts());
    }

    const { page, pageSize } = parsePageParams(url);
    const typeRaw = url.searchParams.get("type") || "all";
    const type = typeRaw !== "all" && ALLOWED_TYPES.has(typeRaw) ? typeRaw : undefined;
    const search = url.searchParams.get("q") ?? undefined;
    const SORTS = new Set(["created_at", "customer_name", "type", "is_active", "content"]);
    const sortRaw = url.searchParams.get("sort") || "created_at";
    const sortBy = SORTS.has(sortRaw) ? (sortRaw as "created_at" | "customer_name" | "type" | "is_active" | "content") : "created_at";
    const sortDir = url.searchParams.get("dir") === "asc" ? "asc" : "desc";

    const result = await listFeedbacksPaginated({
      page,
      pageSize,
      type: type ?? "all",
      search: search?.trim() || undefined,
      sortBy,
      sortDir,
    });
    return ok(result);
  } catch (error) {
    return fail("Không thể tải feedback.", 500, error);
  }
}

export async function POST(request: Request) {
  const auth = await requireAdminActor();
  if (!auth.actor) return fail(auth.message ?? "Forbidden", auth.status);

  try {
    const body = await request.json();
    const type = typeof body.type === "string" ? body.type : "";
    if (!type || !ALLOWED_TYPES.has(type)) {
      return fail("type phải là 'before_after', 'testimonial' hoặc 'comment'.");
    }

    const client = createAdminClient();
    const { data, error } = await client
      .from("feedbacks")
      .insert({
        type,
        customer_name: typeof body.customerName === "string" ? body.customerName.trim() || null : null,
        customer_info: typeof body.customerInfo === "string" ? body.customerInfo.trim() || null : null,
        content: typeof body.content === "string" ? body.content.trim() || null : null,
        avatar_url: typeof body.avatarUrl === "string" ? body.avatarUrl.trim() || null : null,
        image_url_1: typeof body.imageUrl1 === "string" ? body.imageUrl1.trim() || null : null,
        image_url_2: typeof body.imageUrl2 === "string" ? body.imageUrl2.trim() || null : null,
        is_active: body.isActive !== false,
      })
      .select("*")
      .single();

    if (error) return fail("Không thể tạo feedback.", 400, error);
    return ok(data, 201);
  } catch (error) {
    return fail("Không thể tạo feedback.", 500, error);
  }
}
