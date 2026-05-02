import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/api/auth", () => ({
  requireAdminActor: vi.fn(),
}));

vi.mock("@/lib/api/repositories", () => ({
  listProfilesPaginated: vi.fn(),
}));

import { requireAdminActor } from "@/lib/api/auth";
import { listProfilesPaginated } from "@/lib/api/repositories";
import { GET } from "./route";

function jsonBody(res: Response) {
  return res.json() as Promise<{ data?: unknown; error?: { message: string } }>;
}

describe("GET /api/admin/users", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(requireAdminActor).mockResolvedValue({
      actor: { id: "admin-id", email: "admin@test.com", role: "admin" as const, isActive: true },
      status: 200 as const,
      message: null,
    });
  });

  it("returns 403 when not admin", async () => {
    vi.mocked(requireAdminActor).mockResolvedValue({
      actor: null,
      status: 403 as const,
      message: "Forbidden",
    });
    const res = await GET(new Request("http://localhost/api/admin/users"));
    expect(res.status).toBe(403);
    expect(listProfilesPaginated).not.toHaveBeenCalled();
  });

  it("returns paginated payload and forwards query params", async () => {
    const payload = {
      items: [{ id: "u1", full_name: "A", email: "a@x.com", enrollments: [] }],
      total: 100,
      page: 1,
      pageSize: 20,
    };
    vi.mocked(listProfilesPaginated).mockResolvedValue(payload as never);
    const res = await GET(
      new Request("http://localhost/api/admin/users?page=1&pageSize=20&role=coach&q=nguyen&sort=full_name&dir=asc"),
    );
    expect(res.status).toBe(200);
    const body = await jsonBody(res);
    expect(body.data).toEqual(payload);
    expect(listProfilesPaginated).toHaveBeenCalledWith({
      page: 1,
      pageSize: 20,
      role: "coach",
      search: "nguyen",
      sortBy: "full_name",
      sortDir: "asc",
    });
  });

  it("defaults invalid role to all and invalid sort to created_at", async () => {
    vi.mocked(listProfilesPaginated).mockResolvedValue({ items: [], total: 0, page: 1, pageSize: 10 });
    await GET(new Request("http://localhost/api/admin/users?role=superuser&sort=bad"));
    expect(listProfilesPaginated).toHaveBeenCalledWith(
      expect.objectContaining({
        role: "all",
        sortBy: "created_at",
      }),
    );
  });
});
