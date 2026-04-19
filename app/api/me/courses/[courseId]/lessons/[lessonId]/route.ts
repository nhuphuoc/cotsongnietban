import { requireActiveActor } from "@/lib/api/auth";
import { fail, ok } from "@/lib/api/http";
import { applyLessonProgressForUser } from "@/lib/api/repositories";
import { buildLmsCourseViewModel } from "@/lib/lms/build-lms-course-view-model";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ courseId: string; lessonId: string }> }
) {
  const auth = await requireActiveActor();
  if (!auth.actor) {
    return fail(auth.message ?? "Bạn chưa đăng nhập.", auth.status);
  }

  const { courseId, lessonId } = await params;
  let isCompleted = true;
  try {
    const body = (await request.json()) as { is_completed?: unknown };
    if (typeof body.is_completed === "boolean") {
      isCompleted = body.is_completed;
    }
  } catch {
    // empty body → mặc định đánh dấu hoàn thành
  }

  try {
    const bundle = await applyLessonProgressForUser(auth.actor.id, courseId, lessonId, isCompleted);
    if (!bundle) {
      return fail("Không tìm thấy khóa học, bài học, hoặc bạn chưa được cấp quyền.", 404);
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
    return fail("Không thể cập nhật tiến độ bài học.", 500, error);
  }
}
