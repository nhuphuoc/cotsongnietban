"use client";

import { useMemo } from "react";
import { useLocalStorageState } from "@/lib/hooks/use-local-storage-state";
import type { AdminFeedback, AdminFeedbackType } from "@/lib/admin/feedback-types";

const KEY = "csnb_admin_feedback_v1";

function nowIso() {
  return new Date().toISOString();
}

const seed: AdminFeedback[] = [
  {
    id: "FB001",
    type: "testimonial",
    customer_name: "Chị Lan Anh",
    customer_info: "45 tuổi, thoát vị L4-L5",
    content: "Đau lưng mãn tính giảm rõ sau 3 tháng; ngồi làm việc cả ngày đỡ mỏi hơn nhiều.",
    avatar_url: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=80&h=80&fit=crop",
    image_url_1: null,
    image_url_2: null,
    is_active: true,
    created_at: "2024-04-15T03:05:00.000Z",
  },
  {
    id: "FB002",
    type: "before_after",
    customer_name: "Anh Minh Tuấn",
    customer_info: "Thoát vị L5-S1",
    content: "Từng phải nghỉ tập — giờ tập lại ổn và an tâm hơn về lưng.",
    avatar_url: null,
    image_url_1: null,
    image_url_2: null,
    is_active: true,
    created_at: "2024-04-15T02:22:00.000Z",
  },
];

export function useAdminFeedbackStore() {
  const { value: items, setValue: setItems, hydrated } = useLocalStorageState<AdminFeedback[]>(KEY, seed);

  const api = useMemo(() => {
    const byId = (id: string) => items.find((f) => f.id === id) ?? null;

    const create = (input: {
      type: AdminFeedbackType;
      customer_name: string;
      customer_info?: string | null;
      content?: string | null;
      avatar_url?: string | null;
      image_url_1?: string | null;
      image_url_2?: string | null;
      is_active?: boolean;
    }) => {
      const id = `FB${String(Date.now()).slice(-6)}`;
      const next: AdminFeedback = {
        id,
        type: input.type,
        customer_name: input.customer_name,
        customer_info: input.customer_info ?? null,
        content: input.content ?? null,
        avatar_url: input.avatar_url ?? null,
        image_url_1: input.image_url_1 ?? null,
        image_url_2: input.image_url_2 ?? null,
        is_active: input.is_active ?? true,
        created_at: nowIso(),
      };
      setItems((prev) => [next, ...prev]);
      return next;
    };
    const upsert = (patch: Partial<AdminFeedback> & { id: string }) => {
      setItems((prev) => prev.map((f) => (f.id === patch.id ? { ...f, ...patch } : f)));
    };
    const remove = (id: string) => setItems((prev) => prev.filter((f) => f.id !== id));
    return { hydrated, items, byId, create, upsert, remove };
  }, [hydrated, items, setItems]);

  return api;
}
