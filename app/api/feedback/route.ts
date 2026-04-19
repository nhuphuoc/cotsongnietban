import { ok, fail } from "@/lib/api/http";
import { createAdminClient } from "@/utils/supabase/admin";

const ALLOWED_TYPES = new Set(["before_after", "testimonial", "comment"]);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");

    const client = createAdminClient();
    let query = client
      .from("feedbacks")
      .select("id, type, customer_name, customer_info, content, avatar_url, image_url_1, image_url_2, created_at")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(60);

    if (type && ALLOWED_TYPES.has(type)) {
      query = query.eq("type", type);
    }

    const { data, error } = await query;
    if (error) return fail("Không thể tải feedback.", 400, error);
    return ok(data ?? []);
  } catch (error) {
    return fail("Không thể tải feedback.", 500, error);
  }
}

