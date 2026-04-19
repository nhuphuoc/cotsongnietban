import { requireActiveActor } from "@/lib/api/auth";
import { ok, fail } from "@/lib/api/http";
import { listAccessibleEnrollmentsForUser } from "@/lib/api/repositories";

export async function GET() {
  try {
    const auth = await requireActiveActor();
    if (!auth.actor) return fail(auth.message ?? "Bạn chưa đăng nhập.", auth.status);
    const enrollments = await listAccessibleEnrollmentsForUser(auth.actor.id);
    return ok(enrollments);
  } catch (error) {
    return fail("Không thể tải danh sách khóa học của bạn.", 500, error);
  }
}
