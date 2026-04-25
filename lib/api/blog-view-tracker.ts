import { createHash } from "node:crypto";
import { createAdminClient } from "@/utils/supabase/admin";

type TrackBlogPostViewInput = {
  postId: string;
  ip?: string | null;
  userAgent?: string | null;
  acceptLanguage?: string | null;
};

function normalizeIp(value?: string | null): string {
  if (!value) return "";
  const first = value.split(",")[0]?.trim() ?? "";
  return first.toLowerCase();
}

function normalizeText(value?: string | null): string {
  return (value ?? "").trim().toLowerCase();
}

function buildVisitorHash(input: Omit<TrackBlogPostViewInput, "postId">): string {
  const fingerprint = [
    normalizeIp(input.ip),
    normalizeText(input.userAgent),
    normalizeText(input.acceptLanguage),
  ].join("|");

  return createHash("sha256").update(fingerprint || "anonymous").digest("hex");
}

function isBlogViewTableMissing(error: unknown): boolean {
  const code = (error as { code?: string } | null)?.code;
  const message = String((error as { message?: string } | null)?.message ?? "");
  const details = String((error as { details?: string } | null)?.details ?? "");
  return code === "42P01" || code === "PGRST205" || /blog_post_views/i.test(`${message} ${details}`);
}

export async function trackBlogPostView(input: TrackBlogPostViewInput): Promise<{ counted: boolean }> {
  const client = createAdminClient();
  const visitorHash = buildVisitorHash(input);
  const nowIso = new Date().toISOString();

  const { data: existing, error: readError } = await client
    .from("blog_post_views")
    .select("post_id, view_count")
    .eq("post_id", input.postId)
    .eq("visitor_hash", visitorHash)
    .maybeSingle();
  if (isBlogViewTableMissing(readError)) {
    return incrementFallbackViewCount(client, input.postId);
  }
  if (readError) throw readError;

  if (existing) {
    const { error: updateViewError } = await client
      .from("blog_post_views")
      .update({
        view_count: Number(existing.view_count ?? 0) + 1,
        last_viewed_at: nowIso,
      })
      .eq("post_id", input.postId)
      .eq("visitor_hash", visitorHash);
    if (updateViewError) throw updateViewError;
    return { counted: false };
  }

  const { error: insertError } = await client.from("blog_post_views").insert({
    post_id: input.postId,
    visitor_hash: visitorHash,
    first_viewed_at: nowIso,
    last_viewed_at: nowIso,
    view_count: 1,
  });

  // Another concurrent request may have inserted the same visitor first.
  if (insertError) {
    if (isBlogViewTableMissing(insertError)) {
      return incrementFallbackViewCount(client, input.postId);
    }
    if ((insertError as { code?: string }).code === "23505") {
      return { counted: false };
    }
    throw insertError;
  }

  const { data: post, error: postReadError } = await client
    .from("blog_posts")
    .select("view_count")
    .eq("id", input.postId)
    .maybeSingle();
  if (postReadError) throw postReadError;
  if (!post) return { counted: false };

  const { error: incrementError } = await client
    .from("blog_posts")
    .update({ view_count: Number(post.view_count ?? 0) + 1 })
    .eq("id", input.postId);
  if (incrementError) throw incrementError;

  return { counted: true };
}

async function incrementFallbackViewCount(
  client: ReturnType<typeof createAdminClient>,
  postId: string
): Promise<{ counted: boolean }> {
  const { data: post, error: postReadError } = await client
    .from("blog_posts")
    .select("view_count")
    .eq("id", postId)
    .maybeSingle();
  if (postReadError) throw postReadError;
  if (!post) return { counted: false };

  const { error: incrementError } = await client
    .from("blog_posts")
    .update({ view_count: Number(post.view_count ?? 0) + 1 })
    .eq("id", postId);
  if (incrementError) throw incrementError;

  return { counted: true };
}
