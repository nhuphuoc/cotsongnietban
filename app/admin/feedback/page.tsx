"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronUp, Eye, EyeOff, MessageSquareQuote, Plus, Search, Trash2, User } from "lucide-react";
import { apiFetch } from "@/lib/admin/api-client";
import type { FeedbackTabCounts } from "@/lib/api/repositories";
import { crudNotify, notifyApiProblem } from "@/lib/ui/notify";
import type { AdminFeedback, AdminFeedbackType } from "@/lib/admin/feedback-types";

const TYPE_LABELS: Record<AdminFeedbackType, string> = {
  before_after: "Trước & Sau",
  testimonial: "Chia sẻ",
  comment: "Bình luận",
};

function TypeBadge({ type }: { type: AdminFeedbackType }) {
  const cls =
    type === "before_after"
      ? "bg-[#004E4B]/10 text-[#004E4B]"
      : type === "testimonial"
        ? "bg-green-50 text-green-700"
        : "bg-blue-50 text-blue-700";
  return <span className={`inline-flex rounded-full px-2 py-1 text-[11px] font-semibold ${cls}`}>{TYPE_LABELS[type]}</span>;
}

function ActiveBadge({ isActive }: { isActive: boolean }) {
  return isActive ? (
    <span className="inline-flex rounded-full bg-green-50 px-2 py-1 text-[11px] font-semibold text-green-700">Hiển thị</span>
  ) : (
    <span className="inline-flex rounded-full bg-gray-100 px-2 py-1 text-[11px] font-semibold text-gray-500">Ẩn</span>
  );
}

type FeedbackPagePayload = {
  items: AdminFeedback[];
  total: number;
  page: number;
  pageSize: number;
};

function feedbackListUrl(
  page: number,
  pageSize: number,
  typeFilter: AdminFeedbackType | "all",
  q: string,
  sortBy: "created_at" | "customer_name" | "type" | "is_active" | "content",
  sortDir: "asc" | "desc",
) {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("pageSize", String(pageSize));
  if (typeFilter !== "all") params.set("type", typeFilter);
  const trimmed = q.trim();
  if (trimmed) params.set("q", trimmed);
  params.set("sort", sortBy);
  params.set("dir", sortDir);
  return `/api/admin/feedback?${params.toString()}`;
}

