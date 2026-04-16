-- Cột Sống Niết Bàn - initial relational schema
-- Target: Supabase Postgres
-- Notes:
-- 1. User identity lives in auth.users.
-- 2. Application-specific profile/role data lives in public.profiles.
-- 3. This schema is designed to replace current demo/localStorage data for:
--    public site, LMS, orders, blog, and feedback moderation.

create extension if not exists pgcrypto;

create type public.app_role as enum ('admin', 'coach', 'student');
create type public.publication_status as enum ('draft', 'published', 'archived');
create type public.lesson_kind as enum ('video', 'article', 'download', 'live');
create type public.enrollment_status as enum ('pending', 'active', 'expired', 'cancelled', 'refunded');
create type public.order_status as enum ('pending', 'paid', 'approved', 'cancelled', 'refunded');
create type public.feedback_source as enum ('website', 'zalo', 'facebook', 'email', 'other');
create type public.feedback_status as enum ('new', 'reviewed', 'pinned', 'hidden');

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do update
  set
    email = excluded.email,
    full_name = coalesce(excluded.full_name, public.profiles.full_name),
    avatar_url = coalesce(excluded.avatar_url, public.profiles.avatar_url),
    updated_at = timezone('utc', now());
  return new;
end;
$$;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text,
  avatar_url text,
  phone text,
  role public.app_role not null default 'student',
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.course_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.courses (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.course_categories(id) on delete set null,
  title text not null,
  slug text not null unique,
  short_description text,
  description text,
  level_label text,
  thumbnail_url text,
  trailer_url text,
  price_vnd integer not null default 0 check (price_vnd >= 0),
  access_duration_days integer check (access_duration_days is null or access_duration_days > 0),
  total_duration_seconds integer not null default 0 check (total_duration_seconds >= 0),
  lesson_count integer not null default 0 check (lesson_count >= 0),
  instructor_name text,
  instructor_title text,
  rating_avg numeric(3,2) not null default 0 check (rating_avg >= 0 and rating_avg <= 5),
  rating_count integer not null default 0 check (rating_count >= 0),
  is_featured boolean not null default false,
  status public.publication_status not null default 'draft',
  published_at timestamptz,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.course_sections (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  title text not null,
  slug text not null,
  description text,
  thumbnail_url text,
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (course_id, slug),
  unique (course_id, sort_order)
);

create table public.lessons (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  section_id uuid references public.course_sections(id) on delete set null,
  title text not null,
  slug text not null,
  summary text,
  content_html text,
  notes_intro text,
  notes_json jsonb not null default '[]'::jsonb,
  kind public.lesson_kind not null default 'video',
  video_url text,
  video_provider text,
  poster_url text,
  duration_seconds integer not null default 0 check (duration_seconds >= 0),
  is_preview boolean not null default false,
  is_published boolean not null default false,
  sort_order integer not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (course_id, slug),
  unique (course_id, sort_order)
);

create table public.blog_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.blog_categories(id) on delete set null,
  author_id uuid references public.profiles(id) on delete set null,
  title text not null,
  slug text not null unique,
  excerpt text,
  cover_image_url text,
  content_html text not null default '',
  status public.publication_status not null default 'draft',
  published_at timestamptz,
  view_count integer not null default 0 check (view_count >= 0),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_code text not null unique,
  user_id uuid references public.profiles(id) on delete set null,
  customer_name text not null,
  customer_email text not null,
  customer_phone text,
  subtotal_vnd integer not null default 0 check (subtotal_vnd >= 0),
  discount_vnd integer not null default 0 check (discount_vnd >= 0),
  total_vnd integer not null default 0 check (total_vnd >= 0),
  status public.order_status not null default 'pending',
  payment_method text,
  payment_reference text,
  approved_by uuid references public.profiles(id) on delete set null,
  approved_at timestamptz,
  note text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete restrict,
  course_title_snapshot text not null,
  price_vnd integer not null default 0 check (price_vnd >= 0),
  access_duration_days integer check (access_duration_days is null or access_duration_days > 0),
  created_at timestamptz not null default timezone('utc', now()),
  unique (order_id, course_id)
);

