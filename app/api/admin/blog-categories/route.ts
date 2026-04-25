import { requireAdminActor } from "@/lib/api/auth";
import { ok, fail } from "@/lib/api/http";
import { listBlogCategories } from "@/lib/api/repositories";

export async function GET() {
  const auth = await requireAdminActor();
  if (!auth.actor) return fail(auth.message ?? "Forbidden", auth.status);

  try {
    const categories = await listBlogCategories();
    return ok(categories);
  } catch (error) {
    return fail("Không thể tải danh mục blog.", 500, error);
  }
}
