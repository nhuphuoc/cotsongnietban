"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Trash2 } from "lucide-react";
import { CourseSelect } from "@/components/admin/course-select";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { apiFetch } from "@/lib/admin/api-client";
import type { AdminFeedbackSource, AdminFeedbackStatus } from "@/lib/admin/feedback-types";

export default function AdminFeedbackDetailPage() {
  const params = useParams<{ feedbackId: string }>();
  const router = useRouter();

  const id = params.feedbackId;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [item, setItem] = useState<any | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [avatar, setAvatar] = useState("");
  const [courseId, setCourseId] = useState("");
  const [source, setSource] = useState<AdminFeedbackSource>("website");
  const [status, setStatus] = useState<AdminFeedbackStatus>("new");
  const [rating, setRating] = useState<1 | 2 | 3 | 4 | 5>(5);
  const [messageHtml, setMessageHtml] = useState("<p></p>");
  const [internalNoteHtml, setInternalNoteHtml] = useState("<p></p>");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<any>(`/api/admin/feedback/${id}`);
      setItem(data);
    } catch (e: any) {
      setError(e?.message ?? "Không thể tải feedback.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [id]);

  useEffect(() => {
    if (!item) return;
    setName(item.name ?? "");
    setEmail(item.email ?? "");
    setAvatar(item.avatar_url ?? "");
    setCourseId(item.course?.id ?? "");
    setSource(item.source);
    setStatus(item.status);
    setRating(item.rating);
    setMessageHtml(item.message_html ?? "<p></p>");
    setInternalNoteHtml(item.internal_note_html ?? "<p></p>");
  }, [item?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const canSave = useMemo(() => name.trim().length >= 2 && email.trim().includes("@"), [name, email]);

  const onSave = () => {
    void (async () => {
      if (!item || !canSave || saving) return;
      setSaving(true);
      setError(null);
      try {
        const updated = await apiFetch<any>(`/api/admin/feedback/${item.id}`, {
          method: "PATCH",
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim(),
            avatarUrl: avatar.trim() || null,
            courseId: courseId || null,
            source,
            status,
            rating,
            messageHtml,
            internalNoteHtml: internalNoteHtml.trim() === "<p></p>" ? null : internalNoteHtml,
          }),
        });
        setItem(updated);
      } catch (e: any) {
        setError(e?.message ?? "Không thể lưu thay đổi.");
      } finally {
        setSaving(false);
      }
    })();
  };

  const onDelete = () => {
    void (async () => {
      if (!item) return;
      setError(null);
      try {
        await apiFetch<{ id: string; deleted: true }>(`/api/admin/feedback/${item.id}`, { method: "DELETE" });
        router.push("/admin/feedback");
      } catch (e: any) {
        setError(e?.message ?? "Không thể xóa feedback.");
      }
    })();
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="text-gray-500 text-sm">Đang tải...</div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="p-6 lg:p-8">
        <Link href="/admin/feedback" className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900">
          <ArrowLeft size={16} />
          Quản lý Feedback
        </Link>
        <div className="mt-4 rounded-sm border border-gray-200 bg-white p-6">
          <div className="font-heading font-black text-gray-900 text-lg">Không tìm thấy feedback</div>
          <p className="mt-1 text-sm text-gray-500">{error ?? "Có thể feedback đã bị xoá hoặc ID không tồn tại."}</p>
          <button onClick={load} className="mt-3 text-sm font-semibold text-[#c0392b] hover:underline">
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <Link href="/admin/feedback" className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900">
            <ArrowLeft size={16} />
            Quản lý Feedback
          </Link>
          <h1 className="mt-2 font-heading font-black text-gray-900 text-2xl">Chi tiết feedback</h1>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-500">
            <span className="rounded-full bg-gray-100 px-2 py-1 font-mono">id: {item.id}</span>
            <span className="text-gray-400">·</span>
            <span>Cập nhật: {new Date(item.updated_at).toLocaleString("vi-VN")}</span>
          </div>
        </div>

        <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
          <button
            onClick={onSave}
            disabled={!canSave}
            className="bg-[#c0392b] hover:bg-[#96281b] disabled:opacity-40 disabled:hover:bg-[#c0392b] text-white text-sm font-bold px-4 py-2.5 rounded-sm transition-colors"
          >
            {saving ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
          <button
            onClick={onDelete}
            className="inline-flex items-center justify-center gap-2 rounded-sm border border-gray-200 bg-white px-3 py-2.5 text-sm font-semibold text-gray-700 hover:border-[#c0392b]/40 hover:text-[#c0392b]"
            title="Xóa (demo)"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {error ? (
        <div className="mb-4 rounded-sm border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white border border-gray-200 rounded-sm p-5 space-y-3">
            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5 block">Tên *</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-gray-200 rounded-sm px-3 py-2.5 text-sm focus:outline-none focus:border-[#c0392b]"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5 block">Email *</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-200 rounded-sm px-3 py-2.5 text-sm focus:outline-none focus:border-[#c0392b]"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5 block">Avatar URL</label>
              <input
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full border border-gray-200 rounded-sm px-3 py-2.5 text-sm focus:outline-none focus:border-[#c0392b]"
              />
            </div>
            <CourseSelect value={courseId} onChange={setCourseId} />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5 block">Nguồn</label>
                <select
                  value={source}
                  onChange={(e) => setSource(e.target.value as AdminFeedbackSource)}
                  className="w-full border border-gray-200 rounded-sm px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-[#c0392b]"
                >
                  <option value="website">Website</option>
                  <option value="zalo">Zalo</option>
                  <option value="facebook">Facebook</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5 block">Trạng thái</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as AdminFeedbackStatus)}
                  className="w-full border border-gray-200 rounded-sm px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-[#c0392b]"
                >
                  <option value="new">Mới</option>
                  <option value="reviewed">Đã duyệt</option>
                  <option value="pinned">Ghim</option>
                  <option value="hidden">Ẩn</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5 block">Rating</label>
              <select
                value={rating}
                onChange={(e) => setRating(Number(e.target.value) as any)}
                className="w-full border border-gray-200 rounded-sm px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-[#c0392b]"
              >
                {[5, 4, 3, 2, 1].map((n) => (
                  <option key={n} value={n}>
                    {n} sao
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white border border-gray-200 rounded-sm p-5">
            <div className="mb-2 flex items-center justify-between gap-3">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Nội dung phản hồi</label>
              <span className="text-xs text-gray-400">Rich text</span>
            </div>
            <RichTextEditor valueHtml={messageHtml} onChangeHtml={setMessageHtml} />
          </div>

          <div className="bg-white border border-gray-200 rounded-sm p-5">
            <div className="mb-2 flex items-center justify-between gap-3">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Ghi chú nội bộ</label>
              <span className="text-xs text-gray-400">Chỉ admin thấy</span>
            </div>
            <RichTextEditor valueHtml={internalNoteHtml} onChangeHtml={setInternalNoteHtml} />
          </div>
        </div>
      </div>
    </div>
  );
}

