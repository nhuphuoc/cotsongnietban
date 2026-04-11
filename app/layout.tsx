import type { Metadata } from "next";
import { Anton, Montserrat } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-sans",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
});

const anton = Anton({
  variable: "--font-heading",
  subsets: ["latin", "latin-ext"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Cột Sống Niết Bàn — Phục Hồi Tự Nhiên, Trị Liệu Tận Gốc",
  description: "Chương trình tập luyện & phục hồi chức năng lấy cột sống làm trọng tâm. Giảm đau lưng, thoát vị đĩa đệm, đau khớp mãn tính không cần phẫu thuật.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${montserrat.variable} ${anton.variable} h-full antialiased`}
      data-scroll-behavior="smooth"
    >
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
