"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { SiteLogoMark } from "@/components/brand/site-logo-mark";

export function CheckEmailClient() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "(email không xác định)";
  const resent = searchParams.get("resent") === "1";
  const resendError = searchParams.get("resend_error")?.trim() ?? null;

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
          <div className="mb-6 text-center">
            <div className="mb-3 text-4xl">📧</div>
            <h1 className="mb-2 font-heading text-xl font-black uppercase tracking-wide text-white">
              Kiểm tra email của bạn
            </h1>
            <p className="font-sans text-sm text-csnb-muted">
              Chúng tôi đã gửi một liên kết xác thực tới:
            </p>
          </div>

          <div className="mb-6 rounded-lg border border-csnb-border bg-csnb-bg/50 px-4 py-3 text-center font-sans text-sm font-semibold text-csnb-orange">
            {email}
          </div>

          {resendError ? (
            <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-center font-sans text-sm text-red-200">
              Không gửi được email: {resendError}
            </div>
          ) : null}

          {resent ? (
            <div className="mb-6 rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-center font-sans text-sm text-green-200">
              ✓ Email xác thực đã được gửi lại. Vui lòng kiểm tra hộp thư.
            </div>
          ) : null}

          <div className="space-y-4 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4">
            <p className="font-sans text-sm text-amber-100">
              <strong>Bước 1:</strong> Mở hộp thư email của bạn
            </p>
            <p className="font-sans text-sm text-amber-100">
              <strong>Bước 2:</strong> Tìm email từ Cột Sống Niết Bàn
            </p>
            <p className="font-sans text-sm text-amber-100">
              <strong>Bước 3:</strong> Bấm vào liên kết xác thực trong email
            </p>
          </div>

          <div className="mt-6 flex flex-col gap-3">
            <Link
              href={`/auth/resend-verification?email=${encodeURIComponent(email)}`}
              className="rounded-lg border border-csnb-orange bg-csnb-orange px-4 py-2.5 text-center font-sans text-sm font-semibold text-white transition-colors hover:bg-csnb-orange-bright"
            >
              Gửi lại email xác thực
            </Link>

            <Link
              href="/login"
              className="rounded-lg border border-csnb-border text-center font-sans text-sm font-semibold text-csnb-muted transition-colors hover:text-white"
            >
              Quay lại đăng nhập
            </Link>
          </div>

          <p className="mt-6 text-center font-sans text-xs leading-relaxed text-csnb-muted">
            Email có thể nằm trong thư mục Spam hoặc Promotions. Nếu bạn nhập sai email khi đăng ký, hãy{" "}
            <Link href="/login" className="text-csnb-orange-bright hover:underline">
              quay lại đăng nhập
            </Link>
            , chọn Đăng ký và tạo tài khoản với địa chỉ đúng.
          </p>
        </div>
      </div>
    </div>
  );
}
