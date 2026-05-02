import { requireAdminActor } from "@/lib/api/auth";
import { ok, fail } from "@/lib/api/http";
import { slugify } from "@/lib/api/repositories";
import { extractBunnyVideoGuid } from "@/lib/bunny/stream-signing";
import { createAdminClient } from "@/utils/supabase/admin";

const ALLOWED_PROVIDERS = new Set(["bunny_stream", "youtube", "mp4", "article"]);

function plainFromHtml(html: string): string {
  return String(html ?? "")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<\/?[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

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
      summary?: string | null;
      contentHtml?: string | null;
      isPreview?: boolean;
      isPublished?: boolean;
    };

    if (!body.courseId) return fail("Thiếu courseId.", 400);
    if (!body.title?.trim()) return fail("Thiếu title.", 400);

    const providerRaw = String(body.videoProvider ?? "").trim().toLowerCase();
    if (!providerRaw || !ALLOWED_PROVIDERS.has(providerRaw)) {
      return fail("Chọn loại video / loại bài học.", 400);
    }

    const contentHtmlTrimmed = typeof body.contentHtml === "string" ? body.contentHtml.trim() : "";
    if (!plainFromHtml(contentHtmlTrimmed)) {
      return fail("Nội dung chi tiết không được để trống.", 400);
    }

    let insertVideoUrl: string | null = null;
    if (providerRaw !== "article") {
      const rawUrl = String(body.videoUrl ?? "").trim();
      if (!rawUrl) {
        return fail("Thiếu GUID / URL video.", 400);
      }
      if (providerRaw === "bunny_stream") {
        const guid = extractBunnyVideoGuid(rawUrl);
        if (!guid) {
          return fail("videoUrl phải là Bunny Video GUID hợp lệ hoặc URL Bunny.", 400);
        }
        insertVideoUrl = guid;
      } else {
        insertVideoUrl = rawUrl;
      }
    }

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

    const { data: anySection, error: secListErr } = await client
      .from("course_sections")
      .select("id")
      .eq("course_id", body.courseId)
      .limit(1);
    if (!secListErr && anySection && anySection.length > 0) {
      const sid = typeof body.sectionId === "string" ? body.sectionId.trim() : "";
      if (!sid) {
        return fail("Khóa học có phần học — vui lòng chọn phần học cho bài này.", 400);
      }
    }

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

    const { data, error } = await client
      .from("lessons")
      .insert({
        course_id: body.courseId,
        section_id: body.sectionId ?? null,
        title: body.title.trim(),
        slug: finalSlug,
        video_provider: providerRaw,
        video_url: insertVideoUrl,
        duration_seconds: body.durationSeconds ?? 0,
        summary: body.summary?.trim() || null,
        content_html: contentHtmlTrimmed || null,
        sort_order: nextSortOrder,
        is_preview: Boolean(body.isPreview),
        is_published: Boolean(body.isPublished),
      })
      .select("*")
      .single();

    if (error) return fail("Không thể tạo bài học.", 400, error);
    return ok(data, 201);
  } catch (error) {
    return fail("Không thể tạo bài học.", 500, error);
  }
}
