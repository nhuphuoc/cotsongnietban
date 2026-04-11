import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-csnb-bg px-4">
      <div className="pointer-events-none absolute top-1/2 left-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-csnb-orange/10 blur-[100px]" aria-hidden />

      <div className="relative w-full max-w-sm">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex flex-col items-center gap-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-md bg-csnb-orange">
              <span className="font-heading text-xl font-black text-white">C</span>
            </div>
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

          <button
            type="button"
            className="flex w-full items-center justify-center gap-3 rounded-md border border-gray-200 bg-white px-4 py-3.5 font-sans text-sm font-semibold text-csnb-ink shadow-sm transition-colors hover:bg-gray-50"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg" aria-hidden>
              <path
                d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
                fill="#4285F4"
              />
              <path
                d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
                fill="#34A853"
              />
              <path
                d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
                fill="#FBBC05"
              />
              <path
                d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
                fill="#EA4335"
              />
            </svg>
            Đăng nhập bằng Google
          </button>

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
