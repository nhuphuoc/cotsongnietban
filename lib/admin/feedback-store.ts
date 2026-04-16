"use client";

import { useMemo } from "react";
import { useLocalStorageState } from "@/lib/hooks/use-local-storage-state";
import type { AdminFeedback, AdminFeedbackSource, AdminFeedbackStatus } from "@/lib/admin/feedback-types";

const KEY = "csnb_admin_feedback_v1";

function nowIso() {
  return new Date().toISOString();
}

const seed: AdminFeedback[] = [
  {
    id: "FB001",
    name: "Chị Lan Anh",
    email: "lananh@gmail.com",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=80&h=80&fit=crop",
    source: "website",
    rating: 5,
    messageHtml: "<p>Đau lưng mãn tính giảm rõ sau 3 tháng; ngồi làm việc cả ngày đỡ mỏi hơn nhiều.</p>",
    course: "Phục Hồi Lưng Cơ Bản",
    status: "pinned",
    createdAt: "2024-04-15T03:05:00.000Z",
    updatedAt: "2024-04-15T03:05:00.000Z",
  },
  {
    id: "FB002",
    name: "Anh Minh Tuấn",
    email: "tuan@gmail.com",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop",
    source: "facebook",
    rating: 5,
    messageHtml: "<p>Thoát vị L5-S1 từng phải nghỉ tập — giờ tập lại ổn và an tâm hơn về lưng.</p>",
    course: "Corrective Exercise Nâng Cao",
    status: "reviewed",
    createdAt: "2024-04-15T02:22:00.000Z",
    updatedAt: "2024-04-15T02:22:00.000Z",
  },
  {
    id: "FB003",
    name: "Chị Thu Hương",
    email: "huong@gmail.com",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop",
    source: "zalo",
    rating: 4,
    messageHtml:
      "<p>Đứng lớp cả ngày đỡ đau chân; giảm dần thuốc giảm đau sau vài tuần. Coach theo sát nên yên tâm.</p>",
    course: "VIP Coach 1-1",
    status: "new",
    createdAt: "2024-04-14T10:40:00.000Z",
    updatedAt: "2024-04-14T10:40:00.000Z",
  },
];

export function useAdminFeedbackStore() {
  const { value: items, setValue: setItems, hydrated } = useLocalStorageState<AdminFeedback[]>(KEY, seed);

  const api = useMemo(() => {
    const byId = (id: string) => items.find((f) => f.id === id) ?? null;
    const create = (input: {
      name: string;
      email: string;
      avatar?: string;
      source: AdminFeedbackSource;
      rating: AdminFeedback["rating"];
      messageHtml: string;
      course?: string;
      status: AdminFeedbackStatus;
      internalNoteHtml?: string;
    }) => {
      const id = `FB${String(Date.now()).slice(-6)}`;
      const createdAt = nowIso();
      const next: AdminFeedback = {
        id,
        ...input,
        createdAt,
        updatedAt: createdAt,
      };
      setItems((prev) => [next, ...prev]);
      return next;
    };
    const upsert = (patch: Partial<AdminFeedback> & { id: string }) => {
      setItems((prev) =>
        prev.map((f) => (f.id === patch.id ? { ...f, ...patch, updatedAt: nowIso() } : f))
      );
    };
    const remove = (id: string) => setItems((prev) => prev.filter((f) => f.id !== id));
    return { hydrated, items, byId, create, upsert, remove };
  }, [hydrated, items, setItems]);

  return api;
}

