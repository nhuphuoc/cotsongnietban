import Link from "next/link";
import { XCircle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CheckoutCancelPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-white via-red-50/30 to-white px-4">
      <div className="w-full max-w-sm rounded-2xl border border-red-200 bg-white p-6 text-center shadow-sm">
        <XCircle className="mx-auto size-12 text-red-400" aria-hidden />
        <h1 className="mt-4 font-sans text-lg font-extrabold text-neutral-900">
          Thanh toán đã bị hủy
        </h1>
        <p className="mt-2 font-sans text-sm leading-relaxed text-neutral-600">
          Bạn đã hủy thanh toán hoặc giao dịch không thành công. Đơn hàng sẽ không bị tính phí.
        </p>
        <div className="mt-5 flex flex-col gap-2">
          <Link
            href="/courses"
            className="inline-flex min-h-10 items-center justify-center rounded-md bg-csnb-orange px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-csnb-orange-deep"
          >
            Quay lại danh sách khóa học
          </Link>
          <Link
            href="/"
            className="text-xs text-neutral-400 underline hover:text-neutral-600"
          >
            Về trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
}
