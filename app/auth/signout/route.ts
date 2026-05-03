import { NextResponse } from "next/server";
import { getSupabasePublicEnv } from "@/utils/supabase/env";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: Request) {
  const { origin } = new URL(request.url);

  // Next.js may prefetch links in background. Never perform destructive side effects on prefetch.
  const nextPrefetch = request.headers.get("next-router-prefetch");
  const purpose = request.headers.get("purpose") ?? request.headers.get("sec-purpose");
  if (nextPrefetch === "1" || (purpose && purpose.toLowerCase().includes("prefetch"))) {
    return new NextResponse(null, { status: 204 });
  }

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
