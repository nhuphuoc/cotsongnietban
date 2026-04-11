"use client";

import { useState } from "react";
import Image from "next/image";
import { Search, Shield, User } from "lucide-react";

const users = [
  { id: "1", name: "Nguyễn Thị Lan", email: "lan@gmail.com", avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop", role: "student", courses: ["Phục Hồi Lưng Cơ Bản"], joinedAt: "10/01/2024" },
  { id: "2", name: "Trần Minh Tuấn", email: "tuan@gmail.com", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop", role: "student", courses: ["Corrective Exercise Nâng Cao", "Phục Hồi Lưng Cơ Bản"], joinedAt: "15/01/2024" },
  { id: "3", name: "Lê Thu Hương", email: "huong@gmail.com", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop", role: "student", courses: ["VIP Coach 1-1"], joinedAt: "20/01/2024" },
  { id: "4", name: "Phạm Quốc Hùng", email: "hung@gmail.com", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop", role: "student", courses: ["Phục Hồi Lưng Cơ Bản"], joinedAt: "25/01/2024" },
  { id: "5", name: "Admin Phúc", email: "phuc@cotsongnietban.vn", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop", role: "admin", courses: [], joinedAt: "01/01/2024" },
];

export default function AdminUsersPage() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const filtered = users.filter((u) => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "all" || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="font-heading font-black text-gray-900 text-2xl">Quản Lý Người Dùng</h1>
        <p className="text-gray-500 text-sm mt-1">{users.length} tài khoản trong hệ thống</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm kiếm tên, email..."
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-sm text-sm focus:outline-none focus:border-[#c0392b] bg-white"
          />
        </div>
        <div className="flex gap-2">
          {[
            { value: "all", label: "Tất Cả" },
            { value: "student", label: "Học Viên" },
            { value: "admin", label: "Admin" },
          ].map((f) => (
            <button
              key={f.value}
              onClick={() => setRoleFilter(f.value)}
              className={`px-4 py-2.5 text-xs font-semibold rounded-sm border transition-colors ${
                roleFilter === f.value
                  ? "bg-[#c0392b] text-white border-[#c0392b]"
                  : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                {["Người Dùng", "Email", "Vai Trò", "Khóa Học", "Ngày Tham Gia"].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs text-gray-400 font-semibold uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => (
                <tr key={user.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full overflow-hidden relative shrink-0">
                        <Image src={user.avatar} alt={user.name} fill sizes="36px" className="object-cover" />
                      </div>
                      <span className="font-semibold text-gray-900">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-gray-500">{user.email}</td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${
                      user.role === "admin"
                        ? "bg-purple-50 text-purple-600"
                        : "bg-blue-50 text-blue-600"
                    }`}>
                      {user.role === "admin" ? <Shield size={11} /> : <User size={11} />}
                      {user.role === "admin" ? "Admin" : "Học Viên"}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    {user.courses.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {user.courses.map((c) => (
                          <span key={c} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                            {c}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-300 text-xs">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-gray-500 text-xs">{user.joinedAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
