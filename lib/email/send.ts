import { Resend } from "resend";
import { createAdminClient } from "@/utils/supabase/admin";

const resend = (() => {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) return null;
  return new Resend(key);
})();

export interface SendEmailParams {
  to: string;
  subject: string;
  template: string; // 'order_confirmation' | 'payment_success' | 'course_activated' | 'welcome'
  react: React.ReactElement;
  metadata?: Record<string, unknown>;
}

export async function sendEmail(params: SendEmailParams): Promise<{ ok: boolean; id?: string; error?: string }> {
  if (!resend) {
    console.warn("[email] RESEND_API_KEY chưa được cấu hình. Bỏ qua gửi email.");
    return { ok: false, error: "RESEND_API_KEY not configured" };
  }

  const from = process.env.RESEND_FROM_EMAIL?.trim() || "noreply@cotsongnietban.vn";

  try {
    const { data, error } = await resend.emails.send({
      from,
      to: params.to,
      subject: params.subject,
      react: params.react,
    });

    // Ghi log vào DB (fire-and-forget, không block response)
    logEmailToDb({
      recipient: params.to,
      subject: params.subject,
      template: params.template,
      resendId: data?.id ?? null,
      status: error ? "failed" : "sent",
      errorMessage: error?.message ?? null,
      metadata: params.metadata ?? {},
    }).catch((err) => console.error("[email] Failed to log email:", err));

    if (error) {
      console.error("[email] Resend error:", error);
      return { ok: false, error: error.message };
    }

    return { ok: true, id: data?.id };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("[email] Unexpected error:", msg);

    logEmailToDb({
      recipient: params.to,
      subject: params.subject,
      template: params.template,
      status: "failed",
      errorMessage: msg,
      metadata: params.metadata ?? {},
    }).catch(() => {});

    return { ok: false, error: msg };
  }
}

/**
 * Gửi email không chặn response chính.
 * Dùng trong Server Action / API route — gọi await sendEmailAsync(...) rồi bỏ qua kết quả.
 */
export function sendEmailAsync(params: SendEmailParams): void {
  sendEmail(params).catch((err) => console.error("[email] Async send failed:", err));
}

// ─── Internal: log to email_logs table ───

interface EmailLogEntry {
  recipient: string;
  subject: string;
  template: string;
  resendId?: string | null;
  status: "sent" | "failed";
  errorMessage?: string | null;
  metadata: Record<string, unknown>;
}

async function logEmailToDb(entry: EmailLogEntry): Promise<void> {
  try {
    const client = createAdminClient();
    const { error } = await client.from("email_logs").insert({
      recipient: entry.recipient,
      subject: entry.subject,
      template: entry.template,
      resend_id: entry.resendId ?? null,
      status: entry.status,
      error_message: entry.errorMessage ?? null,
      metadata: entry.metadata,
    });
    if (error) {
      console.error("[email] DB log error:", error);
    }
  } catch (err) {
    console.error("[email] DB log exception:", err);
  }
}
