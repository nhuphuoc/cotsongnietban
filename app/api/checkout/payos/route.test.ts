import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/api/auth", () => ({
  requireActiveActor: vi.fn(),
}));

vi.mock("@/utils/supabase/admin", () => ({
  createAdminClient: vi.fn(),
}));

vi.mock("@/lib/api/repositories", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/api/repositories")>();
  return {
    ...actual,
    getCoursePurchaseStateForUser: vi.fn(),
  };
});

vi.mock("@/lib/payos", () => ({
  getPayos: vi.fn(),
}));

import { requireActiveActor } from "@/lib/api/auth";
import { getCoursePurchaseStateForUser } from "@/lib/api/repositories";
import { createAdminClient } from "@/utils/supabase/admin";
import { getPayos } from "@/lib/payos";
import { POST as checkoutHandler } from "./route";

const VALID_UUID = "550e8400-e29b-41d4-a716-446655440000";

function buildReq(payload: unknown) {
  return new Request("http://localhost:3000/api/checkout/payos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

function readJson(res: Response) {
  return res.json() as Promise<{ data?: unknown; error?: { message: string } }>;
}

type MockClient = {
  from: ReturnType<typeof vi.fn>;
};

function createClientMock() {
  const maybeSingleCourse = vi.fn().mockResolvedValue({
    data: { id: "course-1", title: "Khoa A", price_vnd: 1500000, status: "published", access_duration_days: 90 },
    error: null,
  });

  const selectCourses = vi.fn().mockReturnValue({
    eq: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({ maybeSingle: maybeSingleCourse }),
    }),
  });

  const maybeSingleProfile = vi.fn().mockResolvedValue({
    data: { full_name: "Hoc Vien", email: "hv@test.com", phone: "0900000000" },
    error: null,
  });

  const selectProfileEq = vi.fn().mockReturnValue({ maybeSingle: maybeSingleProfile });

  const deleteEq = vi.fn().mockResolvedValue({ error: null });

  const insertOrderSingle = vi.fn();
  const insertOrder = vi.fn().mockReturnValue({
    select: vi.fn().mockReturnValue({ single: insertOrderSingle }),
  });

  const insertOrderItem = vi.fn();

  const updateEq = vi.fn().mockResolvedValue({ error: null });
  const update = vi.fn().mockReturnValue({ eq: updateEq });

  const from = vi.fn((table: string) => {
    if (table === "courses") {
      return { select: selectCourses };
    }
    if (table === "profiles") {
      return { select: vi.fn().mockReturnValue({ eq: selectProfileEq }) };
    }
    if (table === "orders") {
      return { insert: insertOrder, delete: vi.fn().mockReturnValue({ eq: deleteEq }), update };
    }
    if (table === "order_items") {
      return { insert: insertOrderItem };
    }
    throw new Error(`Unexpected table: ${table}`);
  });

  return {
    client: { from } as unknown as MockClient,
    refs: { insertOrderSingle, insertOrder, insertOrderItem, updateEq, maybeSingleCourse },
  };
}

