-- Voucher / mã giảm giá
-- Hỗ trợ: giảm %, giảm VND, miễn phí
-- Phạm vi: toàn site, khóa cụ thể, user cụ thể
-- Đối tượng: tất cả, học viên mới

create type public.voucher_discount_type as enum ('percentage', 'fixed_amount', 'free');
create type public.voucher_target_type as enum ('all', 'new_users');
create type public.voucher_scope as enum ('sitewide', 'specific_courses', 'specific_user');

-- ============================================================
-- vouchers
-- ============================================================
create table public.vouchers (
  id              uuid primary key default gen_random_uuid(),
  code            text not null unique
                    constraint vouchers_code_format check (code ~ '^[A-Z0-9_-]{3,30}$'),
  description     text,
  terms           text,
  discount_type   public.voucher_discount_type not null,
  discount_value  integer check (discount_value >= 0),
  max_discount_vnd integer check (max_discount_vnd > 0),
  min_order_vnd   integer not null default 0 check (min_order_vnd >= 0),
  max_uses        integer check (max_uses > 0),
  max_uses_per_user integer not null default 1 check (max_uses_per_user > 0),
  used_count      integer not null default 0 check (used_count >= 0),
  target_type     public.voucher_target_type not null default 'all',
  scope           public.voucher_scope not null default 'sitewide',
  user_id         uuid references public.profiles(id)
                    constraint vouchers_user_id_check check (user_id is null or scope = 'specific_user'),
  is_public       boolean not null default false,
  status          text not null default 'draft'
                    check (status in ('draft','active','paused','expired')),
  starts_at       timestamptz,
  expires_at      timestamptz not null,
  created_by      uuid references public.profiles(id),
  created_at      timestamptz not null default timezone('utc', now()),
  updated_at      timestamptz not null default timezone('utc', now())
);

create index idx_vouchers_code on public.vouchers(code) where status = 'active';
create index idx_vouchers_status on public.vouchers(status);

-- ============================================================
-- voucher_courses
-- ============================================================
create table public.voucher_courses (
  voucher_id  uuid not null references public.vouchers(id) on delete cascade,
  course_id   uuid not null references public.courses(id) on delete cascade,
  created_at  timestamptz not null default timezone('utc', now()),
  primary key (voucher_id, course_id)
);

-- ============================================================
-- voucher_usages
-- ============================================================
create table public.voucher_usages (
  id          uuid primary key default gen_random_uuid(),
  voucher_id  uuid not null references public.vouchers(id) on delete restrict,
  user_id     uuid not null references public.profiles(id) on delete cascade,
  order_id    uuid references public.orders(id) on delete set null,
  discount_vnd integer not null check (discount_vnd >= 0),
  created_at  timestamptz not null default timezone('utc', now())
);

create index idx_voucher_usages_voucher on public.voucher_usages(voucher_id);
create index idx_voucher_usages_user on public.voucher_usages(user_id);

-- ============================================================
-- orders: thêm voucher reference
-- ============================================================
alter table public.orders
  add column if not exists voucher_id uuid references public.vouchers(id) on delete set null,
  add column if not exists voucher_code text;

-- ============================================================
-- updated_at trigger
-- ============================================================
create trigger set_vouchers_updated_at
  before update on public.vouchers
  for each row execute procedure public.set_updated_at();

-- ============================================================
-- RLS
-- ============================================================
alter table public.vouchers enable row level security;
alter table public.voucher_courses enable row level security;
alter table public.voucher_usages enable row level security;

-- Admin quản lý toàn bộ voucher
drop policy if exists "admins manage vouchers" on public.vouchers;
create policy "admins manage vouchers"
  on public.vouchers
  for all
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "admins manage voucher_courses" on public.voucher_courses;
create policy "admins manage voucher_courses"
  on public.voucher_courses
  for all
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "admins manage voucher_usages" on public.voucher_usages;
create policy "admins manage voucher_usages"
  on public.voucher_usages
  for all
  using (public.is_admin());

-- User xem usage của chính mình (lịch sử dùng voucher)
drop policy if exists "users read own voucher usages" on public.voucher_usages;
create policy "users read own voucher usages"
  on public.voucher_usages
  for select
  using (auth.uid() = user_id);

-- Voucher công khai: user có thể xem (để hiển thị trên site)
drop policy if exists "public read active public vouchers" on public.vouchers;
create policy "public read active public vouchers"
  on public.vouchers
  for select
  using (status = 'active' and is_public = true);

grant select on public.voucher_courses to anon, authenticated;

-- ============================================================
-- Function: cron tự động expire voucher
-- Gọi thủ công hoặc qua pg_cron / Vercel cron
-- ============================================================
create or replace function public.expire_vouchers()
returns integer
language plpgsql
as $$
declare
  affected integer;
begin
  update public.vouchers
  set status = 'expired'
  where status = 'active'
    and expires_at < timezone('utc', now());

  get diagnostics affected = row_count;
  return affected;
end;
$$;