create table public.enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  order_item_id uuid references public.order_items(id) on delete set null,
  status public.enrollment_status not null default 'pending',
  starts_at timestamptz not null default timezone('utc', now()),
  expires_at timestamptz,
  progress_percent integer not null default 0 check (progress_percent between 0 and 100),
  completed_lessons integer not null default 0 check (completed_lessons >= 0),
  last_lesson_id uuid references public.lessons(id) on delete set null,
  last_activity_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (user_id, course_id)
);

create table public.lesson_progress (
  id uuid primary key default gen_random_uuid(),
  enrollment_id uuid not null references public.enrollments(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  is_completed boolean not null default false,
  completed_at timestamptz,
  watch_seconds integer not null default 0 check (watch_seconds >= 0),
  last_position_seconds integer not null default 0 check (last_position_seconds >= 0),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (enrollment_id, lesson_id)
);

create table public.feedbacks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  course_id uuid references public.courses(id) on delete set null,
  source public.feedback_source not null default 'website',
  name text not null,
  email text,
  avatar_url text,
  rating integer not null check (rating between 1 and 5),
  message_html text not null,
  internal_note_html text,
  status public.feedback_status not null default 'new',
  is_public boolean not null default false,
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index idx_courses_status_featured on public.courses (status, is_featured, published_at desc);
create index idx_course_sections_course_sort on public.course_sections (course_id, sort_order);
create index idx_lessons_course_sort on public.lessons (course_id, sort_order);
create index idx_lessons_section_sort on public.lessons (section_id, sort_order);
create index idx_blog_posts_status_published on public.blog_posts (status, published_at desc);
create index idx_orders_status_created on public.orders (status, created_at desc);
create index idx_orders_user_created on public.orders (user_id, created_at desc);
create index idx_order_items_course on public.order_items (course_id);
create index idx_enrollments_user_status on public.enrollments (user_id, status);
create index idx_enrollments_course_status on public.enrollments (course_id, status);
create index idx_lesson_progress_enrollment on public.lesson_progress (enrollment_id);
create index idx_feedbacks_status_created on public.feedbacks (status, created_at desc);
create index idx_feedbacks_course_status on public.feedbacks (course_id, status);

create trigger set_profiles_updated_at
before update on public.profiles
for each row execute procedure public.set_updated_at();

create trigger set_course_categories_updated_at
before update on public.course_categories
for each row execute procedure public.set_updated_at();

create trigger set_courses_updated_at
before update on public.courses
for each row execute procedure public.set_updated_at();

create trigger set_course_sections_updated_at
before update on public.course_sections
for each row execute procedure public.set_updated_at();

create trigger set_lessons_updated_at
before update on public.lessons
for each row execute procedure public.set_updated_at();

create trigger set_blog_categories_updated_at
before update on public.blog_categories
for each row execute procedure public.set_updated_at();

create trigger set_blog_posts_updated_at
before update on public.blog_posts
for each row execute procedure public.set_updated_at();

create trigger set_orders_updated_at
before update on public.orders
for each row execute procedure public.set_updated_at();

create trigger set_enrollments_updated_at
before update on public.enrollments
for each row execute procedure public.set_updated_at();

create trigger set_lesson_progress_updated_at
before update on public.lesson_progress
for each row execute procedure public.set_updated_at();

create trigger set_feedbacks_updated_at
before update on public.feedbacks
for each row execute procedure public.set_updated_at();

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

comment on table public.profiles is 'App profile mapped 1:1 with auth.users.';
comment on table public.courses is 'Sellable LMS course catalog.';
comment on table public.course_sections is 'Sections/phases/modules inside a course.';
comment on table public.lessons is 'Course lessons shown in LMS and public previews.';
comment on table public.orders is 'Commercial order/payment approval workflow.';
comment on table public.enrollments is 'Granted access to a course for one learner.';
comment on table public.lesson_progress is 'Per-lesson learner progress state.';
comment on table public.blog_posts is 'Public knowledge/blog content.';
comment on table public.feedbacks is 'Testimonials and moderation workflow.';
