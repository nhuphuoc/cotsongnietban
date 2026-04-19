"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Upload } from "lucide-react";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { ApiError, apiFetch, slugifyClient } from "@/lib/admin/api-client";
import { uploadAdminImage } from "@/lib/admin/upload-image";
import { crudNotify, notify } from "@/lib/ui/notify";

const categories = ["Liệu Pháp", "Đau Lưng", "Kiến Thức"];

export default function AdminBlogCreatePage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(categories[0]);
  const [excerpt, setExcerpt] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [contentHtml, setContentHtml] = useState("<p></p>");
  const [coverUploading, setCoverUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSave = useMemo(() => title.trim().length >= 6 && excerpt.trim().length >= 12, [title, excerpt]);

  const onSave = () => {
    void (async () => {
      if (!canSave || submitting) return;
      setSubmitting(true);
      setError(null);
      try {
        const created = await crudNotify.create(
          () =>
            apiFetch<any>("/api/admin/blog", {
              method: "POST",
              body: JSON.stringify({
                title: title.trim(),
                excerpt: excerpt.trim(),
                contentHtml,
                status,
                coverImageUrl: coverImage.trim() || null,
                categorySlug: slugifyClient(category),
              }),
            }),
          {
            entity: "bài viết",
          }
        );
        notify.info("Đang chuyển trang", "Mở màn hình chỉnh sửa bài viết vừa tạo.");
        router.push(`/admin/blog/${created.id}`);
      } catch (e: any) {
        if (e instanceof ApiError) {
          setError(`${e.message} (HTTP ${e.status})\n${e.details ? JSON.stringify(e.details, null, 2) : ""}`.trim());
        } else {
          setError(e?.message ?? "Không thể tạo bài viết.");
        }
      } finally {
        setSubmitting(false);
      }
    })();
  };

  const onUploadCover = (file: File | null) => {
    if (!file) return;
    void (async () => {
      setCoverUploading(true);
      setError(null);
      try {
        const url = await crudNotify.create(() => uploadAdminImage(file), {
          entity: "ảnh cover",
          loadingMessage: "Đang tải ảnh cover...",
          successMessage: "Upload ảnh cover thành công.",
          fallbackErrorMessage: "Không thể upload ảnh cover.",
        });
        setCoverImage(url);
      } catch (e: any) {
        setError(e?.message ?? "Không thể upload ảnh cover.");
      } finally {
        setCoverUploading(false);
      }
    })();
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <Link href="/admin/blog" className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900">
            <ArrowLeft size={16} />
            Quản lý Blog
          </Link>
          <h1 className="mt-2 font-heading font-black text-gray-900 text-2xl">Tạo bài viết</h1>
          <p className="text-gray-500 text-sm mt-1">Soạn nội dung bằng rich text (Tiptap)</p>
        </div>
        <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
            className="border border-gray-200 rounded-sm px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-[#c0392b]"
          >
            <option value="draft">Bản nháp</option>
            <option value="published">Xuất bản</option>
          </select>
          <button
            onClick={onSave}
            disabled={!canSave}
            className="bg-[#c0392b] hover:bg-[#96281b] disabled:opacity-40 disabled:hover:bg-[#c0392b] text-white text-sm font-bold px-4 py-2.5 rounded-sm transition-colors"
          >
            {submitting ? "Đang lưu..." : "Lưu bài"}
          </button>
        </div>
      </div>

      {error ? (
        <div className="mb-4 rounded-sm border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 whitespace-pre-wrap">
          {error}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white border border-gray-200 rounded-sm p-5">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5 block">Tiêu đề *</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nhập tiêu đề bài viết..."
              className="w-full border border-gray-200 rounded-sm px-3 py-2.5 text-sm focus:outline-none focus:border-[#c0392b]"
            />
            <label className="mt-4 text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5 block">Tóm tắt *</label>
            <textarea
              rows={3}
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="1–2 câu mô tả ngắn..."
              className="w-full border border-gray-200 rounded-sm px-3 py-2.5 text-sm focus:outline-none focus:border-[#c0392b] resize-none"
            />
          </div>

          <div className="bg-white border border-gray-200 rounded-sm p-5">
            <div className="mb-2 flex items-center justify-between gap-3">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Nội dung</label>
            </div>
            <RichTextEditor valueHtml={contentHtml} onChangeHtml={setContentHtml} placeholder="Bắt đầu viết..." />
          </div>
        </div>

        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white border border-gray-200 rounded-sm p-5">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5 block">Danh mục</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border border-gray-200 rounded-sm px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-[#c0392b]"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <label className="mt-4 text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5 block">Ảnh cover</label>
            <label className="flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-sm border border-dashed border-gray-300 bg-white px-3 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:border-[#c0392b]/50 hover:text-[#c0392b]">
              {coverUploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
              {coverUploading ? "Đang upload..." : "Chọn ảnh từ máy"}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="sr-only"
                onChange={(e) => {
                  onUploadCover(e.target.files?.[0] ?? null);
                  e.target.value = "";
                }}
              />
            </label>
            {coverImage ? (
              <div className="mt-3 overflow-hidden rounded-sm border border-gray-200 bg-gray-50">
                <img src={coverImage} alt="Cover preview" className="h-36 w-full object-cover" />
                <div className="flex items-center justify-between gap-3 px-3 py-2">
                  <span className="truncate text-xs text-gray-500">{coverImage}</span>
                  <button
                    type="button"
                    onClick={() => setCoverImage("")}
                    className="shrink-0 text-xs font-semibold text-gray-600 hover:text-[#c0392b]"
                  >
                    Xóa ảnh
                  </button>
                </div>
              </div>
            ) : (
              <p className="mt-2 text-xs text-gray-400">Tuỳ chọn. Không chọn thì bài viết sẽ không có ảnh cover.</p>
            )}
          </div>

          <div className="bg-white border border-gray-200 rounded-sm p-5">
            <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Gợi ý</div>
            <ul className="mt-2 space-y-2 text-sm text-gray-600">
              <li>Viết đoạn mở đầu ngắn, rõ vấn đề.</li>
              <li>Dùng bullet/quote để dễ đọc trên mobile.</li>
              <li>Chèn tiêu đề H2/H3 cho phần lớn.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

