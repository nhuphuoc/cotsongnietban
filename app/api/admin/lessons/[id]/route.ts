import { requireAdminActor } from "@/lib/api/auth";
import { fail, ok } from "@/lib/api/http";
import { compactPatch } from "@/lib/api/repositories";
import { extractBunnyVideoGuid } from "@/lib/bunny/stream-signing";
import { createAdminClient } from "@/utils/supabase/admin";

const ALLOWED_PROVIDERS = new Set(["bunny_stream", "youtube", "mp4"]);

function normalizeNullableText(value: unknown): string | null | undefined {
  if (value === undefined) return undefined;
  if (value === null) return null;
  const str = String(value);
  const trimmed = str.trim();
  if (trimmed === "") return null;
  return str;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminActor();
  if (!auth.actor) return fail(auth.message ?? "Forbidden", auth.status);

  try {
    const { id } = await params;
    const client = createAdminClient();
    const { data, error } = await client.from("lessons").select("*").eq("id", id).maybeSingle();
    if (error) return fail("Không tải được bài học.", 400, error);
    if (!data) return fail("Không tìm thấy bài học.", 404);
    return ok(data);
  } catch (error) {
    return fail("Không tải được bài học.", 500, error);
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
      videoProvider?: string | null;
      videoUrl?: string | null;
      durationSeconds?: number | null;
      sectionId?: string | null;
      sortOrder?: number;
      title?: string;
      summary?: string | null;
      contentHtml?: string | null;
      isPreview?: boolean;
      isPublished?: boolean;
    };

    let videoProvider: string | null | undefined;
    if (body.videoProvider === undefined) {
      videoProvider = undefined;
    } else if (body.videoProvider === null || body.videoProvider === "") {
      videoProvider = null;
    } else {
      const v = String(body.videoProvider).trim().toLowerCase();
      if (!ALLOWED_PROVIDERS.has(v)) {
        return fail(`videoProvider không hợp lệ (phải là một trong: ${[...ALLOWED_PROVIDERS].join(", ")}).`, 400);
      }
      videoProvider = v;
    }

    let videoUrl: string | null | undefined;
    if (body.videoUrl === undefined) {
      videoUrl = undefined;
    } else if (body.videoUrl === null || String(body.videoUrl).trim() === "") {
      videoUrl = null;
    } else {
      const raw = String(body.videoUrl).trim();
      if (videoProvider === "bunny_stream") {
        const guid = extractBunnyVideoGuid(raw);
        if (!guid) {
          return fail("videoUrl phải là Bunny Video GUID hợp lệ (UUID) hoặc URL embed/play của Bunny.", 400);
        }
        videoUrl = guid;
      } else {
        videoUrl = raw;
      }
    }

    let durationSeconds: number | null | undefined;
    if (body.durationSeconds === undefined) {
      durationSeconds = undefined;
    } else if (body.durationSeconds === null) {
      durationSeconds = null;
    } else {
      const n = Number(body.durationSeconds);
      if (!Number.isFinite(n) || n < 0) {
        return fail("durationSeconds phải là số nguyên không âm.", 400);
      }
      durationSeconds = Math.floor(n);
    }

    let sortOrder: number | undefined;
    if (body.sortOrder !== undefined) {
      const n = Number(body.sortOrder);
      if (!Number.isFinite(n) || n < 0) {
        return fail("sortOrder phải là số nguyên không âm.", 400);
      }
      sortOrder = Math.floor(n);
    }

    const sectionId =
      body.sectionId === undefined
        ? undefined
        : body.sectionId === null || String(body.sectionId).trim() === ""
          ? null
          : String(body.sectionId).trim();

    let title: string | undefined;
    if (body.title !== undefined) {
      const trimmed = String(body.title).trim();
      if (trimmed === "") {
        return fail("Tên bài học không được để trống.", 400);
      }
      title = trimmed;
    }

    const summary = normalizeNullableText(body.summary);
    const contentHtml = normalizeNullableText(body.contentHtml);

    let isPublished: boolean | undefined;
    if (body.isPublished !== undefined) {
      isPublished = Boolean(body.isPublished);
    }

    let isPreview: boolean | undefined;
    if (body.isPreview !== undefined) {
      isPreview = Boolean(body.isPreview);
    }

    const patch = compactPatch({
      video_provider: videoProvider,
      video_url: videoUrl,
      duration_seconds: durationSeconds,
      section_id: sectionId,
      sort_order: sortOrder,
      title,
      summary,
      content_html: contentHtml,
      is_preview: isPreview,
      is_published: isPublished,
    });

    if (Object.keys(patch).length === 0) {
      return fail("Không có trường nào để cập nhật.", 400);
    }

    const client = createAdminClient();
    const { data, error } = await client
      .from("lessons")
      .update(patch)
      .eq("id", id)
      .select("*")
      .single();

    if (error) return fail("Không thể cập nhật bài học.", 400, error);
    return ok(data);
  } catch (error) {
    return fail("Không thể cập nhật bài học.", 500, error);
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
    const { error } = await client.from("lessons").delete().eq("id", id);
    if (error) return fail("Không thể xoá bài học.", 400, error);
    return ok({ id, deleted: true });
  } catch (error) {
    return fail("Không thể xoá bài học.", 500, error);
  }
}
