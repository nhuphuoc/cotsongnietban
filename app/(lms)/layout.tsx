import LmsSidebar from "@/components/layout/LmsSidebar";

export default function LmsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-neutral-100">
      <LmsSidebar />
      <main className="min-h-0 flex-1 overflow-y-auto bg-neutral-100">{children}</main>
    </div>
  );
}
