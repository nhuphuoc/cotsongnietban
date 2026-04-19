create or replace function public.current_app_role()
returns public.app_role
language sql
stable
security definer
set search_path = public
as $$
  select role
  from public.profiles
  where id = auth.uid()
  limit 1
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_app_role() = 'admin', false)
$$;

create or replace function public.has_active_course_access(target_course_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.enrollments
    where user_id = auth.uid()
      and course_id = target_course_id
      and status = 'active'
      and (expires_at is null or expires_at > timezone('utc', now()))
  )
$$;

grant execute on function public.current_app_role() to anon, authenticated;
grant execute on function public.is_admin() to anon, authenticated;
grant execute on function public.has_active_course_access(uuid) to anon, authenticated;

grant select on public.course_categories, public.blog_categories, public.courses, public.course_sections, public.lessons, public.blog_posts, public.feedbacks to anon, authenticated;
grant insert on public.feedbacks to anon, authenticated;
grant select on public.profiles, public.orders, public.order_items, public.enrollments, public.lesson_progress to authenticated;
grant insert, update on public.lesson_progress to authenticated;

alter table public.profiles enable row level security;
alter table public.course_categories enable row level security;
alter table public.courses enable row level security;
alter table public.course_sections enable row level security;
alter table public.lessons enable row level security;
alter table public.blog_categories enable row level security;
alter table public.blog_posts enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.enrollments enable row level security;
alter table public.lesson_progress enable row level security;
alter table public.feedbacks enable row level security;

drop policy if exists "admins manage profiles" on public.profiles;
create policy "admins manage profiles"
on public.profiles
for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "users read own profile" on public.profiles;
create policy "users read own profile"
on public.profiles
for select
using (auth.uid() = id);

drop policy if exists "public read course categories" on public.course_categories;
create policy "public read course categories"
on public.course_categories
for select
using (true);

drop policy if exists "admins manage course categories" on public.course_categories;
create policy "admins manage course categories"
on public.course_categories
for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "public or enrolled read courses" on public.courses;
create policy "public or enrolled read courses"
on public.courses
for select
using (
  public.is_admin()
  or status = 'published'
  or public.has_active_course_access(id)
);

drop policy if exists "admins manage courses" on public.courses;
create policy "admins manage courses"
on public.courses
for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "public or enrolled read course sections" on public.course_sections;
create policy "public or enrolled read course sections"
on public.course_sections
for select
using (
  public.is_admin()
  or exists (
    select 1
    from public.courses
    where courses.id = course_sections.course_id
      and courses.status = 'published'
  )
  or public.has_active_course_access(course_id)
);

drop policy if exists "admins manage course sections" on public.course_sections;
create policy "admins manage course sections"
on public.course_sections
for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "preview or enrolled read lessons" on public.lessons;
create policy "preview or enrolled read lessons"
on public.lessons
for select
using (
  public.is_admin()
  or public.has_active_course_access(course_id)
  or (
    is_published
    and is_preview
    and exists (
      select 1
      from public.courses
      where courses.id = lessons.course_id
        and courses.status = 'published'
    )
  )
);

drop policy if exists "admins manage lessons" on public.lessons;
create policy "admins manage lessons"
on public.lessons
for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "public read blog categories" on public.blog_categories;
create policy "public read blog categories"
on public.blog_categories
for select
using (true);

drop policy if exists "admins manage blog categories" on public.blog_categories;
create policy "admins manage blog categories"
on public.blog_categories
for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "public read published blog posts" on public.blog_posts;
create policy "public read published blog posts"
on public.blog_posts
for select
using (public.is_admin() or status = 'published');

drop policy if exists "admins manage blog posts" on public.blog_posts;
create policy "admins manage blog posts"
on public.blog_posts
for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "admins or owners read orders" on public.orders;
create policy "admins or owners read orders"
on public.orders
for select
using (public.is_admin() or auth.uid() = user_id);

drop policy if exists "admins manage orders" on public.orders;
create policy "admins manage orders"
on public.orders
for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "admins or owners read order items" on public.order_items;
create policy "admins or owners read order items"
on public.order_items
for select
using (
  public.is_admin()
  or exists (
    select 1
    from public.orders
    where orders.id = order_items.order_id
      and orders.user_id = auth.uid()
  )
);

drop policy if exists "admins manage order items" on public.order_items;
create policy "admins manage order items"
on public.order_items
for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "admins or owners read enrollments" on public.enrollments;
create policy "admins or owners read enrollments"
on public.enrollments
for select
using (public.is_admin() or auth.uid() = user_id);

drop policy if exists "admins manage enrollments" on public.enrollments;
create policy "admins manage enrollments"
on public.enrollments
for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "admins or owners read lesson progress" on public.lesson_progress;
create policy "admins or owners read lesson progress"
on public.lesson_progress
for select
using (
  public.is_admin()
  or exists (
    select 1
    from public.enrollments
    where enrollments.id = lesson_progress.enrollment_id
      and enrollments.user_id = auth.uid()
  )
);

drop policy if exists "owners write lesson progress" on public.lesson_progress;
create policy "owners write lesson progress"
on public.lesson_progress
for insert
with check (
  public.is_admin()
  or exists (
    select 1
    from public.enrollments
    where enrollments.id = lesson_progress.enrollment_id
      and enrollments.user_id = auth.uid()
  )
);

drop policy if exists "owners update lesson progress" on public.lesson_progress;
create policy "owners update lesson progress"
on public.lesson_progress
for update
using (
  public.is_admin()
  or exists (
    select 1
    from public.enrollments
    where enrollments.id = lesson_progress.enrollment_id
      and enrollments.user_id = auth.uid()
  )
)
with check (
  public.is_admin()
  or exists (
    select 1
    from public.enrollments
    where enrollments.id = lesson_progress.enrollment_id
      and enrollments.user_id = auth.uid()
  )
);

drop policy if exists "public read visible feedbacks" on public.feedbacks;
create policy "public read visible feedbacks"
on public.feedbacks
for select
using (public.is_admin() or is_public);

drop policy if exists "public submit feedback" on public.feedbacks;
create policy "public submit feedback"
on public.feedbacks
for insert
with check (
  public.is_admin()
  or (
    auth.uid() is null
    and user_id is null
  )
  or user_id = auth.uid()
);

drop policy if exists "admins manage feedbacks" on public.feedbacks;
create policy "admins manage feedbacks"
on public.feedbacks
for all
using (public.is_admin())
with check (public.is_admin());
