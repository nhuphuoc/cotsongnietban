"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { apiFetch } from "@/lib/admin/api-client";
import type { AdminFeedbackSource, AdminFeedbackStatus } from "@/lib/admin/feedback-types";

export default function AdminFeedbackCreatePage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [avatar, setAvatar] = useState("");
  const [course, setCourse] = useState("");
  const [source, setSource] = useState<AdminFeedbackSource>("website");
  const [status, setStatus] = useState<AdminFeedbackStatus>("new");
  const [rating, setRating] = useState<1 | 2 | 3 | 4 | 5>(5);
  const [messageHtml, setMessageHtml] = useState("<p></p>");
  const [internalNoteHtml, setInternalNoteHtml] = useState("<p></p>");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSave = useMemo(() => name.trim().length >= 2 && email.trim().includes("@"), [name, email]);

  const onSave = () => {
    void (async () => {
      if (!canSave || submitting) return;
      setSubmitting(true);
      setError(null);
      try {
        const created = await apiFetch<any>("/api/admin/feedback", {
          method: "POST",
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim(),
            avatarUrl: avatar.trim() || null,
            source,
            status,
            rating,
            messageHtml,
            internalNoteHtml: internalNoteHtml.trim() === "<p></p>" ? null : internalNoteHtml,
            // TODO: wire courseId when we have course picker
          }),
        });
        router.push(`/admin/feedback/${created.id}`);
      } catch (e: any) {
        setError(e?.message ?? "Không thể tạo feedback.");
      } finally {
        setSubmitting(false);
      }
    })();
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <Link href="/admin/feedback" className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900">
            <ArrowLeft size={16} />
            Quản lý Feedback
          </Link>
          <h1 className="mt-2 font-heading font-black text-gray-900 text-2xl">Tạo feedback</h1>
          <p className="text-gray-500 text-sm mt-1">Tạo phản hồi (demo) và lưu vào localStorage</p>
        </div>
        <button
          onClick={onSave}
          disabled={!canSave}
          className="bg-[#c0392b] hover:bg-[#96281b] disabled:opacity-40 disabled:hover:bg-[#c0392b] text-white text-sm font-bold px-4 py-2.5 rounded-sm transition-colors"
        >
          {submitting ? "Đang lưu..." : "Lưu feedback"}
        </button>
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
            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5 block">Khóa học</label>
              <input
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                placeholder="Tên khóa học (tuỳ chọn)"
                className="w-full border border-gray-200 rounded-sm px-3 py-2.5 text-sm focus:outline-none focus:border-[#c0392b]"
              />
            </div>
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
            <RichTextEditor valueHtml={messageHtml} onChangeHtml={setMessageHtml} placeholder="Nhập phản hồi..." />
          </div>

          <div className="bg-white border border-gray-200 rounded-sm p-5">
            <div className="mb-2 flex items-center justify-between gap-3">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Ghi chú nội bộ</label>
              <span className="text-xs text-gray-400">Chỉ admin thấy</span>
            </div>
            <RichTextEditor valueHtml={internalNoteHtml} onChangeHtml={setInternalNoteHtml} placeholder="Ghi chú..." />
          </div>
        </div>
      </div>
    </div>
  );
}

