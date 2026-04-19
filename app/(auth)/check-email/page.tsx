import { Suspense } from "react";
import { CheckEmailClient } from "./check-email-client";

export default function CheckEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="relative flex min-h-screen items-center justify-center bg-csnb-bg px-4 font-sans text-sm text-csnb-muted">
          Đang tải…
        </div>
      }
    >
      <CheckEmailClient />
    </Suspense>
  );
}
