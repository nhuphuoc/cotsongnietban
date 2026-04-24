import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/api/auth", () => ({
  requireActiveActor: vi.fn(),
}));

vi.mock("@/utils/supabase/admin", () => ({
  createAdminClient: vi.fn(),
}));

vi.mock("@/lib/api/repositories", () => ({
  getCoursePurchaseStateForUser: vi.fn(),
}));

import { requireActiveActor } from "@/lib/api/auth";
import { getCoursePurchaseStateForUser } from "@/lib/api/repositories";
import { createAdminClient } from "@/utils/supabase/admin";
import { POST as createOrderHandler } from "./route";

function buildReq(payload: unknown) {
  return new Request("http://localhost/api/orders", {
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
  const insertOrderSingle = vi.fn();
  const insertOrder = vi.fn().mockReturnValue({
    select: vi.fn().mockReturnValue({ single: insertOrderSingle }),
  });

  const insertOrderItem = vi.fn();
  const insertOrderItemSingle = vi.fn();
  const deleteOrder = vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) });

  const from = vi.fn((table: string) => {
    if (table === "courses") {
      return {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              maybeSingle: vi.fn().mockResolvedValue({
                data: {
                  id: "course-1",
                  title: "Khoa hoc A",
                  price_vnd: 1500000,
                  access_duration_days: 90,
                  status: "published",
                },
                error: null,
              }),
            }),
          }),
        }),
      };
    }

    if (table === "profiles") {
      return {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({
              data: { full_name: "Hoc Vien", email: "hv@test.com", phone: "0900000000" },
              error: null,
            }),
          }),
        }),
      };
    }

    if (table === "orders") {
      return {
        insert: insertOrder,
        delete: deleteOrder,
      };
    }

    if (table === "order_items") {
      return {
        insert: insertOrderItem.mockReturnValue({
          select: vi.fn().mockReturnValue({ single: insertOrderItemSingle }),
        }),
      };
    }

    throw new Error(`Unexpected table: ${table}`);
  });

  return {
    client: { from } as unknown as MockClient,
    refs: {
      insertOrderSingle,
      insertOrder,
      insertOrderItem,
      insertOrderItemSingle,
      deleteOrder,
    },
  };
}

describe("public POST /api/orders", () => {
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

    const res = await createOrderHandler(buildReq({ courseId: "course-1" }));
    expect(res.status).toBe(401);
  });

  it("returns 400 when courseId missing", async () => {
    vi.mocked(requireActiveActor).mockResolvedValue({
      actor: { id: "user-1", email: "u@test.com", role: "student", isActive: true },
      status: 200,
      message: null,
    });

    const res = await createOrderHandler(buildReq({}));
    expect(res.status).toBe(400);
    const json = await readJson(res);
    expect(json.error?.message).toMatch(/courseId/);
  });

  it("creates order and item, returns 201", async () => {
    vi.mocked(requireActiveActor).mockResolvedValue({
      actor: { id: "user-1", email: "u@test.com", role: "student", isActive: true },
      status: 200,
      message: null,
    });

    const { client, refs } = createClientMock();
    vi.mocked(createAdminClient).mockReturnValue(client as never);
    refs.insertOrderSingle.mockResolvedValueOnce({
      data: { id: "order-1", status: "pending", payment_reference: "CSNB ORD-X" },
      error: null,
    });
    refs.insertOrderItem.mockResolvedValueOnce({ error: null });

    const res = await createOrderHandler(buildReq({ courseId: "course-1" }));
    expect(res.status).toBe(201);

    const json = await readJson(res);
    expect(json.data).toMatchObject({
      orderId: "order-1",
      status: "pending",
      totalVnd: 1500000,
      paymentMethod: "bank_transfer",
    });

    expect(refs.insertOrder).toHaveBeenCalledOnce();
    expect(refs.insertOrderItem).toHaveBeenCalledWith(
      expect.objectContaining({
        order_id: "order-1",
        course_id: "course-1",
        price_vnd: 1500000,
      })
    );
  });

  it("returns existing order when user already has open order", async () => {
    vi.mocked(requireActiveActor).mockResolvedValue({
      actor: { id: "user-1", email: "u@test.com", role: "student", isActive: true },
      status: 200,
      message: null,
    });
    vi.mocked(getCoursePurchaseStateForUser).mockResolvedValue({
      hasEnrollment: false,
      enrollment: null as never,
      hasOpenOrder: true,
      latestOrder: {
        id: "order-existing",
        order_code: "ORD-EXIST",
        status: "pending",
        total_vnd: 1500000,
        payment_reference: "CSNB ORD-EXIST",
        created_at: "2026-04-19T00:00:00Z",
      },
      alreadyPurchased: true,
    });

    const res = await createOrderHandler(buildReq({ courseId: "course-1" }));
    expect(res.status).toBe(200);
    const json = await readJson(res);
    expect(json.data).toMatchObject({
      orderId: "order-existing",
      alreadyExists: true,
      paymentReference: "CSNB ORD-EXIST",
      totalVnd: 1500000,
    });
  });

  it("returns 409 when user already has enrollment", async () => {
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

    const res = await createOrderHandler(buildReq({ courseId: "course-1" }));
    expect(res.status).toBe(409);
  });

  it("retries when order_code conflicts", async () => {
    vi.mocked(requireActiveActor).mockResolvedValue({
      actor: { id: "user-1", email: "u@test.com", role: "student", isActive: true },
      status: 200,
      message: null,
    });

    const { client, refs } = createClientMock();
    vi.mocked(createAdminClient).mockReturnValue(client as never);

    refs.insertOrderSingle
      .mockResolvedValueOnce({ data: null, error: { code: "23505" } })
      .mockResolvedValueOnce({
        data: { id: "order-2", status: "pending", payment_reference: "CSNB ORD-Y" },
        error: null,
      });
    refs.insertOrderItem.mockResolvedValueOnce({ error: null });

    const res = await createOrderHandler(buildReq({ courseId: "course-1" }));
    expect(res.status).toBe(201);
    expect(refs.insertOrder).toHaveBeenCalledTimes(2);
  });
});
