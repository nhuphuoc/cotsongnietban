/**
 * "Phòng học" — URL tách cho LMS (subdomain hoặc origin riêng).
 *
 * - NEXT_PUBLIC_LEARNING_HUB_URL: origin đầy đủ, VD https://khoahoc.cotsongnietban.com
 *   Khi có, liên kết từ site marketing sẽ trỏ sang origin này (cookie/session: cấu hình Supabase cho cùng parent domain nếu dùng subdomain).
 * - NEXT_PUBLIC_LEARNING_HUB_HOSTS: danh sách host (cách nhau bởi dấu phẩy) phục vụ proxy/middleware, VD khoahoc.localhost:3000
 *   Trên các host này, "/" được rewrite nội bộ sang /phong-hoc.
 */

function trimTrailingSlash(s: string): string {
  return s.replace(/\/+$/, "");
}

export function getLearningHubOrigin(): string | null {
  const raw = process.env.NEXT_PUBLIC_LEARNING_HUB_URL?.trim();
  if (!raw) return null;
  try {
    return trimTrailingSlash(new URL(raw).origin);
  } catch {
    return null;
  }
}

/** Host:port hoặc hostname, để khớp header Host (lowercase). */
export function parseLearningHubHosts(): string[] {
  const raw = process.env.NEXT_PUBLIC_LEARNING_HUB_HOSTS?.trim();
  if (!raw) return [];
  return raw
    .split(",")
    .map((h) => h.trim().toLowerCase())
    .filter(Boolean);
}

export function requestHostIsLearningHub(hostHeader: string | null): boolean {
  if (!hostHeader) return false;
  const host = hostHeader.trim().toLowerCase();
  const patterns = parseLearningHubHosts();
  if (!patterns.length) return false;
  return patterns.some((p) => host === p || host.endsWith(`.${p}`));
}

/** Trang chủ LMS: trên hub subdomain thường là "/" (rewrite → /phong-hoc); không hub thì /phong-hoc */
export function getLmsHomeHref(): string {
  const o = getLearningHubOrigin();
  if (o) return `${o}/`;
  return "/phong-hoc";
}

/** URL tuyệt đối cho `redirect()` / `NextResponse.redirect()` (luôn có scheme + host). */
export function getLmsHomeAbsoluteUrl(requestOrigin: string): string {
  const o = getLearningHubOrigin();
  if (o) return `${o}/`;
  const base = requestOrigin.replace(/\/+$/, "");
  return `${base}/phong-hoc`;
}

/** Đường dẫn tương đối trên hub hoặc site hiện tại: /courses/... */
export function getLmsCourseHref(courseKey: string): string {
  const o = getLearningHubOrigin();
  const path = `/courses/${encodeURIComponent(courseKey)}`;
  if (o) return `${o}${path}`;
  return path;
}

export function getLmsLessonHref(courseKey: string, lessonId: string): string {
  const o = getLearningHubOrigin();
  const path = `/courses/${encodeURIComponent(courseKey)}/lessons/${encodeURIComponent(lessonId)}`;
  if (o) return `${o}${path}`;
  return path;
}

/** Dùng sau đăng nhập / magic link: path tương đối an toàn cho callback cùng origin */
export function getDefaultPostAuthPath(): string {
  return "/phong-hoc";
}

/** Callback ?next= — cho phép URL tuyệt đối nếu trùng LEARNING_HUB origin */
export function resolveAuthCallbackNext(nextParam: string | null, requestOrigin: string): string {
  const fallback = getDefaultPostAuthPath();
  const raw = nextParam?.trim();
  if (!raw) return fallback;
  if (raw.startsWith("/") && !raw.startsWith("//")) return raw;

  try {
    const u = new URL(raw);
    const hub = getLearningHubOrigin();
    if (hub && trimTrailingSlash(u.origin) === hub) {
      return `${u.pathname}${u.search}` || "/";
    }
    const req = trimTrailingSlash(new URL(requestOrigin).origin);
    if (trimTrailingSlash(u.origin) === req) {
      return `${u.pathname}${u.search}` || fallback;
    }
  } catch {
    /* ignore */
  }
  return fallback;
}

