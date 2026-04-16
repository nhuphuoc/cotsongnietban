import { createAdminClient } from "@/utils/supabase/admin";
import { createClient as createSessionClient } from "@/utils/supabase/server";

export type SessionActor = {
  id: string;
  email: string | null;
};

export async function getSessionActor(): Promise<SessionActor | null> {
  const client = await createSessionClient();
  const {
    data: { user },
    error,
  } = await client.auth.getUser();

  if (error || !user) return null;
  return { id: user.id, email: user.email ?? null };
}

export async function requireAdminActor() {
  const actor = await getSessionActor();
  if (!actor) {
    return { actor: null, status: 401 as const, message: "Bạn chưa đăng nhập." };
  }

  const admin = createAdminClient();
  const { data: profile, error } = await admin
    .from("profiles")
    .select("id, role, is_active")
    .eq("id", actor.id)
    .single();

  if (error || !profile) {
    return { actor: null, status: 403 as const, message: "Không tìm thấy hồ sơ người dùng." };
  }

  if (!profile.is_active || profile.role !== "admin") {
    return { actor: null, status: 403 as const, message: "Bạn không có quyền admin." };
  }

  return { actor, status: 200 as const, message: null };
}
