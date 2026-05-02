import { PayOS } from "@payos/node";

const PAYOS_ENV_KEYS = ["PAYOS_CLIENT_ID", "PAYOS_API_KEY", "PAYOS_CHECKSUM_KEY"] as const;

function requirePayOSEnv(): { clientId: string; apiKey: string; checksumKey: string } {
  const missing: string[] = [];
  for (const key of PAYOS_ENV_KEYS) {
    if (!process.env[key]?.trim()) missing.push(key);
  }
  if (missing.length > 0) {
    throw new Error(
      `Thiếu biến môi trường PayOS: ${missing.join(", ")}. Thêm vào .env.local và tham khảo .env.example.`
    );
  }
  return {
    clientId: process.env.PAYOS_CLIENT_ID!.trim(),
    apiKey: process.env.PAYOS_API_KEY!.trim(),
    checksumKey: process.env.PAYOS_CHECKSUM_KEY!.trim(),
  };
}

let _payos: PayOS | null = null;

export function getPayos(): PayOS {
  if (!_payos) {
    const env = requirePayOSEnv();
    _payos = new PayOS({
      clientId: env.clientId,
      apiKey: env.apiKey,
      checksumKey: env.checksumKey,
    });
  }
  return _payos;
}

export type PayOSWebhookData = Awaited<ReturnType<PayOS["webhooks"]["verify"]>>;
