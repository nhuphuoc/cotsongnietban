import { expect, test } from "@playwright/test";

test.describe("Admin course (create + list)", () => {
  test("create draft course and find it in list", async ({ page }) => {
    const stamp = Date.now();
    const title = `E2E Khoá ${stamp}`;
    let createdCourseId: string | null = null;

    try {
      await page.goto("/admin/course");
      await expect(page.getByRole("heading", { name: "Quản lý khoá học" })).toBeVisible({ timeout: 30_000 });

      await page.getByRole("button", { name: /Tạo khoá học/ }).first().click();
      await expect(page.getByRole("heading", { name: "Tạo khoá học mới" })).toBeVisible();

      const createRespPromise = page.waitForResponse(
        (r) =>
          r.url().includes("/api/admin/courses") &&
          r.request().method() === "POST" &&
          r.status() === 201
      );

      await page.getByPlaceholder("VD: Phục hồi lưng cơ bản").fill(title);
      await page.getByRole("button", { name: "Tạo khoá học" }).last().click();

      const createResp = await createRespPromise;
      const body = (await createResp.json()) as { data?: { id?: string } };
      createdCourseId = body.data?.id ? String(body.data.id) : null;
      expect(createdCourseId).toBeTruthy();

      await expect(page.getByRole("heading", { name: "Tạo khoá học mới" })).toBeHidden({ timeout: 45_000 });

      await page.getByPlaceholder("Tìm tên khoá học, mô tả…").fill(title);
      await expect(page.getByRole("table").getByText(title, { exact: true })).toBeVisible({ timeout: 15_000 });
    } finally {
      if (createdCourseId) {
        const del = await page.request.delete(`/api/admin/courses/${encodeURIComponent(createdCourseId)}`);
        if (!del.ok()) {
          const detail = await del.text().catch(() => "");
          throw new Error(`E2E cleanup: xóa khóa học thất bại HTTP ${del.status()}: ${detail}`);
        }
      }
    }
  });
});
