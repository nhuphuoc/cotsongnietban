import { requireAdminActor } from "@/lib/api/auth";
import { fail, ok } from "@/lib/api/http";
import { signBunnyStreamEmbedUrl } from "@/lib/bunny/stream-signing";

function toYouTubeEmbedUrl(raw: string): string | null {
  const input = raw.trim();
  if (!input) return null;

  const directId = /^[a-zA-Z0-9_-]{11}$/;
  if (directId.test(input)) {
    return `https://www.youtube.com/embed/${input}`;
  }

  try {
    const u = new URL(input);
    const host = u.hostname.toLowerCase();
    if (host === "youtu.be") {
      const id = u.pathname.split("/").filter(Boolean)[0];
      return id && directId.test(id) ? `https://www.youtube.com/embed/${id}` : null;
    }
    if (host.includes("youtube.com")) {
      const v = u.searchParams.get("v");
      if (v && directId.test(v)) return `https://www.youtube.com/embed/${v}`;
      const parts = u.pathname.split("/").filter(Boolean);
      const idx = parts.findIndex((p) => p === "embed" || p === "shorts");
      const id = idx >= 0 ? parts[idx + 1] : null;
      return id && directId.test(id) ? `https://www.youtube.com/embed/${id}` : null;
    }
  } catch {
    return null;
  }

  return null;
}

export async function POST(request: Request) {
  const auth = await requireAdminActor();
  if (!auth.actor) return fail(auth.message ?? "Forbidden", auth.status);

  try {
    const body = (await request.json()) as {
      videoProvider?: string | null;
      videoUrl?: string | null;
    };
    const provider = String(body.videoProvider ?? "").trim().toLowerCase();
    const rawUrl = String(body.videoUrl ?? "").trim();

    if (!provider) return fail("Thiếu videoProvider.", 400);
    if (!rawUrl) return fail("Thiếu videoUrl.", 400);

    if (provider === "youtube") {
      const embedUrl = toYouTubeEmbedUrl(rawUrl);
      if (!embedUrl) return fail("YouTube URL/ID không hợp lệ để preview.", 400);
      return ok({ kind: "iframe", url: embedUrl });
    }

    if (provider === "mp4") {
      return ok({ kind: "video", url: rawUrl });
    }

    if (provider === "bunny_stream") {
      const signed = signBunnyStreamEmbedUrl(rawUrl);
      if (!signed) {
        return fail("Không tạo được URL playback Bunny. Kiểm tra GUID/URL hoặc cấu hình Bunny.", 400);
      }
      return ok({ kind: "iframe", url: signed.url, expiresAt: signed.expiresAt });
    }

    return fail("videoProvider không hỗ trợ preview.", 400);
  } catch (error) {
    return fail("Không tạo được preview playback.", 500, error);
  }
}
