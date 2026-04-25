"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, ExternalLink, Loader2, Trash2, Upload } from "lucide-react";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { apiFetch, slugifyClient } from "@/lib/admin/api-client";
import { uploadAdminImage } from "@/lib/admin/upload-image";
import { crudNotify, notifyApiProblem, notify } from "@/lib/ui/notify";

type BlogCategory = {
  id: string;
  name: string;
  slug: string;
  sort_order: number | null;
};

export default function AdminBlogEditPage() {
  const params = useParams<{ postId: string }>();
  const router = useRouter();
  const postId = params.postId;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [post, setPost] = useState<any | null>(null);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [categoryId, setCategoryId] = useState("");
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [excerpt, setExcerpt] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [contentHtml, setContentHtml] = useState("<p></p>");
  const [coverUploading, setCoverUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<any>(`/api/admin/blog/${postId}`);
      setPost(data);
    } catch (e: any) {
      notifyApiProblem(e, { fallbackTitle: "Không thể tải bài viết" });
      setError(e?.message ?? "Không thể tải bài viết.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [postId]);

  useEffect(() => {
    if (!post) return;
    setTitle(post.title ?? "");
    setSlug(post.slug ?? "");
    setCategoryId(post.category?.id ?? "");
    setExcerpt(post.excerpt ?? "");
    setCoverImage(post.cover_image_url ?? "");
    setStatus(post.status === "published" ? "published" : "draft");
    setContentHtml(post.content_html ?? "<p></p>");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [post?.id]);

  useEffect(() => {
    let cancelled = false;
    const loadCategories = async () => {
      setCategoriesLoading(true);
      try {
        const data = await apiFetch<BlogCategory[]>("/api/admin/blog-categories");
        if (cancelled) return;
        setCategories(data);
        setCategoryId((prev) => prev || data[0]?.id || "");
      } catch (e) {
        if (!cancelled) {
          notifyApiProblem(e, { fallbackTitle: "Không thể tải danh mục blog" });
        }
      } finally {
        if (!cancelled) setCategoriesLoading(false);
      }
    };

    void loadCategories();
    return () => {
      cancelled = true;
    };
  }, []);

  const canSave = useMemo(() => title.trim().length >= 6 && excerpt.trim().length >= 12, [title, excerpt]);

  const onSave = () => {
    void (async () => {
      if (!post || !canSave || saving) return;
      setSaving(true);
      setError(null);
      try {
        const updated = await crudNotify.update(
          () =>
            apiFetch<any>(`/api/admin/blog/${post.id}`, {
              method: "PATCH",
              body: JSON.stringify({
                title: title.trim(),
                slug: slug.trim() || slugifyClient(title),
                excerpt: excerpt.trim(),
                coverImageUrl: coverImage.trim() || null,
                contentHtml,
                status,
                categoryId: categoryId || null,
              }),
            }),
          { entity: "bài viết" }
        );
        setPost(updated);
      } catch (e: any) {
        setError(e?.message ?? "Không thể lưu thay đổi.");
      } finally {
        setSaving(false);
      }
    })();
  };

  const onDelete = () => {
    void (async () => {
      if (!post) return;
      setError(null);
      try {
        await crudNotify.remove(() => apiFetch<{ id: string; deleted: true }>(`/api/admin/blog/${post.id}`, { method: "DELETE" }), {
          entity: "bài viết",
        });
        notify.info("Đã xóa bài viết", "Đang quay về danh sách blog.");
        router.push("/admin/blog");
      } catch (e: any) {
        setError(e?.message ?? "Không thể xóa bài viết.");
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

  if (loading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="text-gray-500 text-sm">Đang tải...</div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="p-6 lg:p-8">
        <Link href="/admin/blog" className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900">
          <ArrowLeft size={16} />
          Quản lý Blog
        </Link>
        <div className="mt-4 rounded-sm border border-gray-200 bg-white p-6">
          <div className="font-heading font-black text-gray-900 text-lg">Không tìm thấy bài viết</div>
          <p className="mt-1 text-sm text-gray-500">{error ?? "Có thể bài đã bị xoá hoặc ID không tồn tại."}</p>
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
          <Link href="/admin/blog" className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900">
            <ArrowLeft size={16} />
            Quản lý Blog
          </Link>
          <h1 className="mt-2 font-heading font-black text-gray-900 text-2xl line-clamp-2">{post.title}</h1>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-500">
            <span className="rounded-full bg-gray-100 px-2 py-1 font-mono">id: {post.id}</span>
            <span className="rounded-full bg-gray-100 px-2 py-1 font-mono">slug: {slug || post.slug}</span>
            <span className={`rounded-full px-2 py-1 font-semibold ${post.status === "published" ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-600"}`}>
              {post.status === "published" ? "Đã đăng" : "Bản nháp"}
            </span>
            <span className="text-gray-400">·</span>
            <span>Cập nhật: {new Date(post.updated_at).toLocaleString("vi-VN")}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          <Link
            href={`/blog/${post.slug}`}
            target="_blank"
            className="inline-flex h-11 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-700 transition-colors hover:border-gray-300 hover:bg-gray-50"
          >
            Xem public <ExternalLink size={16} />
          </Link>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
            className="h-11 shrink-0 rounded-lg border border-gray-200 bg-white px-3.5 text-sm font-semibold text-gray-700 focus:border-[#c0392b] focus:outline-none"
          >
            <option value="draft">Bản nháp</option>
            <option value="published">Xuất bản</option>
          </select>
          <button
            onClick={onSave}
            disabled={!canSave}
            className="inline-flex h-11 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-[#c0392b] px-4 text-sm font-bold text-white transition-colors hover:bg-[#96281b] disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : null}
            {saving ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
          <button
            onClick={onDelete}
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-red-100 bg-white text-red-500 transition-colors hover:bg-red-50 hover:text-red-600"
            title="Xóa bài viết"
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
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white border border-gray-200 rounded-sm p-5">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5 block">Tiêu đề *</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-gray-200 rounded-sm px-3 py-2.5 text-sm focus:outline-none focus:border-[#c0392b]"
            />
            <label className="mt-4 text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5 block">Slug *</label>
            <input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="vi-du-ten-bai-viet"
              className="w-full border border-gray-200 rounded-sm px-3 py-2.5 text-sm font-mono focus:outline-none focus:border-[#c0392b]"
            />
            <p className="mt-1 text-xs text-gray-400">Dùng cho URL public của bài viết.</p>
            <label className="mt-4 text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5 block">Tóm tắt *</label>
            <textarea
              rows={3}
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              className="w-full border border-gray-200 rounded-sm px-3 py-2.5 text-sm focus:outline-none focus:border-[#c0392b] resize-none"
            />
          </div>

          <div className="bg-white border border-gray-200 rounded-sm p-5">
            <div className="mb-2 flex items-center justify-between gap-3">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Nội dung</label>
              <span className="text-xs text-gray-400">Tiptap Editor</span>
            </div>
            <RichTextEditor valueHtml={contentHtml} onChangeHtml={setContentHtml} />
          </div>
        </div>

        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white border border-gray-200 rounded-sm p-5">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5 block">Danh mục</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              disabled={categoriesLoading || categories.length === 0}
              className="w-full border border-gray-200 rounded-sm px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-[#c0392b] disabled:bg-gray-100 disabled:text-gray-400"
            >
              {categories.length === 0 ? (
                <option value="">
                  {categoriesLoading ? "Đang tải danh mục..." : "Không có danh mục"}
                </option>
              ) : categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
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
              <p className="mt-2 text-xs text-gray-400">Để trống nếu không dùng.</p>
            )}
          </div>

          <div className="bg-white border border-gray-200 rounded-sm p-5">
            <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Thông tin</div>
            <div className="mt-3 space-y-2 text-sm text-gray-600">
              <div className="flex items-center justify-between gap-3">
                <span className="text-gray-500">Views</span>
                <span className="font-semibold text-gray-900">{Number(post.view_count ?? 0).toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-gray-500">Tạo lúc</span>
                <span className="text-gray-700">{new Date(post.created_at).toLocaleDateString("vi-VN")}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-gray-500">Cập nhật</span>
                <span className="text-gray-700">{new Date(post.updated_at).toLocaleDateString("vi-VN")}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

