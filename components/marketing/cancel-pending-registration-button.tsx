"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

async function readErrorMessage(res: Response) {
  try {
    const json = (await res.json()) as { error?: { message?: string } };
    return json.error?.message ?? `Lỗi ${res.status}`;
  } catch {
    return `Lỗi ${res.status}`;
  }
}

type Props = {
  orderId: string;
  /** link: text như liên kết; button: nút viền nhạt */
  variant?: "link" | "button";
  className?: string;
  children?: React.ReactNode;
  confirmMessage?: string;
};

export function CancelPendingRegistrationButton({
  orderId,
  variant = "link",
  className = "",
  children = "Hủy & đăng ký lại",
  confirmMessage = "Đơn sẽ được hủy và bạn có thể đăng ký lại bất cứ lúc nào. Bạn chắc chắn chứ?",
}: Props) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConfirm() {
    setError(null);
    const res = await fetch(`/api/me/orders/${encodeURIComponent(orderId)}/cancel`, {
      method: "POST",
    });
    if (!res.ok) {
      setError(await readErrorMessage(res));
      return;
    }
    setDialogOpen(false);
    router.refresh();
  }

  const triggerDisabled = !orderId;

  return (
    <>
      {variant === "button" ? (
        <div className={className}>
          <button
            type="button"
            onClick={() => setDialogOpen(true)}
            disabled={triggerDisabled}
            className="inline-flex min-h-9 w-full items-center justify-center rounded-lg border border-neutral-300 bg-white px-3 py-2 font-sans text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            {children}
          </button>
        </div>
      ) : (
        <span className={`inline-flex flex-col gap-0.5 ${className}`}>
          <button
            type="button"
            onClick={() => setDialogOpen(true)}
            disabled={triggerDisabled}
            className="font-sans text-left text-sm font-medium text-neutral-500 underline decoration-neutral-300 underline-offset-2 transition-colors hover:text-csnb-ink hover:decoration-csnb-ink disabled:cursor-not-allowed disabled:opacity-60"
          >
            {children}
          </button>
        </span>
      )}

      <ConfirmDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setError(null);
        }}
        title="Hủy đơn đăng ký?"
        description={confirmMessage}
        confirmLabel="Hủy đơn"
        cancelLabel="Giữ đơn"
        tone="danger"
        error={error}
        onConfirm={handleConfirm}
      />
    </>
  );
}
