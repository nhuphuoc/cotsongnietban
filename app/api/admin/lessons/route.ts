import { requireAdminActor } from "@/lib/api/auth";
import { ok, fail } from "@/lib/api/http";
import { slugify } from "@/lib/api/repositories";
import { createAdminClient } from "@/utils/supabase/admin";

const ALLOWED_PROVIDERS = new Set(["bunny_stream", "youtube", "mp4"]);

export async function POST(request: Request) {
  const auth = await requireAdminActor();
  if (!auth.actor) return fail(auth.message ?? "Forbidden", auth.status);

  try {
    const body = await request.json() as {
      courseId: string;
      title: string;
      sectionId?: string | null;
      videoProvider?: string | null;
      videoUrl?: string | null;
      durationSeconds?: number | null;
    };

    if (!body.courseId) return fail("Thiếu courseId.", 400);
    if (!body.title?.trim()) return fail("Thiếu title.", 400);

    const client = createAdminClient();

    // Determine next sort_order for this course
    const { data: existing, error: countError } = await client
      .from("lessons")
      .select("sort_order")
      .eq("course_id", body.courseId)
      .order("sort_order", { ascending: false })
      .limit(1);

    if (countError) return fail("Không xác định được sort_order.", 400, countError);
    const nextSortOrder = existing && existing.length > 0 ? (existing[0].sort_order ?? 0) + 1 : 1;

    // Derive a unique slug
    const baseSlug = slugify(body.title.trim());
    const { data: slugCheck } = await client
      .from("lessons")
      .select("slug")
      .eq("course_id", body.courseId)
      .like("slug", `${baseSlug}%`);

    const usedSlugs = new Set((slugCheck ?? []).map((r) => r.slug as string));
    let finalSlug = baseSlug;
    if (usedSlugs.has(finalSlug)) {
      let n = 2;
      while (usedSlugs.has(`${baseSlug}-${n}`)) n++;
      finalSlug = `${baseSlug}-${n}`;
    }

    let videoProvider: string | null = null;
    if (body.videoProvider && ALLOWED_PROVIDERS.has(body.videoProvider)) {
      videoProvider = body.videoProvider;
    }

    const { data, error } = await client
      .from("lessons")
      .insert({
        course_id: body.courseId,
        section_id: body.sectionId ?? null,
        title: body.title.trim(),
        slug: finalSlug,
        video_provider: videoProvider,
        video_url: body.videoUrl?.trim() || null,
        duration_seconds: body.durationSeconds ?? 0,
        sort_order: nextSortOrder,
        is_published: false,
        kind: "video",
      })
      .select("*")
      .single();

    if (error) return fail("Không thể tạo bài học.", 400, error);
    return ok(data, 201);
  } catch (error) {
    return fail("Không thể tạo bài học.", 500, error);
  }
}
