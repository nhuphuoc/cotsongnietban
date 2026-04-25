"use client";

import Link from "next/link";
import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/admin/api-client";
import { crudNotify, notifyApiProblem } from "@/lib/ui/notify";

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
  const router = useRouter();
  const [posts, setPosts] = useState<BlogPostRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"published_at" | "view_count" | "title" | "status">("published_at");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<BlogPostRow[]>("/api/admin/blog");
      setPosts(data);
    } catch (e: any) {
      notifyApiProblem(e, { fallbackTitle: "Không thể tải bài viết" });
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
      await crudNotify.update(
        () =>
          apiFetch<BlogPostRow>(`/api/admin/blog/${id}`, {
            method: "PATCH",
            body: JSON.stringify({ status: next }),
          }),
        {
          entity: "trạng thái bài viết",
          successMessage: next === "published" ? "Đã xuất bản bài viết." : "Đã chuyển bài viết về bản nháp.",
        }
      );
      setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, status: next } : p)));
    } catch (e: any) {
      setError(e?.message ?? "Không thể cập nhật trạng thái.");
    }
  };

  const removePost = async (id: string) => {
    try {
      await crudNotify.remove(() => apiFetch<{ id: string; deleted: true }>(`/api/admin/blog/${id}`, { method: "DELETE" }), {
        entity: "bài viết",
      });
      setPosts((prev) => prev.filter((p) => p.id !== id));
    } catch (e: any) {
      setError(e?.message ?? "Không thể xóa bài viết.");
    }
  };

  const rows = useMemo(() => {
    const toPublishedTs = (post: BlogPostRow) => {
      const source = post.published_at ?? post.created_at ?? null;
      if (!source) return null;
      const ts = new Date(source).getTime();
      return Number.isNaN(ts) ? null : ts;
    };
    const sorted = [...posts];
    sorted.sort((a, b) => {
      let result = 0;
      if (sortBy === "view_count") {
        result = (a.view_count ?? 0) - (b.view_count ?? 0);
      } else if (sortBy === "title") {
        result = a.title.localeCompare(b.title, "vi");
      } else if (sortBy === "status") {
        result = a.status.localeCompare(b.status, "vi");
      } else {
        const aTs = toPublishedTs(a);
        const bTs = toPublishedTs(b);
        if (aTs == null && bTs == null) result = a.title.localeCompare(b.title, "vi");
        else if (aTs == null) result = 1;
        else if (bTs == null) result = -1;
        else result = aTs - bTs;
      }
      return sortDir === "asc" ? result : -result;
    });
    return sorted;
  }, [posts, sortBy, sortDir]);
  const formatDate = (iso: string) => {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return "—";
    return date.toLocaleDateString("vi-VN");
  };

  const handleSort = (next: "published_at" | "view_count" | "title" | "status") => {
    if (sortBy === next) {
      setSortDir((dir) => (dir === "asc" ? "desc" : "asc"));
      return;
    }
    setSortBy(next);
    setSortDir("desc");
  };

  const SortMark = ({ active }: { active: boolean }) => (
    <span className={`ml-1 inline-flex flex-col leading-none ${active ? "text-[#c0392b]" : "text-gray-300"}`}>
      <ChevronUp size={10} className={active && sortDir === "asc" ? "opacity-100" : "opacity-50"} />
      <ChevronDown size={10} className={`-mt-0.5 ${active && sortDir === "desc" ? "opacity-100" : "opacity-50"}`} />
    </span>
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading font-black text-gray-900 text-2xl">Quản Lý Blog</h1>
          <p className="text-gray-500 text-sm mt-1">Đăng bài viết và nội dung kiến thức</p>
        </div>
        <Link
          href="/admin/blog/new"
          className="inline-flex w-full sm:w-auto items-center justify-center gap-2 bg-[#c0392b] hover:bg-[#96281b] text-white text-sm font-semibold px-4 py-2.5 rounded-sm transition-colors"
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

      <div className="md:hidden space-y-3">
        {loading ? (
          <div className="rounded-sm border border-gray-200 bg-white px-4 py-8 text-center text-sm text-gray-400">
            Đang tải...
          </div>
        ) : rows.length === 0 ? (
          <div className="rounded-sm border border-gray-200 bg-white px-4 py-8 text-center text-sm text-gray-400">
            Chưa có bài viết.
          </div>
        ) : (
          rows.map((post) => (
            <div key={post.id} className="rounded-sm border border-gray-200 bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <Link href={`/admin/blog/${post.id}`} className="line-clamp-2 font-semibold text-gray-900 hover:underline">
                  {post.title}
                </Link>
                <span className={`shrink-0 rounded-full px-2 py-1 text-[11px] font-semibold ${
                  post.status === "published"
                    ? "bg-green-50 text-green-600"
                    : post.status === "archived"
                      ? "bg-gray-200 text-gray-700"
                      : "bg-gray-100 text-gray-500"
                }`}>
                  {post.status === "published" ? "Đã Đăng" : post.status === "archived" ? "Lưu trữ" : "Bản Nháp"}
                </span>
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-[#c0392b]/10 px-2 py-1 text-xs font-semibold text-[#c0392b]">
                  {post.category?.name ?? "—"}
                </span>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-500">
                <div>
                  <div className="text-gray-400">Lượt xem</div>
                  <div className="font-semibold text-gray-800">{post.view_count.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-gray-400">Ngày đăng</div>
                  <div className="font-semibold text-gray-800">{formatDate(post.published_at ?? post.created_at)}</div>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between">
                <button
                  onClick={() => toggleStatus(post.id, post.status)}
                  className="text-xs font-semibold text-gray-500 hover:text-gray-900"
                >
                  {post.status === "published" ? "Chuyển draft" : "Xuất bản"}
                </button>
                <button
                  onClick={() => removePost(post.id)}
                  className="text-gray-400 transition-colors hover:text-[#c0392b]"
                  title="Xoá bài viết"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="hidden md:block bg-white border border-gray-200 rounded-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">
                  <button type="button" onClick={() => handleSort("title")} className="inline-flex w-full items-center justify-start hover:text-gray-600">
                    Tiêu Đề
                    <SortMark active={sortBy === "title"} />
                  </button>
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">Danh Mục</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">
                  <button type="button" onClick={() => handleSort("view_count")} className="inline-flex w-full items-center justify-start hover:text-gray-600">
                    Lượt Xem
                    <SortMark active={sortBy === "view_count"} />
                  </button>
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">
                  <button type="button" onClick={() => handleSort("published_at")} className="inline-flex w-full items-center justify-start hover:text-gray-600">
                    Ngày Đăng
                    <SortMark active={sortBy === "published_at"} />
                  </button>
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">
                  <button type="button" onClick={() => handleSort("status")} className="inline-flex w-full items-center justify-start hover:text-gray-600">
                    Trạng Thái
                    <SortMark active={sortBy === "status"} />
                  </button>
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">Hành Động</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td className="px-5 py-10 text-center text-sm text-gray-400" colSpan={6}>
                    Đang tải...
                  </td>
                </tr>
              ) : null}
              {rows.map((post) => (
                <tr
                  key={post.id}
                  className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer"
                  onClick={() => router.push(`/admin/blog/${post.id}`)}
                >
                  <td className="px-5 py-3 font-semibold text-gray-900 max-w-xs">
                    <Link
                      href={`/admin/blog/${post.id}`}
                      className="line-clamp-2 hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {post.title}
                    </Link>
                  </td>
                  <td className="px-5 py-3">
                    <span className="bg-[#c0392b]/10 text-[#c0392b] text-xs font-semibold px-2 py-1 rounded-full">
                      {post.category?.name ?? "—"}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-600">{post.view_count.toLocaleString()}</td>
                  <td className="px-5 py-3 text-gray-500 text-xs">{formatDate(post.published_at ?? post.created_at)}</td>
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
                        onClick={(e) => { e.stopPropagation(); void toggleStatus(post.id, post.status); }}
                        className="text-xs font-semibold text-gray-500 hover:text-gray-900"
                      >
                        {post.status === "published" ? "Chuyển draft" : "Xuất bản"}
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); void removePost(post.id); }}
                        className="text-gray-400 hover:text-[#c0392b] transition-colors"
                      >
                        <Trash2 size={15} />
                      </button>
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
