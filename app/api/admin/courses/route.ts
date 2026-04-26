import { requireAdminActor } from "@/lib/api/auth";
import { ok, fail } from "@/lib/api/http";
import { omitMissingColumnsUntilSuccess } from "@/lib/api/pgrst-schema-compat";
import { listCourses, slugify } from "@/lib/api/repositories";
import { createAdminClient } from "@/utils/supabase/admin";

const ALLOWED_STATUS = new Set(["draft", "published", "archived"]);

export async function GET() {
  const auth = await requireAdminActor();
  if (!auth.actor) return fail(auth.message ?? "Forbidden", auth.status);

  try {
    return ok(await listCourses({ publishedOnly: false }));
  } catch (error) {
    return fail("Không thể tải khóa học admin.", 500, error);
  }
}

export async function POST(request: Request) {
  const auth = await requireAdminActor();
  if (!auth.actor) return fail(auth.message ?? "Forbidden", auth.status);

  try {
    const body = (await request.json()) as {
      title?: string;
      slug?: string;
      shortDescription?: string | null;
      description?: string | null;
      extraInfo?: string | null;
      thumbnailUrl?: string | null;
      heroImageUrl?: string | null;
      trailerUrl?: string | null;
      priceVnd?: number | null;
      accessDurationDays?: number | null;
      accessNote?: string | null;
      status?: string;
      isFeatured?: boolean;
    };
    if (!body.title?.trim()) return fail("Thiếu title.", 400);
    const title = body.title.trim();
    const rawSlug = body.slug?.trim() ?? "";
    const finalSlug = slugify(rawSlug || title);
    if (!finalSlug) return fail("slug không hợp lệ.", 400);

    const status = body.status?.trim() || "draft";
    if (!ALLOWED_STATUS.has(status)) {
      return fail("status không hợp lệ (draft/published/archived).", 400);
    }

    let priceVnd = 0;
    if (body.priceVnd != null) {
      const n = Number(body.priceVnd);
      if (!Number.isFinite(n) || n < 0) return fail("priceVnd phải >= 0.", 400);
      priceVnd = Math.floor(n);
    }

    let accessDurationDays: number | null = null;
    if (body.accessDurationDays != null) {
      const n = Number(body.accessDurationDays);
      if (!Number.isFinite(n) || n <= 0) return fail("accessDurationDays phải > 0.", 400);
      accessDurationDays = Math.floor(n);
    }

    const client = createAdminClient();
    const payloadBase = {
      title,
      slug: finalSlug,
      short_description: body.shortDescription?.trim() || null,
      description: body.description?.trim() || null,
      extra_info: body.extraInfo?.trim() || null,
      thumbnail_url: body.thumbnailUrl?.trim() || null,
      hero_image_url: body.heroImageUrl?.trim() || null,
      trailer_url: body.trailerUrl?.trim() || null,
      price_vnd: priceVnd,
      access_duration_days: accessDurationDays,
      access_note: body.accessNote?.trim() || null,
      is_featured: Boolean(body.isFeatured),
      status,
      published_at: status === "published" ? new Date().toISOString() : null,
    };

    const { data, error } = await omitMissingColumnsUntilSuccess(
      payloadBase as Record<string, unknown>,
      async (p) => await client.from("courses").insert(p).select("*").single()
    );

    if (error) return fail("Không thể tạo khóa học.", 400, error);
    return ok(data, 201);
  } catch (error) {
    return fail("Không thể tạo khóa học.", 500, error);
  }
}
