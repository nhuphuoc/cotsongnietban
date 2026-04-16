import { ok, fail } from "@/lib/api/http";
import { listCourses } from "@/lib/api/repositories";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const publishedOnly = url.searchParams.get("status") !== "all";
    const courses = await listCourses({ publishedOnly });
    return ok(courses);
  } catch (error) {
    return fail("Không thể tải danh sách khóa học.", 500, error);
  }
}
