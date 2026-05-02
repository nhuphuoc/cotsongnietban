import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/api/auth", () => ({
  requireAdminActor: vi.fn(),
}));

vi.mock("@/lib/api/repositories", () => ({
  listOrdersPaginated: vi.fn(),
}));

import { requireAdminActor } from "@/lib/api/auth";
import { listOrdersPaginated } from "@/lib/api/repositories";
import { GET } from "./route";

function jsonBody(res: Response) {
  return res.json() as Promise<{ data?: unknown; error?: { message: string } }>;
}

describe("GET /api/admin/orders", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(requireAdminActor).mockResolvedValue({
      actor: { id: "admin-id", email: "admin@test.com", role: "admin" as const, isActive: true },
      status: 200 as const,
      message: null,
    });
  });

  it("returns 401 when not admin", async () => {
    vi.mocked(requireAdminActor).mockResolvedValue({
      actor: null,
      status: 401 as const,
      message: "Bạn chưa đăng nhập.",
    });
    const res = await GET(new Request("http://localhost/api/admin/orders"));
    expect(res.status).toBe(401);
    const body = await jsonBody(res);
    expect(body.error?.message).toBe("Bạn chưa đăng nhập.");
    expect(listOrdersPaginated).not.toHaveBeenCalled();
  });

  it("returns paginated payload from listOrdersPaginated", async () => {
    const payload = {
      items: [{ id: "o1", order_code: "A1", items: [], user: null }],
      total: 42,
      page: 2,
      pageSize: 50,
    };
    vi.mocked(listOrdersPaginated).mockResolvedValue(payload as never);
    const res = await GET(
      new Request("http://localhost/api/admin/orders?page=2&pageSize=50&status=pending&q=abc&sort=total_vnd&dir=asc"),
    );
    expect(res.status).toBe(200);
    const body = await jsonBody(res);
    expect(body.data).toEqual(payload);
    expect(listOrdersPaginated).toHaveBeenCalledWith({
      page: 2,
      pageSize: 50,
      statusFilter: "pending",
      search: "abc",
      sortBy: "total_vnd",
      sortDir: "asc",
    });
  });

  it("defaults invalid status to all and invalid sort to created_at", async () => {
    vi.mocked(listOrdersPaginated).mockResolvedValue({ items: [], total: 0, page: 1, pageSize: 10 });
    await GET(new Request("http://localhost/api/admin/orders?status=nope&sort=hack"));
    expect(listOrdersPaginated).toHaveBeenCalledWith(
      expect.objectContaining({
        statusFilter: "all",
        sortBy: "created_at",
        sortDir: "desc",
      }),
    );
  });

  it("omits search when q is whitespace only", async () => {
    vi.mocked(listOrdersPaginated).mockResolvedValue({ items: [], total: 0, page: 1, pageSize: 10 });
    await GET(new Request("http://localhost/api/admin/orders?q=%20%20"));
    expect(listOrdersPaginated).toHaveBeenCalledWith(
      expect.objectContaining({
        search: undefined,
      }),
    );
  });

  it("maps dir=asc only when explicitly asc", async () => {
    vi.mocked(listOrdersPaginated).mockResolvedValue({ items: [], total: 0, page: 1, pageSize: 10 });
    await GET(new Request("http://localhost/api/admin/orders?dir=asc"));
    expect(listOrdersPaginated).toHaveBeenCalledWith(expect.objectContaining({ sortDir: "asc" }));

    vi.mocked(listOrdersPaginated).mockClear();
    await GET(new Request("http://localhost/api/admin/orders?dir=wrong"));
    expect(listOrdersPaginated).toHaveBeenCalledWith(expect.objectContaining({ sortDir: "desc" }));
  });
});
