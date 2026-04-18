"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

type Mode = "signin" | "signup";

export function EmailPasswordAuthForm() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setNotice(null);
    const trimmed = email.trim();
    if (!trimmed || !password) {
      setMessage("Nhập email và mật khẩu.");
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

        setNotice("Đăng ký thành công. Vui lòng kiểm tra email để xác thực tài khoản trước khi đăng nhập.");
        setMode("signin");
        setPassword("");
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

  return (
    <div className="w-full">
      <div className="mb-4 flex rounded-md border border-csnb-border bg-csnb-bg/50 p-0.5">
        <button
          type="button"
          onClick={() => {
            setMode("signin");
            setMessage(null);
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
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-md border border-csnb-border bg-white px-3 py-2.5 font-sans text-sm text-csnb-ink outline-none ring-csnb-orange/40 focus:ring-2"
            placeholder="ban@example.com"
            disabled={pending}
          />
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
