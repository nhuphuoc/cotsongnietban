"use client";

export type ApiOk<T> = { data: T };
export type ApiFail = { error: { message: string; details: unknown | null } };

export class ApiError extends Error {
  status: number;
  details: unknown | null;

  constructor(message: string, status: number, details: unknown | null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

async function readJsonSafe(res: Response) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

export async function apiFetch<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const method = (init?.method ?? "GET").toUpperCase();
  const requestInit: RequestInit = {
    ...init,
    /** Luôn gửi cookie session (tránh trường hợp mặc định không rõ ràng). */
    credentials: "same-origin",
    /** Tránh browser/CDN giữ bản GET 401 cũ sau khi đã đăng nhập (hay gặp trên prod). */
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  };

  let res = await fetch(input, requestInit);

  // Một số request đầu tiên sau điều hướng có thể dính race refresh cookie ở edge/proxy.
  // Retry 1 lần cho request idempotent để giảm 401 giả trên trang admin dạng list.
  if (res.status === 401 && (method === "GET" || method === "HEAD")) {
    await new Promise((resolve) => setTimeout(resolve, 120));
    res = await fetch(input, requestInit);
  }

  const json = (await readJsonSafe(res)) as ApiOk<T> | ApiFail | null;

  if (!res.ok) {
    const msg = (json as ApiFail | null)?.error?.message ?? `Request failed (${res.status})`;
    const details = (json as ApiFail | null)?.error?.details ?? null;
    throw new ApiError(msg, res.status, details);
  }

  if (!json || !("data" in json)) {
    throw new ApiError("Invalid API response shape.", 500, json);
  }

  return (json as ApiOk<T>).data;
}

export function slugifyClient(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/đ/g, "d")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

