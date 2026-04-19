"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Trash2, Upload } from "lucide-react";
import { apiFetch } from "@/lib/admin/api-client";
import { uploadAdminImage } from "@/lib/admin/upload-image";
import type { AdminFeedback, AdminFeedbackType } from "@/lib/admin/feedback-types";
import { crudNotify, notifyApiProblem, notify } from "@/lib/ui/notify";

const TYPE_OPTIONS: { value: AdminFeedbackType; label: string }[] = [
  { value: "before_after", label: "Trước & Sau" },
  { value: "testimonial", label: "Chia sẻ" },
  { value: "comment", label: "Bình luận" },
];

export default function AdminFeedbackDetailPage() {
  const params = useParams<{ feedbackId: string }>();
  const router = useRouter();

  const id = params.feedbackId;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [item, setItem] = useState<AdminFeedback | null>(null);

  const [type, setType] = useState<AdminFeedbackType>("testimonial");
  const [customerName, setCustomerName] = useState("");
  const [customerInfo, setCustomerInfo] = useState("");
  const [content, setContent] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [imageUrl1, setImageUrl1] = useState("");
  const [imageUrl2, setImageUrl2] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [uploading1, setUploading1] = useState(false);
  const [uploading2, setUploading2] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<AdminFeedback>(`/api/admin/feedback/${id}`);
      setItem(data);
    } catch (e: any) {
      notifyApiProblem(e, { fallbackTitle: "Không thể tải feedback" });
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
    setType(item.type);
    setCustomerName(item.customer_name ?? "");
    setCustomerInfo(item.customer_info ?? "");
    setContent(item.content ?? "");
    setAvatarUrl(item.avatar_url ?? "");
    setImageUrl1(item.image_url_1 ?? "");
    setImageUrl2(item.image_url_2 ?? "");
    setIsActive(item.is_active);
  }, [item?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const canSave = useMemo(() => customerName.trim().length >= 2, [customerName]);

  const onSave = () => {
    void (async () => {
      if (!item || !canSave || saving) return;
      setSaving(true);
      setError(null);
      try {
        const updated = await crudNotify.update(
          () =>
            apiFetch<AdminFeedback>(`/api/admin/feedback/${item.id}`, {
              method: "PATCH",
              body: JSON.stringify({
                type,
                customerName: customerName.trim(),
                customerInfo: customerInfo.trim() || null,
                content: content.trim() || null,
                avatarUrl: avatarUrl.trim() || null,
                imageUrl1: imageUrl1.trim() || null,
                imageUrl2: imageUrl2.trim() || null,
                isActive,
              }),
            }),
          { entity: "feedback" }
        );
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
        await crudNotify.remove(() => apiFetch<{ id: string; deleted: true }>(`/api/admin/feedback/${item.id}`, { method: "DELETE" }), {
          entity: "feedback",
        });
        notify.info("Đã xóa feedback", "Đang quay về danh sách feedback.");
        router.push("/admin/feedback");
      } catch (e: any) {
        setError(e?.message ?? "Không thể xóa feedback.");
      }
    })();
  };

  const makeImageUploader = (setter: (v: string) => void, setUploading: (v: boolean) => void, label: string) =>
    (file: File | null) => {
      if (!file) return;
      void (async () => {
        setUploading(true);
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
          setUploading(false);
        }
      })();
    };

  const onUploadAvatar = makeImageUploader(setAvatarUrl, setUploadingAvatar, "ảnh đại diện");
  const onUploadImage1 = makeImageUploader(setImageUrl1, setUploading1, "ảnh 1");
  const onUploadImage2 = makeImageUploader(setImageUrl2, setUploading2, "ảnh 2");

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
          <button onClick={load} className="mt-3 text-sm font-semibold text-[#c0392b] hover:underline">Thử lại</button>
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
            <span>Tạo: {new Date(item.created_at).toLocaleString("vi-VN")}</span>
          </div>
        </div>
        <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
          <button
            onClick={onSave}
            disabled={!canSave || saving}
            className="bg-[#c0392b] hover:bg-[#96281b] disabled:opacity-40 disabled:hover:bg-[#c0392b] text-white text-sm font-bold px-4 py-2.5 rounded-sm transition-colors"
          >
            {saving ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
          <button
            onClick={onDelete}
            className="inline-flex items-center justify-center gap-2 rounded-sm border border-gray-200 bg-white px-3 py-2.5 text-sm font-semibold text-gray-700 hover:border-[#c0392b]/40 hover:text-[#c0392b]"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {error ? (
        <div className="mb-4 rounded-sm border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      ) : null}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white border border-gray-200 rounded-sm p-5 space-y-3">
            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5 block">Loại *</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as AdminFeedbackType)}
                className="w-full border border-gray-200 rounded-sm px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-[#c0392b]"
              >
                {TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5 block">Tên khách hàng *</label>
              <input
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
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
                className="w-full border border-gray-200 rounded-sm px-3 py-2.5 text-sm focus:outline-none focus:border-[#c0392b] resize-none"
              />
            </div>
            <div>
              <label className="flex cursor-pointer items-center gap-3 text-sm">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="accent-[#c0392b]"
                />
                <span className="font-semibold text-gray-700">Hiển thị (is_active)</span>
              </label>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white border border-gray-200 rounded-sm p-5 space-y-4">
            {type === "testimonial" && (
              <ImageUploadField
                label="Ảnh đại diện (avatar_url)"
                value={avatarUrl}
                uploading={uploadingAvatar}
                onChange={onUploadAvatar}
                onClear={() => setAvatarUrl("")}
              />
            )}
            <ImageUploadField
              label={type === "before_after" ? "Ảnh Trước (image_url_1)" : "Ảnh chính (image_url_1)"}
              value={imageUrl1}
              uploading={uploading1}
              onChange={onUploadImage1}
              onClear={() => setImageUrl1("")}
            />
            {type === "before_after" && (
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


