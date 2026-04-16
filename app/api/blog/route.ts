import { ok, fail } from "@/lib/api/http";
import { listBlogPosts } from "@/lib/api/repositories";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const publishedOnly = url.searchParams.get("status") !== "all";
    const posts = await listBlogPosts({ publishedOnly });
    return ok(posts);
  } catch (error) {
    return fail("Không thể tải danh sách bài viết.", 500, error);
  }
}
