import type { Metadata } from "next";
import { Inter, Montserrat } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const montserrat = Montserrat({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
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
    <html lang="vi" className={`${inter.variable} ${montserrat.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
