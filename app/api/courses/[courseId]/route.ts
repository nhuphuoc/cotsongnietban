import { ok, fail } from "@/lib/api/http";
import { getPublicCourseByIdentifier } from "@/lib/api/repositories";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params;
    const course = await getPublicCourseByIdentifier(courseId);
    if (!course) {
      return fail("Không tìm thấy khóa học.", 404);
    }
    return ok(course);
  } catch (error) {
    return fail("Không thể tải chi tiết khóa học.", 500, error);
  }
}
