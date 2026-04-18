import { describe, expect, it, vi } from "vitest";

describe("utils/supabase/env", () => {
  it("prefers ANON_KEY but falls back to PUBLISHABLE_KEY", async () => {
    vi.resetModules();
    process.env.NEXT_PUBLIC_SUPABASE_URL = "http://127.0.0.1:54321";
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "sb_publishable_x";

    const mod = await import("./env");
    expect(mod.getSupabasePublicEnv()).toEqual({
      url: "http://127.0.0.1:54321",
      anonKey: "sb_publishable_x",
    });
  });

  it("server env prefers SERVICE_ROLE_KEY but falls back to SECRET_KEY", async () => {
    vi.resetModules();
    process.env.NEXT_PUBLIC_SUPABASE_URL = "http://127.0.0.1:54321";
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    process.env.SUPABASE_SECRET_KEY = "sb_secret_x";

    const mod = await import("./env");
    expect(mod.getSupabaseServerEnv()).toEqual({
      url: "http://127.0.0.1:54321",
      serviceRoleKey: "sb_secret_x",
    });
  });
});

