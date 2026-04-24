import { ok, fail } from "@/lib/api/http";
import { createAdminClient } from "@/utils/supabase/admin";
import { getSessionActor } from "@/lib/api/auth";

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

export async function POST(request: Request) {
  try {
    const body = await request.json() as Record<string, unknown>;
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const messageHtml = typeof body.messageHtml === "string" ? body.messageHtml.trim() : "";

    if (!name || !messageHtml) {
      return fail("Thiếu name hoặc messageHtml.", 400);
    }

    const rating = body.rating != null ? Number(body.rating) : null;
    if (rating == null || !Number.isInteger(rating) || rating < 1 || rating > 5) {
      return fail("rating phải là số nguyên từ 1 đến 5.", 400);
    }

    let email: string | null = null;
    if (body.email != null) {
      const emailStr = typeof body.email === "string" ? body.email.trim() : "";
      if (emailStr.length > 0) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailStr)) {
          return fail("Địa chỉ email không hợp lệ.", 400);
        }
        email = emailStr;
      }
    }

    const actor = await getSessionActor();
    const userId = actor?.id ?? null;

    const client = createAdminClient();
    const { data, error } = await client
      .from("feedbacks")
      .insert({
        name,
        message_html: messageHtml,
        rating,
        email,
        user_id: userId,
        is_public: body.isPublic === true,
        is_active: false,
      })
      .select("id, created_at")
      .single();

    if (error) return fail("Không thể lưu feedback.", 400, error);
    return ok(data, 201);
  } catch (error) {
    return fail("Không thể lưu feedback.", 500, error);
  }
}
