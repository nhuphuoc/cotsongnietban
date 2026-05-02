import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/utils/supabase/admin", () => ({
  createAdminClient: vi.fn(),
}));

vi.mock("@/lib/payos", () => ({
  getPayos: vi.fn(),
}));

vi.mock("@/lib/api/enrollments", () => ({
  activateEnrollmentForOrder: vi.fn(),
}));

import { createAdminClient } from "@/utils/supabase/admin";
import { getPayos } from "@/lib/payos";
import { activateEnrollmentForOrder } from "@/lib/api/enrollments";
import { POST as webhookHandler } from "./route";

function buildReq(body: unknown) {
  return new Request("http://localhost:3000/api/webhook/payos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

type MockClient = {
  from: ReturnType<typeof vi.fn>;
};

function createClientMock() {
  const selectEq = vi.fn();
  const select = vi.fn().mockReturnValue({ eq: selectEq });
  const updateEq = vi.fn();
  const update = vi.fn().mockReturnValue({ eq: updateEq });

  const from = vi.fn((table: string) => {
    if (table === "orders") {
      return { select, update };
    }
    throw new Error(`Unexpected table: ${table}`);
  });

  return { client: { from } as unknown as MockClient, refs: { selectEq, updateEq } };
}

describe("POST /api/webhook/payos", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 400 when signature is invalid", async () => {
    const mockPayos = {
      webhooks: {
        verify: vi.fn().mockRejectedValue(new Error("Invalid signature")),
      },
    };
    vi.mocked(getPayos).mockReturnValue(mockPayos as never);

    const res = await webhookHandler(buildReq({ invalid: true }));
    expect(res.status).toBe(400);
  });

  it("returns 200 when order not found (silent drop)", async () => {
    const mockPayos = {
      webhooks: {
        verify: vi.fn().mockResolvedValue({ orderCode: 999999999 }),
      },
    };
    vi.mocked(getPayos).mockReturnValue(mockPayos as never);

    const { client, refs } = createClientMock();
    vi.mocked(createAdminClient).mockReturnValue(client as never);
    refs.selectEq.mockResolvedValue({ data: [], error: null });

    const res = await webhookHandler(buildReq({ code: "00", success: true, data: { orderCode: 999999999 }, signature: "sig" }));
    expect(res.status).toBe(200);
    expect(activateEnrollmentForOrder).not.toHaveBeenCalled();
  });

  it("returns 200 when order is cancelled — không ghi paid (webhook muộn)", async () => {
    const mockPayos = {
      webhooks: {
        verify: vi.fn().mockResolvedValue({ orderCode: 123456789 }),
      },
    };
    vi.mocked(getPayos).mockReturnValue(mockPayos as never);

    const { client, refs } = createClientMock();
    vi.mocked(createAdminClient).mockReturnValue(client as never);
    refs.selectEq.mockResolvedValue({
      data: [{ id: "order-1", status: "cancelled", payos_order_code: 123456789 }],
      error: null,
    });

    const res = await webhookHandler(buildReq({ code: "00", success: true, data: { orderCode: 123456789 }, signature: "sig" }));
    expect(res.status).toBe(200);
    expect(refs.updateEq).not.toHaveBeenCalled();
    expect(activateEnrollmentForOrder).not.toHaveBeenCalled();
  });

  it("returns 200 when order already paid (idempotent)", async () => {
    const mockPayos = {
      webhooks: {
        verify: vi.fn().mockResolvedValue({ orderCode: 123456789 }),
      },
    };
    vi.mocked(getPayos).mockReturnValue(mockPayos as never);

    const { client, refs } = createClientMock();
    vi.mocked(createAdminClient).mockReturnValue(client as never);
    refs.selectEq.mockResolvedValue({
      data: [{ id: "order-1", status: "paid", payos_order_code: 123456789 }],
      error: null,
    });

    const res = await webhookHandler(buildReq({ code: "00", success: true, data: { orderCode: 123456789 }, signature: "sig" }));
    expect(res.status).toBe(200);
    // Không gọi update vì đã paid
    expect(refs.updateEq).not.toHaveBeenCalled();
  });

  it("updates order to paid, activates enrollment, returns 200", async () => {
    const mockPayos = {
      webhooks: {
        verify: vi.fn().mockResolvedValue({ orderCode: 123456789 }),
      },
    };
    vi.mocked(getPayos).mockReturnValue(mockPayos as never);

    const { client, refs } = createClientMock();
    vi.mocked(createAdminClient).mockReturnValue(client as never);
    refs.selectEq.mockResolvedValue({
      data: [{ id: "order-1", status: "pending", payos_order_code: 123456789 }],
      error: null,
    });
    refs.updateEq.mockResolvedValue({ error: null });
    vi.mocked(activateEnrollmentForOrder).mockResolvedValue({ enrollmentIds: ["enr-1"] });

    const res = await webhookHandler(buildReq({ code: "00", success: true, data: { orderCode: 123456789 }, signature: "sig" }));
    expect(res.status).toBe(200);
    expect(activateEnrollmentForOrder).toHaveBeenCalledTimes(1);
    expect(activateEnrollmentForOrder).toHaveBeenCalledWith(expect.anything(), "order-1");
  });
});
