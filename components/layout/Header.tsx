"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

const navLinks = [
  { href: "/landing", label: "Trang Chủ" },
  { href: "/results", label: "Kết Quả" },
  { href: "/blog", label: "Blog" },
  { href: "#pricing", label: "Khóa Học" },
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
          ? "bg-[#0a0a0a]/95 backdrop-blur-md shadow-lg shadow-black/20"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/landing" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-[#c0392b] rounded flex items-center justify-center">
              <span className="text-white font-black text-sm font-heading">C</span>
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-heading font-black text-white text-sm tracking-wider uppercase">
                Cột Sống
              </span>
              <span className="font-heading font-black text-[#c0392b] text-sm tracking-wider uppercase">
                Niết Bàn
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-[#a0a0a0] hover:text-white text-sm font-medium tracking-wide transition-colors duration-200 hover:text-[#c0392b] uppercase font-heading"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* CTA */}
          <div className="hidden lg:flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm text-white/70 hover:text-white transition-colors font-medium"
            >
              Đăng Nhập
            </Link>
            <Link
              href="#consult"
              className="bg-[#c0392b] hover:bg-[#96281b] text-white text-sm font-bold px-5 py-2.5 rounded-sm uppercase tracking-wider transition-colors duration-200 font-heading"
            >
              Tư Vấn Ngay
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden text-white p-2"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="lg:hidden bg-[#0a0a0a] border-t border-[#222]">
          <div className="px-4 py-4 space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="block text-[#a0a0a0] hover:text-white py-2 text-sm uppercase font-heading font-semibold tracking-wider transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-3 border-t border-[#222] flex flex-col gap-3">
              <Link href="/login" className="text-sm text-white/70 text-center py-2">
                Đăng Nhập
              </Link>
              <Link
                href="#consult"
                onClick={() => setIsOpen(false)}
                className="bg-[#c0392b] text-white text-sm font-bold px-5 py-3 rounded-sm uppercase tracking-wider text-center font-heading"
              >
                Tư Vấn Ngay
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
