import Link from "next/link";
import { Phone, Mail, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-csnb-border bg-csnb-bg text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4 lg:gap-12">
          <div className="lg:col-span-2">
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-sm bg-csnb-orange">
                <span className="font-heading text-base font-black text-white">C</span>
              </div>
              <div className="flex flex-col leading-none">
                <span className="font-heading text-base font-black uppercase tracking-wider text-white">
                  Cột Sống Niết Bàn
                </span>
                <span className="mt-0.5 text-xs text-csnb-muted">
                  Phục hồi chức năng · Lấy cột sống làm trọng tâm
                </span>
              </div>
            </div>
            <p className="mb-6 max-w-sm text-sm leading-relaxed text-csnb-muted">
              Hệ thống khóa học phục hồi chức năng và coaching fitness hàng đầu Việt Nam. Hơn 59,000 học viên đã thay
              đổi cuộc sống.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-sm border border-csnb-border bg-csnb-surface text-csnb-muted transition-colors hover:border-csnb-orange hover:text-csnb-orange"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-sm border border-csnb-border bg-csnb-surface text-csnb-muted transition-colors hover:border-csnb-orange hover:text-csnb-orange"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58a2.78 2.78 0 0 0 1.95 1.95C5.12 20 12 20 12 20s6.88 0 8.59-.47a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58zM9.75 15.02V8.98L15.5 12l-5.75 3.02z" />
                </svg>
              </a>
              <a
                href="https://zalo.me"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-sm border border-csnb-border bg-csnb-surface font-heading text-xs font-bold text-csnb-muted transition-colors hover:border-csnb-orange hover:text-csnb-orange"
              >
                Za
              </a>
            </div>
          </div>

          <div>
            <h4 className="mb-4 font-heading text-sm font-bold uppercase tracking-wider text-white">Điều hướng</h4>
            <ul className="space-y-2">
              {[
                { href: "/", label: "Trang Chủ" },
                { href: "/results", label: "Kết Quả Học Viên" },
                { href: "/blog", label: "Blog Kiến Thức" },
                { href: "/#pricing", label: "Khóa Học" },
                { href: "https://zalo.me", label: "Zalo" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-csnb-muted transition-colors hover:text-white"
                    {...(link.href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-heading text-sm font-bold uppercase tracking-wider text-white">Liên hệ</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5">
                <Phone size={14} className="mt-0.5 shrink-0 text-csnb-orange" />
                <span className="text-sm text-csnb-muted">0909 xxx xxx</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Mail size={14} className="mt-0.5 shrink-0 text-csnb-orange" />
                <span className="text-sm text-csnb-muted">info@cotsongnietban.vn</span>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin size={14} className="mt-0.5 shrink-0 text-csnb-orange" />
                <span className="text-sm text-csnb-muted">TP. Hồ Chí Minh, Việt Nam</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-csnb-border pt-6 sm:flex-row">
          <p className="text-xs text-csnb-muted">© 2024 Cột Sống Niết Bàn. Tất cả quyền được bảo lưu.</p>
          <div className="flex items-center gap-4">
            <Link href="#" className="text-xs text-csnb-muted transition-colors hover:text-white">
              Chính sách bảo mật
            </Link>
            <Link href="#" className="text-xs text-csnb-muted transition-colors hover:text-white">
              Điều khoản dịch vụ
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
