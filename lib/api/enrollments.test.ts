import { describe, expect, it, vi } from "vitest";
import { activateEnrollmentForOrder } from "./enrollments";

type MockClient = {
  from: ReturnType<typeof vi.fn>;
};

function createAdminMock() {
  const singleOrder = vi.fn();
  const eqOrderItems = vi.fn();

  const selectEnrollmentIds = vi.fn();
  const upsert = vi.fn().mockReturnValue({ select: selectEnrollmentIds });

  const from = vi.fn((table: string) => {
    if (table === "orders") {
      return { select: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ single: singleOrder }) }) };
    }
    if (table === "order_items") {
      return { select: vi.fn().mockReturnValue({ eq: eqOrderItems }) };
    }
    if (table === "enrollments") {
      return { upsert };
    }
    throw new Error(`Unexpected table: ${table}`);
  });

  return { client: { from } as unknown as MockClient, refs: { singleOrder, eqOrderItems, upsert, selectEnrollmentIds } };
}

describe("activateEnrollmentForOrder", () => {
  it("throws when order not found", async () => {
    const { client, refs } = createAdminMock();
    refs.singleOrder.mockResolvedValue({ data: null, error: { code: "PGRST116" } });

    await expect(activateEnrollmentForOrder(client as never, "order-1")).rejects.toThrow("Không tìm thấy");
  });

  it("throws when order has no user_id", async () => {
    const { client, refs } = createAdminMock();
    refs.singleOrder.mockResolvedValue({ data: { id: "order-1", user_id: null }, error: null });

    await expect(activateEnrollmentForOrder(client as never, "order-1")).rejects.toThrow("chưa gắn user_id");
  });

  it("returns empty array when order has no items", async () => {
    const { client, refs } = createAdminMock();
    refs.singleOrder.mockResolvedValue({ data: { id: "order-1", user_id: "user-1" }, error: null });
    refs.eqOrderItems.mockReturnValue({ data: [], error: null });

    const result = await activateEnrollmentForOrder(client as never, "order-1");
    expect(result).toEqual({ enrollmentIds: [] });
  });

  it("upserts enrollments with correct data", async () => {
    const { client, refs } = createAdminMock();
    refs.singleOrder.mockResolvedValue({ data: { id: "order-1", user_id: "user-1" }, error: null });
    refs.eqOrderItems.mockReturnValue({
      data: [
        { id: "item-1", order_id: "order-1", course_id: "course-1", access_duration_days: 90 },
        { id: "item-2", order_id: "order-1", course_id: "course-2", access_duration_days: null },
      ],
      error: null,
    });
    refs.selectEnrollmentIds.mockResolvedValue({ data: [{ id: "enr-1" }, { id: "enr-2" }], error: null });

    const result = await activateEnrollmentForOrder(client as never, "order-1");
    expect(result.enrollmentIds).toEqual(["enr-1", "enr-2"]);

    // Verify upsert called with right data
    const upsertCall = refs.upsert.mock.calls[0][0];
    expect(upsertCall).toHaveLength(2);
    expect(upsertCall[0]).toMatchObject({
      user_id: "user-1",
      course_id: "course-1",
      order_item_id: "item-1",
      status: "active",
    });
    expect(upsertCall[0].starts_at).toBeTruthy();
    expect(upsertCall[0].expires_at).toBeTruthy(); // 90 days

    expect(upsertCall[1]).toMatchObject({
      user_id: "user-1",
      course_id: "course-2",
      order_item_id: "item-2",
      status: "active",
    });
    expect(upsertCall[1].expires_at).toBeNull(); // null access_duration_days
  });
});
