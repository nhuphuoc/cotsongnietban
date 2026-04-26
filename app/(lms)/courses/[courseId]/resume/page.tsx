import { notFound, redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { getEnrollmentCourseBundleForUser } from "@/lib/api/repositories";
import { buildLmsCourseViewModel } from "@/lib/lms/build-lms-course-view-model";
import { getLmsLessonHref, getLmsCourseHref } from "@/lib/learning-hub";

/**
 * "Resume" route: luôn chuyển học viên tới bài hợp lý nhất để tiếp tục.
 * Ưu tiên: bài đầu tiên chưa hoàn thành và không bị khoá.
 */
export default async function CourseResumePage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId: routeCourseKey } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const bundle = await getEnrollmentCourseBundleForUser(user.id, routeCourseKey);
  if (!bundle) notFound();

  const course = buildLmsCourseViewModel({
    enrollment: bundle.enrollment as { id: string; expires_at: string | null },
    course: bundle.course,
    completedLessonIds: bundle.completedLessonIds,
  });

  const next = course.lessons.find((l) => !l.completed && !l.locked);
  if (next) {
    redirect(getLmsLessonHref(routeCourseKey, next.id));
  }

  redirect(getLmsCourseHref(routeCourseKey));
}

