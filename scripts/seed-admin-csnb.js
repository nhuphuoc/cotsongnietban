/* eslint-disable no-console */
/**
 * Đảm bảo có tài khoản admin CSNB (mặc định: admin@cotsongnietban.com / 123123).
 *
 * - Tạo user Auth + profile (trigger) nếu chưa có.
 * - Nếu đã có: đặt lại mật khẩu, email đã xác nhận, role admin, is_active true.
 *
 * Supabase ONLINE — chạy trong thư mục gốc project (nơi có .env.local):
 *   node scripts/seed-admin-csnb.js --remote
 *
 * Hoặc:
 *   npm run seed:admin:remote
 *
 * Local (127.0.0.1:54321):
 *   node scripts/seed-admin-csnb.js
 *
 * Ghi đè email/mật khẩu:
 *   ADMIN_EMAIL=a@b.com ADMIN_PASSWORD=xxx node scripts/seed-admin-csnb.js --remote
 *
 * Cần trong .env.local: NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SECRET_KEY (hoặc SUPABASE_SERVICE_ROLE_KEY).
 * Mật khẩu mặc định yếu — chỉ dev/staging.
 */

const { createClient } = require("@supabase/supabase-js");
const path = require("path");

try {
  // eslint-disable-next-line import/no-extraneous-dependencies
  const dotenv = require("dotenv");
  dotenv.config({ path: path.join(process.cwd(), ".env.local") });
  dotenv.config({ path: path.join(process.cwd(), ".env") });
} catch {
  // ignore
}

const SUPABASE_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim();
const SERVICE_KEY =
  (process.env.SUPABASE_SECRET_KEY || "").trim() ||
  (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "admin@cotsongnietban.com").trim().toLowerCase();
const ADMIN_PASSWORD = (process.env.ADMIN_PASSWORD || "123123").trim();

function assertEnv() {
  if (!SUPABASE_URL || !SERVICE_KEY) {
    throw new Error(
      "Thiếu env: NEXT_PUBLIC_SUPABASE_URL và SUPABASE_SECRET_KEY (hoặc SUPABASE_SERVICE_ROLE_KEY).\n" +
        "Chạy từ thư mục gốc repo (có file .env.local), hoặc export hai biến đó trước khi gọi node."
    );
  }
  const isLocalUrl = /^http:\/\/127\.0\.0\.1:54321$/.test(SUPABASE_URL);
  const argvRemote =
    process.argv.includes("--remote") ||
    process.argv.includes("-r") ||
    (process.env.SEED_REMOTE_SUPABASE || "").trim() === "true";
  if (!isLocalUrl && !argvRemote) {
    throw new Error(
      `URL đang là remote (${SUPABASE_URL}). Chạy lại với cờ:\n` +
        `  node scripts/seed-admin-csnb.js --remote`
    );
  }
}

async function findUserByEmail(supabase, email) {
  const { data, error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 200 });
  if (error) throw error;
  return (data.users || []).find((u) => (u.email || "").toLowerCase() === email.toLowerCase()) ?? null;
}

async function ensureAdmin(supabase) {
  let user = await findUserByEmail(supabase, ADMIN_EMAIL);

  if (user) {
    const { data, error } = await supabase.auth.admin.updateUserById(user.id, {
      password: ADMIN_PASSWORD,
      email_confirm: true,
      user_metadata: { ...(user.user_metadata || {}), full_name: user.user_metadata?.full_name || "CSNB Admin" },
    });
    if (error) throw error;
    user = data.user;
    console.log(`Đã cập nhật user có sẵn: ${ADMIN_EMAIL}`);
  } else {
    const { data, error } = await supabase.auth.admin.createUser({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      email_confirm: true,
      user_metadata: { full_name: "CSNB Admin" },
    });
    if (error) throw error;
    user = data.user;
    console.log(`Đã tạo user mới: ${ADMIN_EMAIL}`);
  }

  const { data: profile, error: pErr } = await supabase
    .from("profiles")
    .update({ role: "admin", is_active: true })
    .eq("id", user.id)
    .select("id,email,role,is_active")
    .maybeSingle();

  if (pErr) throw pErr;
  if (!profile) {
    throw new Error(
      "Không tìm thấy profile sau khi tạo user. Kiểm tra trigger handle_new_user trên auth.users."
    );
  }

  return { user, profile };
}

async function main() {
  assertEnv();

  const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { user, profile } = await ensureAdmin(supabase);

  console.log("✅ Admin CSNB sẵn sàng:");
  console.log(`   Email:    ${ADMIN_EMAIL}`);
  console.log(`   Password: ${ADMIN_PASSWORD}`);
  console.log(`   User id:  ${user.id}`);
  console.log(`   Profile:  role=${profile.role} is_active=${profile.is_active}`);
}

main().catch((err) => {
  console.error("❌ seed-admin-csnb thất bại");
  console.error(err);
  process.exit(1);
});
