import { ok, fail } from "@/lib/api/http";
import { getSessionActor } from "@/lib/api/auth";
import { createAdminClient } from "@/utils/supabase/admin";

const ALLOWED_SOURCES = new Set(["website", "zalo", "facebook", "email", "other"]);
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Gửi feedback công khai (không cần đăng nhập) — dùng cho form trên site.
 * Ghi vào bảng `feedbacks` qua service role (local dev).
 */
export async function POST(request: Request) {
  try {
    const actor = await getSessionActor();
    const body = await request.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const messageHtml = typeof body.messageHtml === "string" ? body.messageHtml.trim() : "";
    if (!name || !messageHtml) {
      return fail("Thiếu name hoặc messageHtml.");
    }

    const rating = Number(body.rating);
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return fail("rating phải là số nguyên trong khoảng 1–5.");
    }

    const email = typeof body.email === "string" ? body.email.trim() : "";
    if (email && !EMAIL_REGEX.test(email)) {
      return fail("email không hợp lệ.");
    }

    const rawSource = typeof body.source === "string" ? body.source : "website";
    const source = ALLOWED_SOURCES.has(rawSource) ? rawSource : "website";

    const client = createAdminClient();
    const { data, error } = await client
      .from("feedbacks")
      .insert({
        user_id: actor?.id ?? null,
        course_id: body.courseId ?? null,
        source,
        name,
        email: email || null,
        avatar_url: typeof body.avatarUrl === "string" ? body.avatarUrl.trim() || null : null,
        rating,
        message_html: messageHtml,
        status: "new",
        is_public: Boolean(body.isPublic),
      })
      .select("id, created_at")
      .single();

    if (error) return fail("Không thể gửi feedback.", 400, error);
    return ok(data, 201);
  } catch (error) {
    return fail("Không thể gửi feedback.", 500, error);
  }
}
