import "server-only";
import { createHash } from "node:crypto";

/**
 * Bunny Stream — Embed view token authentication.
 * Docs: https://docs.bunny.net/stream/token-authentication
 *
 *   token = SHA256_HEX(token_security_key + video_id + expiration_unix_seconds)
 *   URL   = https://{embedHost}/embed/{libraryId}/{videoGuid}?token={token}&expires={unix}
 */

const DEFAULT_EMBED_HOST = "iframe.mediadelivery.net";
const DEFAULT_TTL_SEC = 60 * 60;

export type BunnyStreamConfig = {
  libraryId: string;
  tokenKey: string;
  embedHost: string;
  ttlSec: number;
  cdnHostname: string | null;
};

function readConfig(): BunnyStreamConfig | null {
  const libraryId = (process.env.BUNNY_STREAM_LIBRARY_ID ?? "").trim();
  const tokenKey = (process.env.BUNNY_STREAM_TOKEN_KEY ?? "").trim();
  if (!libraryId || !tokenKey) return null;

  const embedHost = (process.env.BUNNY_STREAM_EMBED_HOST ?? "").trim() || DEFAULT_EMBED_HOST;
  const ttlRaw = Number.parseInt(process.env.BUNNY_STREAM_TOKEN_TTL_SEC ?? "", 10);
  const ttlSec = Number.isFinite(ttlRaw) && ttlRaw > 0 ? ttlRaw : DEFAULT_TTL_SEC;
  const cdnHostname = (process.env.BUNNY_STREAM_CDN_HOSTNAME ?? "").trim() || null;

  return { libraryId, tokenKey, embedHost, ttlSec, cdnHostname };
}

export function getBunnyStreamConfig(): BunnyStreamConfig | null {
  return readConfig();
}

export function isBunnyStreamConfigured(): boolean {
  return readConfig() !== null;
}

/**
 * Trích GUID từ giá trị lưu trong DB (`lessons.video_url`).
 * Chấp nhận: GUID thuần hoặc URL Bunny chứa `/embed/{libraryId}/{guid}` / `/play/{libraryId}/{guid}`.
 */
export function extractBunnyVideoGuid(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;

  // GUID pattern (UUID v4-like, Bunny uses UUID-style GUIDs).
  const guidRe = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (guidRe.test(trimmed)) return trimmed.toLowerCase();

  try {
    const u = new URL(trimmed);
    const parts = u.pathname.split("/").filter(Boolean);
    const guid = parts[parts.length - 1];
    if (guid && guidRe.test(guid)) return guid.toLowerCase();
  } catch {
    // not a URL
  }

  return null;
}

function sha256Hex(input: string): string {
  return createHash("sha256").update(input, "utf8").digest("hex");
}

export type SignedBunnyEmbed = {
  url: string;
  expiresAt: number;
  videoGuid: string;
};

/**
 * Tạo URL iframe ký sẵn cho 1 video Bunny Stream.
 * Trả về `null` nếu thiếu env hoặc GUID không hợp lệ.
 *
 * @param videoGuidOrUrl GUID hoặc URL Bunny chứa GUID.
 * @param options `ttlSec` override; `now` để test cố định thời gian.
 */
export function signBunnyStreamEmbedUrl(
  videoGuidOrUrl: string | null | undefined,
  options?: { ttlSec?: number; now?: number }
): SignedBunnyEmbed | null {
  const config = readConfig();
  if (!config) return null;

  const videoGuid = extractBunnyVideoGuid(videoGuidOrUrl);
  if (!videoGuid) return null;

  const nowSec = Math.floor((options?.now ?? Date.now()) / 1000);
  const ttlSec = options?.ttlSec && options.ttlSec > 0 ? options.ttlSec : config.ttlSec;
  const expiresAt = nowSec + ttlSec;

  const token = sha256Hex(`${config.tokenKey}${videoGuid}${expiresAt}`);

  const url = `https://${config.embedHost}/embed/${encodeURIComponent(config.libraryId)}/${videoGuid}?token=${token}&expires=${expiresAt}`;

  return { url, expiresAt, videoGuid };
}
