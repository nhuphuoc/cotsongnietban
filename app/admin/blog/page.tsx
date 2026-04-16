"use client";

import Link from "next/link";
import { Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/admin/api-client";

type BlogPostRow = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  cover_image_url: string | null;
  content_html: string;
  status: "draft" | "published" | "archived";
  published_at: string | null;
  created_at: string;
  updated_at: string;
  view_count: number;
  category: { id: string; name: string; slug: string } | null;
};

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPostRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<BlogPostRow[]>("/api/admin/blog");
      setPosts(data);
    } catch (e: any) {
      setError(e?.message ?? "Không thể tải bài viết.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const toggleStatus = async (id: string, current: BlogPostRow["status"]) => {
    const next = current === "published" ? "draft" : "published";
    try {
      await apiFetch<BlogPostRow>(`/api/admin/blog/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: next }),
      });
      setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, status: next } : p)));
    } catch (e: any) {
      setError(e?.message ?? "Không thể cập nhật trạng thái.");
    }
  };

  const removePost = async (id: string) => {
    try {
      await apiFetch<{ id: string; deleted: true }>(`/api/admin/blog/${id}`, { method: "DELETE" });
      setPosts((prev) => prev.filter((p) => p.id !== id));
    } catch (e: any) {
      setError(e?.message ?? "Không thể xóa bài viết.");
    }
  };

  const rows = useMemo(() => posts, [posts]);

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading font-black text-gray-900 text-2xl">Quản Lý Blog</h1>
          <p className="text-gray-500 text-sm mt-1">Đăng bài viết và nội dung kiến thức</p>
        </div>
        <Link
          href="/admin/blog/new"
          className="flex items-center gap-2 bg-[#c0392b] hover:bg-[#96281b] text-white text-sm font-semibold px-4 py-2.5 rounded-sm transition-colors"
        >
          <Plus size={16} /> Bài Viết Mới
        </Link>
      </div>

      {error ? (
        <div className="mb-4 rounded-sm border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}{" "}
          <button type="button" onClick={load} className="ml-2 font-semibold underline underline-offset-2">
            Thử lại
          </button>
        </div>
      ) : null}

      <div className="bg-white border border-gray-200 rounded-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                {["Tiêu Đề", "Danh Mục", "Slug", "Lượt Xem", "Cập nhật", "Trạng Thái", "Hành Động"].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs text-gray-400 font-semibold uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td className="px-5 py-10 text-center text-sm text-gray-400" colSpan={7}>
                    Đang tải...
                  </td>
                </tr>
              ) : null}
              {rows.map((post) => (
                <tr key={post.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-5 py-3 font-semibold text-gray-900 max-w-xs">
                    <Link href={`/admin/blog/${post.id}`} className="line-clamp-2 hover:underline">
                      {post.title}
                    </Link>
                  </td>
                  <td className="px-5 py-3">
                    <span className="bg-[#c0392b]/10 text-[#c0392b] text-xs font-semibold px-2 py-1 rounded-full">
                      {post.category?.name ?? "—"}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-600 text-xs font-mono">{post.slug}</td>
                  <td className="px-5 py-3 text-gray-600">{post.view_count.toLocaleString()}</td>
                  <td className="px-5 py-3 text-gray-500 text-xs">{new Date(post.updated_at).toLocaleDateString("vi-VN")}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                      post.status === "published"
                        ? "bg-green-50 text-green-600"
                        : post.status === "archived"
                          ? "bg-gray-200 text-gray-700"
                          : "bg-gray-100 text-gray-500"
                    }`}>
                      {post.status === "published" ? "Đã Đăng" : post.status === "archived" ? "Lưu trữ" : "Bản Nháp"}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleStatus(post.id, post.status)}
                        className="text-xs font-semibold text-gray-500 hover:text-gray-900"
                      >
                        {post.status === "published" ? "Chuyển draft" : "Xuất bản"}
                      </button>
                      <button onClick={() => removePost(post.id)} className="text-gray-400 hover:text-[#c0392b] transition-colors"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
