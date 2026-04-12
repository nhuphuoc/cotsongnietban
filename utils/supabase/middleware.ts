import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabasePublicEnv } from "@/utils/supabase/env";

export async function updateSession(request: NextRequest) {
  const env = getSupabasePublicEnv();

  // Cho phép chạy app khi chưa cấu hình Supabase. Khi có .env.local, session sẽ được refresh tự động.
  if (!env) {
    return NextResponse.next({ request });
  }

  const { url: supabaseUrl, anonKey: supabaseAnonKey } = env;

  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            supabaseResponse = NextResponse.next({
              request,
            });
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  // IMPORTANT: Avoid writing any additional logic between createServerClient
  // and supabase.auth.getUser(). A simple getUser refreshes the session cookie.
  await supabase.auth.getUser();

  return supabaseResponse;
}

