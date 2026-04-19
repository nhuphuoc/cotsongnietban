import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/api/auth", () => ({
  requireAdminActor: vi.fn(),
}));

vi.mock("@/lib/api/repositories", async (importOriginal) => {
  const orig = await importOriginal<typeof import("@/lib/api/repositories")>();
  return {
    ...orig,
    listBlogPosts: vi.fn(),
    getBlogPostByIdentifier: vi.fn(),
    resolveCategoryId: vi.fn(),
  };
});

vi.mock("@/utils/supabase/admin", () => ({
  createAdminClient: vi.fn(),
}));

import { requireAdminActor } from "@/lib/api/auth";
import { listBlogPosts, getBlogPostByIdentifier, resolveCategoryId } from "@/lib/api/repositories";
import { createAdminClient } from "@/utils/supabase/admin";
import { GET as listHandler, POST as createHandler } from "./route";
import { GET as getOneHandler, PATCH as patchHandler, DELETE as deleteHandler } from "./[id]/route";

function jsonResponse(res: Response) {
  return res.json() as Promise<{ data?: unknown; error?: { message: string } }>;
}

describe("admin blog API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(requireAdminActor).mockResolvedValue({
      actor: { id: "admin-id", email: "admin@test.com" },
      status: 200 as const,
      message: null,
    });
  });

  describe("GET /api/admin/blog", () => {
    it("returns 401 when not admin", async () => {
      vi.mocked(requireAdminActor).mockResolvedValue({
        actor: null,
        status: 401 as const,
        message: "Bạn chưa đăng nhập.",
      });
      const res = await listHandler();
      expect(res.status).toBe(401);
      const body = await jsonResponse(res);
      expect(body.error?.message).toBe("Bạn chưa đăng nhập.");
    });

    it("returns posts from listBlogPosts", async () => {
      const rows = [{ id: "p1", title: "Hello", slug: "hello", category: null }];
      vi.mocked(listBlogPosts).mockResolvedValue(rows as never);
      const res = await listHandler();
      expect(res.status).toBe(200);
      const body = await jsonResponse(res);
      expect(body.data).toEqual(rows);
      expect(listBlogPosts).toHaveBeenCalledWith({ publishedOnly: false });
    });
  });

  describe("POST /api/admin/blog", () => {
    it("returns 401 when not admin", async () => {
      vi.mocked(requireAdminActor).mockResolvedValue({
        actor: null,
        status: 403 as const,
        message: "Forbidden",
      });
      const req = new Request("http://localhost/api/admin/blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "A", contentHtml: "<p>x</p>" }),
      });
      const res = await createHandler(req);
      expect(res.status).toBe(403);
    });

    it("returns 400 when title or contentHtml missing", async () => {
      const req = new Request("http://localhost/api/admin/blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "Only title" }),
      });
      const res = await createHandler(req);
      expect(res.status).toBe(400);
      const body = await jsonResponse(res);
      expect(body.error?.message).toMatch(/Thiếu title hoặc contentHtml/);
    });

    it("creates post and returns 201", async () => {
      vi.mocked(resolveCategoryId).mockResolvedValue("cat-1");
      const single = vi.fn().mockResolvedValue({
        data: { id: "new-post", title: "Tiêu đề", slug: "tieu-de", content_html: "<p>x</p>" },
        error: null,
      });
      const from = vi.fn().mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({ single }),
        }),
      });
      vi.mocked(createAdminClient).mockReturnValue({ from } as never);

      const req = new Request("http://localhost/api/admin/blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Tiêu đề",
          contentHtml: "<p>Nội dung</p>",
          excerpt: "Mô tả đủ dài",
          categorySlug: "lieu-phap",
          status: "draft",
        }),
      });
      const res = await createHandler(req);
      expect(res.status).toBe(201);
      const body = await jsonResponse(res);
      expect(body.data).toMatchObject({ id: "new-post", title: "Tiêu đề" });
      expect(resolveCategoryId).toHaveBeenCalledWith("blog_categories", "lieu-phap");
      expect(from).toHaveBeenCalledWith("blog_posts");
    });
  });

  describe("GET /api/admin/blog/[id]", () => {
    it("returns 404 when post missing", async () => {
      vi.mocked(getBlogPostByIdentifier).mockResolvedValue(null);
      const res = await getOneHandler(new Request("http://x"), {
        params: Promise.resolve({ id: "missing" }),
      });
      expect(res.status).toBe(404);
    });

    it("returns post when found", async () => {
      const post = { id: "p1", title: "T", slug: "t", content_html: "<p></p>", category: null };
      vi.mocked(getBlogPostByIdentifier).mockResolvedValue(post as never);
      const res = await getOneHandler(new Request("http://x"), {
        params: Promise.resolve({ id: "p1" }),
      });
      expect(res.status).toBe(200);
      const body = await jsonResponse(res);
      expect(body.data).toEqual(post);
    });
  });

  describe("PATCH /api/admin/blog/[id]", () => {
    it("updates and returns refreshed post", async () => {
      vi.mocked(resolveCategoryId).mockResolvedValue("cat-2");
      const eq = vi.fn().mockResolvedValue({ error: null });
      const from = vi.fn().mockReturnValue({
        update: vi.fn().mockReturnValue({ eq }),
      });
      vi.mocked(createAdminClient).mockReturnValue({ from } as never);

      const updated = {
        id: "p1",
        title: "Updated",
        slug: "updated",
        content_html: "<p>z</p>",
        category: { id: "cat-2", name: "X", slug: "x" },
      };
      vi.mocked(getBlogPostByIdentifier).mockResolvedValue(updated as never);

      const req = new Request("http://x", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Updated",
          contentHtml: "<p>z</p>",
          status: "published",
          categorySlug: "dau-lung",
        }),
      });
      const res = await patchHandler(req, { params: Promise.resolve({ id: "p1" }) });
      expect(res.status).toBe(200);
      const body = await jsonResponse(res);
      expect(body.data).toEqual(updated);
      expect(from).toHaveBeenCalledWith("blog_posts");
      expect(eq).toHaveBeenCalledWith("id", "p1");
    });
  });

  describe("DELETE /api/admin/blog/[id]", () => {
    it("deletes and returns payload", async () => {
      const eq = vi.fn().mockResolvedValue({ error: null });
      const from = vi.fn().mockReturnValue({
        delete: vi.fn().mockReturnValue({ eq }),
      });
      vi.mocked(createAdminClient).mockReturnValue({ from } as never);

      const res = await deleteHandler(new Request("http://x"), {
        params: Promise.resolve({ id: "p-del" }),
      });
      expect(res.status).toBe(200);
      const body = await jsonResponse(res);
      expect(body.data).toEqual({ id: "p-del", deleted: true });
    });
  });
});
