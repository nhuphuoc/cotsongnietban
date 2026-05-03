"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { getLmsHomeHref } from "@/lib/learning-hub";

export type SignInResult =
  | { ok: false; error: string }
  | { ok: true; redirectTo: string };

export async function signInAction(email: string, password: string): Promise<SignInResult> {
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    if (/Email not confirmed/i.test(error.message)) {
      return { ok: false, error: "Email chưa xác thực. Vui lòng kiểm tra hộp thư và bấm link xác thực." };
    }
    return { ok: false, error: error.message };
  }

  const { data: { user } } = await supabase.auth.getUser();

  if (!user?.email_confirmed_at) {
    return { ok: true, redirectTo: "/verify-email" };
  }

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role === "admin") {
    return { ok: true, redirectTo: "/admin" };
  }

  return { ok: true, redirectTo: getLmsHomeHref() };
}
