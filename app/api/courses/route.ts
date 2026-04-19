import { ok, fail } from "@/lib/api/http";
import { listCourses } from "@/lib/api/repositories";

export async function GET() {
  try {
    const courses = await listCourses({ publishedOnly: true });
    return ok(courses);
  } catch (error) {
    return fail("Không thể tải danh sách khóa học.", 500, error);
  }
}
