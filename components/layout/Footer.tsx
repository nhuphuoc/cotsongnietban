import Link from "next/link";
import { SiteLogoMark } from "@/components/brand/site-logo-mark";
import { Phone, Mail, MapPin, MessageCircle } from "lucide-react";
import { SITE_CONTACT } from "@/lib/site-contact";

export default function Footer() {
  return (
    <footer className="border-t border-csnb-border bg-csnb-bg text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4 lg:gap-12">
          <div className="lg:col-span-2">
            <div className="mb-4 flex items-center gap-2">
              <SiteLogoMark boxClassName="block h-9 w-9" alt="" />
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
            <div className="flex flex-wrap items-center gap-3">
              <a
                href={SITE_CONTACT.facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook Cột Sống Niết Bàn"
                className="flex h-11 w-11 items-center justify-center rounded-md border border-csnb-border bg-csnb-surface text-csnb-muted transition-colors hover:border-csnb-orange hover:text-csnb-orange focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-csnb-orange-bright"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </a>
              <a
                href={SITE_CONTACT.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Instagram @${SITE_CONTACT.instagramHandle}`}
                className="flex h-11 w-11 items-center justify-center rounded-md border border-csnb-border bg-csnb-surface text-csnb-muted transition-colors hover:border-csnb-orange hover:text-csnb-orange focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-csnb-orange-bright"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>
              <a
                href={SITE_CONTACT.zaloUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Tư vấn trực tiếp"
                className="flex h-11 w-11 items-center justify-center rounded-md border border-csnb-border bg-csnb-surface text-csnb-muted transition-colors hover:border-csnb-orange hover:text-csnb-orange focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-csnb-orange-bright"
              >
                <MessageCircle className="size-[18px]" aria-hidden />
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
                { href: "/courses", label: "Khóa Học" },
                { href: "/feedback", label: "Gửi Feedback" },
                { href: SITE_CONTACT.facebookUrl, label: "Facebook" },
                { href: SITE_CONTACT.instagramUrl, label: "Instagram" },
                { href: SITE_CONTACT.zaloUrl, label: "Tư vấn trực tiếp" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="inline-block rounded-sm py-1 text-sm text-csnb-muted underline-offset-4 transition-colors hover:text-white hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-csnb-orange-bright"
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
                <div className="text-sm">
                  <a
                    href={`tel:${SITE_CONTACT.phoneE164}`}
                    className="block text-csnb-muted transition-colors hover:text-white"
                  >
                    {SITE_CONTACT.phoneDisplay}
                  </a>
                  <span className="mt-0.5 block text-xs text-csnb-muted/80">{SITE_CONTACT.phoneIntl}</span>
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <Mail size={14} className="mt-0.5 shrink-0 text-csnb-orange" />
                <a
                  href={`mailto:${SITE_CONTACT.email}`}
                  className="break-all text-sm text-csnb-muted transition-colors hover:text-white"
                >
                  {SITE_CONTACT.email}
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin size={14} className="mt-0.5 shrink-0 text-csnb-orange" />
                <span className="text-sm text-csnb-muted">TP. Hồ Chí Minh, Việt Nam</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-csnb-border pt-6 sm:flex-row">
          <p className="text-xs text-csnb-muted">© 2026 Cột Sống Niết Bàn. Tất cả quyền được bảo lưu.</p>
          <div className="flex items-center gap-4">
            <Link
              href="/legal/privacy"
              className="rounded-sm px-1 py-1 text-xs text-csnb-muted underline-offset-2 transition-colors hover:text-white hover:underline"
            >
              Chính sách bảo mật
            </Link>
            <Link
              href="/legal/terms"
              className="rounded-sm px-1 py-1 text-xs text-csnb-muted underline-offset-2 transition-colors hover:text-white hover:underline"
            >
              Điều khoản dịch vụ
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
