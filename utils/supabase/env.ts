/**
 * Biến công khai Supabase (dùng trình duyệt + server với anon key).
 * Service role chỉ dùng trong Edge/API bí mật — không đặt NEXT_PUBLIC_*.
 */
export function getSupabasePublicEnv(): { url: string; anonKey: string } | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!url || !anonKey) return null;
  return { url, anonKey };
}

export function requireSupabasePublicEnv(): { url: string; anonKey: string } {
  const env = getSupabasePublicEnv();
  if (!env) {
    throw new Error(
      "Thiếu NEXT_PUBLIC_SUPABASE_URL hoặc NEXT_PUBLIC_SUPABASE_ANON_KEY. Tạo file .env.local từ .env.example và lấy giá trị tại Supabase → Project Settings → API."
    );
  }
  return env;
}
