import { randomUUID } from "node:crypto";
import { requireAdminActor } from "@/lib/api/auth";
import { fail, ok } from "@/lib/api/http";
import { createAdminClient } from "@/utils/supabase/admin";

const BUCKET = "blog-media";
/** PDF tài liệu bài học — lớn hơn ảnh nhưng có giới hạn */
const MAX_BYTES = 15 * 1024 * 1024;
const ALLOWED = new Set(["application/pdf"]);

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
    return fail("Chỉ hỗ trợ file PDF.", 400);
  }

  if (file.size > MAX_BYTES) {
    return fail("PDF tối đa 15MB.", 400);
  }

  const safeBase =
    file.name.replace(/[^\w.\- ()\[\]]+/g, "_").slice(0, 80) || "document";
  const path = `${auth.actor.id}/${Date.now()}-${randomUUID().slice(0, 8)}-${safeBase.replace(/\s+/g, "_")}`;
  const bytes = new Uint8Array(await file.arrayBuffer());

  const admin = createAdminClient();
  const { error: upErr } = await admin.storage.from(BUCKET).upload(path, bytes, {
    contentType: "application/pdf",
    upsert: false,
  });

  if (upErr) {
    return fail("Không upload được lên Storage.", 500, upErr.message);
  }

  const { data: pub } = admin.storage.from(BUCKET).getPublicUrl(path);
  return ok({ url: pub.publicUrl });
}
