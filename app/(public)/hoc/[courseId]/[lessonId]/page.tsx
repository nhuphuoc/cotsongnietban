import { PublicHocLessonClient } from "@/components/learning/public-hoc-lesson-client";

export default async function PublicHocLessonPage({
  params,
}: {
  params: Promise<{ courseId: string; lessonId: string }>;
}) {
  const { courseId, lessonId } = await params;
  return <PublicHocLessonClient courseId={courseId} lessonId={lessonId} />;
}
