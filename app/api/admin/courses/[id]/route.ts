import { requireAdminActor } from "@/lib/api/auth";
import { ok, fail } from "@/lib/api/http";
import { compactPatch, getCourseByIdentifier, slugify } from "@/lib/api/repositories";
import { createAdminClient } from "@/utils/supabase/admin";

const ALLOWED_STATUS = new Set(["draft", "published", "archived"]);

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminActor();
  if (!auth.actor) return fail(auth.message ?? "Forbidden", auth.status);

  try {
    const { id } = await params;
    const course = await getCourseByIdentifier(id);
    if (!course) return fail("Không tìm thấy khóa học.", 404);
    return ok(course);
  } catch (error) {
    return fail("Không thể tải khóa học.", 500, error);
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminActor();
  if (!auth.actor) return fail(auth.message ?? "Forbidden", auth.status);

  try {
    const { id } = await params;
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
      isFeatured?: boolean;
      status?: string;
      publishedAt?: string | null;
    };

    if (body.title !== undefined && !String(body.title).trim()) {
      return fail("title không được để trống.", 400);
    }

    if (body.slug !== undefined && !String(body.slug).trim()) {
      return fail("slug không được để trống.", 400);
    }

    let priceVnd: number | undefined;
    if (body.priceVnd !== undefined) {
      const n = Number(body.priceVnd);
      if (!Number.isFinite(n) || n < 0) return fail("priceVnd phải >= 0.", 400);
      priceVnd = Math.floor(n);
    }

    let accessDurationDays: number | null | undefined;
    if (body.accessDurationDays !== undefined) {
      if (body.accessDurationDays === null) {
        accessDurationDays = null;
      } else {
        const n = Number(body.accessDurationDays);
        if (!Number.isFinite(n) || n <= 0) return fail("accessDurationDays phải > 0.", 400);
        accessDurationDays = Math.floor(n);
      }
    }

    if (body.status !== undefined && !ALLOWED_STATUS.has(String(body.status))) {
      return fail("status không hợp lệ (draft/published/archived).", 400);
    }

    const patch = compactPatch({
      title: body.title?.trim(),
      slug: body.slug ?? (body.title ? slugify(body.title) : undefined),
      short_description: body.shortDescription?.trim() || (body.shortDescription === null ? null : undefined),
      description: body.description?.trim() || (body.description === null ? null : undefined),
      extra_info: body.extraInfo?.trim() || (body.extraInfo === null ? null : undefined),
      thumbnail_url: body.thumbnailUrl?.trim() || (body.thumbnailUrl === null ? null : undefined),
      hero_image_url: body.heroImageUrl?.trim() || (body.heroImageUrl === null ? null : undefined),
      trailer_url: body.trailerUrl?.trim() || (body.trailerUrl === null ? null : undefined),
      price_vnd: priceVnd,
      access_duration_days: accessDurationDays,
      access_note: body.accessNote?.trim() || (body.accessNote === null ? null : undefined),
      is_featured: body.isFeatured,
      status: body.status,
      published_at:
        body.status === "published"
          ? body.publishedAt ?? new Date().toISOString()
          : body.status
            ? null
            : undefined,
    });

    const client = createAdminClient();
    const { data, error } = await client.from("courses").update(patch).eq("id", id).select("*").single();
    if (error) return fail("Không thể cập nhật khóa học.", 400, error);
    return ok(data);
  } catch (error) {
    return fail("Không thể cập nhật khóa học.", 500, error);
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminActor();
  if (!auth.actor) return fail(auth.message ?? "Forbidden", auth.status);

  try {
    const { id } = await params;
    const client = createAdminClient();
    const { error } = await client.from("courses").delete().eq("id", id);
    if (error) return fail("Không thể xóa khóa học.", 400, error);
    return ok({ id, deleted: true });
  } catch (error) {
    return fail("Không thể xóa khóa học.", 500, error);
  }
}
