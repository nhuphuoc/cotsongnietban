import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/api/auth", () => ({
  requireAdminActor: vi.fn(),
}));

vi.mock("@/lib/api/repositories", async (importOriginal) => {
  const orig = await importOriginal<typeof import("@/lib/api/repositories")>();
  return {
    ...orig,
    listFeedbacks: vi.fn(),
    getFeedbackById: vi.fn(),
  };
});

vi.mock("@/utils/supabase/admin", () => ({
  createAdminClient: vi.fn(),
}));

import { requireAdminActor } from "@/lib/api/auth";
import { listFeedbacks, getFeedbackById } from "@/lib/api/repositories";
import { createAdminClient } from "@/utils/supabase/admin";
import { GET as listHandler, POST as createHandler } from "./route";
import { GET as getOneHandler, PATCH as patchHandler, DELETE as deleteHandler } from "./[id]/route";

function jsonResponse(res: Response) {
  return res.json() as Promise<{ data?: unknown; error?: { message: string } }>;
}

describe("admin feedback API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(requireAdminActor).mockResolvedValue({
      actor: { id: "admin-id", email: "admin@test.com", role: "admin" as const, isActive: true },
      status: 200 as const,
      message: null,
    });
  });

  describe("GET /api/admin/feedback", () => {
    it("returns 403 when not admin", async () => {
      vi.mocked(requireAdminActor).mockResolvedValue({
        actor: null,
        status: 403 as const,
        message: "Không có quyền admin.",
      });
      const res = await listHandler();
      expect(res.status).toBe(403);
    });

    it("returns list from listFeedbacks", async () => {
      const rows = [{ id: "f1", name: "A", rating: 5, message_html: "<p>x</p>", course: null }];
      vi.mocked(listFeedbacks).mockResolvedValue(rows as never);
      const res = await listHandler();
      expect(res.status).toBe(200);
      const body = await jsonResponse(res);
      expect(body.data).toEqual(rows);
    });
  });

  describe("POST /api/admin/feedback", () => {
    it("returns 400 when type missing/invalid", async () => {
      const req = new Request("http://x", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerName: "X" }),
      });
      const res = await createHandler(req);
      expect(res.status).toBe(400);
      const body = await jsonResponse(res);
      expect(body.error?.message).toMatch(/type phải là/);
    });

    it("creates feedback and returns 201", async () => {
      const single = vi.fn().mockResolvedValue({
        data: { id: "fb-new", type: "testimonial", customer_name: "User", content: "ok" },
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
          type: "testimonial",
          customerName: "User",
          content: "ok",
          isActive: true,
        }),
      });
      const res = await createHandler(req);
      expect(res.status).toBe(201);
      const body = await jsonResponse(res);
      expect(body.data).toMatchObject({ id: "fb-new", type: "testimonial", customer_name: "User" });
      expect(from).toHaveBeenCalledWith("feedbacks");
    });
  });

  describe("GET /api/admin/feedback/[id]", () => {
    it("returns 404 when missing", async () => {
      vi.mocked(getFeedbackById).mockResolvedValue(null);
      const res = await getOneHandler(new Request("http://x"), {
        params: Promise.resolve({ id: "nope" }),
      });
      expect(res.status).toBe(404);
    });

    it("returns item when found", async () => {
      const item = { id: "f1", name: "N", message_html: "<p></p>", course: null };
      vi.mocked(getFeedbackById).mockResolvedValue(item as never);
      const res = await getOneHandler(new Request("http://x"), {
        params: Promise.resolve({ id: "f1" }),
      });
      expect(res.status).toBe(200);
      const body = await jsonResponse(res);
      expect(body.data).toEqual(item);
    });
  });

  describe("PATCH /api/admin/feedback/[id]", () => {
    it("updates and returns refreshed row", async () => {
      const eq = vi.fn().mockResolvedValue({ error: null });
      const from = vi.fn().mockReturnValue({
        update: vi.fn().mockReturnValue({ eq }),
      });
      vi.mocked(createAdminClient).mockReturnValue({ from } as never);

      const updated = {
        id: "f1",
        name: "N2",
        status: "reviewed",
        message_html: "<p>y</p>",
        course: null,
      };
      vi.mocked(getFeedbackById).mockResolvedValue(updated as never);

      const req = new Request("http://x", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "reviewed", messageHtml: "<p>y</p>", name: "N2", email: "e@test.com" }),
      });
      const res = await patchHandler(req, { params: Promise.resolve({ id: "f1" }) });
      expect(res.status).toBe(200);
      const body = await jsonResponse(res);
      expect(body.data).toEqual(updated);
      expect(from).toHaveBeenCalledWith("feedbacks");
      expect(eq).toHaveBeenCalledWith("id", "f1");
    });
  });

  describe("DELETE /api/admin/feedback/[id]", () => {
    it("deletes and returns id", async () => {
      const eq = vi.fn().mockResolvedValue({ error: null });
      const from = vi.fn().mockReturnValue({
        delete: vi.fn().mockReturnValue({ eq }),
      });
      vi.mocked(createAdminClient).mockReturnValue({ from } as never);

      const res = await deleteHandler(new Request("http://x"), {
        params: Promise.resolve({ id: "f-del" }),
      });
      expect(res.status).toBe(200);
      const body = await jsonResponse(res);
      expect(body.data).toEqual({ id: "f-del", deleted: true });
    });
  });
});
