import Link from "next/link";
import { redirect } from "next/navigation";
import { SiteLogoMark } from "@/components/brand/site-logo-mark";
import { getSupabasePublicEnv } from "@/utils/supabase/env";
import { createClient } from "@/utils/supabase/server";
import { getLmsHomeHref } from "@/lib/learning-hub";

type Props = { searchParams?: Promise<{ resent?: string; resend_error?: string }> };

export default async function VerifyEmailPage({ searchParams }: Props) {
  const params = searchParams ? await searchParams : {};
  const resent = params.resent === "1";
  const resendError = params.resend_error?.trim() ?? null;

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

  const email = user.email ?? "(khong xac dinh)";

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-csnb-bg px-4">
      <div
        className="pointer-events-none absolute top-1/2 left-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-csnb-orange/10 blur-[100px]"
        aria-hidden
      />

      <div className="relative w-full max-w-sm">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex flex-col items-center gap-2">
            <SiteLogoMark boxClassName="mx-auto block h-12 w-12" />
            <div className="font-heading text-lg font-black uppercase leading-tight tracking-wider text-white">
              Cột Sống Niết Bàn
            </div>
          </Link>
        </div>

        <div className="rounded-xl border border-csnb-border bg-csnb-surface/95 p-8 shadow-lg ring-1 ring-white/5">
          <h1 className="mb-2 text-center font-heading text-xl font-black uppercase tracking-wide text-white">
            Xác thực email
          </h1>
          <p className="mb-4 text-center font-sans text-sm text-csnb-muted">
            Tài khoản của bạn chưa xác thực. Vui lòng mở email và bấm vào liên kết xác thực.
          </p>
          <p className="mb-4 rounded-md border border-csnb-border bg-csnb-bg/50 px-3 py-2 text-center font-mono text-xs text-white">
            {email}
          </p>

          {resendError ? (
            <p className="mb-4 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-center font-sans text-xs text-red-200">
              Không gửi được email: {resendError}
            </p>
          ) : null}

          {resent ? (
            <p className="mb-4 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-center font-sans text-xs text-emerald-100">
              Đã gửi lại email xác thực.
            </p>
          ) : null}

          <div className="space-y-3">
            <Link
              href="/auth/resend-verification"
              className="block w-full rounded-md bg-csnb-orange px-4 py-3 text-center font-sans text-sm font-semibold text-white transition-colors hover:bg-csnb-orange-deep"
            >
              Gửi lại email xác thực
            </Link>
            <Link
              prefetch={false}
              href="/auth/signout"
              className="block w-full rounded-md border border-csnb-border px-4 py-3 text-center font-sans text-sm font-semibold text-csnb-muted transition-colors hover:text-white"
            >
              Đăng xuất
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
