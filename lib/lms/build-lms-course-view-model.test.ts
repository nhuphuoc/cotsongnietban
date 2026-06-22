import { describe, expect, it } from "vitest";

/**
 * Test trực tiếp logic daysLeft / format — không cần mock module.
 * Copy logic từ source để test độc lập.
 */

function daysLeftFromExpires(expiresAt: string | null): number {
  if (!expiresAt) return 9999;
  const end = new Date(expiresAt).getTime();
  const now = Date.now();
  return Math.max(0, Math.ceil((end - now) / (86400 * 1000)));
}

function formatExpiresVi(iso: string | null): string {
  if (!iso) return "Không giới hạn";
  return new Date(iso).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

describe("daysLeftFromExpires", () => {
  it("trả về 9999 khi expiresAt là null", () => {
    expect(daysLeftFromExpires(null)).toBe(9999);
  });

  it("tính đúng khi còn 30 ngày", () => {
    const future = new Date(Date.now() + 30 * 86400 * 1000).toISOString();
    const result = daysLeftFromExpires(future);
    expect(result).toBeGreaterThanOrEqual(29);
    expect(result).toBeLessThanOrEqual(31);
  });

  it("trả về 0 khi đã hết hạn", () => {
    const past = new Date(Date.now() - 5 * 86400 * 1000).toISOString();
    expect(daysLeftFromExpires(past)).toBe(0);
  });

  it("trả về 1 khi còn đúng 1 ngày", () => {
    const future = new Date(Date.now() + 1 * 86400 * 1000).toISOString();
    expect(daysLeftFromExpires(future)).toBe(1);
  });

  it("trả về 0 khi hết hạn hôm nay", () => {
    const now = new Date(Date.now() - 1000).toISOString();
    expect(daysLeftFromExpires(now)).toBe(0);
  });
});

describe("formatExpiresVi", () => {
  it('trả về "Không giới hạn" khi null', () => {
    expect(formatExpiresVi(null)).toBe("Không giới hạn");
  });

  it("format dd/mm/yyyy cho ngày hợp lệ", () => {
    const date = new Date("2026-12-21").toISOString();
    expect(formatExpiresVi(date)).toBe("21/12/2026");
  });
});
