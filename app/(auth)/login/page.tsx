import Link from "next/link";
import Image from "next/image";
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
    <div className="relative min-h-screen overflow-hidden bg-csnb-bg px-4 py-10 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute left-1/2 top-0 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-csnb-orange/10 blur-[120px]" />
        <div className="absolute -left-24 bottom-0 h-72 w-72 rounded-full bg-csnb-orange/8 blur-[100px]" />
        <div className="absolute -right-24 top-24 h-80 w-80 rounded-full bg-cyan-500/10 blur-[120px]" />
      </div>

      <div className="relative mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8">
        <section className="rounded-2xl border border-csnb-border/70 bg-csnb-surface/70 p-6 shadow-[0_20px_65px_-35px_rgba(0,0,0,0.65)] backdrop-blur-sm sm:p-8 lg:p-10">
          <Link href="/" className="inline-flex items-center gap-3">
            <SiteLogoMark boxClassName="block h-12 w-12" />
            <div>
              <div className="font-heading text-xl font-black uppercase leading-tight tracking-wider text-white">
                Cột Sống Niết Bàn
              </div>
              <p className="mt-1 font-sans text-sm text-csnb-muted">Phục hồi chức năng · Lấy cột sống làm trọng tâm</p>
            </div>
          </Link>

          <div className="mt-10 space-y-5">
            <h1 className="font-heading text-3xl font-black uppercase tracking-wide text-white sm:text-4xl">
              Đăng nhập hoặc tạo tài khoản
            </h1>
            <p className="max-w-xl font-sans text-sm leading-relaxed text-csnb-muted sm:text-base">
              Truy cập dashboard học viên, theo dõi tiến độ và quản lý khóa học của bạn trên cùng một tài khoản.
            </p>
          </div>

          <div className="relative mt-8 overflow-hidden rounded-xl border border-csnb-border/60">
            <div className="relative h-44 w-full sm:h-52">
              <Image
                src="https://images.unsplash.com/photo-1518611012118-696072aa579a?w=1200&h=700&fit=crop"
                alt="Không gian tập luyện phục hồi chức năng"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 640px"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-csnb-bg/90 via-csnb-bg/45 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                <p className="font-sans text-xs font-semibold uppercase tracking-wide text-csnb-orange-bright">
                  Hành trình phục hồi
                </p>
                <p className="mt-1 font-sans text-sm font-semibold text-white sm:text-base">
                  Đăng nhập để tiếp tục lộ trình tập luyện của bạn
                </p>
              </div>
            </div>
          </div>

          <div className="mt-10 hidden lg:block">
            <Link href="/" className="font-sans text-sm text-csnb-muted transition-colors hover:text-white">
              ← Quay lại trang chủ
            </Link>
          </div>
        </section>

        <section className="rounded-2xl border border-csnb-border bg-csnb-surface/95 p-6 shadow-[0_20px_65px_-35px_rgba(0,0,0,0.8)] ring-1 ring-white/5 sm:p-8">
          <h2 className="mb-2 text-center font-heading text-2xl font-black uppercase tracking-wide text-white">
            Tài khoản học viên
          </h2>
          <p className="mb-8 text-center font-sans text-sm text-csnb-muted">
            Đăng nhập hoặc đăng ký bằng email/mật khẩu hoặc Google.
          </p>

          {errorKey === "auth" ? (
            <p className="mb-4 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-center font-sans text-xs text-red-200">
              Đăng nhập thất bại. Thử lại hoặc kiểm tra cấu hình Supabase.
            </p>
          ) : null}
          {errorKey === "config" ? (
            <p className="mb-4 rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-center font-sans text-xs text-amber-100">
              Chưa cấu hình Supabase. Thêm NEXT_PUBLIC_SUPABASE_URL và khóa publishable/anon vào .env.local.
            </p>
          ) : null}

          <EmailPasswordAuthForm initialMode={initialAuthMode} />

          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-csnb-border" />
            <span className="font-sans text-[11px] uppercase tracking-wider text-csnb-muted">hoặc</span>
            <div className="h-px flex-1 bg-csnb-border" />
          </div>

          <GoogleSignInButton />

          <div className="mt-6 border-t border-csnb-border pt-6 text-center">
            <p className="font-sans text-xs leading-relaxed text-csnb-muted">
              Bằng cách tiếp tục, bạn đồng ý với{" "}
              <Link href="/legal/terms" className="text-white transition-colors hover:text-csnb-orange-bright">
                Điều khoản dịch vụ
              </Link>{" "}
              và{" "}
              <Link href="/legal/privacy" className="text-white transition-colors hover:text-csnb-orange-bright">
                Chính sách bảo mật
              </Link>{" "}
              của chúng tôi.
            </p>
          </div>
        </section>

        <div className="text-center lg:hidden">
          <Link href="/" className="font-sans text-sm text-csnb-muted transition-colors hover:text-white">
            ← Quay lại trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
}
