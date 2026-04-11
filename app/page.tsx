import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black px-4 text-white">
      <p className="text-center text-sm text-white/60">
        Trang chủ mới — bắt đầu xây dựng tại đây.
      </p>
      <h1 className="mt-4 text-center text-2xl font-extrabold tracking-tight sm:text-3xl">
        COTSONGNIETBAN
      </h1>
      <div className="mt-8">
        <Link
          href="/landing"
          className="inline-flex h-11 items-center justify-center rounded-none bg-red-700 px-6 text-sm font-medium text-white transition-colors hover:bg-red-800"
        >
          Xem landing cũ
        </Link>
      </div>
    </div>
  );
}
