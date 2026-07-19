import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { validateVoucher, recordVoucherUsage } from "./vouchers";
import type { ValidateVoucherInput, VoucherRow } from "./vouchers";

// ============================================================
// Helpers
// ============================================================

function voucherRow(overrides: Partial<VoucherRow> = {}): VoucherRow {
  return {
    id: "v-1",
    code: "TEST10",
    description: "Test voucher",
    terms: null,
    discount_type: "percentage",
    discount_value: 10,
    max_discount_vnd: 200000,
    min_order_vnd: 100000,
    max_uses: 100,
    max_uses_per_user: 1,
    used_count: 5,
    target_type: "all",
    scope: "sitewide",
    user_id: null,
    is_public: false,
    status: "active",
    starts_at: null,
    expires_at: new Date(Date.now() + 86400000).toISOString(),
    created_by: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  };
}

const validInput: ValidateVoucherInput = {
  code: "TEST10",
  courseId: "course-1",
  subtotalVnd: 500000,
  userId: "user-1",
};

function createMockClient(
  tableMocks: Record<
    string,
    {
      /** Return voucher or null based on all filters applied */
      maybeSingle?: (filters: { code?: string; status?: string }) => Promise<{ data: unknown; error: unknown }>;
      /** For count-based queries like voucher_usages, enrollments */
      countQuery?: () => Promise<{ count: number | null; error: unknown }>;
    }
  > = {}
) {
  const from = vi.fn((table: string) => {
    const tm = tableMocks[table];

    if (table === "voucher_usages") {
      const chainedEq2 = vi.fn().mockImplementation(() =>
        tm?.countQuery ? tm.countQuery() : { count: 0, error: null }
      );
      const chainedEq1 = vi.fn().mockReturnValue({ eq: chainedEq2 });
      const chainedSelect = vi.fn().mockReturnValue({ eq: chainedEq1 });
      return { select: chainedSelect, eq: chainedEq1 };
    }

    // enrollments: .select().eq().in()
    if (table === "enrollments") {
      const inFn = vi.fn().mockImplementation(() =>
        tm?.countQuery ? tm.countQuery() : { count: 0, error: null }
      );
      const eqFn = vi.fn().mockReturnValue({ in: inFn });
      const selectFn = vi.fn().mockReturnValue({ eq: eqFn });
      return { select: selectFn, eq: eqFn, in: inFn };
    }

    // voucher_courses: .select().eq().eq().maybeSingle()
    if (table === "voucher_courses") {
      const courseMaybeSingle = tm?.maybeSingle
        ? vi.fn().mockImplementation(() => tm.maybeSingle!({}))
        : vi.fn().mockResolvedValue({ data: null, error: null });
      const courseEq2 = vi.fn().mockReturnValue({ maybeSingle: courseMaybeSingle });
      const courseEq1 = vi.fn().mockReturnValue({ eq: courseEq2 });
      const courseSelect = vi.fn().mockReturnValue({ eq: courseEq1 });
      return { select: courseSelect, eq: courseEq1 };
    }

    // vouchers: .select().eq().eq().maybeSingle()
    const filters: { code?: string; status?: string } = {};

    const terminalMaybeSingle = vi.fn().mockImplementation(() => {
      if (tm?.maybeSingle) {
        return tm.maybeSingle(filters);
      }
      return { data: null, error: null };
    });

    const statusEq = vi.fn((val: string) => {
      filters.status = val;
      return { maybeSingle: terminalMaybeSingle };
    });
    const codeEq = vi.fn((val: string) => {
      filters.code = val;
      return { eq: statusEq };
    });
    const voucherSelect = vi.fn().mockReturnValue({ eq: codeEq });

    return {
      select: voucherSelect,
      eq: codeEq,
      insert: vi.fn(),
      order: vi.fn().mockReturnThis(),
      range: vi.fn().mockReturnThis(),
      rpc: vi.fn(),
    };
  });

  return { from } as never;
}

// ============================================================
// Tests
// ============================================================

