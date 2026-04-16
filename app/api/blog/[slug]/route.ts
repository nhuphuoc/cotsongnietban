import { ok, fail } from "@/lib/api/http";
import { getBlogPostByIdentifier, incrementBlogPostViewCount } from "@/lib/api/repositories";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const post = await getBlogPostByIdentifier(slug);
    if (!post || post.status !== "published") {
      return fail("Không tìm thấy bài viết.", 404);
    }
    try {
      await incrementBlogPostViewCount(post.id);
    } catch {
      // Ignore view-count errors; still return the post.
    }
    return ok({ ...post, view_count: (post.view_count ?? 0) + 1 });
  } catch (error) {
    return fail("Không thể tải bài viết.", 500, error);
  }
}
