import { describe, expect, it, beforeEach, vi } from "vitest";
import { createHash } from "node:crypto";

// Next.js `server-only` package không được resolve trong môi trường Vitest/Node.
// Stub nó để test module có import "server-only".
vi.mock("server-only", () => ({}));

const BUNNY_ENV_KEYS = [
  "BUNNY_STREAM_LIBRARY_ID",
  "BUNNY_STREAM_TOKEN_KEY",
  "BUNNY_STREAM_EMBED_HOST",
  "BUNNY_STREAM_TOKEN_TTL_SEC",
  "BUNNY_STREAM_CDN_HOSTNAME",
] as const;

function clearBunnyEnv() {
  for (const k of BUNNY_ENV_KEYS) delete process.env[k];
}

async function importFresh() {
  vi.resetModules();
  return import("./stream-signing");
}

describe("lib/bunny/stream-signing", () => {
  beforeEach(() => {
    clearBunnyEnv();
  });

  describe("isBunnyStreamConfigured", () => {
    it("false khi thiếu library id hoặc token key", async () => {
      const mod = await importFresh();
      expect(mod.isBunnyStreamConfigured()).toBe(false);

      process.env.BUNNY_STREAM_LIBRARY_ID = "123456";
      const mod2 = await importFresh();
      expect(mod2.isBunnyStreamConfigured()).toBe(false);

      process.env.BUNNY_STREAM_TOKEN_KEY = "k";
      const mod3 = await importFresh();
      expect(mod3.isBunnyStreamConfigured()).toBe(true);
    });
  });

  describe("extractBunnyVideoGuid", () => {
    it("chấp nhận GUID thuần", async () => {
      const mod = await importFresh();
      expect(mod.extractBunnyVideoGuid("32d140e2-e4f4-4eec-9d53-20371e9be607")).toBe(
        "32d140e2-e4f4-4eec-9d53-20371e9be607"
      );
    });

    it("lower-case GUID", async () => {
      const mod = await importFresh();
      expect(mod.extractBunnyVideoGuid("32D140E2-E4F4-4EEC-9D53-20371E9BE607")).toBe(
        "32d140e2-e4f4-4eec-9d53-20371e9be607"
      );
    });

    it("trích GUID từ URL Bunny", async () => {
      const mod = await importFresh();
      expect(
        mod.extractBunnyVideoGuid(
          "https://iframe.mediadelivery.net/embed/759/eb1c4f77-0cda-46be-b47d-1118ad7c2ffe"
        )
      ).toBe("eb1c4f77-0cda-46be-b47d-1118ad7c2ffe");
    });

    it("null khi không phải GUID hợp lệ", async () => {
      const mod = await importFresh();
      expect(mod.extractBunnyVideoGuid(null)).toBeNull();
      expect(mod.extractBunnyVideoGuid("")).toBeNull();
      expect(mod.extractBunnyVideoGuid("not-a-guid")).toBeNull();
      expect(mod.extractBunnyVideoGuid("https://example.com/foo/bar")).toBeNull();
    });
  });

  describe("signBunnyStreamEmbedUrl", () => {
    it("null khi thiếu env", async () => {
      const mod = await importFresh();
      expect(
        mod.signBunnyStreamEmbedUrl("32d140e2-e4f4-4eec-9d53-20371e9be607")
      ).toBeNull();
    });

    it("null khi GUID không hợp lệ", async () => {
      process.env.BUNNY_STREAM_LIBRARY_ID = "123";
      process.env.BUNNY_STREAM_TOKEN_KEY = "k";
      const mod = await importFresh();
      expect(mod.signBunnyStreamEmbedUrl("nope")).toBeNull();
    });

    it("tạo URL đúng thuật toán SHA256_HEX(key + guid + expires) của Bunny", async () => {
      // Tham số lấy từ docs: https://docs.bunny.net/stream/token-authentication
      process.env.BUNNY_STREAM_LIBRARY_ID = "759";
      process.env.BUNNY_STREAM_TOKEN_KEY = "4742a81b-bf15-42fe-8b1c-8fcb9024c550";
      process.env.BUNNY_STREAM_TOKEN_TTL_SEC = "100";

      const mod = await importFresh();
      const fixedNow = 1623440102 * 1000; // 100 giây trước expires
      const guid = "32d140e2-e4f4-4eec-9d53-20371e9be607";

      const signed = mod.signBunnyStreamEmbedUrl(guid, { now: fixedNow });
      expect(signed).not.toBeNull();
      if (!signed) return;

      expect(signed.expiresAt).toBe(1623440202);
      expect(signed.videoGuid).toBe(guid);

      const expectedToken = createHash("sha256")
        .update(`4742a81b-bf15-42fe-8b1c-8fcb9024c550${guid}1623440202`, "utf8")
        .digest("hex");

      expect(signed.url).toBe(
        `https://iframe.mediadelivery.net/embed/759/${guid}?token=${expectedToken}&expires=1623440202`
      );
    });

    it("override embed host và TTL per-call", async () => {
      process.env.BUNNY_STREAM_LIBRARY_ID = "123456";
      process.env.BUNNY_STREAM_TOKEN_KEY = "secret";
      process.env.BUNNY_STREAM_EMBED_HOST = "cdn.custom.example";

      const mod = await importFresh();
      const fixedNow = 1_700_000_000 * 1000;
      const guid = "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee";

      const signed = mod.signBunnyStreamEmbedUrl(guid, { now: fixedNow, ttlSec: 7200 });
      expect(signed?.expiresAt).toBe(1_700_000_000 + 7200);
      expect(signed?.url.startsWith("https://cdn.custom.example/embed/123456/")).toBe(true);
    });

    it("chấp nhận cả URL Bunny làm input", async () => {
      process.env.BUNNY_STREAM_LIBRARY_ID = "1";
      process.env.BUNNY_STREAM_TOKEN_KEY = "k";

      const mod = await importFresh();
      const signed = mod.signBunnyStreamEmbedUrl(
        "https://iframe.mediadelivery.net/embed/999/eb1c4f77-0cda-46be-b47d-1118ad7c2ffe",
        { now: 0 }
      );
      expect(signed?.videoGuid).toBe("eb1c4f77-0cda-46be-b47d-1118ad7c2ffe");
      expect(signed?.url).toContain("/embed/1/eb1c4f77-0cda-46be-b47d-1118ad7c2ffe");
    });
  });
});
