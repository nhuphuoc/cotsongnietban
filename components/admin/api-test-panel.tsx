"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/utils/supabase/client";

type Result = {
  label: string;
  ok: boolean;
  status: number;
  body: any;
};

async function fetchJson(input: RequestInfo | URL, init?: RequestInit) {
  const res = await fetch(input, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  let json: any = null;
  try {
    json = await res.json();
  } catch {
    json = null;
  }
  return { status: res.status, ok: res.ok, body: json };
}

export function ApiTestPanel() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [results, setResults] = useState<Result[]>([]);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    void (async () => {
      const supabase = createClient();
      const { data } = await supabase.auth.getUser();
      setUserEmail(data.user?.email ?? null);
    })();
  }, []);

  const canRun = useMemo(() => !pending, [pending]);

  const run = async () => {
    if (!canRun) return;
    setPending(true);
    try {
      const out: Result[] = [];

      const r1 = await fetchJson("/api/admin/blog");
      out.push({ label: "GET /api/admin/blog", ...r1 });

      const r2 = await fetchJson("/api/admin/feedback");
      out.push({ label: "GET /api/admin/feedback", ...r2 });

      const r3 = await fetchJson("/api/admin/orders");
      out.push({ label: "GET /api/admin/orders", ...r3 });

      // Minimal create blog to expose DB errors clearly (will create a draft post).
      const r4 = await fetchJson("/api/admin/blog", {
        method: "POST",
        body: JSON.stringify({
          title: `API Test Post ${new Date().toISOString()}`,
          excerpt: "Test excerpt for API diagnostics (local).",
          contentHtml: "<p>API test content.</p>",
          status: "draft",
          categorySlug: "lieu-phap",
        }),
      });
      out.push({ label: "POST /api/admin/blog (draft)", ...r4 });

      setResults(out);
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="rounded-sm border border-gray-200 bg-white p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide">API test</div>
          <div className="mt-1 text-sm text-gray-700">
            Đang đăng nhập: <span className="font-mono">{userEmail ?? "—"}</span>
          </div>
          <div className="mt-1 text-xs text-gray-400">
            Panel này dùng để debug nhanh lỗi API (401/403/500 + chi tiết Supabase).
          </div>
        </div>
        <button
          type="button"
          onClick={() => void run()}
          disabled={pending}
          className="inline-flex items-center justify-center rounded-sm bg-gray-900 px-3 py-2 text-xs font-semibold text-white hover:bg-black disabled:opacity-60"
        >
          {pending ? "Đang test..." : "Chạy test API"}
        </button>
      </div>

      {results.length ? (
        <div className="mt-4 space-y-3">
          {results.map((r) => (
            <div key={r.label} className="rounded border border-gray-200 p-3">
              <div className="flex items-center justify-between gap-3">
                <div className="text-xs font-semibold text-gray-900">{r.label}</div>
                <div
                  className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                    r.ok ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                  }`}
                >
                  {r.status}
                </div>
              </div>
              <pre className="mt-2 max-h-52 overflow-auto rounded bg-gray-50 p-2 text-[11px] text-gray-700">
                {JSON.stringify(r.body, null, 2)}
              </pre>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

