-- Align courses / sections / lessons with simplified schema used by admin lesson-videos.

-- courses
alter table public.courses
  add column if not exists extra_info text,
  add column if not exists hero_image_url text,
  add column if not exists access_note text;

alter table public.courses
  drop column if exists level_label,
  drop column if exists total_duration_seconds,
  drop column if exists lesson_count,
  drop column if exists instructor_name,
  drop column if exists instructor_title,
  drop column if exists rating_avg,
  drop column if exists rating_count;

alter table public.courses
  alter column price_vnd type bigint using price_vnd::bigint;

alter table public.courses
  alter column price_vnd set default 0;

alter table public.courses
  drop constraint if exists courses_price_vnd_check;

alter table public.courses
  add constraint courses_price_vnd_check check (price_vnd >= 0);

alter table public.courses
  drop constraint if exists courses_access_duration_days_check;

alter table public.courses
  add constraint courses_access_duration_days_check
  check (access_duration_days is null or access_duration_days > 0);

-- course_sections (retain only required business constraints)
alter table public.course_sections
  alter column sort_order drop default;

-- lessons: keep core video lesson shape; drop no-longer-used content helpers if present.
alter table public.lessons
  drop column if exists description,
  drop column if exists notes_intro,
  drop column if exists notes_json,
  drop column if exists kind,
  drop column if exists attachment_url,
  drop column if exists poster_url;

do $$
begin
  delete from storage.buckets where id = 'lesson-attachments';
exception
  when others then null;
end
$$;
