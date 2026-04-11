"use client";

import { useState } from "react";
import { Plus, Edit, Trash2, Eye, EyeOff } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const initialCourses = [
  { id: "1", title: "Phục Hồi Lưng Cơ Bản", price: "1,500,000đ", lessons: 12, students: 486, expiryDays: 90, published: true },
  { id: "2", title: "Corrective Exercise Nâng Cao", price: "3,500,000đ", lessons: 20, students: 312, expiryDays: 180, published: true },
  { id: "3", title: "VIP Coach 1-1", price: "8,000,000đ", lessons: 40, students: 89, expiryDays: 365, published: true },
  { id: "4", title: "Mobility & Flexibility", price: "2,000,000đ", lessons: 15, students: 0, expiryDays: 90, published: false },
];

const emptyForm = { title: "", price: "", expiryDays: "90", description: "" };

export default function CoursesPage() {
  const [courses, setCourses] = useState(initialCourses);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<(typeof initialCourses)[0] | null>(null);
  const [form, setForm] = useState(emptyForm);

  const openAdd = () => {
    setEditingCourse(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (course: (typeof initialCourses)[0]) => {
    setEditingCourse(course);
    setForm({ title: course.title, price: course.price, expiryDays: String(course.expiryDays), description: "" });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (editingCourse) {
      setCourses((prev) =>
        prev.map((c) => c.id === editingCourse.id ? { ...c, title: form.title, price: form.price, expiryDays: Number(form.expiryDays) } : c)
      );
    } else {
      setCourses((prev) => [
        ...prev,
        { id: String(Date.now()), title: form.title, price: form.price, lessons: 0, students: 0, expiryDays: Number(form.expiryDays), published: false },
      ]);
    }
    setDialogOpen(false);
  };

  const togglePublish = (id: string) => {
    setCourses((prev) => prev.map((c) => c.id === id ? { ...c, published: !c.published } : c));
  };

  const deleteCourse = (id: string) => {
    setCourses((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading font-black text-gray-900 text-2xl">Quản Lý Khóa Học</h1>
          <p className="text-gray-500 text-sm mt-1">Thêm, sửa, xóa khóa học và bài giảng</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-[#c0392b] hover:bg-[#96281b] text-white text-sm font-semibold px-4 py-2.5 rounded-sm transition-colors"
        >
          <Plus size={16} /> Thêm Khóa Học
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                {["Tên Khóa Học", "Giá", "Bài Giảng", "Học Viên", "Thời Hạn", "Trạng Thái", "Hành Động"].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs text-gray-400 font-semibold uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {courses.map((course) => (
                <tr key={course.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-5 py-3 font-semibold text-gray-900">{course.title}</td>
                  <td className="px-5 py-3 text-gray-600 whitespace-nowrap">{course.price}</td>
                  <td className="px-5 py-3 text-gray-600">{course.lessons} bài</td>
                  <td className="px-5 py-3 text-gray-600">{course.students}</td>
                  <td className="px-5 py-3 text-gray-600">{course.expiryDays} ngày</td>
                  <td className="px-5 py-3">
                    <span className={`inline-block text-xs font-semibold px-2 py-1 rounded-full ${
                      course.published ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-500"
                    }`}>
                      {course.published ? "Đã Xuất Bản" : "Bản Nháp"}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(course)} className="text-gray-400 hover:text-gray-900 transition-colors"><Edit size={15} /></button>
                      <button onClick={() => togglePublish(course.id)} className="text-gray-400 hover:text-gray-900 transition-colors">
                        {course.published ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                      <button onClick={() => deleteCourse(course.id)} className="text-gray-400 hover:text-[#c0392b] transition-colors"><Trash2 size={15} /></button>
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
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading font-bold">
              {editingCourse ? "Chỉnh Sửa Khóa Học" : "Thêm Khóa Học Mới"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {[
              { label: "Tên Khóa Học *", key: "title", placeholder: "VD: Phục Hồi Lưng Cơ Bản" },
              { label: "Giá (VND) *", key: "price", placeholder: "VD: 1,500,000đ" },
              { label: "Thời Hạn Truy Cập (ngày) *", key: "expiryDays", placeholder: "90" },
            ].map((field) => (
              <div key={field.key}>
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5 block">{field.label}</label>
                <input
                  value={form[field.key as keyof typeof form]}
                  onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                  placeholder={field.placeholder}
                  className="w-full border border-gray-200 rounded-sm px-3 py-2.5 text-sm focus:outline-none focus:border-[#c0392b]"
                />
              </div>
            ))}
            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5 block">Mô Tả</label>
              <textarea
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Mô tả ngắn về khóa học..."
                className="w-full border border-gray-200 rounded-sm px-3 py-2.5 text-sm focus:outline-none focus:border-[#c0392b] resize-none"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={() => setDialogOpen(false)} className="flex-1 border border-gray-200 text-gray-600 text-sm font-semibold py-2.5 rounded-sm hover:bg-gray-50">Hủy</button>
              <button onClick={handleSave} className="flex-1 bg-[#c0392b] hover:bg-[#96281b] text-white text-sm font-bold py-2.5 rounded-sm transition-colors">Lưu</button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
