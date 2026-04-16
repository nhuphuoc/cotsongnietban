import { getSessionActor } from "@/lib/api/auth";
import { ok, fail } from "@/lib/api/http";
import { listEnrollmentsForUser } from "@/lib/api/repositories";

export async function GET() {
  try {
    const actor = await getSessionActor();
    if (!actor) return fail("Bạn chưa đăng nhập.", 401);
    const enrollments = await listEnrollmentsForUser(actor.id);
    return ok(enrollments);
  } catch (error) {
    return fail("Không thể tải danh sách khóa học của bạn.", 500, error);
  }
}
