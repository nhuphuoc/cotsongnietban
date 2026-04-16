import { requireAdminActor } from "@/lib/api/auth";
import { ok, fail } from "@/lib/api/http";
import { listFeedbacks } from "@/lib/api/repositories";
import { createAdminClient } from "@/utils/supabase/admin";

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
    if (!body.name || !body.messageHtml || !body.rating) {
      return fail("Thiếu name, rating hoặc messageHtml.");
    }

    const client = createAdminClient();
    const { data, error } = await client
      .from("feedbacks")
      .insert({
        user_id: body.userId ?? null,
        course_id: body.courseId ?? null,
        source: body.source ?? "website",
        name: body.name,
        email: body.email ?? null,
        avatar_url: body.avatarUrl ?? null,
        rating: body.rating,
        message_html: body.messageHtml,
        internal_note_html: body.internalNoteHtml ?? null,
        status: body.status ?? "new",
        is_public: body.isPublic ?? false,
      })
      .select("*")
      .single();

    if (error) return fail("Không thể tạo feedback.", 400, error);
    return ok(data, 201);
  } catch (error) {
    return fail("Không thể tạo feedback.", 500, error);
  }
}
