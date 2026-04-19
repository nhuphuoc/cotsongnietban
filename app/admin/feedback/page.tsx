"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, Clock, Flag, MessageSquareQuote, Plus, Search, Star, Trash2, User } from "lucide-react";
import { apiFetch } from "@/lib/admin/api-client";
import { crudNotify, notifyApiProblem } from "@/lib/ui/notify";

type FeedbackStatus = "new" | "reviewed" | "pinned" | "hidden";

type Feedback = {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  source: "website" | "zalo" | "facebook";
  rating: 1 | 2 | 3 | 4 | 5;
  message: string;
  course?: string;
  createdAt: string;
  status: FeedbackStatus;
};

type FeedbackRow = {
  id: string;
  name: string;
  email: string | null;
  avatar_url: string | null;
  source: Feedback["source"];
  rating: 1 | 2 | 3 | 4 | 5;
  message_html: string;
  status: FeedbackStatus;
  created_at: string;
  course: { id: string; title: string } | null;
};

function SourceBadge({ source }: { source: Feedback["source"] }) {
  const tone =
    source === "website"
      ? "bg-blue-50 text-blue-700"
      : source === "zalo"
        ? "bg-emerald-50 text-emerald-700"
        : "bg-sky-50 text-sky-700";
  const label = source === "website" ? "Website" : source === "zalo" ? "Zalo" : "Facebook";
  return <span className={`inline-flex rounded-full px-2 py-1 text-[11px] font-semibold ${tone}`}>{label}</span>;
}

function StatusBadge({ status }: { status: FeedbackStatus }) {
  const meta =
    status === "pinned"
      ? { label: "Ghim", cls: "bg-[#c0392b]/10 text-[#c0392b]" }
      : status === "reviewed"
        ? { label: "Đã duyệt", cls: "bg-green-50 text-green-700" }
        : status === "hidden"
          ? { label: "Ẩn", cls: "bg-gray-100 text-gray-600" }
          : { label: "Mới", cls: "bg-orange-50 text-orange-700" };
  return <span className={`inline-flex rounded-full px-2 py-1 text-[11px] font-semibold ${meta.cls}`}>{meta.label}</span>;
}

function Stars({ rating }: { rating: number }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={14}
          className={i < rating ? "fill-[#c0392b] text-[#c0392b]" : "text-gray-300"}
        />
      ))}
    </span>
  );
}

