import { expect, test } from "@playwright/test";

test.describe("Admin feedback CRUD", () => {
  test("create, update name, delete", async ({ page }) => {
    const stamp = Date.now();
    const name = `E2E FB ${stamp}`;
    const nameEdited = `${name} sửa`;

    await page.goto("/admin/feedback/new");
    await expect(page.getByRole("heading", { name: "Tạo feedback" })).toBeVisible();

    await page.getByPlaceholder("VD: Chị Mai Phương").fill(name);
    await page.getByRole("button", { name: "Lưu feedback" }).click();

    await expect(page).toHaveURL(/\/admin\/feedback\/[0-9a-f-]{36}/i, { timeout: 30_000 });
    await expect(page.getByRole("heading", { name: "Chi tiết feedback" })).toBeVisible();

    await page.getByLabel("Tên khách hàng *").fill(nameEdited);
    await page.getByRole("button", { name: "Lưu thay đổi" }).click();
    await expect(page.getByLabel("Tên khách hàng *")).toHaveValue(nameEdited, { timeout: 15_000 });

    await page.getByRole("button", { name: "Xóa feedback" }).click();
    await expect(page).toHaveURL(/\/admin\/feedback\/?$/, { timeout: 15_000 });
  });
});
