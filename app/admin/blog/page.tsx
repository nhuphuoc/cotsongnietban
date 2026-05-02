"use client";

import Link from "next/link";
import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/admin/api-client";
import { crudNotify, notifyApiProblem } from "@/lib/ui/notify";

type BlogPostRow = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  cover_image_url: string | null;
  content_html?: string;
  status: "draft" | "published" | "archived";
  published_at: string | null;
  created_at: string;
  updated_at: string;
  view_count: number;
  category: { id: string; name: string; slug: string } | null;
};

type BlogPagePayload = {
  items: BlogPostRow[];
  total: number;
  page: number;
  pageSize: number;
};

function blogListUrl(
  page: number,
  pageSize: number,
  sortBy: "published_at" | "view_count" | "title" | "status",
  sortDir: "asc" | "desc",
) {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("pageSize", String(pageSize));
  params.set("sort", sortBy);
  params.set("dir", sortDir);
  return `/api/admin/blog?${params.toString()}`;
}

export default function AdminBlogPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<BlogPostRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"published_at" | "view_count" | "title" | "status">("published_at");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<BlogPagePayload>(blogListUrl(page, pageSize, sortBy, sortDir));
      setPosts(data.items);
      setTotal(data.total);
    } catch (e: unknown) {
      notifyApiProblem(e, { fallbackTitle: "Không thể tải bài viết" });
      setError(e instanceof Error ? e.message : "Không thể tải bài viết.");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, sortBy, sortDir]);

  useEffect(() => {
    void load();
  }, [load]);

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
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Không thể cập nhật trạng thái.");
    }
  };

  const removePost = async (id: string) => {
    try {
      await crudNotify.remove(() => apiFetch<{ id: string; deleted: true }>(`/api/admin/blog/${id}`, { method: "DELETE" }), {
        entity: "bài viết",
      });
      await load();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Không thể xóa bài viết.");
    }
  };

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
    setPage(1);
  };

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

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
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
          <label className="flex items-center justify-end gap-2 text-xs text-gray-500 sm:order-first">
            <span className="hidden sm:inline">Hiển thị</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              className="rounded-sm border border-gray-200 bg-white py-2 pl-2 pr-8 text-xs font-semibold text-gray-700"
            >
              <option value={10}>10 / trang</option>
              <option value={20}>20 / trang</option>
              <option value={50}>50 / trang</option>
              <option value={100}>100 / trang</option>
            </select>
          </label>
          <Link
            href="/admin/blog/new"
            className="inline-flex w-full sm:w-auto items-center justify-center gap-2 bg-[#c0392b] hover:bg-[#96281b] text-white text-sm font-semibold px-4 py-2.5 rounded-sm transition-colors"
          >
            <Plus size={16} /> Bài Viết Mới
          </Link>
        </div>
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
        ) : posts.length === 0 ? (
          <div className="rounded-sm border border-gray-200 bg-white px-4 py-8 text-center text-sm text-gray-400">
            Chưa có bài viết.
          </div>
        ) : (
          posts.map((post) => (
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
              ) : posts.length === 0 ? (
                <tr>
                  <td className="px-5 py-10 text-center text-sm text-gray-400" colSpan={6}>
                    Chưa có bài viết.
                  </td>
                </tr>
              ) : (
                posts.map((post) => (
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
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 px-5 py-3 text-sm text-gray-600">
          <span>
            {total === 0
              ? "0 bài"
              : `${(page - 1) * pageSize + 1}–${Math.min(page * pageSize, total)} / ${total}`}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1 || loading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-sm border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 disabled:opacity-40"
            >
              Trước
            </button>
            <span className="tabular-nums text-xs">
              Trang {page} / {totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages || loading}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-sm border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 disabled:opacity-40"
            >
              Sau
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
