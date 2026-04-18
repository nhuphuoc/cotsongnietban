import { redirect } from "next/navigation";
import { LmsAppShell } from "@/components/layout/LmsAppShell";
import { getSupabasePublicEnv } from "@/utils/supabase/env";
import { createClient } from "@/utils/supabase/server";

export default async function LmsLayout({ children }: { children: React.ReactNode }) {
  if (!getSupabasePublicEnv()) {
    redirect("/login?error=config");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  if (!user.email_confirmed_at) {
    redirect("/verify-email");
  }

  return <LmsAppShell>{children}</LmsAppShell>;
}
