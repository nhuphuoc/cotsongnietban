/**
 * DEBUG ONLY — xóa sau khi debug xong lỗi 401 trên Vercel.
 * GET /api/admin/debug-session
 */
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { getSupabasePublicEnv, getSupabaseServerEnv } from "@/utils/supabase/env";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll();
  const authCookies = allCookies
    .filter((c) => c.name.startsWith("sb-"))
    .map((c) => ({ name: c.name, valueLength: c.value.length }));

  const publicEnv = getSupabasePublicEnv();
  const serverEnv = getSupabaseServerEnv();

  let getUserResult: unknown = null;
  let getSessionResult: unknown = null;
  let profileResult: unknown = null;

  if (publicEnv) {
    try {
      const client = await createClient();
      const { data, error } = await client.auth.getUser();
      getUserResult = {
        hasUser: !!data.user,
        userId: data.user?.id ?? null,
        email: data.user?.email ?? null,
        error: error?.message ?? null,
      };

      const { data: sessionData, error: sessionError } = await client.auth.getSession();
      getSessionResult = {
        hasSession: !!sessionData.session,
        userId: sessionData.session?.user?.id ?? null,
        expiresAt: sessionData.session?.expires_at ?? null,
        error: sessionError?.message ?? null,
      };
    } catch (e) {
      getUserResult = { threw: e instanceof Error ? e.message : String(e) };
    }
  }

  if (serverEnv && getUserResult && typeof getUserResult === "object" && "userId" in getUserResult && getUserResult.userId) {
    try {
      const admin = createAdminClient();
      const { data: profile, error } = await admin
        .from("profiles")
        .select("id, role, is_active")
        .eq("id", getUserResult.userId as string)
        .maybeSingle();
      profileResult = { profile, error: error?.message ?? null };
    } catch (e) {
      profileResult = { threw: e instanceof Error ? e.message : String(e) };
    }
  }

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    env: {
      hasPublicUrl: !!publicEnv?.url,
      hasPublicAnonKey: !!publicEnv?.anonKey,
      hasServiceRoleKey: !!serverEnv?.serviceRoleKey,
    },
    cookies: {
      total: allCookies.length,
      authCookies,
    },
    getUser: getUserResult,
    getSession: getSessionResult,
    profile: profileResult,
  });
}
