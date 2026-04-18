import { NextResponse } from "next/server";
import { getSupabasePublicEnv } from "@/utils/supabase/env";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: Request) {
  const { origin } = new URL(request.url);

  if (!getSupabasePublicEnv()) {
    return NextResponse.redirect(`${origin}/login?error=config`);
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return NextResponse.redirect(`${origin}/login`);
  }

  if (user.email_confirmed_at) {
    return NextResponse.redirect(`${origin}/dashboard`);
  }

  await supabase.auth.resend({
    type: "signup",
    email: user.email,
    options: {
      emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent("/dashboard")}`,
    },
  });

  return NextResponse.redirect(`${origin}/verify-email?resent=1`);
}
