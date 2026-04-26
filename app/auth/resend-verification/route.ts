import { NextResponse } from "next/server";
import { getSupabasePublicEnv } from "@/utils/supabase/env";
import { createClient } from "@/utils/supabase/server";
import { getLmsHomeAbsoluteUrl } from "@/lib/learning-hub";

function appendQuery(basePath: string, entries: Record<string, string>) {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(entries)) {
    if (v) q.set(k, v);
  }
  const s = q.toString();
  return s ? `${basePath}?${s}` : basePath;
}

export async function GET(request: Request) {
  const { origin, searchParams } = new URL(request.url);
  const emailParam = searchParams.get("email");

  if (!getSupabasePublicEnv()) {
    return NextResponse.redirect(`${origin}/login?error=config`);
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const email = user?.email ?? emailParam?.trim() ?? "";

  if (!email) {
    return NextResponse.redirect(`${origin}/login`);
  }

  if (user?.email_confirmed_at) {
    return NextResponse.redirect(getLmsHomeAbsoluteUrl(origin));
  }

  const { error } = await supabase.auth.resend({
    type: "signup",
    email,
    options: {
      emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent("/phong-hoc")}`,
    },
  });

  if (error) {
    if (user) {
      return NextResponse.redirect(
        appendQuery(`${origin}/verify-email`, { resend_error: error.message }),
      );
    }
    return NextResponse.redirect(
      appendQuery(`${origin}/check-email`, {
        email,
        resend_error: error.message,
      }),
    );
  }

  if (user) {
    return NextResponse.redirect(`${origin}/verify-email?resent=1`);
  }
  return NextResponse.redirect(
    `${origin}/check-email?email=${encodeURIComponent(email)}&resent=1`,
  );
}
