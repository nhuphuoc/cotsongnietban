"use client";

import { useEffect, useState, useRef } from "react";
import { X, Loader2, Search } from "lucide-react";

type CourseOption = { id: string; title: string };
type VoucherFull = {
  id: string;
  code: string;
  description: string | null;
  terms: string | null;
  discount_type: "percentage" | "fixed_amount" | "free";
  discount_value: number | null;
  max_discount_vnd: number | null;
  min_order_vnd: number;
  max_uses: number | null;
  max_uses_per_user: number;
  target_type: "all" | "new_users";
  scope: "sitewide" | "specific_courses" | "specific_user";
  user_id: string | null;
  is_public: boolean;
  status: string;
  starts_at: string | null;
  expires_at: string;
  voucher_courses: { course_id: string }[];
};

type Props = {
  open: boolean;
  onClose: () => void;
  editId: string | null;
};

const DISCOUNT_TYPES = [
  { value: "percentage", label: "Phần trăm (%)" },
  { value: "fixed_amount", label: "Số tiền cố định (VND)" },
  { value: "free", label: "Miễn phí" },
];

const SCOPES = [
  { value: "sitewide", label: "Toàn bộ khóa học" },
  { value: "specific_courses", label: "Khóa học cụ thể" },
  { value: "specific_user", label: "User cụ thể" },
];

const TARGET_TYPES = [
  { value: "all", label: "Tất cả người dùng" },
  { value: "new_users", label: "Chỉ học viên mới (chưa mua khóa nào)" },
];

const STATUSES = [
  { value: "draft", label: "Nháp" },
  { value: "active", label: "Hoạt động" },
  { value: "paused", label: "Tạm dừng" },
];

