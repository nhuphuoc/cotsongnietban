"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Upload } from "lucide-react";
import { apiFetch } from "@/lib/admin/api-client";
import { uploadAdminImage } from "@/lib/admin/upload-image";
import { crudNotify } from "@/lib/ui/notify";
import type { AdminFeedbackType } from "@/lib/admin/feedback-types";

const TYPE_OPTIONS: { value: AdminFeedbackType; label: string; hint: string }[] = [
  { value: "before_after", label: "Trước & Sau", hint: "Dùng ảnh 1 (Trước) và ảnh 2 (Sau)" },
  { value: "testimonial", label: "Chia sẻ", hint: "Ảnh đại diện + đoạn quote" },
  { value: "comment", label: "Bình luận", hint: "Ảnh chụp màn hình tin nhắn" },
];

export default function AdminFeedbackCreatePage() {
  const router = useRouter();

  const [type, setType] = useState<AdminFeedbackType>("testimonial");
  const [customerName, setCustomerName] = useState("");
  const [customerInfo, setCustomerInfo] = useState("");
  const [content, setContent] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [imageUrl1, setImageUrl1] = useState("");
  const [imageUrl2, setImageUrl2] = useState("");
  const [uploading1, setUploading1] = useState(false);
  const [uploading2, setUploading2] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSave = useMemo(() => customerName.trim().length >= 2, [customerName]);

  const onSave = () => {
    void (async () => {
      if (!canSave || submitting) return;
      setSubmitting(true);
      setError(null);
      try {
        const created = await crudNotify.create(
          () =>
            apiFetch<{ id: string }>("/api/admin/feedback", {
              method: "POST",
              body: JSON.stringify({
                type,
                customerName: customerName.trim(),
                customerInfo: customerInfo.trim() || null,
                content: content.trim() || null,
                avatarUrl: avatarUrl.trim() || null,
                imageUrl1: imageUrl1.trim() || null,
                imageUrl2: imageUrl2.trim() || null,
              }),
            }),
          { entity: "feedback" }
        );
        router.push(`/admin/feedback/${created.id}`);
      } catch (e: any) {
        setError(e?.message ?? "Không thể tạo feedback.");
      } finally {
        setSubmitting(false);
      }
    })();
  };

  const makeImageUploader = (
    setter: (v: string) => void,
    setLoading: (v: boolean) => void,
    label: string
  ) =>
    (file: File | null) => {
      if (!file) return;
      void (async () => {
        setLoading(true);
        setError(null);
        try {
          const url = await crudNotify.create(() => uploadAdminImage(file), {
            entity: label,
            loadingMessage: `Đang tải ${label}...`,
            successMessage: `Upload ${label} thành công.`,
            fallbackErrorMessage: `Không thể upload ${label}.`,
          });
          setter(url);
        } catch (e: any) {
          setError(e?.message ?? `Không thể upload ${label}.`);
        } finally {
          setLoading(false);
        }
      })();
    };

  const onUploadAvatar = makeImageUploader(setAvatarUrl, setUploadingAvatar, "ảnh đại diện");
  const onUploadImage1 = makeImageUploader(setImageUrl1, setUploading1, "ảnh 1");
  const onUploadImage2 = makeImageUploader(setImageUrl2, setUploading2, "ảnh 2");

  const selectedHint = TYPE_OPTIONS.find((t) => t.value === type)?.hint ?? "";

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <Link href="/admin/feedback" className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900">
            <ArrowLeft size={16} />
            Quản lý Feedback
          </Link>
          <h1 className="mt-2 font-heading font-black text-gray-900 text-2xl">Tạo feedback</h1>
          <p className="text-gray-500 text-sm mt-1">Thêm minh chứng mới (Trước &amp; Sau / Chia sẻ / Bình luận)</p>
        </div>
        <button
          onClick={onSave}
          disabled={!canSave || submitting}
          className="bg-[#c0392b] hover:bg-[#96281b] disabled:opacity-40 disabled:hover:bg-[#c0392b] text-white text-sm font-bold px-4 py-2.5 rounded-sm transition-colors"
        >
          {submitting ? "Đang lưu..." : "Lưu feedback"}
        </button>
      </div>

      {error ? (
        <div className="mb-4 rounded-sm border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      ) : null}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left column */}
        <div className="lg:col-span-5 space-y-4">
          {/* Type selector */}
          <div className="bg-white border border-gray-200 rounded-sm p-5">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3 block">Loại *</label>
            <div className="space-y-2">
              {TYPE_OPTIONS.map((opt) => (
                <label key={opt.value} className="flex cursor-pointer items-start gap-3 rounded-sm border border-gray-200 p-3 hover:border-[#c0392b]/40">
                  <input
                    type="radio"
                    name="type"
                    value={opt.value}
                    checked={type === opt.value}
                    onChange={() => setType(opt.value)}
                    className="mt-0.5 accent-[#c0392b]"
                  />
                  <div>
                    <div className="text-sm font-semibold text-gray-900">{opt.label}</div>
                    <div className="text-xs text-gray-500">{opt.hint}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Basic info */}
          <div className="bg-white border border-gray-200 rounded-sm p-5 space-y-3">
            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5 block">Tên khách hàng *</label>
              <input
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="VD: Chị Mai Phương"
                className="w-full border border-gray-200 rounded-sm px-3 py-2.5 text-sm focus:outline-none focus:border-[#c0392b]"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5 block">Thông tin phụ</label>
              <input
                value={customerInfo}
                onChange={(e) => setCustomerInfo(e.target.value)}
                placeholder="VD: 45 tuổi, thoát vị L4-L5"
                className="w-full border border-gray-200 rounded-sm px-3 py-2.5 text-sm focus:outline-none focus:border-[#c0392b]"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5 block">Nội dung / Caption</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={3}
                placeholder={type === "before_after" ? "Caption mô tả kết quả..." : "Đoạn quote / lời chia sẻ..."}
                className="w-full border border-gray-200 rounded-sm px-3 py-2.5 text-sm focus:outline-none focus:border-[#c0392b] resize-none"
              />
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white border border-gray-200 rounded-sm p-5 space-y-4">
            <p className="text-xs text-gray-500 italic">{selectedHint}</p>

            {/* Avatar URL */}
            {(type === "testimonial") && (
              <ImageUploadField
                label="Ảnh đại diện"
                value={avatarUrl}
                uploading={uploadingAvatar}
                onChange={onUploadAvatar}
                onClear={() => setAvatarUrl("")}
              />
            )}

            {/* Image 1 */}
            <ImageUploadField
              label={type === "before_after" ? "Ảnh Trước (image_url_1)" : "Ảnh chính (image_url_1)"}
              value={imageUrl1}
              uploading={uploading1}
              onChange={onUploadImage1}
              onClear={() => setImageUrl1("")}
            />

            {/* Image 2 */}
            {(type === "before_after") && (
              <ImageUploadField
                label="Ảnh Sau (image_url_2)"
                value={imageUrl2}
                uploading={uploading2}
                onChange={onUploadImage2}
                onClear={() => setImageUrl2("")}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ImageUploadField({
  label,
  value,
  uploading,
  onChange,
  onClear,
}: {
  label: string;
  value: string;
  uploading: boolean;
  onChange: (file: File | null) => void;
  onClear: () => void;
}) {
  return (
    <div>
      <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5 block">{label}</label>
      <label className="flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-sm border border-dashed border-gray-300 bg-white px-3 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:border-[#c0392b]/50 hover:text-[#c0392b]">
        {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
        {uploading ? "Đang upload..." : "Chọn ảnh từ máy"}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="sr-only"
          onChange={(e) => {
            onChange(e.target.files?.[0] ?? null);
            e.target.value = "";
          }}
        />
      </label>
      {value ? (
        <div className="mt-2 overflow-hidden rounded-sm border border-gray-200 bg-gray-50">
          <img src={value} alt="" className="h-36 w-full object-cover" />
          <div className="flex items-center justify-between gap-3 px-3 py-2">
            <span className="truncate text-xs text-gray-500">{value}</span>
            <button type="button" onClick={onClear} className="shrink-0 text-xs font-semibold text-gray-600 hover:text-[#c0392b]">
              Xóa ảnh
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