describe("validateVoucher", () => {
  it("returns error for empty code", async () => {
    const client = createMockClient();
    const result = await validateVoucher(client, { ...validInput, code: "" });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toContain("nhập mã");
  });

  it("returns error when voucher not found", async () => {
    const client = createMockClient({
      vouchers: { maybeSingle: () => Promise.resolve({ data: null, error: null }) },
    });
    const result = await validateVoucher(client, validInput);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toContain("không tồn tại");
  });

  it("returns error when voucher not active", async () => {
    // DB filters status=active, so expired vouchers return null
    const client = createMockClient({
      vouchers: { maybeSingle: () => Promise.resolve({ data: null, error: null }) },
    });
    const result = await validateVoucher(client, validInput);
    expect(result.ok).toBe(false);
  });

  it("returns error when not yet started", async () => {
    const v = voucherRow({ starts_at: new Date(Date.now() + 86400000).toISOString() });
    const client = createMockClient({
      vouchers: { maybeSingle: () => Promise.resolve({ data: v, error: null }) },
    });
    const result = await validateVoucher(client, validInput);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toContain("chưa có hiệu lực");
  });

  it("returns error when already expired", async () => {
    const v = voucherRow({ expires_at: new Date(Date.now() - 1000).toISOString() });
    const client = createMockClient({
      vouchers: { maybeSingle: () => Promise.resolve({ data: v, error: null }) },
    });
    const result = await validateVoucher(client, validInput);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toContain("hết hạn");
  });

  it("returns error when max_uses reached", async () => {
    const v = voucherRow({ max_uses: 10, used_count: 10 });
    const client = createMockClient({
      vouchers: { maybeSingle: () => Promise.resolve({ data: v, error: null }) },
    });
    const result = await validateVoucher(client, validInput);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toContain("hết lượt");
  });

  it("returns error when user exceeded max_uses_per_user", async () => {
    const v = voucherRow({ max_uses_per_user: 1 });
    const client = createMockClient({
      vouchers: { maybeSingle: () => Promise.resolve({ data: v, error: null }) },
      voucher_usages: { countQuery: () => Promise.resolve({ count: 1, error: null }) },
    });
    const result = await validateVoucher(client, validInput);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toContain("đã sử dụng mã");
  });

  it("allows user under max_uses_per_user", async () => {
    const v = voucherRow({ max_uses_per_user: 3 });
    const client = createMockClient({
      vouchers: { maybeSingle: () => Promise.resolve({ data: v, error: null }) },
      voucher_usages: { countQuery: () => Promise.resolve({ count: 2, error: null }) },
    });
    const result = await validateVoucher(client, validInput);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.discountVnd).toBe(50000);
      expect(result.finalVnd).toBe(450000);
    }
  });

  it("blocks new_user when user has enrollments", async () => {
    const v = voucherRow({ target_type: "new_users" });
    const client = createMockClient({
      vouchers: { maybeSingle: () => Promise.resolve({ data: v, error: null }) },
      voucher_usages: { countQuery: () => Promise.resolve({ count: 0, error: null }) },
      enrollments: { countQuery: () => Promise.resolve({ count: 5, error: null }) },
    });
    const result = await validateVoucher(client, validInput);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toContain("học viên mới");
  });

  it("allows new_user when no enrollments", async () => {
    const v = voucherRow({ target_type: "new_users" });
    const client = createMockClient({
      vouchers: { maybeSingle: () => Promise.resolve({ data: v, error: null }) },
      voucher_usages: { countQuery: () => Promise.resolve({ count: 0, error: null }) },
      enrollments: { countQuery: () => Promise.resolve({ count: 0, error: null }) },
    });
    const result = await validateVoucher(client, validInput);
    expect(result.ok).toBe(true);
  });

  it("blocks specific_user when user_id mismatch", async () => {
    const v = voucherRow({ scope: "specific_user", user_id: "other-user" });
    const client = createMockClient({
      vouchers: { maybeSingle: () => Promise.resolve({ data: v, error: null }) },
    });
    const result = await validateVoucher(client, validInput);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toContain("không áp dụng cho tài khoản");
  });

  it("allows specific_user when user_id matches", async () => {
    const v = voucherRow({ scope: "specific_user", user_id: "user-1" });
    const client = createMockClient({
      vouchers: { maybeSingle: () => Promise.resolve({ data: v, error: null }) },
    });
    const result = await validateVoucher(client, validInput);
    expect(result.ok).toBe(true);
  });

  it("blocks specific_courses when course not in list", async () => {
    const v = voucherRow({ scope: "specific_courses" });
    const client = createMockClient({
      vouchers: { maybeSingle: () => Promise.resolve({ data: v, error: null }) },
      voucher_courses: { maybeSingle: () => Promise.resolve({ data: null, error: null }) },
    });
    const result = await validateVoucher(client, { ...validInput, courseId: "course-99" });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toContain("không áp dụng cho khóa");
  });

  it("blocks when subtotal below min_order", async () => {
    const v = voucherRow({ min_order_vnd: 1000000 });
    const client = createMockClient({
      vouchers: { maybeSingle: () => Promise.resolve({ data: v, error: null }) },
    });
    const result = await validateVoucher(client, { ...validInput, subtotalVnd: 500000 });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toContain("tối thiểu");
  });

  it("calculates percentage discount", async () => {
    const v = voucherRow({ discount_type: "percentage", discount_value: 20, max_discount_vnd: null });
    const client = createMockClient({
      vouchers: { maybeSingle: () => Promise.resolve({ data: v, error: null }) },
    });
    const result = await validateVoucher(client, validInput);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.discountVnd).toBe(100000);
      expect(result.finalVnd).toBe(400000);
    }
  });

  it("caps percentage at max_discount_vnd", async () => {
    const v = voucherRow({ discount_type: "percentage", discount_value: 50, max_discount_vnd: 100000 });
    const client = createMockClient({
      vouchers: { maybeSingle: () => Promise.resolve({ data: v, error: null }) },
    });
    const result = await validateVoucher(client, validInput);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.discountVnd).toBe(100000);
      expect(result.finalVnd).toBe(400000);
    }
  });

  it("calculates fixed_amount discount", async () => {
    const v = voucherRow({ discount_type: "fixed_amount", discount_value: 150000 });
    const client = createMockClient({
      vouchers: { maybeSingle: () => Promise.resolve({ data: v, error: null }) },
    });
    const result = await validateVoucher(client, validInput);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.discountVnd).toBe(150000);
      expect(result.finalVnd).toBe(350000);
    }
  });

  it("fixed_amount does not exceed subtotal", async () => {
    const v = voucherRow({ discount_type: "fixed_amount", discount_value: 999999 });
    const client = createMockClient({
      vouchers: { maybeSingle: () => Promise.resolve({ data: v, error: null }) },
    });
    const result = await validateVoucher(client, validInput);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.discountVnd).toBe(500000);
      expect(result.finalVnd).toBe(0);
    }
  });

  it("free type makes finalVnd 0", async () => {
    const v = voucherRow({ discount_type: "free", discount_value: null });
    const client = createMockClient({
      vouchers: { maybeSingle: () => Promise.resolve({ data: v, error: null }) },
    });
    const result = await validateVoucher(client, validInput);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.discountVnd).toBe(500000);
      expect(result.finalVnd).toBe(0);
    }
  });
});

