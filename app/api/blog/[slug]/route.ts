import { ok, fail } from "@/lib/api/http";
import { getBlogPostByIdentifier } from "@/lib/api/repositories";
import { trackBlogPostView } from "@/lib/api/blog-view-tracker";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const post = await getBlogPostByIdentifier(slug);
    if (!post || post.status !== "published") {
      return fail("Không tìm thấy bài viết.", 404);
    }

    const ip = request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip");
    const userAgent = request.headers.get("user-agent");
    const acceptLanguage = request.headers.get("accept-language");

    try {
      await trackBlogPostView({
        postId: post.id,
        ip,
        userAgent,
        acceptLanguage,
      });
    } catch {
      // Ignore view-count errors; still return the post.
    }
    const refreshed = await getBlogPostByIdentifier(post.id);
    return ok(refreshed ?? post);
  } catch (error) {
    return fail("Không thể tải bài viết.", 500, error);
  }
}
