import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { getLmsCourseHref } from "@/lib/learning-hub";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ orderId?: string }>;
};

export default async function CheckoutSuccessPage({ searchParams }: Props) {
  const { orderId } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-white via-emerald-50/30 to-white px-4">
      <div className="w-full max-w-sm rounded-2xl border border-emerald-200 bg-white p-6 text-center shadow-sm">
        <CheckCircle2 className="mx-auto size-12 text-emerald-500" aria-hidden />
        <h1 className="mt-4 font-sans text-lg font-extrabold text-neutral-900">
          Thanh toán thành công!
        </h1>
        <p className="mt-2 font-sans text-sm leading-relaxed text-neutral-600">
          Cảm ơn bạn đã đăng ký. Hệ thống đang xử lý — quyền học sẽ được kích hoạt trong giây lát.
        </p>
        <div className="mt-5 flex flex-col gap-2">
          <Link
            href="/hoc-cua-toi"
            className="inline-flex min-h-10 items-center justify-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-emerald-700"
          >
            Vào phòng học của tôi
          </Link>
          <Link
            href="/courses"
            className="inline-flex min-h-10 items-center justify-center rounded-md border border-csnb-border/30 bg-white px-4 py-2 text-sm font-semibold text-neutral-700 transition-colors hover:bg-neutral-50"
          >
            Xem thêm khóa học
          </Link>
        </div>
      </div>
    </div>
  );
}
