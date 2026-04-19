import { ok, fail } from "@/lib/api/http";
import { listBlogPosts } from "@/lib/api/repositories";

export async function GET() {
  try {
    const posts = await listBlogPosts({ publishedOnly: true });
    return ok(posts);
  } catch (error) {
    return fail("Không thể tải danh sách bài viết.", 500, error);
  }
}