describe("POST /api/checkout/payos", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getCoursePurchaseStateForUser).mockResolvedValue({
      hasEnrollment: false,
      enrollment: null as never,
      hasOpenOrder: false,
      latestOrder: null,
      alreadyPurchased: false,
    });
  });

  it("returns 401 when user not authenticated", async () => {
    vi.mocked(requireActiveActor).mockResolvedValue({ actor: null, status: 401, message: "Ban chua dang nhap." });

    const res = await checkoutHandler(buildReq({ courseId: VALID_UUID, amount: 1500000 }));
    expect(res.status).toBe(401);
  });

  it("returns 400 when body invalid (missing courseId)", async () => {
    vi.mocked(requireActiveActor).mockResolvedValue({
      actor: { id: "user-1", email: "u@test.com", role: "student", isActive: true },
      status: 200,
      message: null,
    });

    const res = await checkoutHandler(buildReq({ courseId: "", amount: 1500000 }));
    expect(res.status).toBe(400);
  });

  it("returns 400 when amount does not match course.price_vnd", async () => {
    vi.mocked(requireActiveActor).mockResolvedValue({
      actor: { id: "user-1", email: "u@test.com", role: "student", isActive: true },
      status: 200,
      message: null,
    });

    const { client, refs } = createClientMock();
    vi.mocked(createAdminClient).mockReturnValue(client as never);
    // Course has price_vnd=1500000, but we send 999999
    refs.maybeSingleCourse.mockResolvedValue({
      data: { id: "course-1", title: "Khoa A", price_vnd: 1500000, status: "published", access_duration_days: 90 },
      error: null,
    });

    const res = await checkoutHandler(buildReq({ courseId: VALID_UUID, amount: 999999 }));
    expect(res.status).toBe(400);
    const json = await readJson(res);
    expect(json.error?.message).toMatch(/không khớp/);
  });

  it("returns 409 when user already has enrollment active", async () => {
    vi.mocked(requireActiveActor).mockResolvedValue({
      actor: { id: "user-1", email: "u@test.com", role: "student", isActive: true },
      status: 200,
      message: null,
    });
    vi.mocked(getCoursePurchaseStateForUser).mockResolvedValue({
      hasEnrollment: true,
      enrollment: { id: "enr-1", status: "active", created_at: "2026-04-19T00:00:00Z" },
      hasOpenOrder: false,
      latestOrder: null,
      alreadyPurchased: true,
    });

    const res = await checkoutHandler(buildReq({ courseId: VALID_UUID, amount: 1500000 }));
    expect(res.status).toBe(409);
  });

  it("creates order, calls payos.createPaymentLink, returns checkoutUrl", async () => {
    vi.mocked(requireActiveActor).mockResolvedValue({
      actor: { id: "user-1", email: "u@test.com", role: "student", isActive: true },
      status: 200,
      message: null,
    });

    const { client, refs } = createClientMock();
    vi.mocked(createAdminClient).mockReturnValue(client as never);
    refs.insertOrderSingle.mockResolvedValueOnce({
      data: { id: "order-1", payos_order_code: 123456789, status: "pending" },
      error: null,
    });
    refs.insertOrderItem.mockResolvedValueOnce({ error: null });

    const mockPayos = {
      paymentRequests: {
        create: vi.fn().mockResolvedValue({
          checkoutUrl: "https://pay.payos.vn/payment/test",
          paymentLinkId: "pl-1",
          orderCode: 123456789,
        }),
      },
    };
    vi.mocked(getPayos).mockReturnValue(mockPayos as never);

    const res = await checkoutHandler(buildReq({ courseId: VALID_UUID, amount: 1500000 }));
    expect(res.status).toBe(200);

    const json = await readJson(res);
    expect(json.data).toMatchObject({
      checkoutUrl: "https://pay.payos.vn/payment/test",
      orderId: "order-1",
      orderCode: 123456789,
    });

    expect(mockPayos.paymentRequests.create).toHaveBeenCalledWith(
      expect.objectContaining({
        orderCode: 123456789,
        amount: 1500000,
        description: expect.stringContaining("Khoa hoc"),
      })
    );
  });

  it("marks order cancelled and returns 502 when payos.createPaymentLink throws", async () => {
    vi.mocked(requireActiveActor).mockResolvedValue({
      actor: { id: "user-1", email: "u@test.com", role: "student", isActive: true },
      status: 200,
      message: null,
    });

    const { client, refs } = createClientMock();
    vi.mocked(createAdminClient).mockReturnValue(client as never);
    refs.insertOrderSingle.mockResolvedValueOnce({
      data: { id: "order-1", payos_order_code: 123456789, status: "pending" },
      error: null,
    });
    refs.insertOrderItem.mockResolvedValueOnce({ error: null });

    const mockPayos = {
      paymentRequests: {
        create: vi.fn().mockRejectedValue(new Error("PayOS API error")),
      },
    };
    vi.mocked(getPayos).mockReturnValue(mockPayos as never);

    const res = await checkoutHandler(buildReq({ courseId: VALID_UUID, amount: 1500000 }));
    expect(res.status).toBe(502);

    // Verify order was marked as cancelled
    expect(refs.updateEq).toHaveBeenCalled();
  });
});
