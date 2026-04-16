"use client";

import { useMemo } from "react";
import { useLocalStorageState } from "@/lib/hooks/use-local-storage-state";
import type { AdminBlogPost, AdminBlogStatus } from "@/lib/admin/blog-types";

const KEY = "csnb_admin_blog_posts_v1";

function nowIso() {
  return new Date().toISOString();
}

function slugify(input: string) {
  return input
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

const seed: AdminBlogPost[] = [
  {
    id: "1",
    title: "Thoát Vị Đĩa Đệm: Phương Pháp Phục Hồi Không Cần Phẫu Thuật",
    slug: "thoat-vi-dia-dem-va-phuong-phap-phuc-hoi",
    category: "Liệu Pháp",
    excerpt: "Hiểu đúng về thoát vị đĩa đệm và lộ trình phục hồi tự nhiên hiệu quả...",
    coverImage: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=1600&h=900&fit=crop",
    contentHtml: "<p>Demo nội dung bài viết (rich text).</p>",
    status: "published",
    views: 2456,
    createdAt: "2024-03-15T02:00:00.000Z",
    updatedAt: "2024-03-15T02:00:00.000Z",
  },
  {
    id: "2",
    title: "Đau Lưng Mãn Tính: 5 Nguyên Nhân Bạn Chưa Biết",
    slug: "dau-lung-man-tinh-nguyen-nhan-va-giai-phap",
    category: "Đau Lưng",
    excerpt: "Đau lưng không chỉ do ngồi sai tư thế — đây là những nguyên nhân ẩn thường bị bỏ qua...",
    coverImage: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1600&h=900&fit=crop",
    contentHtml: "<p>Demo nội dung bài viết (rich text).</p>",
    status: "published",
    views: 1832,
    createdAt: "2024-03-08T02:00:00.000Z",
    updatedAt: "2024-03-08T02:00:00.000Z",
  },
  {
    id: "3",
    title: "Functional Patterns Là Gì?",
    slug: "functional-patterns-la-gi",
    category: "Kiến Thức",
    excerpt: "Phương pháp vận động chức năng theo chuỗi sinh học — giải thích từ A đến Z...",
    coverImage: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=1600&h=900&fit=crop",
    contentHtml: "<p>Demo nội dung bài viết (rich text).</p>",
    status: "published",
    views: 3211,
    createdAt: "2024-03-01T02:00:00.000Z",
    updatedAt: "2024-03-01T02:00:00.000Z",
  },
  {
    id: "4",
    title: "Dinh Dưỡng Hỗ Trợ Phục Hồi (Draft)",
    slug: "dinh-duong-ho-tro-phuc-hoi",
    category: "Dinh Dưỡng",
    excerpt: "Các nguyên tắc ăn uống hỗ trợ phục hồi và giảm viêm...",
    contentHtml: "<p>Demo nội dung bài viết (rich text).</p>",
    status: "draft",
    views: 0,
    createdAt: "2024-04-10T02:00:00.000Z",
    updatedAt: "2024-04-10T02:00:00.000Z",
  },
];

export function useAdminBlogStore() {
  const { value: posts, setValue: setPosts, hydrated } = useLocalStorageState<AdminBlogPost[]>(KEY, seed);

  const api = useMemo(() => {
    const byId = (id: string) => posts.find((p) => p.id === id) ?? null;
    const upsert = (patch: Partial<AdminBlogPost> & { id: string }) => {
      setPosts((prev) => {
        const idx = prev.findIndex((p) => p.id === patch.id);
        if (idx < 0) return prev;
        const next = [...prev];
        next[idx] = { ...next[idx], ...patch, updatedAt: nowIso() };
        return next;
      });
    };
    const create = (input: {
      title: string;
      category: string;
      excerpt: string;
      coverImage?: string;
      contentHtml: string;
      status: AdminBlogStatus;
    }) => {
      const id = String(Date.now());
      const createdAt = nowIso();
      const baseSlug = slugify(input.title);
      const slug =
        posts.some((p) => p.slug === baseSlug) ? `${baseSlug}-${id.slice(-4)}` : baseSlug || `post-${id}`;
      const post: AdminBlogPost = {
        id,
        title: input.title,
        slug,
        category: input.category,
        excerpt: input.excerpt,
        coverImage: input.coverImage,
        contentHtml: input.contentHtml,
        status: input.status,
        views: 0,
        createdAt,
        updatedAt: createdAt,
      };
      setPosts((prev) => [post, ...prev]);
      return post;
    };
    const remove = (id: string) => setPosts((prev) => prev.filter((p) => p.id !== id));
    const setStatus = (id: string, status: AdminBlogStatus) =>
      setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, status, updatedAt: nowIso() } : p)));
    return { hydrated, posts, byId, upsert, create, remove, setStatus };
  }, [hydrated, posts, setPosts]);

  return api;
}

