"use client";

import { useMemo, useState } from "react";

function escapeHtml(input: string) {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function textToHtml(input: string) {
  return input
    .trim()
    .split(/\n\s*\n/)
    .map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/g, "<br />")}</p>`)
    .join("");
}

export function PublicFeedbackForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [rating, setRating] = useState<1 | 2 | 3 | 4 | 5>(5);
  const [isPublic, setIsPublic] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const canSubmit = useMemo(() => name.trim().length >= 2 && message.trim().length >= 12, [name, message]);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit || submitting) return;
    setError(null);
    setSuccess(null);

    const trimmedEmail = email.trim();
    if (trimmedEmail && !trimmedEmail.includes("@")) {
      setError("Email chưa đúng định dạng.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          email: trimmedEmail || null,
          rating,
          messageHtml: textToHtml(message),
          isPublic,
          source: "website",
        }),
      });

      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(payload?.error?.message ?? "Không thể gửi feedback lúc này.");
      }

      setName("");
      setEmail("");
      setMessage("");
      setRating(5);
      setIsPublic(true);
      setSuccess("Feedback đã được gửi. Đội ngũ sẽ kiểm tra trước khi hiển thị công khai.");
    } catch (e: any) {
      setError(e?.message ?? "Không thể gửi feedback lúc này.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="rounded-[28px] border border-csnb-border/70 bg-csnb-surface/80 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.22)] backdrop-blur sm:p-8">
      <div className="grid gap-5">
        <div>
          <label htmlFor="feedback-name" className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-csnb-orange-bright">
            Họ tên
          </label>
          <input
            id="feedback-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Ví dụ: Nguyễn Minh Anh"
            className="min-h-12 w-full rounded-2xl border border-csnb-border bg-csnb-bg/70 px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-csnb-muted/70 focus:border-csnb-orange-bright"
          />
        </div>

        <div>
          <label htmlFor="feedback-email" className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-csnb-orange-bright">
            Email liên hệ (tùy chọn)
          </label>
          <input
            id="feedback-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="tenban@email.com"
            className="min-h-12 w-full rounded-2xl border border-csnb-border bg-csnb-bg/70 px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-csnb-muted/70 focus:border-csnb-orange-bright"
          />
        </div>

        <div>
          <div className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-csnb-orange-bright">Đánh giá</div>
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4, 5].map((value) => {
              const active = rating === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRating(value as 1 | 2 | 3 | 4 | 5)}
                  className={`inline-flex min-h-11 items-center rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                    active
                      ? "border-csnb-orange-bright bg-csnb-orange text-white"
                      : "border-csnb-border bg-csnb-bg/60 text-csnb-muted hover:border-csnb-orange"
                  }`}
                >
                  {value} sao
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label htmlFor="feedback-message" className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-csnb-orange-bright">
            Nội dung phản hồi
          </label>
          <textarea
            id="feedback-message"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Bạn đã cải thiện điều gì sau khi theo dõi chương trình hoặc nhận tư vấn?"
            rows={7}
            className="w-full rounded-[24px] border border-csnb-border bg-csnb-bg/70 px-4 py-3 text-sm leading-relaxed text-white outline-none transition-colors placeholder:text-csnb-muted/70 focus:border-csnb-orange-bright"
          />
        </div>

        <label className="flex items-start gap-3 rounded-2xl border border-csnb-border/80 bg-csnb-bg/50 px-4 py-3 text-sm text-csnb-muted">
          <input
            type="checkbox"
            checked={isPublic}
            onChange={(event) => setIsPublic(event.target.checked)}
            className="mt-0.5 size-4 rounded border-csnb-border bg-csnb-bg accent-csnb-orange"
          />
          <span>Cho phép hiển thị feedback này ở khu vực công khai sau khi được đội ngũ duyệt.</span>
        </label>

        {error ? <div className="rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">{error}</div> : null}
        {success ? <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">{success}</div> : null}

        <button
          type="submit"
          disabled={!canSubmit || submitting}
          className="inline-flex min-h-12 items-center justify-center rounded-full bg-csnb-orange px-6 py-3 font-heading text-sm font-bold uppercase tracking-[0.16em] text-white transition-colors hover:bg-csnb-orange-deep disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? "Đang gửi..." : "Gửi feedback"}
        </button>
      </div>
    </form>
  );
}
