/* eslint-disable no-console */
/**
 * Seed Supabase auth users + roles + some user-linked rows.
 *
 * Why a script (not SQL)?
 * - Supabase Auth users live in `auth.users` and should be created via Admin API.
 *
 * Run:
 *   npm run seed:auth
 *
 * Remote safety:
 * - To seed a non-local Supabase URL, set SEED_REMOTE_SUPABASE=true
 *
 * Requirements:
 * - NEXT_PUBLIC_SUPABASE_URL
 * - SUPABASE_SECRET_KEY (or SUPABASE_SERVICE_ROLE_KEY)
 */

const { createClient } = require("@supabase/supabase-js");

// Load `.env.local` for local scripts (Next loads it, node doesn't).
try {
  // eslint-disable-next-line import/no-extraneous-dependencies
  require("dotenv").config({ path: ".env.local" });
} catch {
  // ignore
}

const SUPABASE_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim();
const SERVICE_KEY =
  (process.env.SUPABASE_SECRET_KEY || "").trim() ||
  (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();

function assertEnv() {
  if (!SUPABASE_URL || !SERVICE_KEY) {
    throw new Error(
      "Missing env. Need NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY (or SUPABASE_SERVICE_ROLE_KEY)."
    );
  }
  const isLocalUrl = /^http:\/\/127\.0\.0\.1:54321$/.test(SUPABASE_URL);
  const allowRemote = (process.env.SEED_REMOTE_SUPABASE || "").trim() === "true";
  if (!isLocalUrl && !allowRemote) {
    throw new Error(
      `Refusing to seed remote Supabase URL: ${SUPABASE_URL}. Set SEED_REMOTE_SUPABASE=true if you really want to continue.`
    );
  }
}

async function ensureUser(supabase, { email, password, user_metadata }) {
  // Try find by email first.
  const { data: listData, error: listError } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 200,
  });
  if (listError) throw listError;

  const existing = (listData.users || []).find((u) => (u.email || "").toLowerCase() === email.toLowerCase());
  if (existing) return existing;

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata,
  });
  if (error) throw error;
  return data.user;
}

async function getProfileIdByEmail(supabase, email) {
  const { data, error } = await supabase
    .from("profiles")
    .select("id,email,role,is_active")
    .eq("email", email)
    .maybeSingle();
  if (error) throw error;
  return data?.id ?? null;
}

async function setProfileRole(supabase, { email, role }) {
  const { data, error } = await supabase
    .from("profiles")
    .update({ role })
    .eq("email", email)
    .select("id,email,role")
    .maybeSingle();
  if (error) throw error;
  return data;
}

async function upsertEnrollment(supabase, { userId, courseId }) {
  const { error } = await supabase
    .from("enrollments")
    .upsert(
      {
        user_id: userId,
        course_id: courseId,
        status: "active",
        starts_at: new Date().toISOString(),
      },
      { onConflict: "user_id,course_id" }
    );
  if (error) throw error;
}

async function attachSeedOrdersToUsers(supabase, { user1Id, user2Id }) {
  // Link the existing seeded orders (LOCAL-0001/0002) to the seeded users for testing admin/orders + enrollments approval.
  const { error: e1 } = await supabase
    .from("orders")
    .update({ user_id: user1Id })
    .eq("order_code", "LOCAL-0001");
  if (e1) throw e1;

  const { error: e2 } = await supabase
    .from("orders")
    .update({ user_id: user2Id })
    .eq("order_code", "LOCAL-0002");
  if (e2) throw e2;
}

async function main() {
  assertEnv();

  const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const PASSWORD = (process.env.SEED_AUTH_PASSWORD || "SeedAuth123!").trim();

  const adminEmail = (process.env.SEED_ADMIN_EMAIL || "admin@example.com").trim();
  const user1Email = (process.env.SEED_USER1_EMAIL || "user1@example.com").trim();
  const user2Email = (process.env.SEED_USER2_EMAIL || "user2@example.com").trim();

  const adminUser = await ensureUser(supabase, {
    email: adminEmail,
    password: PASSWORD,
    user_metadata: { full_name: "Local Admin" },
  });
  const user1 = await ensureUser(supabase, {
    email: user1Email,
    password: PASSWORD,
    user_metadata: { full_name: "Local User One" },
  });
  const user2 = await ensureUser(supabase, {
    email: user2Email,
    password: PASSWORD,
    user_metadata: { full_name: "Local User Two" },
  });

  // Trigger handle_new_user() should have created/updated profiles; if not, we still try role update by email.
  await setProfileRole(supabase, { email: adminEmail, role: "admin" });

  const adminProfileId = await getProfileIdByEmail(supabase, adminEmail);
  const user1ProfileId = await getProfileIdByEmail(supabase, user1Email);
  const user2ProfileId = await getProfileIdByEmail(supabase, user2Email);

  if (!adminProfileId || !user1ProfileId || !user2ProfileId) {
    throw new Error(
      "Profiles not found for seeded users. Ensure trigger `public.handle_new_user()` exists and auth users were created."
    );
  }

  // Link some enrollments to seeded published courses from seed.sql
  await upsertEnrollment(supabase, {
    userId: user1ProfileId,
    courseId: "11111111-1111-1111-1111-111111111111",
  });
  await upsertEnrollment(supabase, {
    userId: user2ProfileId,
    courseId: "11111111-1111-1111-1111-111111111112",
  });

  // Attach the existing seeded orders to these users
  await attachSeedOrdersToUsers(supabase, { user1Id: user1ProfileId, user2Id: user2ProfileId });

  console.log("✅ Seeded auth users:");
  console.log(`- admin: ${adminEmail} / ${PASSWORD} (role=admin) id=${adminUser.id}`);
  console.log(`- user1: ${user1Email} / ${PASSWORD} id=${user1.id}`);
  console.log(`- user2: ${user2Email} / ${PASSWORD} id=${user2.id}`);
  console.log("✅ Added enrollments + linked seed orders to users.");
}

main().catch((err) => {
  console.error("❌ seed-local-auth failed");
  console.error(err);
  process.exit(1);
});

