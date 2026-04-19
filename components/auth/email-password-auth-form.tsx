"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

type Mode = "signin" | "signup";

interface EmailCheckResult {
  available: boolean;
  checking: boolean;
  error: string | null;
}

type EmailPasswordAuthFormProps = {
  initialMode?: Mode;
};

export function EmailPasswordAuthForm({ initialMode = "signin" }: EmailPasswordAuthFormProps) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [emailCheck, setEmailCheck] = useState<EmailCheckResult>({
    available: true,
    checking: false,
    error: null,
  });
  const checkTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setNotice(null);
    const trimmed = email.trim();
    if (!trimmed || !password) {
      setMessage("Nhập email và mật khẩu.");
      return;
    }

    // Check email availability for signup
    if (mode === "signup" && !emailCheck.available) {
      setMessage("Email này đã được sử dụng. Vui lòng dùng email khác.");
      return;
    }

    if (mode === "signup" && emailCheck.checking) {
      setMessage("Vui lòng đợi kiểm tra email hoàn tất.");
      return;
    }

    setPending(true);
    try {
      const supabase = createClient();
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({
          email: trimmed,
          password,
        });
        if (error) {
          if (/Email not confirmed/i.test(error.message)) {
            setMessage("Email chưa xác thực. Vui lòng kiểm tra hộp thư và bấm link xác thực.");
          } else {
            setMessage(error.message);
          }
          return;
        }

        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user?.email_confirmed_at) {
          router.push("/verify-email");
          return;
        }
      } else {
        const { error } = await supabase.auth.signUp({
          email: trimmed,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent("/dashboard")}`,
          },
        });
        if (error) {
          setMessage(error.message);
          return;
        }

        router.push(`/check-email?email=${encodeURIComponent(trimmed)}`);
        return;
      }

      router.refresh();
      router.push("/dashboard");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Không thể đăng nhập.");
    } finally {
      setPending(false);
    }
  }

  // Check email availability when user is signing up
  async function checkEmailAvailability(emailValue: string) {
    const trimmed = emailValue.trim();

    // Clear previous timeout
    if (checkTimeoutRef.current) {
      clearTimeout(checkTimeoutRef.current);
    }

    // Don't check if email is empty or invalid format
    if (!trimmed || !trimmed.includes("@")) {
      setEmailCheck({ available: true, checking: false, error: null });
      return;
    }

    // Only check in signup mode
    if (mode !== "signup") {
      setEmailCheck({ available: true, checking: false, error: null });
      return;
    }

    setEmailCheck((prev) => ({ ...prev, checking: true }));

    // Debounce check by 500ms
    checkTimeoutRef.current = setTimeout(async () => {
      try {
        const response = await fetch("/api/auth/check-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: trimmed }),
        });

        if (!response.ok) {
          const data = await response.json();
          setEmailCheck({
            available: true,
            checking: false,
            error: data.error || "Không thể kiểm tra email",
          });
          return;
        }

        const data = await response.json();
        setEmailCheck({
          available: data.available,
          checking: false,
          error: null,
        });
      } catch (err) {
        console.error("Email check error:", err);
        setEmailCheck({
          available: true,
          checking: false,
          error: "Không thể kết nối",
        });
      }
    }, 500);
  }

  const handleEmailChange = (value: string) => {
    setEmail(value);
    checkEmailAvailability(value);
  };

  return (
    <div className="w-full">
      <div className="mb-4 flex rounded-md border border-csnb-border bg-csnb-bg/50 p-0.5">
        <button
          type="button"
          onClick={() => {
            setMode("signin");
            setMessage(null);
            setEmailCheck({ available: true, checking: false, error: null });
          }}
          className={`flex-1 rounded px-3 py-2 font-sans text-xs font-semibold transition-colors ${
            mode === "signin" ? "bg-csnb-orange text-white" : "text-csnb-muted hover:text-white"
          }`}
        >
          Đăng nhập
        </button>
        <button
          type="button"
          onClick={() => {
            setMode("signup");
            setMessage(null);
            setEmailCheck({ available: true, checking: false, error: null });
          }}
          className={`flex-1 rounded px-3 py-2 font-sans text-xs font-semibold transition-colors ${
            mode === "signup" ? "bg-csnb-orange text-white" : "text-csnb-muted hover:text-white"
          }`}
        >
          Đăng ký
        </button>
      </div>

      <form onSubmit={(e) => void onSubmit(e)} className="space-y-4">
        <div>
          <label htmlFor="auth-email" className="mb-1.5 block font-sans text-xs font-semibold text-csnb-muted">
            Email
          </label>
          <input
            id="auth-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => handleEmailChange(e.target.value)}
            className="w-full rounded-md border border-csnb-border bg-white px-3 py-2.5 font-sans text-sm text-csnb-ink outline-none ring-csnb-orange/40 focus:ring-2"
            placeholder="ban@example.com"
            disabled={pending}
          />
          {mode === "signup" && email.trim() && (
            <div className="mt-2">
              {emailCheck.checking && (
                <p className="font-sans text-[11px] text-csnb-muted">
                  ⏳ Đang kiểm tra...
                </p>
              )}
              {!emailCheck.checking && !emailCheck.error && (
                <p className={`font-sans text-[11px] ${
                  emailCheck.available ? "text-emerald-400" : "text-red-400"
                }`}>
                  {emailCheck.available ? "✓ Email có sẵn" : "✕ Email đã được dùng"}
                </p>
              )}
              {emailCheck.error && (
                <p className="font-sans text-[11px] text-amber-400">
                  ⚠ {emailCheck.error}
                </p>
              )}
            </div>
          )}
          <p className="mt-1 font-sans text-[11px] text-csnb-muted/90">
            Tài khoản là email (Supabase Auth). Đăng nhập Google có thể bật lại sau.
          </p>
        </div>
        <div>
          <label htmlFor="auth-password" className="mb-1.5 block font-sans text-xs font-semibold text-csnb-muted">
            Mật khẩu
          </label>
          <input
            id="auth-password"
            type="password"
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-md border border-csnb-border bg-white px-3 py-2.5 font-sans text-sm text-csnb-ink outline-none ring-csnb-orange/40 focus:ring-2"
            placeholder="********"
            disabled={pending}
            minLength={6}
          />
        </div>

        {message ? (
          <p className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 font-sans text-xs text-red-200">{message}</p>
        ) : null}
        {notice ? (
          <p className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 font-sans text-xs text-emerald-100">{notice}</p>
        ) : null}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-md bg-csnb-orange px-4 py-3 font-sans text-sm font-semibold text-white transition-colors hover:bg-csnb-orange-deep disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Đang xử lý…" : mode === "signin" ? "Đăng nhập" : "Tạo tài khoản"}
        </button>
      </form>
    </div>
  );
}
