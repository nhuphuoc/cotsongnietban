import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/api/auth", () => ({
  getSessionActor: vi.fn(),
}));

vi.mock("@/utils/supabase/admin", () => ({
  createAdminClient: vi.fn(),
}));

import { getSessionActor } from "@/lib/api/auth";
import { createAdminClient } from "@/utils/supabase/admin";
import { POST as publicSubmitHandler } from "./route";

function jsonResponse(res: Response) {
  return res.json() as Promise<{ data?: unknown; error?: { message: string } }>;
}

describe("public POST /api/feedback", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getSessionActor).mockResolvedValue(null);
  });

  it("returns 400 when name or messageHtml missing", async () => {
    const req = new Request("http://x", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rating: 5 }),
    });
    const res = await publicSubmitHandler(req);
    expect(res.status).toBe(400);
    const body = await jsonResponse(res);
    expect(body.error?.message).toMatch(/Thiếu name hoặc messageHtml/);
  });

  it("returns 400 when rating invalid", async () => {
    const req = new Request("http://x", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "A", messageHtml: "<p>x</p>", rating: 99 }),
    });
    const res = await publicSubmitHandler(req);
    expect(res.status).toBe(400);
    const body = await jsonResponse(res);
    expect(body.error?.message).toMatch(/rating/);
  });

  it("creates row and returns 201", async () => {
    const single = vi.fn().mockResolvedValue({
      data: { id: "new-fb", created_at: "2026-01-01T00:00:00Z" },
      error: null,
    });
    const from = vi.fn().mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({ single }),
      }),
    });
    vi.mocked(createAdminClient).mockReturnValue({ from } as never);

    const req = new Request("http://x", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: " Khách ",
        messageHtml: " <p>Hi</p> ",
        rating: 5,
        email: "k@test.com",
        isPublic: true,
      }),
    });
    const res = await publicSubmitHandler(req);
    expect(res.status).toBe(201);
    const body = await jsonResponse(res);
    expect(body.data).toMatchObject({ id: "new-fb" });
    expect(from).toHaveBeenCalledWith("feedbacks");
  });

  it("passes user_id when session exists", async () => {
    vi.mocked(getSessionActor).mockResolvedValue({ id: "user-uuid", email: "u@test.com" });
    const single = vi.fn().mockResolvedValue({
      data: { id: "fb-2", created_at: "2026-01-01T00:00:00Z" },
      error: null,
    });
    const insert = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({ single }),
    });
    const from = vi.fn().mockReturnValue({ insert });
    vi.mocked(createAdminClient).mockReturnValue({ from } as never);

    const req = new Request("http://x", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "U", messageHtml: "<p>m</p>", rating: 3 }),
    });
    await publicSubmitHandler(req);
    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: "user-uuid",
        name: "U",
      })
    );
  });
});
