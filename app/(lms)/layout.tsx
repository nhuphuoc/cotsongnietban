import LmsSidebar from "@/components/layout/LmsSidebar";

export default function LmsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-csnb-bg">
      <LmsSidebar />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