export function VoucherFormDialog({ open, onClose, editId }: Props) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [courses, setCourses] = useState<CourseOption[]>([]);

  // Form state
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [terms, setTerms] = useState("");
  const [discountType, setDiscountType] = useState("percentage");
  const [discountValue, setDiscountValue] = useState("");
  const [maxDiscountVnd, setMaxDiscountVnd] = useState("");
  const [minOrderVnd, setMinOrderVnd] = useState("0");
  const [maxUses, setMaxUses] = useState("");
  const [maxUsesPerUser, setMaxUsesPerUser] = useState("1");
  const [targetType, setTargetType] = useState("all");
  const [scope, setScope] = useState("sitewide");
  const [userId, setUserId] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [status, setStatus] = useState("draft");
  const [startsAt, setStartsAt] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>([]);

  // User search
  const [userSearch, setUserSearch] = useState("");
  const [userSearchResults, setUserSearchResults] = useState<{ id: string; email: string; full_name: string | null }[]>([]);
  const [userSearchLoading, setUserSearchLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<{ id: string; email: string; full_name: string | null } | null>(null);

  // Load courses
  useEffect(() => {
    if (!open) return;
    fetch("/api/admin/courses")
      .then((r) => r.json())
      .then((json) => {
        if (Array.isArray(json.data)) setCourses(json.data);
      })
      .catch(() => {});
  }, [open]);

  // Load editing voucher
  useEffect(() => {
    if (!open || !editId) {
      resetForm();
      return;
    }
    setLoading(true);
    fetch(`/api/admin/vouchers/${editId}`)
      .then((r) => r.json())
      .then((json) => {
        const v = json.data as VoucherFull;
        if (v) {
          setCode(v.code);
          setDescription(v.description ?? "");
          setTerms(v.terms ?? "");
          setDiscountType(v.discount_type);
          setDiscountValue(v.discount_value != null ? String(v.discount_value) : "");
          setMaxDiscountVnd(v.max_discount_vnd != null ? String(v.max_discount_vnd) : "");
          setMinOrderVnd(String(v.min_order_vnd));
          setMaxUses(v.max_uses != null ? String(v.max_uses) : "");
          setMaxUsesPerUser(String(v.max_uses_per_user));
          setTargetType(v.target_type);
          setScope(v.scope);
          setUserId(v.user_id ?? "");
          setIsPublic(v.is_public);
          setStatus(v.status);
          setStartsAt(v.starts_at ? v.starts_at.slice(0, 16) : "");
          setExpiresAt(v.expires_at ? v.expires_at.slice(0, 16) : "");
          setSelectedCourseIds(v.voucher_courses?.map((c) => c.course_id) ?? []);
          // Load user if scope is specific_user
          if (v.scope === "specific_user" && v.user_id) {
            setSelectedUser({ id: v.user_id, email: `User ID: ${v.user_id}`, full_name: null });
          }
        }
      })
      .catch(() => setError("Không thể tải voucher."))
      .finally(() => setLoading(false));
  }, [open, editId]);

  function resetForm() {
    setCode("");
    setDescription("");
    setTerms("");
    setDiscountType("percentage");
    setDiscountValue("");
    setMaxDiscountVnd("");
    setMinOrderVnd("0");
    setMaxUses("");
    setMaxUsesPerUser("1");
    setTargetType("all");
    setScope("sitewide");
    setUserId("");
    setIsPublic(false);
    setStatus("draft");
    setStartsAt("");
    setExpiresAt("");
    setSelectedCourseIds([]);
    setSelectedUser(null);
    setError(null);
  }

  // Search users
  async function searchUsers(q: string) {
    if (q.length < 2) { setUserSearchResults([]); return; }
    setUserSearchLoading(true);
    try {
      const res = await fetch(`/api/admin/users?search=${encodeURIComponent(q)}&pageSize=10`);
      const json = await res.json();
      setUserSearchResults(json.data?.items ?? []);
    } catch {
      setUserSearchResults([]);
    } finally {
      setUserSearchLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      const body: Record<string, unknown> = {
        code,
        description: description || null,
        terms: terms || null,
        discount_type: discountType,
        discount_value: discountType !== "free" ? Number(discountValue) : null,
        max_discount_vnd: discountType === "percentage" && maxDiscountVnd ? Number(maxDiscountVnd) : null,
        min_order_vnd: Number(minOrderVnd) || 0,
        max_uses: maxUses ? Number(maxUses) : null,
        max_uses_per_user: Number(maxUsesPerUser) || 1,
        target_type: targetType,
        scope,
        user_id: scope === "specific_user" ? selectedUser?.id ?? userId : null,
        is_public: isPublic,
        status,
        starts_at: startsAt || null,
        expires_at: expiresAt,
        course_ids: selectedCourseIds,
      };

      const url = editId ? `/api/admin/vouchers/${editId}` : "/api/admin/vouchers";
      const method = editId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error?.message ?? "Lỗi khi lưu voucher.");
      }

      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Lỗi không xác định.");
    } finally {
      setSaving(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh]">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />

      {/* Dialog */}
      <div className="relative z-10 w-full max-w-2xl max-h-[80vh] overflow-y-auto bg-white rounded-xl shadow-2xl">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-xl">
          <h2 className="text-lg font-bold text-gray-900">
            {editId ? "Sửa voucher" : "Tạo voucher mới"}
          </h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100">
            <X size={18} className="text-gray-400" />
          </button>
        </div>

        {loading ? (
          <div className="px-6 py-10 text-center text-gray-400">
            <Loader2 size={20} className="animate-spin mx-auto mb-2" /> Đang tải...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
            {error && (
              <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
            )}

            {/* Code */}
            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-1.5">Mã code *</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="VD: CHAOMUNG10"
                disabled={!!editId}
                className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#c0392b]/20 disabled:bg-gray-50"
                required
                maxLength={30}
              />
              <p className="text-xs text-gray-400 mt-1">3-30 ký tự in hoa, số, -, _</p>
            </div>

            {/* Description */}
            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-1.5">Mô tả (nội bộ)</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="VD: Giảm giá chào mừng khóa mới"
                className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#c0392b]/20"
              />
            </div>

            {/* Terms */}
            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-1.5">Điều khoản (hiển thị cho user)</label>
              <textarea
                value={terms}
                onChange={(e) => setTerms(e.target.value)}
                placeholder="VD: Giảm 10% tối đa 200.000đ cho đơn từ 500.000đ. Không áp dụng cùng chương trình khác."
                className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#c0392b]/20"
                rows={2}
              />
            </div>

            {/* Discount type + value */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-1.5">Loại giảm *</label>
                <select
                  value={discountType}
                  onChange={(e) => setDiscountType(e.target.value)}
                  className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#c0392b]/20"
                >
                  {DISCOUNT_TYPES.map((dt) => (
                    <option key={dt.value} value={dt.value}>{dt.label}</option>
                  ))}
                </select>
              </div>

              {discountType !== "free" && (
                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-1.5">
                    {discountType === "percentage" ? "Phần trăm (%)" : "Số tiền (VND)"}
                  </label>
                  <input
                    type="number"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    min="1"
                    max={discountType === "percentage" ? "100" : undefined}
                    className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#c0392b]/20"
                    required
                  />
                </div>
              )}

              {discountType === "percentage" && (
                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-1.5">Giảm tối đa (VND)</label>
                  <input
                    type="number"
                    value={maxDiscountVnd}
                    onChange={(e) => setMaxDiscountVnd(e.target.value)}
                    min="1"
                    placeholder="Không giới hạn"
                    className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#c0392b]/20"
                  />
                </div>
              )}
            </div>

            {/* Limits */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-1.5">Đơn tối thiểu (VND)</label>
                <input
                  type="number"
                  value={minOrderVnd}
                  onChange={(e) => setMinOrderVnd(e.target.value)}
                  min="0"
                  className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#c0392b]/20"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-1.5">Tổng lượt dùng</label>
                <input
                  type="number"
                  value={maxUses}
                  onChange={(e) => setMaxUses(e.target.value)}
                  min="1"
                  placeholder="Không giới hạn"
                  className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#c0392b]/20"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-1.5">Giới hạn / user</label>
                <input
                  type="number"
                  value={maxUsesPerUser}
                  onChange={(e) => setMaxUsesPerUser(e.target.value)}
                  min="1"
                  className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#c0392b]/20"
                  required
                />
              </div>
            </div>

            {/* Target + Scope */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-1.5">Đối tượng</label>
                <select
                  value={targetType}
                  onChange={(e) => setTargetType(e.target.value)}
                  className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#c0392b]/20"
                >
                  {TARGET_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-1.5">Phạm vi</label>
                <select
                  value={scope}
                  onChange={(e) => setScope(e.target.value)}
                  className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#c0392b]/20"
                >
                  {SCOPES.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* User picker (when scope = specific_user) */}
            {scope === "specific_user" && (
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-1.5">Chọn user *</label>
                {selectedUser ? (
                  <div className="flex items-center justify-between rounded-md border border-gray-200 px-3 py-2 bg-gray-50">
                    <span className="text-sm">{selectedUser.email} {selectedUser.full_name ? `(${selectedUser.full_name})` : ""}</span>
                    <button
                      type="button"
                      onClick={() => { setSelectedUser(null); setUserId(""); }}
                      className="text-xs text-red-500 hover:underline"
                    >
                      Xóa
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Tìm theo email..."
                      value={userSearch}
                      onChange={(e) => { setUserSearch(e.target.value); searchUsers(e.target.value); }}
                      className="w-full pl-9 pr-3 py-2 rounded-md border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#c0392b]/20"
                    />
                    {userSearchResults.length > 0 && (
                      <div className="absolute top-full mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-40 overflow-y-auto z-20">
                        {userSearchResults.map((u) => (
                          <button
                            key={u.id}
                            type="button"
                            onClick={() => { setSelectedUser(u); setUserId(u.id); setUserSearch(""); setUserSearchResults([]); }}
                            className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex flex-col"
                          >
                            <span className="font-medium">{u.email}</span>
                            {u.full_name && <span className="text-xs text-gray-400">{u.full_name}</span>}
                          </button>
                        ))}
                      </div>
                    )}
                    {userSearchLoading && <Loader2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-gray-400" />}
                  </div>
                )}
              </div>
            )}

            {/* Course picker (when scope = specific_courses) */}
            {scope === "specific_courses" && (
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-1.5">Khóa học áp dụng *</label>
                <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-md p-2 space-y-1">
                  {courses.map((c) => (
                    <label key={c.id} className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedCourseIds.includes(c.id)}
                        onChange={() => {
                          setSelectedCourseIds((prev) =>
                            prev.includes(c.id) ? prev.filter((id) => id !== c.id) : [...prev, c.id]
                          );
                        }}
                        className="rounded border-gray-300 text-[#c0392b] focus:ring-[#c0392b]"
                      />
                      <span className="text-sm">{c.title}</span>
                    </label>
                  ))}
                  {courses.length === 0 && <p className="text-sm text-gray-400 px-2 py-2">Đang tải khóa học...</p>}
                </div>
              </div>
            )}

            {/* Dates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-1.5">Ngày bắt đầu</label>
                <input
                  type="datetime-local"
                  value={startsAt}
                  onChange={(e) => setStartsAt(e.target.value)}
                  className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#c0392b]/20"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-1.5">Ngày hết hạn *</label>
                <input
                  type="datetime-local"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#c0392b]/20"
                  required
                />
              </div>
            </div>

            {/* Status + Public */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-1.5">Trạng thái</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#c0392b]/20"
                >
                  {STATUSES.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-end pb-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                    className="rounded border-gray-300 text-[#c0392b] focus:ring-[#c0392b]"
                  />
                  <span className="text-sm text-gray-700">Hiển thị công khai trên site</span>
                </label>
              </div>
            </div>

            {/* Submit */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-md border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 rounded-md bg-[#c0392b] px-5 py-2 text-sm font-semibold text-white hover:bg-[#a93226] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {saving && <Loader2 size={14} className="animate-spin" />}
                {editId ? "Cập nhật" : "Tạo voucher"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
