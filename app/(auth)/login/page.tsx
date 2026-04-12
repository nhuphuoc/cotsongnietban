import Link from "next/link";
import { SiteLogoMark } from "@/components/brand/site-logo-mark";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";

type Props = { searchParams?: Promise<{ error?: string }> };

export default async function LoginPage({ searchParams }: Props) {
  const params = searchParams ? await searchParams : {};
  const errorKey = params.error;

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-csnb-bg px-4">
      <div className="pointer-events-none absolute top-1/2 left-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-csnb-orange/10 blur-[100px]" aria-hidden />

      <div className="relative w-full max-w-sm">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex flex-col items-center gap-2">
            <SiteLogoMark boxClassName="mx-auto block h-12 w-12" />
            <div className="font-heading text-lg font-black uppercase leading-tight tracking-wider text-white">
              Cột Sống Niết Bàn
            </div>
          </Link>
          <p className="mt-2 font-sans text-sm text-csnb-muted">Phục hồi chức năng · Lấy cột sống làm trọng tâm</p>
        </div>

        <div className="rounded-xl border border-csnb-border bg-csnb-surface/95 p-8 shadow-lg ring-1 ring-white/5">
          <h1 className="mb-2 text-center font-heading text-xl font-black uppercase tracking-wide text-white">
            Đăng nhập
          </h1>
          <p className="mb-8 text-center font-sans text-sm text-csnb-muted">Sử dụng tài khoản Google để truy cập khóa học</p>

          {errorKey === "auth" ? (
            <p className="mb-4 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-center font-sans text-xs text-red-200">
              Đăng nhập thất bại. Thử lại hoặc kiểm tra Redirect URL trong Supabase.
            </p>
          ) : null}
          {errorKey === "config" ? (
            <p className="mb-4 rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-center font-sans text-xs text-amber-100">
              Chưa cấu hình Supabase. Thêm NEXT_PUBLIC_SUPABASE_URL và NEXT_PUBLIC_SUPABASE_ANON_KEY vào .env.local.
            </p>
          ) : null}

          <GoogleSignInButton />

          <div className="mt-6 border-t border-csnb-border pt-6 text-center">
            <p className="font-sans text-xs leading-relaxed text-csnb-muted">
              Bằng cách đăng nhập, bạn đồng ý với{" "}
              <Link href="#" className="text-white transition-colors hover:text-csnb-orange-bright">
                Điều khoản dịch vụ
              </Link>{" "}
              và{" "}
              <Link href="#" className="text-white transition-colors hover:text-csnb-orange-bright">
                Chính sách bảo mật
              </Link>{" "}
              của chúng tôi.
            </p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link href="/" className="font-sans text-sm text-csnb-muted transition-colors hover:text-white">
            ← Quay lại trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
}
