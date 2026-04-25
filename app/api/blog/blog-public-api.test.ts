import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/api/repositories", () => ({
  listBlogPosts: vi.fn(),
  getBlogPostByIdentifier: vi.fn(),
}));

vi.mock("@/lib/api/blog-view-tracker", () => ({
  trackBlogPostView: vi.fn(),
}));

import { listBlogPosts, getBlogPostByIdentifier } from "@/lib/api/repositories";
import { trackBlogPostView } from "@/lib/api/blog-view-tracker";
import { GET as listPublishedHandler } from "./route";
import { GET as getBySlugHandler } from "./[slug]/route";

function jsonResponse(res: Response) {
  return res.json() as Promise<{ data?: unknown; error?: { message: string } }>;
}

describe("public blog API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /api/blog", () => {
    it("returns published posts only", async () => {
      const posts = [{ id: "1", title: "A", status: "published" }];
      vi.mocked(listBlogPosts).mockResolvedValue(posts as never);
      const res = await listPublishedHandler();
      expect(res.status).toBe(200);
      const body = await jsonResponse(res);
      expect(body.data).toEqual(posts);
      expect(listBlogPosts).toHaveBeenCalledWith({ publishedOnly: true });
    });
  });

  describe("GET /api/blog/[slug]", () => {
    it("returns 404 when not published or missing", async () => {
      vi.mocked(getBlogPostByIdentifier).mockResolvedValue({
        id: "1",
        status: "draft",
        view_count: 0,
      } as never);
      const res = await getBySlugHandler(new Request("http://x"), {
        params: Promise.resolve({ slug: "secret" }),
      });
      expect(res.status).toBe(404);
    });

    it("returns post and increments view when published", async () => {
      vi.mocked(getBlogPostByIdentifier)
        .mockResolvedValueOnce({
          id: "pub-1",
          slug: "hello",
          title: "Hello",
          status: "published",
          view_count: 3,
          content_html: "<p>x</p>",
        } as never)
        .mockResolvedValueOnce({
          id: "pub-1",
          slug: "hello",
          title: "Hello",
          status: "published",
          view_count: 4,
          content_html: "<p>x</p>",
        } as never);
      vi.mocked(trackBlogPostView).mockResolvedValue({ counted: true });

      const res = await getBySlugHandler(new Request("http://x"), {
        params: Promise.resolve({ slug: "hello" }),
      });
      expect(res.status).toBe(200);
      const body = await jsonResponse(res);
      expect(body.data).toMatchObject({
        id: "pub-1",
        slug: "hello",
        view_count: 4,
      });
      expect(trackBlogPostView).toHaveBeenCalledWith(
        expect.objectContaining({
          postId: "pub-1",
        })
      );
    });

    it("still returns post if increment fails", async () => {
      vi.mocked(getBlogPostByIdentifier)
        .mockResolvedValueOnce({
          id: "pub-2",
          slug: "h2",
          title: "H2",
          status: "published",
          view_count: 10,
        } as never)
        .mockResolvedValueOnce({
          id: "pub-2",
          slug: "h2",
          title: "H2",
          status: "published",
          view_count: 10,
        } as never);
      vi.mocked(trackBlogPostView).mockRejectedValue(new Error("db"));

      const res = await getBySlugHandler(new Request("http://x"), {
        params: Promise.resolve({ slug: "h2" }),
      });
      expect(res.status).toBe(200);
      const body = await jsonResponse(res);
      expect(body.data).toMatchObject({ id: "pub-2", view_count: 10 });
    });
  });
});
