"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Ban, CheckCircle2, ChevronDown, ChevronUp, Loader2, Search, Shield, Trash2, User } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { apiFetch } from "@/lib/admin/api-client";
import { crudNotify, notifyApiProblem } from "@/lib/ui/notify";

type UserRole = "admin" | "coach" | "student";

type AdminUserRow = {
  id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  enrollments?: Array<{
    id: string;
    status?: string;
    course?: { title?: string | null } | null;
  }>;
};

export default function AdminUsersPage() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | UserRole>("all");
  const [sortBy, setSortBy] = useState<"created_at" | "full_name" | "role" | "is_active">("created_at");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [items, setItems] = useState<AdminUserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<{ action: "ban" | "unban" | "remove"; userId: string } | null>(null);

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<AdminUserRow[]>("/api/admin/users");
      setItems(data);
    } catch (e) {
      notifyApiProblem(e, { fallbackTitle: "Không thể tải danh sách người dùng" });
      setError(e instanceof Error ? e.message : "Không thể tải danh sách người dùng.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadUsers();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((u) => {
      const name = (u.full_name ?? "").toLowerCase();
      const email = (u.email ?? "").toLowerCase();
      const matchSearch = !q || name.includes(q) || email.includes(q);
      const matchRole = roleFilter === "all" || u.role === roleFilter;
      return matchSearch && matchRole;
    });
  }, [items, search, roleFilter]);

  const sorted = useMemo(() => {
    const toTs = (value: string | null | undefined) => {
      if (!value) return null;
      const ts = new Date(value).getTime();
      return Number.isNaN(ts) ? null : ts;
    };
    const list = [...filtered];
    list.sort((a, b) => {
      let result = 0;
      if (sortBy === "full_name") {
        const aName = a.full_name?.trim() || a.email || "";
        const bName = b.full_name?.trim() || b.email || "";
        result = aName.localeCompare(bName, "vi");
      } else if (sortBy === "role") {
        result = a.role.localeCompare(b.role, "vi");
      } else if (sortBy === "is_active") {
        result = Number(a.is_active) - Number(b.is_active);
      } else {
        const aTs = toTs(a.created_at);
        const bTs = toTs(b.created_at);
        if (aTs == null && bTs == null) {
          const aName = a.full_name?.trim() || a.email || "";
          const bName = b.full_name?.trim() || b.email || "";
          result = aName.localeCompare(bName, "vi");
        } else if (aTs == null) {
          result = 1;
        } else if (bTs == null) {
          result = -1;
        } else {
          result = aTs - bTs;
        }
      }
      return sortDir === "asc" ? result : -result;
    });
    return list;
  }, [filtered, sortBy, sortDir]);

  const handleSort = (next: "created_at" | "full_name" | "role" | "is_active") => {
    if (sortBy === next) {
      setSortDir((dir) => (dir === "asc" ? "desc" : "asc"));
      return;
    }
    setSortBy(next);
    setSortDir("desc");
  };

  const SortMark = ({ active }: { active: boolean }) => (
    <span className={`ml-1 inline-flex flex-col leading-none ${active ? "text-[#c0392b]" : "text-gray-300"}`}>
      <ChevronUp size={10} className={active && sortDir === "asc" ? "opacity-100" : "opacity-50"} />
      <ChevronDown size={10} className={`-mt-0.5 ${active && sortDir === "desc" ? "opacity-100" : "opacity-50"}`} />
    </span>
  );

  const selectedUser = confirm ? items.find((u) => u.id === confirm.userId) ?? null : null;

  const displayName = (user: AdminUserRow) => {
    return user.full_name?.trim() || user.email || `User ${user.id.slice(0, 8)}`;
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString("vi-VN");
  };

  const doAction = async () => {
    if (!confirm || !selectedUser) return;
    setActionLoading(true);
    setError(null);
    try {
      if (confirm.action === "remove") {
        await crudNotify.remove(
          () => apiFetch<{ id: string; deleted: true }>(`/api/admin/users/${selectedUser.id}`, { method: "DELETE" }),
          { entity: "người dùng" }
        );
        setItems((prev) => prev.filter((u) => u.id !== selectedUser.id));
      } else {
        const nextIsActive = confirm.action === "unban";
        const updated = await crudNotify.update(
          () =>
            apiFetch<AdminUserRow>(`/api/admin/users/${selectedUser.id}`, {
              method: "PATCH",
              body: JSON.stringify({ isActive: nextIsActive }),
            }),
          {
            entity: "trạng thái người dùng",
            successMessage: nextIsActive ? "Đã mở khóa tài khoản." : "Đã khóa tài khoản.",
          }
        );
        setItems((prev) => prev.map((u) => (u.id === selectedUser.id ? { ...u, is_active: updated.is_active } : u)));
      }
      setConfirm(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không thể xử lý thao tác.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="font-heading font-black text-gray-900 text-2xl">Quản Lý Người Dùng</h1>
        <p className="text-gray-500 text-sm mt-1">{items.length} tài khoản trong hệ thống</p>
      </div>

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
            { value: "coach", label: "Coach" },
            { value: "admin", label: "Admin" },
          ].map((f) => (
            <button
              key={f.value}
              onClick={() => setRoleFilter(f.value as "all" | UserRole)}
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

      {error ? (
        <div className="mb-4 rounded-sm border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
          <button type="button" onClick={() => void loadUsers()} className="ml-2 font-semibold underline underline-offset-2">
            Thử lại
          </button>
        </div>
      ) : null}

      <div className="bg-white border border-gray-200 rounded-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-5 py-3 text-xs text-gray-400 font-semibold uppercase tracking-wide whitespace-nowrap">
                  <button type="button" onClick={() => handleSort("full_name")} className="inline-flex w-full items-center justify-start hover:text-gray-600">
                    Người Dùng
                    <SortMark active={sortBy === "full_name"} />
                  </button>
                </th>
                <th className="text-left px-5 py-3 text-xs text-gray-400 font-semibold uppercase tracking-wide whitespace-nowrap">
                  Email
                </th>
                <th className="text-left px-5 py-3 text-xs text-gray-400 font-semibold uppercase tracking-wide whitespace-nowrap">
                  <button type="button" onClick={() => handleSort("role")} className="inline-flex w-full items-center justify-start hover:text-gray-600">
                    Vai Trò
                    <SortMark active={sortBy === "role"} />
                  </button>
                </th>
                <th className="text-left px-5 py-3 text-xs text-gray-400 font-semibold uppercase tracking-wide whitespace-nowrap">
                  <button type="button" onClick={() => handleSort("is_active")} className="inline-flex w-full items-center justify-start hover:text-gray-600">
                    Trạng Thái
                    <SortMark active={sortBy === "is_active"} />
                  </button>
                </th>
                <th className="text-left px-5 py-3 text-xs text-gray-400 font-semibold uppercase tracking-wide whitespace-nowrap">
                  Khóa Học
                </th>
                <th className="text-left px-5 py-3 text-xs text-gray-400 font-semibold uppercase tracking-wide whitespace-nowrap">
                  <button type="button" onClick={() => handleSort("created_at")} className="inline-flex w-full items-center justify-start hover:text-gray-600">
                    Ngày Tham Gia
                    <SortMark active={sortBy === "created_at"} />
                  </button>
                </th>
                <th className="text-left px-5 py-3 text-xs text-gray-400 font-semibold uppercase tracking-wide whitespace-nowrap">
                  Hành Động
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td className="px-5 py-10 text-center text-sm text-gray-400" colSpan={7}>
                    Đang tải...
                  </td>
                </tr>
              ) : null}
              {sorted.map((user) => {
                const courses = (user.enrollments ?? [])
                  .map((enrollment) => enrollment.course?.title?.trim() ?? "")
                  .filter(Boolean);
                const uniqueCourses = [...new Set(courses)];
                return (
                  <tr key={user.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full overflow-hidden relative shrink-0 bg-gray-100">
                          {user.avatar_url ? (
                            <Image src={user.avatar_url} alt={displayName(user)} fill sizes="36px" className="object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-gray-400">
                              <User size={16} />
                            </div>
                          )}
                        </div>
                        <span className="font-semibold text-gray-900">{displayName(user)}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-gray-500">{user.email ?? "—"}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${
                        user.role === "admin"
                          ? "bg-purple-50 text-purple-600"
                          : user.role === "coach"
                            ? "bg-amber-50 text-amber-700"
                            : "bg-blue-50 text-blue-600"
                      }`}>
                        {user.role === "admin" ? <Shield size={11} /> : <User size={11} />}
                        {user.role === "admin" ? "Admin" : user.role === "coach" ? "Coach" : "Học Viên"}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${
                          user.is_active ? "bg-green-50 text-green-700" : "bg-orange-50 text-orange-700"
                        }`}
                      >
                        {user.is_active ? <CheckCircle2 size={11} /> : <Ban size={11} />}
                        {user.is_active ? "Hoạt động" : "Đã khóa"}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      {uniqueCourses.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {uniqueCourses.map((c) => (
                            <span key={c} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                              {c}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-300 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-gray-500 text-xs">{formatDate(user.created_at)}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        {user.role !== "admin" ? (
                          <>
                            {user.is_active ? (
                              <button
                                onClick={() => setConfirm({ action: "ban", userId: user.id })}
                                className="text-gray-400 hover:text-gray-900 transition-colors"
                                title="Khóa"
                              >
                                <Ban size={15} />
                              </button>
                            ) : (
                              <button
                                onClick={() => setConfirm({ action: "unban", userId: user.id })}
                                className="text-gray-400 hover:text-gray-900 transition-colors"
                                title="Mở khóa"
                              >
                                <CheckCircle2 size={15} />
                              </button>
                            )}
                            <button
                              onClick={() => setConfirm({ action: "remove", userId: user.id })}
                              className="text-gray-400 hover:text-[#c0392b] transition-colors"
                              title="Xóa"
                            >
                              <Trash2 size={15} />
                            </button>
                          </>
                        ) : (
                          <span className="text-gray-300 text-xs">—</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {!loading && sorted.length === 0 ? (
                <tr>
                  <td className="px-5 py-10 text-center text-sm text-gray-400" colSpan={7}>
                    Không có người dùng phù hợp bộ lọc.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={!!confirm} onOpenChange={() => setConfirm(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-heading font-bold text-gray-900">Xác nhận thao tác</DialogTitle>
          </DialogHeader>
          {confirm && selectedUser ? (
            <div className="space-y-4">
              <div className="rounded-sm border border-gray-200 bg-gray-50 p-4 text-sm">
                <div className="font-semibold text-gray-900">{displayName(selectedUser)}</div>
                <div className="text-xs text-gray-500">{selectedUser.email ?? "—"}</div>
              </div>
              <p className="text-sm text-gray-600">
                {confirm.action === "remove"
                  ? "Xóa người dùng khỏi hệ thống?"
                  : confirm.action === "ban"
                    ? "Khóa tài khoản người dùng này?"
                    : "Mở khóa tài khoản người dùng này?"}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setConfirm(null)}
                  disabled={actionLoading}
                  className="flex-1 border border-gray-200 text-gray-600 text-sm font-semibold py-2.5 rounded-sm hover:bg-gray-50 transition-colors disabled:opacity-60"
                >
                  Hủy
                </button>
                <button
                  onClick={() => void doAction()}
                  disabled={actionLoading}
                  className="inline-flex flex-1 items-center justify-center gap-2 bg-[#c0392b] hover:bg-[#96281b] text-white text-sm font-bold py-2.5 rounded-sm transition-colors disabled:opacity-60"
                >
                  {actionLoading ? <Loader2 size={14} className="animate-spin" /> : null}
                  Xác nhận
                </button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
