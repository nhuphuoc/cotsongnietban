"use client";

import { useCallback, useEffect, useState } from "react";
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

type UsersPagePayload = {
  items: AdminUserRow[];
  total: number;
  page: number;
  pageSize: number;
};

function usersListUrl(
  page: number,
  pageSize: number,
  role: "all" | UserRole,
  q: string,
  sortBy: "created_at" | "full_name" | "role" | "is_active",
  sortDir: "asc" | "desc",
) {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("pageSize", String(pageSize));
  params.set("role", role);
  const trimmed = q.trim();
  if (trimmed) params.set("q", trimmed);
  params.set("sort", sortBy);
  params.set("dir", sortDir);
  return `/api/admin/users?${params.toString()}`;
}

export default function AdminUsersPage() {
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | UserRole>("all");
  const [sortBy, setSortBy] = useState<"created_at" | "full_name" | "role" | "is_active">("created_at");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [items, setItems] = useState<AdminUserRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<{ action: "ban" | "unban" | "remove"; userId: string } | null>(null);

  useEffect(() => {
    if (searchInput === debouncedSearch) return;
    const t = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setPage(1);
    }, 350);
    return () => clearTimeout(t);
  }, [searchInput, debouncedSearch]);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<UsersPagePayload>(
        usersListUrl(page, pageSize, roleFilter, debouncedSearch, sortBy, sortDir),
      );
      setItems(data.items);
      setTotal(data.total);
    } catch (e) {
      notifyApiProblem(e, { fallbackTitle: "Không thể tải danh sách người dùng" });
      setError(e instanceof Error ? e.message : "Không thể tải danh sách người dùng.");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, roleFilter, debouncedSearch, sortBy, sortDir]);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  const handleSort = (next: "created_at" | "full_name" | "role" | "is_active") => {
    if (sortBy === next) {
      setSortDir((dir) => (dir === "asc" ? "desc" : "asc"));
      return;
    }
    setSortBy(next);
    setSortDir("desc");
    setPage(1);
  };

  const SortMark = ({ active }: { active: boolean }) => (
    <span className={`ml-1 inline-flex flex-col leading-none ${active ? "text-[#c0392b]" : "text-gray-300"}`}>
      <ChevronUp size={10} className={active && sortDir === "asc" ? "opacity-100" : "opacity-50"} />
      <ChevronDown size={10} className={`-mt-0.5 ${active && sortDir === "desc" ? "opacity-100" : "opacity-50"}`} />
    </span>
  );

  const selectedUser = confirm ? items.find((u) => u.id === confirm.userId) ?? null : null;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

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
      } else {
        const nextIsActive = confirm.action === "unban";
        await crudNotify.update(
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
      }
      setConfirm(null);
      await loadUsers();
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
        <p className="text-gray-500 text-sm mt-1">{total.toLocaleString("vi-VN")} tài khoản trong hệ thống</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Tìm kiếm tên, email..."
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-sm text-sm focus:outline-none focus:border-[#c0392b] bg-white"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {[
            { value: "all", label: "Tất Cả" },
            { value: "student", label: "Học Viên" },
            { value: "coach", label: "Coach" },
            { value: "admin", label: "Admin" },
          ].map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => {
                setRoleFilter(f.value as "all" | UserRole);
                setPage(1);
              }}
              className={`px-4 py-2.5 text-xs font-semibold rounded-sm border transition-colors ${
                roleFilter === f.value
                  ? "bg-[#c0392b] text-white border-[#c0392b]"
                  : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
              }`}
            >
              {f.label}
            </button>
          ))}
          <label className="ml-auto flex items-center gap-2 text-xs text-gray-500">
            <span className="hidden sm:inline">Hiển thị</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              className="rounded-sm border border-gray-200 bg-white py-2 pl-2 pr-8 text-xs font-semibold text-gray-700"
            >
              <option value={10}>10 / trang</option>
              <option value={20}>20 / trang</option>
              <option value={50}>50 / trang</option>
              <option value={100}>100 / trang</option>
            </select>
          </label>
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
              ) : items.length === 0 ? (
                <tr>
                  <td className="px-5 py-10 text-center text-sm text-gray-400" colSpan={7}>
                    Không có người dùng phù hợp bộ lọc.
                  </td>
                </tr>
              ) : (
                items.map((user) => {
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
                          ? "bg-[#004E4B]/10 text-[#004E4B]"
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
              })
              )}
            </tbody>
          </table>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 px-5 py-3 text-sm text-gray-600">
          <span>
            {total === 0
              ? "0 người dùng"
              : `${(page - 1) * pageSize + 1}–${Math.min(page * pageSize, total)} / ${total.toLocaleString("vi-VN")}`}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1 || loading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-sm border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 disabled:opacity-40"
            >
              Trước
            </button>
            <span className="tabular-nums text-xs">
              Trang {page} / {totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages || loading}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-sm border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 disabled:opacity-40"
            >
              Sau
            </button>
          </div>
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
