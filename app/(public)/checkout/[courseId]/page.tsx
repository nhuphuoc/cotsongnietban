import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { CourseEnrollmentCheckout } from "@/components/marketing/course-enrollment-checkout";
import { getSessionActor } from "@/lib/api/auth";
import {
  enrollmentGrantsCourseAccess,
  getCoursePurchaseStateForUser,
  getPublicCourseByIdentifier,
} from "@/lib/api/repositories";
import { formatVnd } from "@/lib/format-vnd";
import { getLmsCourseHref } from "@/lib/learning-hub";

export const dynamic = "force-dynamic";

export default async function CheckoutPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;

  const actor = await getSessionActor();
  if (!actor) {
    redirect("/login?mode=signin");
  }

  const course = await getPublicCourseByIdentifier(courseId);
  if (!course) notFound();

  const purchaseState = await getCoursePurchaseStateForUser(actor.id, String(course.id));
  const hasAccess = enrollmentGrantsCourseAccess(purchaseState.enrollment);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-csnb-panel/35 to-csnb-panel pt-24 pb-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <Link href={`/courses/view/${course.slug || course.id}`} className="text-sm font-semibold text-csnb-orange-deep hover:underline">
          ← Quay lại trang khóa học
        </Link>

        <div className="mt-4 rounded-2xl border border-csnb-border/25 bg-white p-5 shadow-sm sm:p-7">
          {hasAccess ? (
            <div className="space-y-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
              <p className="font-sans text-base font-bold text-emerald-900">Bạn đã có quyền học khóa này.</p>
              <p className="font-sans text-sm text-emerald-800">Không cần thanh toán thêm. Nếu cần hỗ trợ, vui lòng liên hệ admin qua Zalo.</p>
              <Link
                href={getLmsCourseHref(String(course.slug || course.id))}
                className="inline-flex min-h-11 items-center justify-center rounded-md bg-emerald-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-800"
              >
                Vào khóa học
              </Link>
            </div>
          ) : (
            <CourseEnrollmentCheckout
              courseId={String(course.id)}
              courseTitle={String(course.title ?? "Khóa học")}
              priceLabel={formatVnd(typeof course.price_vnd === "number" ? course.price_vnd : Number(course.price_vnd))}
            />
          )}
        </div>
      </div>
    </div>
  );
}
