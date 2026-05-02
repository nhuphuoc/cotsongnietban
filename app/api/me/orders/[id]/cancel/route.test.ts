import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/api/auth", () => ({
  requireActiveActor: vi.fn(),
}));

vi.mock("@/utils/supabase/admin", () => ({
  createAdminClient: vi.fn(),
}));

import { requireActiveActor } from "@/lib/api/auth";
import { createAdminClient } from "@/utils/supabase/admin";
import { POST } from "./route";

function readJson(res: Response) {
  return res.json() as Promise<{ data?: unknown; error?: { message: string } }>;
}

describe("POST /api/me/orders/[id]/cancel", () => {
  beforeEach(() => {
    vi.mocked(requireActiveActor).mockResolvedValue({
      actor: { id: "user-1", email: "u@test.com", role: "student" },
      status: 200,
      message: undefined,
    } as never);
  });

  it("returns 403 when order belongs to another user", async () => {
    const maybeSingle = vi.fn().mockResolvedValue({
      data: { id: "ord-1", user_id: "other", status: "pending", note: null },
      error: null,
    });
    vi.mocked(createAdminClient).mockReturnValue({
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({ maybeSingle }),
        }),
      }),
    } as never);

    const res = await POST(new Request("http://localhost/api/me/orders/ord-1/cancel"), {
      params: Promise.resolve({ id: "ord-1" }),
    });
    expect(res.status).toBe(403);
  });

  it("cancels order and enrollments for owner", async () => {
    const enrollUpdate = vi.fn().mockReturnValue({ in: vi.fn().mockResolvedValue({ error: null }) });
    const orderUpdateSingle = vi.fn().mockResolvedValue({
      data: { id: "ord-1", status: "cancelled" },
      error: null,
    });
    const orderUpdate = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({ single: orderUpdateSingle }),
      }),
    });

    const from = vi.fn((table: string) => {
      if (table === "orders") {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              maybeSingle: vi.fn().mockResolvedValue({
                data: { id: "ord-1", user_id: "user-1", status: "pending", note: "Ghi chú cũ" },
                error: null,
              }),
            }),
          }),
          update: orderUpdate,
        };
      }
      if (table === "order_items") {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({
              data: [{ id: "item-1" }],
              error: null,
            }),
          }),
        };
      }
      if (table === "enrollments") {
        return { update: enrollUpdate };
      }
      throw new Error(`unexpected table ${table}`);
    });

    vi.mocked(createAdminClient).mockReturnValue({ from } as never);

    const res = await POST(new Request("http://localhost/api/me/orders/ord-1/cancel"), {
      params: Promise.resolve({ id: "ord-1" }),
    });

    expect(res.status).toBe(200);
    const body = await readJson(res);
    expect(body.data).toEqual({ id: "ord-1", status: "cancelled" });
    expect(enrollUpdate).toHaveBeenCalledWith({ status: "cancelled" });
    expect(orderUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "cancelled",
        note: expect.stringContaining("Học viên hủy đăng ký"),
      }),
    );
  });

  it("returns 400 for approved order", async () => {
    vi.mocked(createAdminClient).mockReturnValue({
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({
              data: { id: "ord-1", user_id: "user-1", status: "approved", note: null },
              error: null,
            }),
          }),
        }),
      }),
    } as never);

    const res = await POST(new Request("http://localhost/api/me/orders/ord-1/cancel"), {
      params: Promise.resolve({ id: "ord-1" }),
    });
    expect(res.status).toBe(400);
  });
});
