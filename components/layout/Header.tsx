"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { SiteLogoMark } from "@/components/brand/site-logo-mark";

const navLinks = [
  { href: "/", label: "Trang chủ" },
  { href: "/results", label: "Kết quả" },
  { href: "/blog", label: "Blog" },
  { href: "/courses", label: "Khóa học" },
  { href: "/hoc-cua-toi", label: "Khóa học của tôi" },
];

function isNavActive(pathname: string, href: string) {
  if (pathname === href) return true;
  if (href === "/hoc-cua-toi") {
    return pathname === "/hoc-cua-toi" || pathname.startsWith("/hoc/");
  }
  if (href === "/courses") {
    return pathname === "/courses" || pathname.startsWith("/courses/");
  }
  if (href === "/") return false;
  return pathname.startsWith(`${href}/`) || pathname.startsWith(`${href}?`);
}

export default function Header() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <header
      className={cn(
        "fixed top-0 right-0 left-0 z-50 border-b transition-[background,box-shadow,border-color] duration-300",
        scrolled
          ? "border-csnb-border/40 bg-csnb-bg/96 shadow-lg shadow-black/25 backdrop-blur-md"
          : "border-transparent bg-csnb-bg/88 backdrop-blur-sm"
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:h-[4.25rem] sm:px-6 lg:px-8">
        <Link
          href="/"
          className="group flex shrink-0 items-center gap-2.5 rounded-sm p-1 -m-1 ring-csnb-orange-bright/0 transition-[box-shadow] focus-visible:ring-2 focus-visible:ring-csnb-orange-bright focus-visible:ring-offset-2 focus-visible:ring-offset-csnb-bg"
        >
          <SiteLogoMark boxClassName="block h-9 w-9 sm:h-10 sm:w-10" alt="" />
          <div className="hidden leading-none sm:flex sm:flex-col">
            <span className="font-heading text-xs font-black uppercase tracking-wider text-white sm:text-sm">
              Cột Sống
            </span>
            <span className="font-heading text-xs font-black uppercase tracking-wider text-csnb-orange-bright sm:text-sm">
              Niết Bàn
            </span>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex lg:gap-0.5" aria-label="Menu chính">
          {navLinks.map((link) => {
            const active = isNavActive(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-md px-3 py-2 font-sans text-sm font-medium text-csnb-muted transition-colors hover:text-white",
                  active && "bg-white/10 text-white"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden shrink-0 items-center gap-2 lg:flex">
          <Link
            href="/login"
            className="rounded-md px-3 py-2 font-sans text-sm font-medium text-csnb-muted transition-colors hover:text-white"
          >
            Đăng nhập
          </Link>
          <Link
            href="/courses"
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-csnb-orange px-4 py-2 font-sans text-sm font-bold text-white shadow-sm transition-colors hover:bg-csnb-orange-deep sm:px-5"
          >
            Khóa học
            <ArrowRight className="size-4 shrink-0 opacity-90" aria-hidden />
          </Link>
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md text-white lg:hidden"
          type="button"
          aria-expanded={isOpen}
          aria-controls="site-mobile-nav"
          aria-label={isOpen ? "Đóng menu" : "Mở menu"}
        >
          {isOpen ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </div>

      {isOpen ? (
        <div
          id="site-mobile-nav"
          className="max-h-[min(70vh,calc(100dvh-4rem))] overflow-y-auto overscroll-contain border-t border-csnb-border/50 bg-csnb-surface/98 lg:hidden"
        >
          <nav className="mx-auto max-w-6xl space-y-0.5 px-4 py-3 sm:px-6" aria-label="Menu chính (mobile)">
            {navLinks.map((link) => {
              const active = isNavActive(pathname, link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "block rounded-lg py-3 pl-3 font-sans text-sm font-semibold text-csnb-muted transition-colors hover:bg-white/5 hover:text-white",
                    active && "bg-white/10 text-white"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
            <div className="mt-3 flex flex-col gap-2 border-t border-csnb-border/40 pt-4">
              <Link
                href="/login"
                className="rounded-lg py-3 text-center font-sans text-sm text-csnb-muted hover:bg-white/5 hover:text-white"
              >
                Đăng nhập
              </Link>
              <Link
                href="/courses"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-csnb-orange px-5 py-3 text-center font-sans text-sm font-bold text-white hover:bg-csnb-orange-deep"
              >
                Khóa học
                <ArrowRight className="size-4 shrink-0" aria-hidden />
              </Link>
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
