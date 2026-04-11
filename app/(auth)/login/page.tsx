import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#c0392b]/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/landing" className="inline-flex flex-col items-center gap-2">
            <div className="w-12 h-12 bg-[#c0392b] rounded flex items-center justify-center">
              <span className="text-white font-black text-xl font-heading">C</span>
            </div>
            <div className="font-heading font-black text-white text-lg tracking-wider uppercase leading-tight">
              Cột Sống Niết Bàn
            </div>
          </Link>
          <p className="text-[#a0a0a0] text-sm mt-2">Phục Hồi Chức Năng · Lấy Cột Sống Làm Trọng Tâm</p>
        </div>

        {/* Card */}
        <div className="bg-[#111] border border-[#222] rounded-sm p-8">
          <h1 className="font-heading font-black text-white text-xl uppercase tracking-wide text-center mb-2">
            Đăng Nhập
          </h1>
          <p className="text-[#a0a0a0] text-sm text-center mb-8">
            Sử dụng tài khoản Google để truy cập khóa học
          </p>

          {/* Google Button */}
          <button className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-100 text-[#0a0a0a] font-semibold text-sm px-4 py-3.5 rounded-sm transition-colors border border-gray-200 shadow-sm">
            {/* Google Icon */}
            <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
              <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
            </svg>
            Đăng Nhập Bằng Google
          </button>

          <div className="mt-6 pt-6 border-t border-[#222] text-center">
            <p className="text-[#a0a0a0] text-xs leading-relaxed">
              Bằng cách đăng nhập, bạn đồng ý với{" "}
              <Link href="#" className="text-white hover:text-[#c0392b] transition-colors">
                Điều khoản dịch vụ
              </Link>{" "}
              và{" "}
              <Link href="#" className="text-white hover:text-[#c0392b] transition-colors">
                Chính sách bảo mật
              </Link>{" "}
              của chúng tôi.
            </p>
          </div>
        </div>

        {/* Back link */}
        <div className="text-center mt-6">
          <Link href="/landing" className="text-[#a0a0a0] text-sm hover:text-white transition-colors">
            ← Quay lại trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
}