export default function AdminFeedbackPage() {
  const router = useRouter();
  const [items, setItems] = useState<AdminFeedback[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [tabCounts, setTabCounts] = useState<FeedbackTabCounts | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<AdminFeedbackType | "all">("all");
  const [sortBy, setSortBy] = useState<"created_at" | "customer_name" | "type" | "is_active" | "content">("created_at");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const c = await apiFetch<FeedbackTabCounts>("/api/admin/feedback?meta=1");
        if (!cancelled) setTabCounts(c);
      } catch {
        if (!cancelled) setTabCounts(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (searchInput === debouncedSearch) return;
    const t = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setPage(1);
    }, 350);
    return () => clearTimeout(t);
  }, [searchInput, debouncedSearch]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<FeedbackPagePayload>(
        feedbackListUrl(page, pageSize, typeFilter, debouncedSearch, sortBy, sortDir),
      );
      setItems(data.items);
      setTotal(data.total);
    } catch (e: unknown) {
      notifyApiProblem(e, { fallbackTitle: "Không thể tải feedback" });
      setError(e instanceof Error ? e.message : "Không thể tải feedback.");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, typeFilter, debouncedSearch, sortBy, sortDir]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleSort = (next: "created_at" | "customer_name" | "type" | "is_active" | "content") => {
    if (sortBy === next) {
      setSortDir((dir) => (dir === "asc" ? "desc" : "asc"));
      return;
    }
    setSortBy(next);
    setSortDir("desc");
    setPage(1);
  };

  const SortMark = ({ active }: { active: boolean }) => (
    <span className={`ml-1 inline-flex flex-col leading-none ${active ? "text-[#c0392b]" : "text-gray-300"}`}>
      <ChevronUp size={10} className={active && sortDir === "asc" ? "opacity-100" : "opacity-50"} />
      <ChevronDown size={10} className={`-mt-0.5 ${active && sortDir === "desc" ? "opacity-100" : "opacity-50"}`} />
    </span>
  );

  const counts: Record<string, number> = {
    all: tabCounts?.all ?? 0,
    before_after: tabCounts?.before_after ?? 0,
    testimonial: tabCounts?.testimonial ?? 0,
    comment: tabCounts?.comment ?? 0,
  };

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const toggleActive = async (id: string, current: boolean) => {
    try {
      await crudNotify.update(
        () => apiFetch<AdminFeedback>(`/api/admin/feedback/${id}`, { method: "PATCH", body: JSON.stringify({ isActive: !current }) }),
        { entity: "feedback", successMessage: current ? "Đã ẩn feedback." : "Đã hiển thị feedback." }
      );
      await load();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Không thể cập nhật trạng thái.");
    }
  };

  const remove = async (id: string) => {
    try {
      await crudNotify.remove(() => apiFetch<{ id: string; deleted: true }>(`/api/admin/feedback/${id}`, { method: "DELETE" }), {
        entity: "feedback",
      });
      await load();
      try {
        const c = await apiFetch<FeedbackTabCounts>("/api/admin/feedback?meta=1");
        setTabCounts(c);
      } catch {
        /* ignore */
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Không thể xóa feedback.");
    }
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-heading font-black text-gray-900 text-2xl">Quản Lý Feedback</h1>
          <p className="text-gray-500 text-sm mt-1">Trước &amp; sau, Chia sẻ, Bình luận</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/admin/feedback/new"
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#c0392b] px-3.5 text-xs font-semibold text-white transition-colors hover:bg-[#96281b]"
          >
            <Plus size={14} />
            Tạo feedback
          </Link>
          <div className="w-full sm:w-auto overflow-x-auto rounded-lg border border-gray-200 bg-white">
            <div className="flex min-w-max items-center">
              {([
                { k: "all", label: "Tất cả" },
                { k: "before_after", label: "Trước & Sau" },
                { k: "testimonial", label: "Chia sẻ" },
                { k: "comment", label: "Bình luận" },
              ] as const).map((b) => {
                const active = typeFilter === b.k;
                return (
                  <button
                    key={b.k}
                    type="button"
                    onClick={() => {
                      setTypeFilter(b.k);
                      setPage(1);
                    }}
                    className={`inline-flex h-10 items-center gap-2 border-r border-gray-100 px-3 text-xs font-semibold transition-colors last:border-r-0 ${
                      active ? "bg-[#c0392b] text-white" : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <MessageSquareQuote size={14} />
                    {b.label}
                    <span className={`ml-0.5 rounded-full px-2 py-0.5 text-[10px] ${active ? "bg-white/20" : "bg-gray-100 text-gray-600"}`}>
                      {counts[b.k] ?? 0}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
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

      <div className="mb-6">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative max-w-sm flex-1 min-w-64">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Tìm theo tên, thông tin, nội dung..."
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-sm text-sm focus:outline-none focus:border-[#c0392b] bg-white"
            />
          </div>
          <label className="flex items-center gap-2 text-xs text-gray-500">
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
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-5 py-3 text-xs text-gray-400 font-semibold uppercase tracking-wide whitespace-nowrap">
                  <button type="button" onClick={() => handleSort("customer_name")} className="inline-flex w-full items-center justify-start hover:text-gray-600">
                    Khách hàng
                    <SortMark active={sortBy === "customer_name"} />
                  </button>
                </th>
                <th className="text-left px-5 py-3 text-xs text-gray-400 font-semibold uppercase tracking-wide whitespace-nowrap">
                  <button type="button" onClick={() => handleSort("type")} className="inline-flex w-full items-center justify-start hover:text-gray-600">
                    Loại
                    <SortMark active={sortBy === "type"} />
                  </button>
                </th>
                <th className="text-left px-5 py-3 text-xs text-gray-400 font-semibold uppercase tracking-wide whitespace-nowrap">
                  <button type="button" onClick={() => handleSort("content")} className="inline-flex w-full items-center justify-start hover:text-gray-600">
                    Nội dung
                    <SortMark active={sortBy === "content"} />
                  </button>
                </th>
                <th className="text-left px-5 py-3 text-xs text-gray-400 font-semibold uppercase tracking-wide whitespace-nowrap">
                  <button type="button" onClick={() => handleSort("is_active")} className="inline-flex w-full items-center justify-start hover:text-gray-600">
                    Trạng thái
                    <SortMark active={sortBy === "is_active"} />
                  </button>
                </th>
                <th className="text-left px-5 py-3 text-xs text-gray-400 font-semibold uppercase tracking-wide whitespace-nowrap">
                  <button type="button" onClick={() => handleSort("created_at")} className="inline-flex w-full items-center justify-start hover:text-gray-600">
                    Thời gian
                    <SortMark active={sortBy === "created_at"} />
                  </button>
                </th>
                <th className="text-left px-5 py-3 text-xs text-gray-400 font-semibold uppercase tracking-wide whitespace-nowrap">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td className="px-5 py-10 text-center text-sm text-gray-400" colSpan={6}>Đang tải...</td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td className="px-5 py-10 text-center text-sm text-gray-400" colSpan={6}>
                    Không có feedback phù hợp.
                  </td>
                </tr>
              ) : (
                items.map((f) => (
                <tr
                  key={f.id}
                  className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer"
                  onClick={() => router.push(`/admin/feedback/${f.id}`)}
                >
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-9 w-9 overflow-hidden rounded-full bg-gray-100 shrink-0">
                        {f.avatar_url ? (
                          <Image src={f.avatar_url} alt={f.customer_name ?? ""} fill sizes="36px" className="object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-gray-400">
                            <User size={16} />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-gray-900 truncate">{f.customer_name ?? "—"}</div>
                        <div className="text-gray-400 text-xs truncate">{f.customer_info ?? ""}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <TypeBadge type={f.type} />
                  </td>
                  <td className="px-5 py-3 max-w-xs">
                    <div className="line-clamp-2 text-gray-700 text-xs">{f.content ?? "—"}</div>
                  </td>
                  <td className="px-5 py-3">
                    <ActiveBadge isActive={f.is_active} />
                  </td>
                  <td className="px-5 py-3 text-gray-400 text-xs whitespace-nowrap">
                    {new Date(f.created_at).toLocaleString("vi-VN")}
                  </td>
                  <td className="px-5 py-3 whitespace-nowrap">
                    <div className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-gray-50 p-1">
                      <Link
                        href={`/admin/feedback/${f.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex h-8 items-center rounded-md px-2.5 text-xs font-semibold text-gray-600 transition-colors hover:bg-white hover:text-gray-900"
                      >
                        Chi tiết
                      </Link>
                      <button
                        onClick={(e) => { e.stopPropagation(); void toggleActive(f.id, f.is_active); }}
                        className="inline-flex h-8 items-center gap-1 rounded-md px-2.5 text-xs font-semibold text-gray-600 transition-colors hover:bg-white hover:text-gray-900"
                        title={f.is_active ? "Ẩn" : "Hiện"}
                      >
                        {f.is_active ? <EyeOff size={12} /> : <Eye size={12} />}
                        {f.is_active ? "Ẩn" : "Hiện"}
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); void remove(f.id); }}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-white hover:text-red-600"
                        title="Xóa"
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
              ? "0 feedback"
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

