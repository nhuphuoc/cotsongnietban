import Link from "next/link";
import { Phone, Mail, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#0a0a0a] border-t border-[#222]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-[#c0392b] rounded flex items-center justify-center">
                <span className="text-white font-black text-base font-heading">C</span>
              </div>
              <div className="flex flex-col leading-none">
                <span className="font-heading font-black text-white text-base tracking-wider uppercase">
                  Cột Sống Niết Bàn
                </span>
                <span className="text-[#a0a0a0] text-xs mt-0.5">Phục Hồi Chức Năng · Lấy Cột Sống Làm Trọng Tâm</span>
              </div>
            </div>
            <p className="text-[#a0a0a0] text-sm leading-relaxed max-w-sm mb-6">
              Hệ thống khóa học phục hồi chức năng và coaching fitness hàng đầu
              Việt Nam. Hơn 59,000 học viên đã thay đổi cuộc sống.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-[#111] border border-[#222] rounded flex items-center justify-center text-[#a0a0a0] hover:text-[#c0392b] hover:border-[#c0392b] transition-colors"
              >
                {/* Facebook SVG */}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-[#111] border border-[#222] rounded flex items-center justify-center text-[#a0a0a0] hover:text-[#c0392b] hover:border-[#c0392b] transition-colors"
              >
                {/* YouTube SVG */}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58a2.78 2.78 0 0 0 1.95 1.95C5.12 20 12 20 12 20s6.88 0 8.59-.47a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58zM9.75 15.02V8.98L15.5 12l-5.75 3.02z"/></svg>
              </a>
              <a
                href="https://zalo.me"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-[#111] border border-[#222] rounded flex items-center justify-center text-[#a0a0a0] hover:text-[#c0392b] hover:border-[#c0392b] transition-colors text-xs font-bold font-heading"
              >
                Za
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white font-heading font-bold text-sm uppercase tracking-wider mb-4">
              Điều Hướng
            </h4>
            <ul className="space-y-2">
              {[
                { href: "/landing", label: "Trang Chủ" },
                { href: "/results", label: "Kết Quả Học Viên" },
                { href: "/blog", label: "Blog Kiến Thức" },
                { href: "#pricing", label: "Khóa Học" },
                { href: "#consult", label: "Đăng Ký Tư Vấn" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[#a0a0a0] hover:text-white text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-heading font-bold text-sm uppercase tracking-wider mb-4">
              Liên Hệ
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5">
                <Phone size={14} className="text-[#c0392b] mt-0.5 shrink-0" />
                <span className="text-[#a0a0a0] text-sm">0909 xxx xxx</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Mail size={14} className="text-[#c0392b] mt-0.5 shrink-0" />
                <span className="text-[#a0a0a0] text-sm">info@cotsongnietban.vn</span>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin size={14} className="text-[#c0392b] mt-0.5 shrink-0" />
                <span className="text-[#a0a0a0] text-sm">TP. Hồ Chí Minh, Việt Nam</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-[#222] flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[#a0a0a0] text-xs">
            © 2024 Cột Sống Niết Bàn. Tất cả quyền được bảo lưu.
          </p>
          <div className="flex items-center gap-4">
            <Link href="#" className="text-[#a0a0a0] text-xs hover:text-white transition-colors">
              Chính sách bảo mật
            </Link>
            <Link href="#" className="text-[#a0a0a0] text-xs hover:text-white transition-colors">
              Điều khoản dịch vụ
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
