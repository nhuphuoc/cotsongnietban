import { NextResponse } from "next/server";
import { getSupabasePublicEnv } from "@/utils/supabase/env";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: Request) {
  const { origin } = new URL(request.url);

  if (getSupabasePublicEnv()) {
    try {
      const supabase = await createClient();
      await supabase.auth.signOut();
    } catch {
      /* không có session hoặc lỗi mạng */
    }
  }

  return NextResponse.redirect(`${origin}/login`);
}
