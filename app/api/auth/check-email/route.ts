import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { getSupabasePublicEnv, getSupabaseServerEnv } from "@/utils/supabase/env";

const PER_PAGE = 1000;
const MAX_PAGES = 500;

async function authEmailExists(normalizedEmail: string): Promise<{ exists: boolean; error: string | null }> {
  if (!getSupabaseServerEnv()) {
    return { exists: false, error: "Máy chủ chưa cấu hình SUPABASE_SERVICE_ROLE_KEY / SUPABASE_SECRET_KEY." };
  }

  const admin = createAdminClient();

  for (let page = 1; page <= MAX_PAGES; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: PER_PAGE });
    if (error) {
      return { exists: false, error: error.message };
    }

    const users = data.users ?? [];
    if (users.some((u) => (u.email ?? "").toLowerCase() === normalizedEmail)) {
      return { exists: true, error: null };
    }

    if (users.length < PER_PAGE) {
      return { exists: false, error: null };
    }
  }

  return {
    exists: false,
    error:
      "Không thể duyệt hết danh sách tài khoản để kiểm tra email. Thử lại sau; nếu email đã được dùng, bước đăng ký sẽ báo lỗi.",
  };
}

export async function POST(request: NextRequest) {
  try {
    if (!getSupabasePublicEnv()) {
      return NextResponse.json({ error: "Supabase chưa được cấu hình" }, { status: 500 });
    }

    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email là bắt buộc" }, { status: 400 });
    }

    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      return NextResponse.json({ error: "Email không hợp lệ" }, { status: 400 });
    }

    const { exists, error } = await authEmailExists(trimmedEmail);
    if (error) {
      return NextResponse.json({ error }, { status: 500 });
    }

    return NextResponse.json({ available: !exists });
  } catch (err) {
    console.error("Check email error:", err);
    return NextResponse.json({ error: "Lỗi máy chủ" }, { status: 500 });
  }
}
