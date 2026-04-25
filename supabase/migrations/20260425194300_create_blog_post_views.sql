create table if not exists public.blog_post_views (
  post_id uuid not null references public.blog_posts(id) on delete cascade,
  visitor_hash text not null,
  first_viewed_at timestamptz not null default timezone('utc', now()),
  last_viewed_at timestamptz not null default timezone('utc', now()),
  view_count integer not null default 1 check (view_count >= 1),
  primary key (post_id, visitor_hash)
);

create index if not exists idx_blog_post_views_post_last_viewed
  on public.blog_post_views (post_id, last_viewed_at desc);

create index if not exists idx_blog_post_views_last_viewed
  on public.blog_post_views (last_viewed_at desc);
