import { requireAdminActor } from "@/lib/api/auth";
import { ok, fail } from "@/lib/api/http";
import { getOrderById } from "@/lib/api/repositories";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminActor();
  if (!auth.actor) return fail(auth.message ?? "Forbidden", auth.status);

  try {
    const { id } = await params;
    const order = await getOrderById(id);
    if (!order) return fail("Không tìm thấy đơn hàng.", 404);
    return ok(order);
  } catch (error) {
    return fail("Không thể tải đơn hàng.", 500, error);
  }
}
