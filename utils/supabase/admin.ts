import { createClient } from "@supabase/supabase-js";
import { requireSupabaseServerEnv } from "@/utils/supabase/env";

export function createAdminClient() {
  const { url, serviceRoleKey } = requireSupabaseServerEnv();
  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
