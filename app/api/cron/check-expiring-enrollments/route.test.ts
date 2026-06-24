import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock dependencies
vi.mock("@/utils/supabase/admin", () => ({
  createAdminClient: vi.fn(),
}));

vi.mock("@/lib/email/send", () => ({
  sendEmailAsync: vi.fn(),
}));

import { createAdminClient } from "@/utils/supabase/admin";
import { sendEmailAsync } from "@/lib/email/send";
import { GET as cronHandler } from "./route";

type MockSupabaseClient = {
  from: ReturnType<typeof vi.fn>;
};

function makeClient(overrides: {
  enrollments?: unknown[];
  enrollmentError?: Error | null;
  emailLogExisting?: boolean;
}) {
  const { enrollments = [], enrollmentError = null, emailLogExisting = false } = overrides;

  // Danh sách hàm mock cho chain: from("enrollments").select("...").eq().not().order()
  const orderFn = vi.fn().mockResolvedValue({
    data: enrollments,
    error: enrollmentError,
  });
  const notFn = vi.fn().mockReturnValue({ order: orderFn });
  const eqFn = vi.fn().mockReturnValue({ not: notFn });
  const selectFn = vi.fn().mockReturnValue({ eq: eqFn });

  // email_logs check — chain: eq().eq().gte().contains().maybeSingle()
  const emailLogMaybeSingle = vi.fn().mockResolvedValue({
    data: emailLogExisting ? { id: "log-1" } : null,
    error: null,
  });
  const emailLogContains = vi.fn().mockReturnValue({
    maybeSingle: emailLogMaybeSingle,
  });
  const emailLogGte = vi.fn().mockReturnValue({
    contains: emailLogContains,
  });
  const emailLogEq2 = vi.fn().mockReturnValue({ gte: emailLogGte });
  const emailLogEq1 = vi.fn().mockReturnValue({ eq: emailLogEq2 });
  const emailLogSelect = vi.fn().mockReturnValue({
    eq: emailLogEq1,
  });

  const from = vi.fn((table: string) => {
    if (table === "enrollments") return { select: selectFn };
    if (table === "email_logs") return { select: emailLogSelect };
    return { select: vi.fn() };
  });

  return { from } as unknown as MockSupabaseClient;
}

