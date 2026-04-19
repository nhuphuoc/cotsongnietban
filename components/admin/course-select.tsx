"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/admin/api-client";

type CourseOption = {
  id: string;
  title: string;
  status?: string | null;
};

type CourseSelectProps = {
  value: string;
  onChange: (value: string) => void;
  id?: string;
  label?: string;
};

export function CourseSelect({ value, onChange, id = "courseId", label = "Khóa học" }: CourseSelectProps) {
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<CourseOption[]>("/api/admin/courses");
      setCourses(data);
    } catch (e: any) {
      setError(e?.message ?? "Không thể tải danh sách khóa học.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  return (
    <div>
      <label htmlFor={id} className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5 block">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={loading}
        className="w-full border border-gray-200 rounded-sm px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-[#c0392b] disabled:bg-gray-50 disabled:text-gray-400"
      >
        <option value="">Không gán khóa học</option>
        {courses.map((course) => (
          <option key={course.id} value={course.id}>
            {course.title}{course.status === "draft" ? " (nháp)" : ""}
          </option>
        ))}
      </select>
      <div className="mt-2 text-xs text-gray-400">
        {loading ? "Đang tải danh sách khóa học..." : error ? error : "Chọn khóa học nếu feedback này gắn với một chương trình cụ thể."}
      </div>
      {error ? (
        <button type="button" onClick={load} className="mt-2 text-xs font-semibold text-[#c0392b] hover:underline">
          Tải lại
        </button>
      ) : null}
    </div>
  );
}