// ============================================================
// recordVoucherUsage
// ============================================================

describe("recordVoucherUsage", () => {
  it("inserts usage and calls rpc", async () => {
    const insert = vi.fn().mockResolvedValue({ error: null });
    const rpc = vi.fn().mockResolvedValue({ error: null });
    const from = vi.fn(() => ({ insert, rpc }));

    const client = { from, rpc } as never;
    const result = await recordVoucherUsage(client, {
      voucherId: "v-1",
      userId: "user-1",
      orderId: "order-1",
      discountVnd: 50000,
    });

    expect(result.success).toBe(true);
    expect(insert).toHaveBeenCalledWith({
      voucher_id: "v-1",
      user_id: "user-1",
      order_id: "order-1",
      discount_vnd: 50000,
    });
    expect(rpc).toHaveBeenCalledWith("increment_voucher_used_count", {
      p_voucher_id: "v-1",
    });
  });

  it("returns false when insert fails", async () => {
    const insert = vi.fn().mockResolvedValue({ error: { message: "DB error" } });
    const rpc = vi.fn();
    const from = vi.fn(() => ({ insert, rpc }));

    const client = { from, rpc } as never;
    const result = await recordVoucherUsage(client, {
      voucherId: "v-1",
      userId: "user-1",
      orderId: "order-1",
      discountVnd: 50000,
    });

    expect(result.success).toBe(false);
  });
});