describe("GET /api/cron/check-expiring-enrollments", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(sendEmailAsync).mockImplementation(() => {});
  });

  it("trả về success với 0 sent khi không có enrollment nào", async () => {
    const client = makeClient({ enrollments: [] });
    vi.mocked(createAdminClient).mockReturnValue(client as never);

    const res = await cronHandler();
    const json = (await res.json()) as { success: boolean; checked: number; sent: number };

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.checked).toBe(0);
    expect(json.sent).toBe(0);
  });

  it("gửi email cho enrollment còn 6 ngày (trong khoảng 4-7)", async () => {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 6 * 86400 * 1000).toISOString();

    const client = makeClient({
      enrollments: [
        {
          id: "enr-1b",
          expires_at: expiresAt,
          user_id: "user-1",
          course_id: "course-1",
          profiles: { email: "test@test.com", full_name: "Học Viên" },
          courses: { title: "Khóa Test", slug: "khoa-test" },
        },
      ],
    });
    vi.mocked(createAdminClient).mockReturnValue(client as never);

    const res = await cronHandler();
    const json = (await res.json()) as { success: boolean; checked: number; sent: number };

    expect(json.sent).toBe(1);
    expect(sendEmailAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        metadata: expect.objectContaining({
          milestoneDays: 7,
        }),
      })
    );
  });

  it("gửi email cho enrollment sắp hết hạn 7 ngày", async () => {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 7 * 86400 * 1000).toISOString();

    const client = makeClient({
      enrollments: [
        {
          id: "enr-1",
          expires_at: expiresAt,
          user_id: "user-1",
          course_id: "course-1",
          profiles: { email: "test@test.com", full_name: "Học Viên" },
          courses: { title: "Khóa Test", slug: "khoa-test" },
        },
      ],
    });
    vi.mocked(createAdminClient).mockReturnValue(client as never);

    const res = await cronHandler();
    const json = (await res.json()) as { success: boolean; checked: number; sent: number };

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.sent).toBe(1);
    expect(sendEmailAsync).toHaveBeenCalledTimes(1);
    expect(sendEmailAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "test@test.com",
        template: "course_expiring",
        metadata: expect.objectContaining({
          milestoneDays: 7,
          daysLeft: 7,
        }),
      })
    );
  });

  it("gửi email cho enrollment sắp hết hạn 3 ngày", async () => {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 3 * 86400 * 1000).toISOString();

    const client = makeClient({
      enrollments: [
        {
          id: "enr-2",
          expires_at: expiresAt,
          user_id: "user-1",
          course_id: "course-1",
          profiles: { email: "test@test.com", full_name: "HV" },
          courses: { title: "Khóa B", slug: "khoa-b" },
        },
      ],
    });
    vi.mocked(createAdminClient).mockReturnValue(client as never);

    const res = await cronHandler();
    const json = (await res.json()) as { success: boolean; checked: number; sent: number };

    expect(json.sent).toBe(1);
    expect(sendEmailAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        metadata: expect.objectContaining({
          milestoneDays: 3,
          daysLeft: 3,
        }),
      })
    );
  });

  it("gửi email cho enrollment sắp hết hạn 1 ngày", async () => {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 1 * 86400 * 1000).toISOString();

    const client = makeClient({
      enrollments: [
        {
          id: "enr-3",
          expires_at: expiresAt,
          user_id: "user-1",
          course_id: "course-1",
          profiles: { email: "urgent@test.com", full_name: "Gấp" },
          courses: { title: "Khóa C", slug: "khoa-c" },
        },
      ],
    });
    vi.mocked(createAdminClient).mockReturnValue(client as never);

    const res = await cronHandler();
    const json = (await res.json()) as { success: boolean; checked: number; sent: number };

    expect(json.sent).toBe(1);
    expect(sendEmailAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        metadata: expect.objectContaining({
          milestoneDays: 1,
          daysLeft: 1,
        }),
      })
    );
  });

  it("không gửi email nếu enrollment ngoài khoảng milestone (vd: còn 8 ngày)", async () => {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 8 * 86400 * 1000).toISOString();

    const client = makeClient({
      enrollments: [
        {
          id: "enr-4",
          expires_at: expiresAt,
          user_id: "user-1",
          course_id: "course-1",
          profiles: { email: "test@test.com", full_name: "HV" },
          courses: { title: "Khóa D", slug: "khoa-d" },
        },
      ],
    });
    vi.mocked(createAdminClient).mockReturnValue(client as never);

    const res = await cronHandler();
    const json = (await res.json()) as { success: boolean; checked: number; sent: number };

    expect(json.sent).toBe(0);
    expect(sendEmailAsync).not.toHaveBeenCalled();
  });

  it("không gửi email trùng lặp (đã có email_logs cho enrollment + milestone)", async () => {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 7 * 86400 * 1000).toISOString();

    const client = makeClient({
      enrollments: [
        {
          id: "enr-5",
          expires_at: expiresAt,
          user_id: "user-1",
          course_id: "course-1",
          profiles: { email: "test@test.com", full_name: "HV" },
          courses: { title: "Khóa E", slug: "khoa-e" },
        },
      ],
      emailLogExisting: true, // Đã gửi trước đó
    });
    vi.mocked(createAdminClient).mockReturnValue(client as never);

    const res = await cronHandler();
    const json = (await res.json()) as { success: boolean; checked: number; sent: number };

    expect(json.sent).toBe(0);
    expect(sendEmailAsync).not.toHaveBeenCalled();
  });

  it("trả về 500 khi DB lỗi", async () => {
    const client = makeClient({
      enrollments: [],
      enrollmentError: new Error("DB down"),
    });
    vi.mocked(createAdminClient).mockReturnValue(client as never);

    const res = await cronHandler();
    expect(res.status).toBe(500);
  });

  it("bỏ qua enrollment không có email", async () => {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 7 * 86400 * 1000).toISOString();

    const client = makeClient({
      enrollments: [
        {
          id: "enr-6",
          expires_at: expiresAt,
          user_id: "user-1",
          course_id: "course-1",
          profiles: { email: null, full_name: "No Email" },
          courses: { title: "Khóa F", slug: "khoa-f" },
        },
      ],
    });
    vi.mocked(createAdminClient).mockReturnValue(client as never);

    const res = await cronHandler();
    const json = (await res.json()) as { success: boolean; checked: number; sent: number };

    expect(json.sent).toBe(0);
    expect(sendEmailAsync).not.toHaveBeenCalled();
  });

  it("bỏ qua enrollment không có expires_at", async () => {
    const client = makeClient({
      enrollments: [
        {
          id: "enr-7",
          expires_at: null,
          user_id: "user-1",
          course_id: "course-1",
          profiles: { email: "test@test.com", full_name: "HV" },
          courses: { title: "Khóa G", slug: "khoa-g" },
        },
      ],
    });
    vi.mocked(createAdminClient).mockReturnValue(client as never);

    const res = await cronHandler();
    const json = (await res.json()) as { success: boolean; checked: number; sent: number };

    expect(json.sent).toBe(0);
  });
});
