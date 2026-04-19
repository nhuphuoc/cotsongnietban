-- Migration: Redesign feedbacks table to support Before/After, Testimonial, Comment types
-- Replaces the old CRM-style feedbacks table with a unified Social Proof schema.

-- 1. Drop old table (and all dependent objects: indexes, triggers, policies, RLS grants)
drop table if exists public.feedbacks cascade;

-- 2. Drop obsolete enum types
drop type if exists public.feedback_source;
drop type if exists public.feedback_status;

-- 3. Create new feedbacks table
create table public.feedbacks (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('before_after', 'testimonial', 'comment')),
  customer_name text,
  customer_info text,
  content text,
  avatar_url text,
  image_url_1 text,
  image_url_2 text,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now())
);

-- 4. Index
create index idx_feedbacks_type_active on public.feedbacks (type, is_active, created_at desc);

-- 5. RLS
alter table public.feedbacks enable row level security;

-- Public can SELECT active records
drop policy if exists "public read visible feedbacks" on public.feedbacks;
create policy "public read visible feedbacks"
on public.feedbacks
for select
using (is_active = true or public.is_admin());

-- Admins can do everything
drop policy if exists "admins manage feedbacks" on public.feedbacks;
create policy "admins manage feedbacks"
on public.feedbacks
for all
using (public.is_admin())
with check (public.is_admin());

-- 6. Grants
grant select on public.feedbacks to anon, authenticated;