export default function AdminFeedbackPage() {
  const [items, setItems] = useState<FeedbackRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<FeedbackStatus | "all">("all");
  const [source, setSource] = useState<Feedback["source"] | "all">("all");

  const viewItems: Feedback[] = useMemo(() => {
    if (loading) return [];
    return items.map((f) => ({
      id: f.id,
      name: f.name,
      email: f.email ?? "",
      avatar: f.avatar_url ?? undefined,
      source: f.source,
      rating: f.rating,
      message: stripHtml(f.message_html),
      course: f.course?.title ?? undefined,
      createdAt: new Date(f.created_at).toLocaleString("vi-VN"),
      status: f.status as FeedbackStatus,
    }));
  }, [loading, items]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return viewItems.filter((f) => {
      const matchSearch =
        !q ||
        f.name.toLowerCase().includes(q) ||
        f.email.toLowerCase().includes(q) ||
        f.message.toLowerCase().includes(q) ||
        (f.course ? f.course.toLowerCase().includes(q) : false);
      const matchStatus = status === "all" || f.status === status;
      const matchSource = source === "all" || f.source === source;
      return matchSearch && matchStatus && matchSource;
    });
  }, [items, search, status, source]);

  const counts = useMemo(() => {
    const base = { all: viewItems.length, new: 0, reviewed: 0, pinned: 0, hidden: 0 } as const;
    const mut = { ...base } as Record<string, number>;
    viewItems.forEach((f) => {
      mut[f.status] = (mut[f.status] ?? 0) + 1;
    });
    return mut as { all: number; new: number; reviewed: number; pinned: number; hidden: number };
  }, [viewItems]);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<FeedbackRow[]>("/api/admin/feedback");
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

  const setStatusFor = async (id: string, next: FeedbackStatus) => {
    setError(null);
    try {
      const updated = await crudNotify.update(
        () =>
          apiFetch<any>(`/api/admin/feedback/${id}`, {
            method: "PATCH",
            body: JSON.stringify({ status: next }),
          }),
        {
          entity: "trạng thái feedback",
          successMessage: `Đã cập nhật trạng thái thành ${next}.`,
        }
      );
      setItems((prev) => prev.map((it) => (it.id === id ? { ...it, status: updated.status ?? next } : it)));
    } catch (e: any) {
      setError(e?.message ?? "Không thể cập nhật trạng thái.");
    }
  };

  const remove = async (id: string) => {
    setError(null);
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
          <p className="text-gray-500 text-sm mt-1">Duyệt, ghim, ẩn phản hồi học viên</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/admin/feedback/new"
            className="inline-flex items-center gap-2 rounded-sm bg-[#c0392b] px-3 py-2 text-xs font-semibold text-white hover:bg-[#96281b]"
          >
            <Plus size={14} />
            Tạo feedback
          </Link>
          {[
            { k: "all", label: "Tất cả", icon: MessageSquareQuote, n: counts.all },
            { k: "new", label: "Mới", icon: Clock, n: counts.new },
            { k: "reviewed", label: "Đã duyệt", icon: CheckCircle2, n: counts.reviewed },
            { k: "pinned", label: "Ghim", icon: Flag, n: counts.pinned },
            { k: "hidden", label: "Ẩn", icon: Clock, n: counts.hidden },
          ].map((b) => {
            const active = status === (b.k as any);
            return (
              <button
                key={b.k}
                onClick={() => setStatus(b.k as any)}
                className={`inline-flex items-center gap-2 rounded-sm border px-3 py-2 text-xs font-semibold transition-colors ${
                  active ? "bg-[#c0392b] text-white border-[#c0392b]" : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                }`}
              >
                <b.icon size={14} />
                {b.label}
                <span className={`ml-0.5 rounded-full px-2 py-0.5 text-[10px] ${active ? "bg-white/20" : "bg-gray-100 text-gray-600"}`}>
                  {b.n}
                </span>
              </button>
            );
          })}
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

      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên, email, nội dung, khóa học..."
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-sm text-sm focus:outline-none focus:border-[#c0392b] bg-white"
          />
        </div>
        <div className="flex gap-2">
          {([
            { value: "all", label: "Tất cả nguồn" },
            { value: "website", label: "Website" },
            { value: "zalo", label: "Zalo" },
            { value: "facebook", label: "Facebook" },
          ] as const).map((opt) => (
            <button
              key={opt.value}
              onClick={() => setSource(opt.value)}
              className={`px-3 py-2.5 text-xs font-semibold rounded-sm border transition-colors ${
                source === opt.value ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                {["Người gửi", "Nguồn", "Đánh giá", "Nội dung", "Khóa học", "Trạng thái", "Thời gian", "Hành động"].map((h) => (
                  <th
                    key={h}
                    className="text-left px-5 py-3 text-xs text-gray-400 font-semibold uppercase tracking-wide whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td className="px-5 py-10 text-center text-sm text-gray-400" colSpan={8}>
                    Đang tải...
                  </td>
                </tr>
              ) : null}
              {filtered.map((f) => (
                <tr key={f.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-9 w-9 overflow-hidden rounded-full bg-gray-100 shrink-0">
                        {f.avatar ? (
                          <Image src={f.avatar} alt={f.name} fill sizes="36px" className="object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-gray-400">
                            <User size={16} />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-gray-900 truncate">{f.name}</div>
                        <div className="text-gray-400 text-xs truncate">{f.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <SourceBadge source={f.source} />
                  </td>
                  <td className="px-5 py-3">
                    <Stars rating={f.rating} />
                  </td>
                  <td className="px-5 py-3 max-w-md">
                    <div className="line-clamp-2 text-gray-700">{f.message}</div>
                  </td>
                  <td className="px-5 py-3 text-gray-600 text-xs">{f.course ?? "—"}</td>
                  <td className="px-5 py-3">
                    <StatusBadge status={f.status} />
                  </td>
                  <td className="px-5 py-3 text-gray-400 text-xs whitespace-nowrap">{f.createdAt}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <Link href={`/admin/feedback/${f.id}`} className="text-gray-500 hover:text-gray-900 text-xs font-semibold">
                        Chi tiết
                      </Link>
                      <button
                        onClick={() => setStatusFor(f.id, "reviewed")}
                        className="text-gray-400 hover:text-gray-900 transition-colors"
                        title="Đánh dấu đã duyệt"
                      >
                        <CheckCircle2 size={15} />
                      </button>
                      <button
                        onClick={() => setStatusFor(f.id, f.status === "pinned" ? "reviewed" : "pinned")}
                        className="text-gray-400 hover:text-gray-900 transition-colors"
                        title="Ghim"
                      >
                        <Flag size={15} />
                      </button>
                      <button
                        onClick={() => setStatusFor(f.id, f.status === "hidden" ? "reviewed" : "hidden")}
                        className="text-gray-400 hover:text-gray-900 transition-colors"
                        title="Ẩn"
                      >
                        <Clock size={15} />
                      </button>
                      <button
                        onClick={() => remove(f.id)}
                        className="text-gray-400 hover:text-[#c0392b] transition-colors"
                        title="Xóa"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && filtered.length === 0 ? (
                <tr>
                  <td className="px-5 py-10 text-center text-sm text-gray-400" colSpan={8}>
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

function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

