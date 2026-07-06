import Link from "next/link";
import { SiteLogoMark } from "@/components/brand/site-logo-mark";
import { Phone, Mail, MessageCircle } from "lucide-react";
import { SITE_CONTACT } from "@/lib/site-contact";

export default function Footer() {
  return (
    <footer className="border-t border-csnb-border bg-csnb-bg text-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          {/* Brand */}
          <div className="flex items-center gap-2">
            <SiteLogoMark boxClassName="block h-7 w-7" alt="" />
            <div className="flex flex-col leading-none">
              <span className="font-heading text-sm font-black uppercase tracking-wider text-white">
                Cột Sống Niết Bàn
              </span>
              <span className="mt-0.5 text-[10px] text-csnb-muted">
                Phục hồi chức năng · Lấy cột sống làm trọng tâm
              </span>
            </div>
          </div>

          {/* Nav links */}
          <div className="flex flex-wrap gap-x-5 gap-y-1.5">
            {[
              { href: "/", label: "Trang Chủ" },
              { href: "/results", label: "Kết Quả" },
              { href: "/blog", label: "Blog" },
              { href: "/courses", label: "Khóa Học" },
              { href: "/feedback", label: "Feedback" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-csnb-muted transition-colors hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Contact + social */}
          <div className="flex items-center gap-3">
            <a
              href={`tel:${SITE_CONTACT.phoneE164}`}
              className="flex items-center gap-1.5 text-sm text-csnb-muted transition-colors hover:text-white"
            >
              <Phone size={13} className="text-csnb-orange" />
              {SITE_CONTACT.phoneDisplay}
            </a>
            <a
              href={`mailto:${SITE_CONTACT.email}`}
              className="flex items-center gap-1.5 text-sm text-csnb-muted transition-colors hover:text-white"
            >
              <Mail size={13} className="text-csnb-orange" />
            </a>
            <a
              href={SITE_CONTACT.zaloUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm text-csnb-muted transition-colors hover:text-white"
            >
              <MessageCircle size={13} className="text-csnb-orange" />
              Zalo
            </a>
          </div>
        </div>

        <div className="mt-6 flex flex-col items-center justify-between gap-2 border-t border-csnb-border pt-4 sm:flex-row">
          <p className="text-xs text-csnb-muted">© 2026 Cột Sống Niết Bàn.</p>
          <div className="flex items-center gap-3">
            <Link
              href="/legal/privacy"
              className="text-xs text-csnb-muted transition-colors hover:text-white"
            >
              Chính sách bảo mật
            </Link>
            <Link
              href="/legal/terms"
              className="text-xs text-csnb-muted transition-colors hover:text-white"
            >
              Điều khoản
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
