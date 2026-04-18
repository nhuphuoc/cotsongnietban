import { describe, expect, it } from "vitest";
import { compactPatch, slugify } from "./repositories";

describe("lib/api/repositories", () => {
  describe("slugify", () => {
    it("removes accents and normalizes spaces", () => {
      expect(slugify("  Thoát vị đĩa đệm  ")).toBe("thoat-vi-dia-dem");
    });

    it("collapses non-alphanumerics into dashes", () => {
      expect(slugify("Hello, world!!! 2026")).toBe("hello-world-2026");
    });
  });

  describe("compactPatch", () => {
    it("removes only undefined keys", () => {
      const out = compactPatch({
        a: 1,
        b: undefined,
        c: null,
        d: false,
        e: "",
      });
      expect(out).toEqual({ a: 1, c: null, d: false, e: "" });
    });
  });
});

