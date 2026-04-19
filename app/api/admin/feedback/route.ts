import { requireAdminActor } from "@/lib/api/auth";
import { ok, fail } from "@/lib/api/http";
import { listFeedbacks } from "@/lib/api/repositories";
import { createAdminClient } from "@/utils/supabase/admin";

const ALLOWED_TYPES = new Set(["before_after", "testimonial", "comment"]);

export async function GET() {
  const auth = await requireAdminActor();
  if (!auth.actor) return fail(auth.message ?? "Forbidden", auth.status);

  try {
    return ok(await listFeedbacks());
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
        customer_name: body.customerName ?? null,
        customer_info: body.customerInfo ?? null,
        content: body.content ?? null,
        avatar_url: body.avatarUrl ?? null,
        image_url_1: body.imageUrl1 ?? null,
        image_url_2: body.imageUrl2 ?? null,
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
