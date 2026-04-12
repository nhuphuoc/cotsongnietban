import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <a
        href="#main-content"
        className="pointer-events-none fixed left-4 top-4 z-[100] -translate-y-20 rounded-md bg-csnb-orange px-4 py-2.5 text-sm font-semibold text-white opacity-0 shadow-lg transition-[opacity,transform] duration-200 focus:pointer-events-auto focus:translate-y-0 focus:opacity-100"
      >
        Bỏ qua menu, đến nội dung chính
      </a>
      <Header />
      <main
        id="main-content"
        className="min-w-0 flex-1 scroll-mt-20 overflow-x-clip outline-none"
        tabIndex={-1}
      >
        {children}
      </main>
      <Footer />
    </>
  );
}
