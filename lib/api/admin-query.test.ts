import { describe, expect, it } from "vitest";
import { parsePageParams } from "./admin-query";

describe("parsePageParams", () => {
  it("defaults page to 1 and pageSize to 10", () => {
    expect(parsePageParams(new URL("https://x/y"))).toEqual({ page: 1, pageSize: 10 });
  });

  it("parses page and pageSize from query", () => {
    expect(parsePageParams(new URL("https://x/y?page=3&pageSize=15"))).toEqual({ page: 3, pageSize: 15 });
  });

  it("clamps page to at least 1", () => {
    expect(parsePageParams(new URL("https://x/y?page=0"))).toEqual({ page: 1, pageSize: 10 });
    expect(parsePageParams(new URL("https://x/y?page=-4"))).toEqual({ page: 1, pageSize: 10 });
  });

  it("clamps pageSize between 5 and 100", () => {
    expect(parsePageParams(new URL("https://x/y?pageSize=3"))).toEqual({ page: 1, pageSize: 5 });
    expect(parsePageParams(new URL("https://x/y?pageSize=500"))).toEqual({ page: 1, pageSize: 100 });
  });

  it("treats non-numeric pageSize as default 10", () => {
    expect(parsePageParams(new URL("https://x/y?pageSize=abc"))).toEqual({ page: 1, pageSize: 10 });
  });
});
