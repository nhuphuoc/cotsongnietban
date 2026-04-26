import { test as setup, expect } from "@playwright/test";
import fs from "fs";
import path from "path";

const authFile = path.join(process.cwd(), "playwright", ".auth", "admin.json");

setup.setTimeout(120_000);

function authTargetPathname(url: URL): boolean {
  return (
    url.pathname.startsWith("/admin") ||
    url.pathname.startsWith("/phong-hoc") ||
    url.pathname.startsWith("/verify-email")
  );
}

/**
 * Cần Supabase + admin trong DB (vd. `npm run seed:admin` hoặc `seed:admin:remote`).
 * Mặc định trùng seed script: admin@cotsongnietban.com / 123123
 *
 * Lưu ý: sau đăng nhập, client thường tới `/phong-hoc` rồi layout LMS mới redirect admin → `/admin`.
 * Nếu đặt NEXT_PUBLIC_LEARNING_HUB_URL trỏ origin khác localhost, luồng đăng nhập có thể
 * `window.location` sang domain hub và làm E2E trên 127.0.0.1 thất bại — tạm gỡ biến đó khi chạy E2E.
 */
setup("authenticate admin", async ({ page }) => {
  const email = process.env.E2E_ADMIN_EMAIL ?? "admin@cotsongnietban.com";
  const password = process.env.E2E_ADMIN_PASSWORD ?? "123123";

  await page.goto("/login", { waitUntil: "domcontentloaded" });
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Mật khẩu").fill(password);

  const submit = page
    .locator("form")
    .getByRole("button", { name: "Đăng nhập", exact: true });

  // Tránh trùng với nút "Đăng nhập bằng Google"; đồng bộ click với navigation SPA.
  try {
    await Promise.all([
      page.waitForURL(authTargetPathname, { timeout: 90_000 }),
      submit.click(),
    ]);
  } catch {
    const inlineError = await page
      .locator("form p.text-red-200")
      .first()
      .textContent()
      .catch(() => null);
    throw new Error(
      `E2E đăng nhập: không rời /login. Kiểm tra E2E_ADMIN_EMAIL / E2E_ADMIN_PASSWORD, seed admin, và .env.local (Supabase). ${
        inlineError ? `UI: ${inlineError.trim()}` : ""
      }`.trim()
    );
  }

  const u = page.url();
  if (u.includes("/verify-email")) {
    throw new Error(
      "E2E: tài khoản admin chưa xác thực email. Trong Supabase Auth bật confirm hoặc chạy seed admin (email_confirm)."
    );
  }

  // Bước 2: admin vào LMS /phong-hoc → server redirect sang /admin.
  if (/\/phong-hoc(\/|\?|$|#)/.test(u)) {
    await page.waitForURL(/\/admin(\/|$)/, { timeout: 60_000 });
  }

  await expect(page).toHaveURL(/\/admin(\/|$)/);
  fs.mkdirSync(path.dirname(authFile), { recursive: true });
  await page.context().storageState({ path: authFile });
});
