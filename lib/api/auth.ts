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

/** Một lần query profiles — dùng cho getSessionProfileActor và requireActiveActor. */
async function lookupProfileForActor(
  actorId: string,
): Promise<
  | { ok: true; role: SessionProfileActor["role"]; isActive: boolean }
  | { ok: false; reason: "missing" | "error" }
> {
  const admin = createAdminClient();
  const { data: profile, error } = await admin
    .from("profiles")
    .select("role, is_active")
    .eq("id", actorId)
    .maybeSingle();

  if (error) {
    console.error("[auth] profiles lookup:", error.message);
    return { ok: false, reason: "error" };
  }
  if (!profile) return { ok: false, reason: "missing" };

  return {
    ok: true,
    role: profile.role as SessionProfileActor["role"],
    isActive: Boolean(profile.is_active),
  };
}

export async function getSessionActor(): Promise<SessionActor | null> {
  const client = await createSessionClient();
  const {
    data: { user },
    error,
  } = await client.auth.getUser();

  if (user) {
    return { id: user.id, email: user.email ?? null };
  }

  if (error) {
    console.warn("[auth] getUser failed, falling back to getSession:", error.message);
  }

  const {
    data: { session },
  } = await client.auth.getSession();

  if (!session?.user) return null;
  return { id: session.user.id, email: session.user.email ?? null };
}

export async function getSessionProfileActor(): Promise<SessionProfileActor | null> {
  const actor = await getSessionActor();
  if (!actor) return null;

  const row = await lookupProfileForActor(actor.id);
  if (!row.ok) return null;

  return {
    ...actor,
    role: row.role,
    isActive: row.isActive,
  };
}

export async function requireActiveActor() {
  const actor = await getSessionActor();
  if (!actor) {
    return { actor: null, status: 401 as const, message: "Bạn chưa đăng nhập." };
  }

  const row = await lookupProfileForActor(actor.id);

  if (!row.ok && row.reason === "error") {
    return {
      actor: null,
      status: 503 as const,
      message: "Hệ thống tạm thời không xác thực được tài khoản. Vui lòng thử lại.",
    };
  }

  if (!row.ok) {
    return {
      actor: null,
      status: 403 as const,
      message: "Tài khoản chưa có hồ sơ. Vui lòng liên hệ hỗ trợ.",
    };
  }

  const resolved: SessionProfileActor = {
    ...actor,
    role: row.role,
    isActive: row.isActive,
  };

  if (!resolved.isActive) {
    return { actor: null, status: 403 as const, message: "Tài khoản của bạn đang bị vô hiệu hóa." };
  }

  return { actor: resolved, status: 200 as const, message: null };
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
