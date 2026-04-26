import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
 
export default async function DashboardAliasPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Không có session thì để flow auth xử lý.
  if (!user) {
    redirect("/phong-hoc");
  }

  // Admin vẫn dùng dashboard admin.
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role === "admin") {
    redirect("/admin");
  }

  redirect("/phong-hoc");
}
