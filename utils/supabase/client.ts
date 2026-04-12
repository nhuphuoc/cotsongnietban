import { createBrowserClient } from "@supabase/ssr";
import { requireSupabasePublicEnv } from "@/utils/supabase/env";

export function createClient() {
  const { url, anonKey } = requireSupabasePublicEnv();
  return createBrowserClient(url, anonKey);
}

