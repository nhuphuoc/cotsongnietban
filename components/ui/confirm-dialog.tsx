"use client";

import * as React from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type ConfirmDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  /** danger: nút xác nhận destructive (hủy, xóa). default: primary */
  tone?: "default" | "danger";
  onConfirm: () => void | Promise<void>;
  /** Khóa nút khi cha đang xử lý (vd. API admin) */
  loading?: boolean;
  /** Lỗi hiển thị trong dialog (vd. fetch thất bại) */
  error?: string | null;
  className?: string;
};

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Xác nhận",
  cancelLabel = "Hủy",
  tone = "default",
  onConfirm,
  loading = false,
  error = null,
  className,
}: ConfirmDialogProps) {
  const [pending, setPending] = React.useState(false);
  const busy = loading || pending;

  async function handleConfirm() {
    setPending(true);
    try {
      await Promise.resolve(onConfirm());
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "max-w-[calc(100%-2rem)] gap-0 overflow-hidden p-0 sm:max-w-md",
          className
        )}
        showCloseButton={false}
      >
        <DialogHeader className="space-y-0 px-6 pb-5 pt-7 text-left sm:px-8 sm:pb-6 sm:pt-8">
          <div className="flex gap-4 sm:gap-5">
            {tone === "danger" ? (
              <div
                className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600 dark:bg-red-950/50 dark:text-red-400 sm:size-12"
                aria-hidden
              >
                <AlertTriangle className="size-5 sm:size-[1.35rem]" strokeWidth={2} />
              </div>
            ) : null}
            <div className="min-w-0 flex-1 space-y-2.5 pt-0.5 sm:space-y-3">
              <DialogTitle className="font-heading text-base font-semibold leading-snug text-foreground sm:text-[1.0625rem]">
                {title}
              </DialogTitle>
              <DialogDescription className="text-sm leading-relaxed text-muted-foreground sm:text-[0.9375rem]">
                {description}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {error ? (
          <p
            className="px-6 pb-4 pt-1 font-sans text-sm leading-relaxed text-red-600 sm:px-8 dark:text-red-400"
            role="alert"
          >
            {error}
          </p>
        ) : null}

        <DialogFooter className="mt-0 flex-col-reverse gap-3 border-t bg-muted/40 px-6 py-5 sm:flex-row sm:justify-end sm:gap-3 sm:px-8 sm:py-6">
          <Button
            type="button"
            variant="outline"
            size="default"
            className="w-full sm:w-auto"
            disabled={busy}
            onClick={() => onOpenChange(false)}
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={tone === "danger" ? "destructive" : "default"}
            size="default"
            className="w-full gap-2 sm:w-auto"
            disabled={busy}
            onClick={() => void handleConfirm()}
          >
            {busy ? <Loader2 className="size-4 shrink-0 animate-spin" aria-hidden /> : null}
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
