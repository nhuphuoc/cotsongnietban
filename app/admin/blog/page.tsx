"use client";

import { useState } from "react";
import { Plus, Edit, Trash2, Eye, EyeOff } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const initialPosts = [
  { id: "1", title: "Thoát Vị Đĩa Đệm: Phương Pháp Phục Hồi Không Cần Phẫu Thuật", category: "Liệu Pháp", views: 2456, published: true, date: "15/03/2024" },
  { id: "2", title: "Đau Lưng Mãn Tính: 5 Nguyên Nhân Bạn Chưa Biết", category: "Đau Lưng", views: 1832, published: true, date: "08/03/2024" },
  { id: "3", title: "Functional Patterns Là Gì?", category: "Kiến Thức", views: 3211, published: true, date: "01/03/2024" },
  { id: "4", title: "Tư Thế Ngồi Đúng Cho Dân Văn Phòng", category: "Tư Thế", views: 987, published: true, date: "22/02/2024" },
  { id: "5", title: "Dinh Dưỡng Hỗ Trợ Phục Hồi - Draft", category: "Dinh Dưỡng", views: 0, published: false, date: "10/04/2024" },
];

const categories = ["Liệu Pháp", "Đau Lưng", "Kiến Thức", "Tư Thế", "Dinh Dưỡng"];
const emptyForm = { title: "", category: categories[0], content: "" };

export default function AdminBlogPage() {
  const [posts, setPosts] = useState(initialPosts);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<(typeof initialPosts)[0] | null>(null);
  const [form, setForm] = useState(emptyForm);

  const openAdd = () => {
    setEditingPost(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (editingPost) {
      setPosts((prev) => prev.map((p) => p.id === editingPost.id ? { ...p, title: form.title, category: form.category } : p));
    } else {
      setPosts((prev) => [
        { id: String(Date.now()), title: form.title, category: form.category, views: 0, published: false, date: new Date().toLocaleDateString("vi-VN") },
        ...prev,
      ]);
    }
    setDialogOpen(false);
  };

  const togglePublish = (id: string) => {
    setPosts((prev) => prev.map((p) => p.id === id ? { ...p, published: !p.published } : p));
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading font-black text-gray-900 text-2xl">Quản Lý Blog</h1>
          <p className="text-gray-500 text-sm mt-1">Đăng bài viết và nội dung kiến thức</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 bg-[#c0392b] hover:bg-[#96281b] text-white text-sm font-semibold px-4 py-2.5 rounded-sm transition-colors">
          <Plus size={16} /> Bài Viết Mới
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                {["Tiêu Đề", "Danh Mục", "Lượt Xem", "Ngày Đăng", "Trạng Thái", "Hành Động"].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs text-gray-400 font-semibold uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-5 py-3 font-semibold text-gray-900 max-w-xs">
                    <span className="line-clamp-2">{post.title}</span>
                  </td>
                  <td className="px-5 py-3">
                    <span className="bg-[#c0392b]/10 text-[#c0392b] text-xs font-semibold px-2 py-1 rounded-full">{post.category}</span>
                  </td>
                  <td className="px-5 py-3 text-gray-600">{post.views.toLocaleString()}</td>
                  <td className="px-5 py-3 text-gray-500 text-xs">{post.date}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${post.published ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-500"}`}>
                      {post.published ? "Đã Đăng" : "Bản Nháp"}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => { setEditingPost(post); setForm({ title: post.title, category: post.category, content: "" }); setDialogOpen(true); }} className="text-gray-400 hover:text-gray-900 transition-colors"><Edit size={15} /></button>
                      <button onClick={() => togglePublish(post.id)} className="text-gray-400 hover:text-gray-900 transition-colors">
                        {post.published ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                      <button onClick={() => setPosts((prev) => prev.filter((p) => p.id !== post.id))} className="text-gray-400 hover:text-[#c0392b] transition-colors"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-heading font-bold">
              {editingPost ? "Chỉnh Sửa Bài Viết" : "Bài Viết Mới"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5 block">Tiêu Đề *</label>
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Nhập tiêu đề bài viết..."
                className="w-full border border-gray-200 rounded-sm px-3 py-2.5 text-sm focus:outline-none focus:border-[#c0392b]"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5 block">Danh Mục</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full border border-gray-200 rounded-sm px-3 py-2.5 text-sm focus:outline-none focus:border-[#c0392b]"
              >
                {categories.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5 block">Nội Dung (Rich Text Editor)</label>
              <div className="border border-gray-200 rounded-sm">
                {/* Tiptap Toolbar Mockup */}
                <div className="flex items-center gap-1 px-3 py-2 border-b border-gray-100 bg-gray-50">
                  {["B", "I", "H1", "H2", "•", "🔗", "🖼️"].map((tool) => (
                    <button key={tool} className="w-7 h-7 text-xs text-gray-600 hover:bg-gray-200 rounded font-bold transition-colors">{tool}</button>
                  ))}
                </div>
                <textarea
                  rows={8}
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  placeholder="Nhập nội dung bài viết..."
                  className="w-full px-4 py-3 text-sm text-gray-700 focus:outline-none resize-none"
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">Tích hợp Tiptap Editor khi deploy</p>
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={() => setDialogOpen(false)} className="flex-1 border border-gray-200 text-gray-600 text-sm font-semibold py-2.5 rounded-sm hover:bg-gray-50">Hủy</button>
              <button onClick={handleSave} className="flex-1 bg-gray-900 hover:bg-gray-700 text-white text-sm font-bold py-2.5 rounded-sm transition-colors">Lưu Nháp</button>
              <button onClick={handleSave} className="flex-1 bg-[#c0392b] hover:bg-[#96281b] text-white text-sm font-bold py-2.5 rounded-sm transition-colors">Xuất Bản</button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
