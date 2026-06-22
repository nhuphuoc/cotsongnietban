import { describe, expect, it } from "vitest";
import { deriveDurationPreset, durationPresetToDays } from "@/lib/admin/course-duration";

describe("deriveDurationPreset", () => {
  it('trả về "" khi input rỗng', () => {
    expect(deriveDurationPreset("")).toBe("");
    expect(deriveDurationPreset("  ")).toBe("");
  });

  it('trả về "" khi input không hợp lệ', () => {
    expect(deriveDurationPreset("abc")).toBe("");
    expect(deriveDurationPreset("-1")).toBe("");
    expect(deriveDurationPreset("0")).toBe("");
  });

  it('trả về "6" khi 180 ngày', () => {
    expect(deriveDurationPreset("180")).toBe("6");
  });

  it('trả về "9" khi 270 ngày', () => {
    expect(deriveDurationPreset("270")).toBe("9");
  });

  it('trả về "12" khi 365 ngày', () => {
    expect(deriveDurationPreset("365")).toBe("12");
  });

  it('trả về "custom" cho các giá trị khác', () => {
    expect(deriveDurationPreset("30")).toBe("custom");
    expect(deriveDurationPreset("90")).toBe("custom");
    expect(deriveDurationPreset("200")).toBe("custom");
    expect(deriveDurationPreset("400")).toBe("custom");
    expect(deriveDurationPreset("999")).toBe("custom");
  });
});

describe("durationPresetToDays", () => {
  it('trả về null khi unlimited hoặc không chọn', () => {
    expect(durationPresetToDays("unlimited", "")).toBeNull();
    expect(durationPresetToDays("", "")).toBeNull();
  });

  it("trả về 180 cho preset 6 tháng", () => {
    expect(durationPresetToDays("6", "")).toBe(180);
  });

  it("trả về 270 cho preset 9 tháng", () => {
    expect(durationPresetToDays("9", "")).toBe(270);
  });

  it("trả về 365 cho preset 12 tháng", () => {
    expect(durationPresetToDays("12", "")).toBe(365);
  });

  it("trả về giá trị custom khi chọn khác", () => {
    expect(durationPresetToDays("custom", "30")).toBe(30);
    expect(durationPresetToDays("custom", "90")).toBe(90);
    expect(durationPresetToDays("custom", "200")).toBe(200);
  });

  it("trả về null khi custom nhưng không nhập số hợp lệ", () => {
    expect(durationPresetToDays("custom", "")).toBeNull();
    expect(durationPresetToDays("custom", "abc")).toBeNull();
    expect(durationPresetToDays("custom", "-5")).toBeNull();
    expect(durationPresetToDays("custom", "0")).toBeNull();
  });

  it("trả về null cho preset không xác định", () => {
    expect(durationPresetToDays("unknown", "")).toBeNull();
  });
});
