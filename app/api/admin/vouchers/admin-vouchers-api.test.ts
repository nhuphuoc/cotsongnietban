import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/api/auth", () => ({
  requireAdminActor: vi.fn(),
}));

vi.mock("@/utils/supabase/admin", () => ({
  createAdminClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      range: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
      single: vi.fn().mockResolvedValue({ data: null, error: { code: "PGRST116" } }),
      insert: vi.fn().mockReturnThis(),
      ilike: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
    })),
    rpc: vi.fn().mockResolvedValue({ error: null }),
  })),
}));

import { requireAdminActor } from "@/lib/api/auth";
import { GET, POST } from "./route";

function jsonBody(res: Response) {
  return res.json() as Promise<{ data?: unknown; error?: { message: string } }>;
}

const mockAdmin = {
  actor: { id: "admin-id", email: "admin@test.com", role: "admin" as const, isActive: true },
  status: 200 as const,
  message: null,
};

describe("GET /api/admin/vouchers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(requireAdminActor).mockResolvedValue(mockAdmin);
  });

  it("returns 401 when not admin", async () => {
    vi.mocked(requireAdminActor).mockResolvedValue({
      actor: null,
      status: 401 as const,
      message: "Bạn chưa đăng nhập.",
    });
    const res = await GET(new Request("http://localhost/api/admin/vouchers"));
    expect(res.status).toBe(401);
  });

  it("returns 200 with default pagination", async () => {
    const res = await GET(new Request("http://localhost/api/admin/vouchers"));
    expect(res.status).toBe(200);
  });

  it("accepts search and status params", async () => {
    const res = await GET(
      new Request("http://localhost/api/admin/vouchers?search=TEST&status=active&page=2&pageSize=5&sort=code&dir=asc")
    );
    expect(res.status).toBe(200);
  });
});

describe("POST /api/admin/vouchers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(requireAdminActor).mockResolvedValue(mockAdmin);
  });

  it("returns 401 when not admin", async () => {
    vi.mocked(requireAdminActor).mockResolvedValue({
      actor: null,
      status: 401 as const,
      message: "Forbidden",
    });
    const res = await POST(
      new Request("http://localhost/api/admin/vouchers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: "TEST10", discount_type: "percentage", expires_at: "2027-01-01T00:00:00Z" }),
      })
    );
    expect(res.status).toBe(401);
  });

  it("returns 400 when code is invalid", async () => {
    const res = await POST(
      new Request("http://localhost/api/admin/vouchers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: "", discount_type: "percentage", expires_at: "2027-01-01T00:00:00Z" }),
      })
    );
    expect(res.status).toBe(400);
    const body = await jsonBody(res);
    expect(body.error?.message).toContain("không hợp lệ");
  });

  it("returns 400 when discount_type is invalid", async () => {
    const res = await POST(
      new Request("http://localhost/api/admin/vouchers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: "TEST10", discount_type: "banana", expires_at: "2027-01-01T00:00:00Z" }),
      })
    );
    expect(res.status).toBe(400);
  });

  it("returns 400 when percentage > 100", async () => {
    const res = await POST(
      new Request("http://localhost/api/admin/vouchers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: "TEST10", discount_type: "percentage", discount_value: 150, expires_at: "2027-01-01T00:00:00Z" }),
      })
    );
    expect(res.status).toBe(400);
  });

  it("returns 400 when scope specific_user but no user_id", async () => {
    const res = await POST(
      new Request("http://localhost/api/admin/vouchers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: "TEST10",
          discount_type: "free",
          scope: "specific_user",
          expires_at: "2027-01-01T00:00:00Z",
        }),
      })
    );
    expect(res.status).toBe(400);
  });

  it("returns 400 when expires_at missing", async () => {
    const res = await POST(
      new Request("http://localhost/api/admin/vouchers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: "TEST10", discount_type: "free" }),
      })
    );
    expect(res.status).toBe(400);
  });
});
