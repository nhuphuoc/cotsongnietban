import AdminSidebar from "@/components/layout/AdminSidebar";
import { Inter } from "next/font/google";

const adminFont = Inter({
  subsets: ["latin", "latin-ext", "vietnamese"],
  weight: ["400", "500", "600", "700"],
});

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={`${adminFont.className} flex h-screen bg-gray-50 overflow-hidden text-[15px] leading-relaxed text-gray-700`}
    >
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
