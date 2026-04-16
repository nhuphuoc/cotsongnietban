-- Grant admin role for a local user (dev only)
-- Usage:
-- 1) Sign up / sign in via your app (Supabase Auth local).
-- 2) Find the profile by email, then run:
--    update public.profiles set role = 'admin' where email = 'you@example.com';
--
-- Notes:
-- - `public.profiles` is auto-created on auth.users insert via trigger `public.handle_new_user()`.
-- - This is intended for LOCAL development only.

update public.profiles
set role = 'admin', updated_at = timezone('utc', now())
where email = 'admin@example.com';

