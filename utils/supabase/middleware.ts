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
          // 1. Cập nhật cookie vào request để downstream handler (Route Handler) thấy token mới.
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });

          // 2. Tạo response mới với request đã có cookie mới — đảm bảo downstream nhận đúng context.
          supabaseResponse = NextResponse.next({
            request,
          });

          // 3. Set cookie lên response để browser lưu token mới.
          cookiesToSet.forEach(({ name, value, options }) => {
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

