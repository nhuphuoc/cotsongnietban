import { NextResponse } from "next/server";
import { getSupabasePublicEnv } from "@/utils/supabase/env";
import { createClient } from "@/utils/supabase/server";
import { resolveAuthCallbackNext } from "@/lib/learning-hub";
import { sendEmailAsync } from "@/lib/email/send";
import { WelcomeEmail } from "@/lib/email/templates/welcome";

async function resolvePostAuthPath(requestedPath: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return requestedPath;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role === "admin") {
    return "/admin";
  }

  return requestedPath;
}

/**
 * Gửi email chào mừng nếu user vừa mới được tạo (trong vòng 2 phút).
 * Chỉ gửi 1 lần — kiểm tra email_logs để tránh trùng lặp.
 */
async function sendWelcomeEmailIfNewUser(origin: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.email) return;

    // Chỉ gửi nếu user mới tạo trong vòng 2 phút
    const createdAt = new Date(user.created_at).getTime();
    if (Date.now() - createdAt > 2 * 60 * 1000) return;

    // Kiểm tra đã gửi welcome email chưa
    const { data: existing } = await supabase
      .from("email_logs")
      .select("id")
      .eq("recipient", user.email)
      .eq("template", "welcome")
      .maybeSingle();

    if (existing) return; // Đã gửi rồi

    const displayName = user.email.split("@")[0];

    sendEmailAsync({
      to: user.email,
      subject: "Chào mừng đến với Cột Sống Niết Bàn",
      template: "welcome",
      react: WelcomeEmail({
        customerName: displayName,
        coursesUrl: `${origin}/courses`,
      }),
      metadata: { userId: user.id },
    });
  } catch {
    // Bỏ qua lỗi — không ảnh hưởng đến auth flow
  }
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const next = searchParams.get("next");

  if (!getSupabasePublicEnv()) {
    return NextResponse.redirect(`${origin}/login?error=config`);
  }

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      sendWelcomeEmailIfNewUser(origin);
      const resolved = resolveAuthCallbackNext(next, origin);
      const redirectPath = await resolvePostAuthPath(resolved);
      return NextResponse.redirect(`${origin}${redirectPath}`);
    }
  }

  if (tokenHash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: type as "signup" | "email_change" | "recovery" | "invite" | "magiclink" | "email",
    });
    if (!error) {
      sendWelcomeEmailIfNewUser(origin);
      const resolved = resolveAuthCallbackNext(next, origin);
      const redirectPath = await resolvePostAuthPath(resolved);
      return NextResponse.redirect(`${origin}${redirectPath}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
