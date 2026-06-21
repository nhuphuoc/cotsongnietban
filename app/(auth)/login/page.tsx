import Link from "next/link";
import { redirect } from "next/navigation";
import { SiteLogoMark } from "@/components/brand/site-logo-mark";
import { EmailPasswordAuthForm } from "@/components/auth/email-password-auth-form";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { getSupabasePublicEnv } from "@/utils/supabase/env";
import { createClient } from "@/utils/supabase/server";
import { getLmsHomeHref } from "@/lib/learning-hub";

type Props = { searchParams?: Promise<{ error?: string; mode?: string }> };

export default async function LoginPage({ searchParams }: Props) {
  const params = searchParams ? await searchParams : {};
  const errorKey = params.error;
  const initialAuthMode = params.mode === "signup" ? "signup" : "signin";

  if (getSupabasePublicEnv()) {
    try {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        if (user.email_confirmed_at) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .maybeSingle();

          if (profile?.role === "admin") {
            redirect("/admin");
          }
          redirect(getLmsHomeHref());
        }
        redirect("/verify-email");
      }
    } catch {
      // Ignore auth check failures and continue rendering login page.
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-csnb-bg px-4 py-10 sm:px-6">
      {/* Ambient background glow */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute left-1/2 top-0 h-[20rem] w-[20rem] -translate-x-1/2 rounded-full bg-csnb-orange/10 blur-[100px]" />
      </div>

      <div className="relative w-full max-w-md space-y-8">
        {/* Brand */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-3">
            <SiteLogoMark boxClassName="block h-10 w-10" />
            <div className="text-left">
              <div className="font-heading text-lg font-black uppercase leading-tight tracking-wider text-white">
                Cột Sống Niết Bàn
              </div>
              <p className="text-xs text-csnb-muted">Phục hồi chức năng · Cột sống làm trọng tâm</p>
            </div>
          </Link>
        </div>

        {/* Login card */}
        <div className="rounded-2xl border border-csnb-border bg-csnb-surface/90 p-6 shadow-lg backdrop-blur-sm sm:p-8">
          <h1 className="text-center font-heading text-xl font-black uppercase tracking-wide text-white sm:text-2xl">
            Đăng nhập hoặc đăng ký
          </h1>
          <p className="mt-2 text-center text-sm text-csnb-muted">
            Dùng email/mật khẩu hoặc tài khoản Google.
          </p>

          <div className="mt-6 space-y-5">
            {errorKey === "auth" ? (
              <p className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-center text-xs text-red-200">
                Bạn cần đăng nhập để tiếp tục.
              </p>
            ) : null}
            {errorKey === "config" ? (
              <p className="rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-center text-xs text-amber-100">
                Chưa cấu hình Supabase.
              </p>
            ) : null}

            <EmailPasswordAuthForm initialMode={initialAuthMode} />

            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-csnb-border" />
              <span className="text-[11px] uppercase tracking-wider text-csnb-muted">hoặc</span>
              <div className="h-px flex-1 bg-csnb-border" />
            </div>

            <GoogleSignInButton />
          </div>

          <div className="mt-6 border-t border-csnb-border pt-5 text-center">
            <p className="text-xs leading-relaxed text-csnb-muted">
              Bằng cách tiếp tục, bạn đồng ý với{" "}
              <Link href="/legal/terms" className="text-white transition-colors hover:text-csnb-orange-bright">
                Điều khoản dịch vụ
              </Link>{" "}
              và{" "}
              <Link href="/legal/privacy" className="text-white transition-colors hover:text-csnb-orange-bright">
                Chính sách bảo mật
              </Link>
              .
            </p>
          </div>
        </div>

        {/* Back link */}
        <div className="text-center">
          <Link href="/" className="text-sm text-csnb-muted transition-colors hover:text-white">
            ← Quay lại trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
}
