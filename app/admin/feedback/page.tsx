"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronUp, Eye, EyeOff, MessageSquareQuote, Plus, Search, Trash2, User } from "lucide-react";
import { apiFetch } from "@/lib/admin/api-client";
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
      ? "bg-purple-50 text-purple-700"
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

export default function AdminFeedbackPage() {
  const router = useRouter();
  const [items, setItems] = useState<AdminFeedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<AdminFeedbackType | "all">("all");
  const [sortBy, setSortBy] = useState<"created_at" | "customer_name" | "type" | "is_active" | "content">("created_at");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((f) => {
      const matchSearch =
        !q ||
        (f.customer_name ?? "").toLowerCase().includes(q) ||
        (f.customer_info ?? "").toLowerCase().includes(q) ||
        (f.content ?? "").toLowerCase().includes(q);
      const matchType = typeFilter === "all" || f.type === typeFilter;
      return matchSearch && matchType;
    });
  }, [items, search, typeFilter]);

  const sorted = useMemo(() => {
    const toTs = (value: string | null | undefined) => {
      if (!value) return null;
      const ts = new Date(value).getTime();
      return Number.isNaN(ts) ? null : ts;
    };
    const list = [...filtered];
    list.sort((a, b) => {
      let result = 0;
      if (sortBy === "customer_name") {
        result = (a.customer_name ?? "").localeCompare(b.customer_name ?? "", "vi");
      } else if (sortBy === "type") {
        result = a.type.localeCompare(b.type, "vi");
      } else if (sortBy === "is_active") {
        result = Number(a.is_active) - Number(b.is_active);
      } else if (sortBy === "content") {
        result = (a.content ?? "").localeCompare(b.content ?? "", "vi");
      } else {
        const aTs = toTs(a.created_at);
        const bTs = toTs(b.created_at);
        if (aTs == null && bTs == null) result = (a.customer_name ?? "").localeCompare(b.customer_name ?? "", "vi");
        else if (aTs == null) result = 1;
        else if (bTs == null) result = -1;
        else result = aTs - bTs;
      }
      return sortDir === "asc" ? result : -result;
    });
    return list;
  }, [filtered, sortBy, sortDir]);

  const handleSort = (next: "created_at" | "customer_name" | "type" | "is_active" | "content") => {
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

  const counts = useMemo(() => {
    const result: Record<string, number> = { all: items.length, before_after: 0, testimonial: 0, comment: 0 };
    items.forEach((f) => {
      result[f.type] = (result[f.type] ?? 0) + 1;
    });
    return result;
  }, [items]);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<AdminFeedback[]>("/api/admin/feedback");
      setItems(data);
    } catch (e: any) {
      notifyApiProblem(e, { fallbackTitle: "Không thể tải feedback" });
      setError(e?.message ?? "Không thể tải feedback.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const toggleActive = async (id: string, current: boolean) => {
    try {
      const updated = await crudNotify.update(
        () => apiFetch<AdminFeedback>(`/api/admin/feedback/${id}`, { method: "PATCH", body: JSON.stringify({ isActive: !current }) }),
        { entity: "feedback", successMessage: current ? "Đã ẩn feedback." : "Đã hiển thị feedback." }
      );
      setItems((prev) => prev.map((it) => (it.id === id ? { ...it, is_active: updated.is_active } : it)));
    } catch (e: any) {
      setError(e?.message ?? "Không thể cập nhật trạng thái.");
    }
  };

  const remove = async (id: string) => {
    try {
      await crudNotify.remove(() => apiFetch<{ id: string; deleted: true }>(`/api/admin/feedback/${id}`, { method: "DELETE" }), {
        entity: "feedback",
      });
      setItems((prev) => prev.filter((it) => it.id !== id));
    } catch (e: any) {
      setError(e?.message ?? "Không thể xóa feedback.");
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
                    onClick={() => setTypeFilter(b.k)}
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
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo tên, thông tin, nội dung..."
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-sm text-sm focus:outline-none focus:border-[#c0392b] bg-white"
            />
          </div>
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
              ) : null}
              {sorted.map((f) => (
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
              ))}
              {!loading && sorted.length === 0 ? (
                <tr>
                  <td className="px-5 py-10 text-center text-sm text-gray-400" colSpan={6}>
                    Không có feedback phù hợp bộ lọc.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

