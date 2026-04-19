"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, ExternalLink, Trash2 } from "lucide-react";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { apiFetch, slugifyClient } from "@/lib/admin/api-client";

const categories = ["Liệu Pháp", "Đau Lưng", "Kiến Thức"];

export default function AdminBlogEditPage() {
  const params = useParams<{ postId: string }>();
  const router = useRouter();
  const postId = params.postId;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [post, setPost] = useState<any | null>(null);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(categories[0]);
  const [excerpt, setExcerpt] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [contentHtml, setContentHtml] = useState("<p></p>");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<any>(`/api/admin/blog/${postId}`);
      setPost(data);
    } catch (e: any) {
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
    setCategory(post.category?.name ?? categories[0]);
    setExcerpt(post.excerpt ?? "");
    setCoverImage(post.cover_image_url ?? "");
    setStatus(post.status === "published" ? "published" : "draft");
    setContentHtml(post.content_html ?? "<p></p>");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [post?.id]);

  const canSave = useMemo(() => title.trim().length >= 6 && excerpt.trim().length >= 12, [title, excerpt]);

  const onSave = () => {
    void (async () => {
      if (!post || !canSave || saving) return;
      setSaving(true);
      setError(null);
      try {
        const updated = await apiFetch<any>(`/api/admin/blog/${post.id}`, {
          method: "PATCH",
          body: JSON.stringify({
            title: title.trim(),
            slug: slugifyClient(title),
            excerpt: excerpt.trim(),
            coverImageUrl: coverImage.trim() || null,
            contentHtml,
            status,
            categorySlug: slugifyClient(category),
          }),
        });
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
        await apiFetch<{ id: string; deleted: true }>(`/api/admin/blog/${post.id}`, { method: "DELETE" });
        router.push("/admin/blog");
      } catch (e: any) {
        setError(e?.message ?? "Không thể xóa bài viết.");
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
            <span className="rounded-full bg-gray-100 px-2 py-1 font-mono">slug: {post.slug}</span>
            <span className={`rounded-full px-2 py-1 font-semibold ${post.status === "published" ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-600"}`}>
              {post.status === "published" ? "Đã đăng" : "Bản nháp"}
            </span>
            <span className="text-gray-400">·</span>
            <span>Cập nhật: {new Date(post.updated_at).toLocaleString("vi-VN")}</span>
          </div>
        </div>

        <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
          <Link
            href={`/blog/${post.slug}`}
            target="_blank"
            className="inline-flex items-center justify-center gap-2 rounded-sm border border-gray-200 bg-white px-3 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            Xem public <ExternalLink size={16} />
          </Link>
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
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white border border-gray-200 rounded-sm p-5">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5 block">Tiêu đề *</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-gray-200 rounded-sm px-3 py-2.5 text-sm focus:outline-none focus:border-[#c0392b]"
            />
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

            <label className="mt-4 text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5 block">
              Ảnh cover (URL)
            </label>
            <input
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full border border-gray-200 rounded-sm px-3 py-2.5 text-sm focus:outline-none focus:border-[#c0392b]"
            />
            <p className="mt-2 text-xs text-gray-400">Để trống nếu không dùng.</p>
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

