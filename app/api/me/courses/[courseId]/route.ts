import { requireActiveActor } from "@/lib/api/auth";
import { fail, ok } from "@/lib/api/http";
import { getEnrollmentCourseBundleForUser } from "@/lib/api/repositories";
import { buildLmsCourseViewModel } from "@/lib/lms/build-lms-course-view-model";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const auth = await requireActiveActor();
  if (!auth.actor) {
    return fail(auth.message ?? "Bạn chưa đăng nhập.", auth.status);
  }

  try {
    const { courseId } = await params;
    const bundle = await getEnrollmentCourseBundleForUser(auth.actor.id, courseId);
    if (!bundle) {
      return fail("Không tìm thấy khóa học hoặc bạn chưa được cấp quyền.", 404);
    }

    const course = buildLmsCourseViewModel({
      enrollment: bundle.enrollment as { id: string; expires_at: string | null },
      course: bundle.course,
      completedLessonIds: bundle.completedLessonIds,
    });

    return ok({
      course,
      enrollmentId: String(bundle.enrollment.id),
    });
  } catch (error) {
    return fail("Không thể tải khóa học.", 500, error);
  }
}
