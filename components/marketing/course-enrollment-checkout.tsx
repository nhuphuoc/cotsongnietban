"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, CreditCard } from "lucide-react";
import { SITE_CONTACT } from "@/lib/site-contact";
import { CancelPendingRegistrationButton } from "@/components/marketing/cancel-pending-registration-button";

type CheckoutResult = {
  orderId: string;
  orderCode: string;
  status: string;
  totalVnd: number | null;
  paymentMethod: string;
  paymentReference: string | null;
  alreadyExists?: boolean;
  bankInfo: {
    bankName: string;
    accountNumber: string;
    accountName: string;
  };
};

type PayOSResult = {
  checkoutUrl: string;
  orderId: string;
  orderCode: number;
};

type Props = {
  courseId: string;
  courseTitle: string;
  priceLabel: string;
  priceVnd: number;
  /** Đơn pending/paid trên server (PayOS hoặc CK) — cho phép hủy trước khi có state cục bộ */
  cancellableOrderId?: string | null;
};

function formatVnd(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
}

async function readErrorMessage(res: Response) {
  try {
    const json = (await res.json()) as { error?: { message?: string } };
    return json.error?.message ?? `Request failed (${res.status})`;
  } catch {
    return `Request failed (${res.status})`;
  }
}

export function CourseEnrollmentCheckout({
  courseId,
  courseTitle,
  priceLabel,
  priceVnd,
  cancellableOrderId = null,
}: Props) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [payosLoading, setPayosLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [result, setResult] = useState<CheckoutResult | null>(null);
  const [transferConfirmed, setTransferConfirmed] = useState(false);

  const qrUrl = useMemo(() => {
    if (!result || result.totalVnd == null || !result.paymentReference) return null;
    const payload = [
      `BANK:${result.bankInfo.bankName}`,
      `ACCOUNT:${result.bankInfo.accountNumber}`,
      `AMOUNT:${result.totalVnd}`,
      `NOTE:${result.paymentReference}`,
    ].join("\n");
    return `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(payload)}`;
  }, [result]);

  async function createOrder() {
    setSubmitting(true);
    setError(null);
    setNotice(null);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId }),
      });

      if (res.status === 401) {
        window.location.href = "/login?mode=signin";
        return;
      }

      if (!res.ok) {
        throw new Error(await readErrorMessage(res));
      }

      const json = (await res.json()) as { data: CheckoutResult };
      setResult(json.data);
      if (json.data.alreadyExists) {
        setNotice("Bạn đã có đơn cho khóa này. Vui lòng dùng đúng nội dung chuyển khoản bên dưới.");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Không thể tạo đơn hàng.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  async function payWithPayos() {
    setPayosLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/checkout/payos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId, amount: priceVnd }),
      });

      if (res.status === 401) {
        window.location.href = "/login?mode=signin";
        return;
      }

      if (!res.ok) {
        throw new Error(await readErrorMessage(res));
      }

      const json = (await res.json()) as { data: PayOSResult };
      router.push(json.data.checkoutUrl);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Không thể tạo thanh toán PayOS.";
      setError(message);
      setPayosLoading(false);
    }
  }

  async function confirmTransfer() {
    if (!result?.orderId) return;
    setConfirming(true);
    setError(null);

    try {
      const res = await fetch(`/api/orders/${result.orderId}/confirm-transfer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note: "User xác nhận đã chuyển khoản qua trang checkout." }),
      });

      if (!res.ok) {
        throw new Error(await readErrorMessage(res));
      }

      setTransferConfirmed(true);
      setNotice("Đã ghi nhận xác nhận chuyển khoản. Vui lòng gửi ảnh chụp màn hình cho admin qua Zalo.");
      setResult((prev) => (prev ? { ...prev, status: "paid" } : prev));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Không thể xác nhận chuyển khoản.";
      setError(message);
    } finally {
      setConfirming(false);
    }
  }

  const showServerPendingCancel = Boolean(cancellableOrderId && !result);

  return (
    <div>
      <p className="font-sans text-xs uppercase tracking-wide text-neutral-500">Checkout khóa học</p>
      <h1 className="mt-1 font-sans text-xl font-extrabold text-csnb-ink">{courseTitle}</h1>
      <p className="mt-1 font-sans text-2xl font-extrabold tabular-nums text-csnb-orange-deep">{priceLabel}</p>

      {showServerPendingCancel ? (
        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50/90 px-3 py-3 font-sans text-sm text-amber-950">
          <p className="font-medium">Bạn đang có đơn chờ thanh toán cho khóa này.</p>
          <p className="mt-1 text-xs text-amber-900/85">
            Ấn nhầm? Hủy đơn để chọn lại phương thức hoặc tạo đơn mới.
          </p>
          <div className="mt-3">
            <CancelPendingRegistrationButton orderId={cancellableOrderId!} variant="button" className="[&_button]:w-full" />
          </div>
        </div>
      ) : null}

      {!result ? (
        <div className="mt-4 space-y-3 rounded-lg border border-csnb-border/25 bg-white p-4">
          <p className="font-sans text-sm leading-relaxed text-neutral-700">
            Chọn phương thức thanh toán cho khóa học này. Mỗi tài khoản chỉ có một đơn thanh toán cho mỗi khóa.
          </p>

          {/* PayOS — thanh toán tự động */}
          <button
            type="button"
            onClick={payWithPayos}
            disabled={payosLoading || submitting}
            className="flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-emerald-600 px-4 py-3 font-sans text-sm font-bold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {payosLoading ? (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            ) : (
              <CreditCard className="size-4" />
            )}
            Thanh toán qua PayOS (tự động)
          </button>

          <div className="flex items-center gap-2">
            <div className="flex-1 border-t border-csnb-border/20" />
            <span className="text-xs text-neutral-400">hoặc</span>
            <div className="flex-1 border-t border-csnb-border/20" />
          </div>

          {/* Bank transfer — thủ công */}
          <p className="font-sans text-xs leading-relaxed text-neutral-500">
            Chuyển khoản ngân hàng thủ công (admin duyệt tay, chậm hơn)
          </p>
          <button
            type="button"
            onClick={createOrder}
            disabled={submitting || payosLoading}
            className="flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-csnb-orange px-4 py-3 font-sans text-sm font-bold text-white transition-colors hover:bg-csnb-orange-deep disabled:cursor-not-allowed disabled:opacity-70"
          >
            {submitting ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <span className="text-lg leading-none">▶</span>}
            Tạo đơn & nhận mã QR
          </button>
        </div>
      ) : (
        <div className="mt-4 space-y-3 rounded-lg border border-csnb-border/25 bg-csnb-panel/55 p-3.5">
          <p className="font-sans text-xs font-semibold uppercase tracking-wide text-csnb-ink/75">Đơn hàng</p>
          <p className="font-mono text-sm font-semibold text-csnb-orange-deep">{result.orderCode}</p>

          {qrUrl ? (
            <div className="mx-auto w-fit rounded-md border border-csnb-border/30 bg-white p-2">
              <img src={qrUrl} alt="QR chuyển khoản" width={180} height={180} />
            </div>
          ) : null}

          <div className="space-y-1 rounded-md border border-csnb-border/25 bg-white p-3 font-sans text-xs text-neutral-700">
            <p>
              Ngân hàng: <strong>{result.bankInfo.bankName}</strong>
            </p>
            <p>
              Số TK: <strong>{result.bankInfo.accountNumber}</strong>
            </p>
            <p>
              Chủ TK: <strong>{result.bankInfo.accountName}</strong>
            </p>
            <p>
              Nội dung CK: <strong className="font-mono text-csnb-orange-deep">{result.paymentReference}</strong>
            </p>
            {result.totalVnd != null ? (
              <p>
                Số tiền: <strong>{formatVnd(result.totalVnd)}</strong>
              </p>
            ) : null}
          </div>

          <div className="space-y-2 rounded-md border border-csnb-border/25 bg-white p-3">
            <p className="font-sans text-xs leading-relaxed text-neutral-700">
              Sau khi chuyển khoản, bấm <strong>Tôi đã chuyển khoản</strong> rồi gửi ảnh chụp màn hình cho admin qua Zalo để được duyệt nhanh.
            </p>
            <button
              type="button"
              onClick={confirmTransfer}
              disabled={confirming || transferConfirmed}
              className="flex min-h-10 w-full items-center justify-center gap-2 rounded-md bg-csnb-ink px-3 py-2 text-sm font-bold text-white transition-colors hover:bg-black disabled:cursor-not-allowed disabled:opacity-70"
            >
              {confirming ? <Loader2 className="size-4 animate-spin" /> : transferConfirmed ? <CheckCircle2 className="size-4" /> : null}
              {transferConfirmed ? "Đã xác nhận chuyển khoản" : "Tôi đã chuyển khoản"}
            </button>
            <Link
              href={SITE_CONTACT.zaloUrl}
              target="_blank"
              className="flex min-h-10 w-full items-center justify-center rounded-md border border-csnb-orange/35 bg-csnb-orange/10 px-3 py-2 text-sm font-semibold text-csnb-orange-deep transition-colors hover:bg-csnb-orange/15"
            >
              Gửi ảnh chuyển khoản qua Zalo admin
            </Link>
            {result.orderId ? (
              <div className="border-t border-csnb-border/20 pt-3">
                <CancelPendingRegistrationButton
                  orderId={result.orderId}
                  variant="button"
                  className="[&_button]:w-full"
                  confirmMessage="Hủy đơn chuyển khoản này? Bạn có thể tạo đơn mới sau."
                />
              </div>
            ) : null}
          </div>
        </div>
      )}

      {error ? <p className="mt-3 font-sans text-xs text-red-600">{error}</p> : null}
      {notice ? <p className="mt-3 font-sans text-xs text-csnb-ink/70">{notice}</p> : null}
    </div>
  );
}
