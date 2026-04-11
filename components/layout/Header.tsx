"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X, ArrowRight } from "lucide-react";

const navLinks = [
  { href: "/", label: "Trang Chủ" },
  { href: "/results", label: "Kết Quả" },
  { href: "/blog", label: "Blog" },
  { href: "/#pricing", label: "Khóa Học" },
];

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-csnb-bg/95 shadow-lg shadow-black/30 backdrop-blur-md"
          : "bg-csnb-bg/90 backdrop-blur-sm"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          <Link href="/" className="group flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-csnb-orange transition-colors group-hover:bg-csnb-orange-deep">
              <span className="font-heading text-sm font-black text-white">C</span>
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-heading text-sm font-black uppercase tracking-wider text-white">
                Cột Sống
              </span>
              <span className="font-heading text-sm font-black uppercase tracking-wider text-csnb-orange-bright">
                Niết Bàn
              </span>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="font-heading text-sm font-medium uppercase tracking-wide text-csnb-muted transition-colors duration-200 hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-csnb-muted transition-colors hover:text-white"
            >
              Đăng Nhập
            </Link>
            <Link
              href="/#pricing"
              className="inline-flex items-center gap-2 rounded-sm bg-csnb-orange px-5 py-2.5 font-heading text-sm font-bold uppercase tracking-wider text-white transition-colors hover:bg-csnb-orange-deep"
            >
              Chọn khóa học
              <ArrowRight size={14} />
            </Link>
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden text-white p-2"
            type="button"
            aria-label={isOpen ? "Đóng menu" : "Mở menu"}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="border-t border-csnb-border bg-csnb-surface lg:hidden">
          <div className="px-4 py-4 space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="block py-2 font-heading text-sm font-semibold uppercase tracking-wider text-csnb-muted transition-colors hover:text-white"
              >
                {link.label}
              </Link>
            ))}
            <div className="flex flex-col gap-3 border-t border-csnb-border pt-3">
              <Link href="/login" className="py-2 text-center text-sm text-csnb-muted hover:text-white">
                Đăng Nhập
              </Link>
              <Link
                href="/#pricing"
                onClick={() => setIsOpen(false)}
                className="inline-flex items-center justify-center gap-2 rounded-sm bg-csnb-orange px-5 py-3 text-center font-heading text-sm font-bold uppercase tracking-wider text-white hover:bg-csnb-orange-deep"
              >
                Chọn khóa học
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
