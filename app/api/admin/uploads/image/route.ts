import { randomUUID } from "node:crypto";
import { requireAdminActor } from "@/lib/api/auth";
import { fail, ok } from "@/lib/api/http";
import { createAdminClient } from "@/utils/supabase/admin";

const BUCKET = "blog-media";
const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

function extFromMime(mime: string): string {
  switch (mime) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    case "image/gif":
      return "gif";
    default:
      return "img";
  }
}

export async function POST(request: Request) {
  const auth = await requireAdminActor();
  if (!auth.actor) {
    return fail(auth.message ?? "Forbidden", auth.status);
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return fail("Không đọc được form gửi lên.", 400);
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return fail("Thiếu file (field name: file).", 400);
  }

  if (!ALLOWED.has(file.type)) {
    return fail("Chỉ hỗ trợ JPEG, PNG, WebP hoặc GIF.", 400);
  }

  if (file.size > MAX_BYTES) {
    return fail("Ảnh tối đa 5MB.", 400);
  }

  const ext = extFromMime(file.type);
  const path = `${auth.actor.id}/${Date.now()}-${randomUUID().slice(0, 10)}.${ext}`;
  const bytes = new Uint8Array(await file.arrayBuffer());

  const admin = createAdminClient();
  const { error: upErr } = await admin.storage.from(BUCKET).upload(path, bytes, {
    contentType: file.type,
    upsert: false,
  });

  if (upErr) {
    return fail("Không upload được lên Storage.", 500, upErr.message);
  }

  const { data: pub } = admin.storage.from(BUCKET).getPublicUrl(path);
  return ok({ url: pub.publicUrl });
}
