import { createAdminClient } from "@/utils/supabase/admin";
import { createClient as createSessionClient } from "@/utils/supabase/server";

export type SessionActor = {
  id: string;
  email: string | null;
};

export type SessionProfileActor = SessionActor & {
  role: "admin" | "coach" | "student";
  isActive: boolean;
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

export async function getSessionProfileActor(): Promise<SessionProfileActor | null> {
  const actor = await getSessionActor();
  if (!actor) return null;

  const admin = createAdminClient();
  const { data: profile, error } = await admin
    .from("profiles")
    .select("role, is_active")
    .eq("id", actor.id)
    .maybeSingle();

  if (error || !profile) return null;

  return {
    ...actor,
    role: profile.role,
    isActive: profile.is_active,
  };
}

export async function requireActiveActor() {
  const actor = await getSessionProfileActor();
  if (!actor) {
    return { actor: null, status: 401 as const, message: "Bạn chưa đăng nhập." };
  }

  if (!actor.isActive) {
    return { actor: null, status: 403 as const, message: "Tài khoản của bạn đang bị vô hiệu hóa." };
  }

  return { actor, status: 200 as const, message: null };
}

export async function requireAdminActor() {
  const auth = await requireActiveActor();
  if (!auth.actor) {
    return auth;
  }

  if (auth.actor.role !== "admin") {
    return { actor: null, status: 403 as const, message: "Bạn không có quyền admin." };
  }

  return auth;
}
