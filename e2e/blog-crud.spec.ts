import { expect, test } from "@playwright/test";

test.describe("Admin blog CRUD", () => {
  test("create, update title, delete", async ({ page }) => {
    const stamp = Date.now();
    const title = `E2E Blog ${stamp}`;
    const excerpt = `Tóm tắt e2e đủ dài cho validation. ${stamp}`;
    const titleEdited = `${title} (đã sửa)`;

    await page.goto("/admin/blog/new");
    await expect(page.getByRole("heading", { name: "Tạo bài viết" })).toBeVisible();

    await page.getByPlaceholder("Nhập tiêu đề bài viết...").fill(title);
    await page.getByPlaceholder("1–2 câu mô tả ngắn...").fill(excerpt);
    await page.getByRole("button", { name: "Lưu bài" }).click();

    await expect(page).toHaveURL(/\/admin\/blog\/[0-9a-f-]{36}/i, { timeout: 30_000 });
    await expect(page.getByRole("heading", { level: 1 })).toContainText(title);

    const titleInput = page.locator("label:has-text('Tiêu đề *') + input").first();
    await titleInput.fill(titleEdited);
    await page.getByRole("button", { name: "Lưu thay đổi" }).click();
    await expect(page.getByRole("heading", { level: 1 })).toContainText(titleEdited, { timeout: 15_000 });

    await page.getByRole("button", { name: "Xóa bài viết" }).click();
    await expect(page).toHaveURL(/\/admin\/blog\/?$/, { timeout: 15_000 });
  });
});
