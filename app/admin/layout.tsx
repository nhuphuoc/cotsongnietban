import AdminSidebar from "@/components/layout/AdminSidebar";
import { Plus_Jakarta_Sans } from "next/font/google";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { getSupabasePublicEnv } from "@/utils/supabase/env";

const adminFont = Plus_Jakarta_Sans({
  subsets: ["latin", "latin-ext", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
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

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("role,is_active")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.is_active || profile.role !== "admin") {
    redirect("/dashboard");
  }

  return (
    <div
      className={`${adminFont.className} flex h-screen bg-gray-50 overflow-hidden text-base leading-relaxed tracking-[0.01em] text-gray-800`}
    >
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto pt-14 md:pt-0">{children}</main>
    </div>
  );
}
