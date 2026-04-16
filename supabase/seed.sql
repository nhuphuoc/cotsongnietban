-- Minimal local seed for development

insert into public.course_categories (name, slug, description, sort_order)
values
  ('Phục hồi', 'phuc-hoi', 'Các chương trình phục hồi cột sống và vận động chức năng.', 1),
  ('Coaching', 'coaching', 'Các gói coaching theo tình trạng và mục tiêu cá nhân.', 2)
on conflict (slug) do nothing;

insert into public.blog_categories (name, slug, description, sort_order)
values
  ('Liệu Pháp', 'lieu-phap', 'Kiến thức và phương pháp phục hồi.', 1),
  ('Đau Lưng', 'dau-lung', 'Nội dung về đau lưng và cơ xương khớp.', 2),
  ('Kiến Thức', 'kien-thuc', 'Kiến thức nền tảng về vận động chức năng.', 3)
on conflict (slug) do nothing;

insert into public.courses (
  id,
  category_id,
  title,
  slug,
  short_description,
  description,
  level_label,
  thumbnail_url,
  price_vnd,
  access_duration_days,
  total_duration_seconds,
  lesson_count,
  instructor_name,
  instructor_title,
  rating_avg,
  rating_count,
  is_featured,
  status,
  published_at
)
select
  '11111111-1111-1111-1111-111111111111',
  id,
  'Phục hồi lưng cơ bản',
  'phuc-hoi-lung-co-ban',
  'Lộ trình nền tảng cho người đau lưng và cần phục hồi chức năng.',
  'Chương trình tập trung vào thở, mobility, activation và các mẫu vận động an toàn cho cột sống.',
  'Cơ bản',
  'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200&h=800&fit=crop&q=75',
  2500000,
  90,
  5400,
  2,
  'Coach CSNB',
  'Chuyên gia phục hồi chức năng',
  4.9,
  128,
  true,
  'published',
  timezone('utc', now())
from public.course_categories
where slug = 'phuc-hoi'
on conflict (id) do update
set
  title = excluded.title,
  slug = excluded.slug,
  short_description = excluded.short_description,
  description = excluded.description,
  level_label = excluded.level_label,
  thumbnail_url = excluded.thumbnail_url,
  price_vnd = excluded.price_vnd,
  access_duration_days = excluded.access_duration_days,
  total_duration_seconds = excluded.total_duration_seconds,
  lesson_count = excluded.lesson_count,
  instructor_name = excluded.instructor_name,
  instructor_title = excluded.instructor_title,
  rating_avg = excluded.rating_avg,
  rating_count = excluded.rating_count,
  is_featured = excluded.is_featured,
  status = excluded.status,
  published_at = excluded.published_at;

insert into public.course_sections (
  id,
  course_id,
  title,
  slug,
  description,
  thumbnail_url,
  sort_order
)
values
  (
    '22222222-2222-2222-2222-222222222221',
    '11111111-1111-1111-1111-111111111111',
    'Myofascial release & nhận thức',
    'myofascial-release-nhan-thuc',
    'Giải phóng căng nông, thở và đánh giá tư thế trước khi vào tải.',
    'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=1200&h=800&fit=crop&q=75',
    1
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    '11111111-1111-1111-1111-111111111111',
    'Posture training & mobility',
    'posture-training-mobility',
    'Củng cố nền tảng vận động với hip mobility và activation an toàn.',
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200&h=800&fit=crop&q=75',
    2
  )
on conflict (id) do update
set
  title = excluded.title,
  slug = excluded.slug,
  description = excluded.description,
  thumbnail_url = excluded.thumbnail_url,
  sort_order = excluded.sort_order;

insert into public.lessons (
  id,
  course_id,
  section_id,
  title,
  slug,
  summary,
  content_html,
  notes_intro,
  notes_json,
  kind,
  video_url,
  video_provider,
  poster_url,
  duration_seconds,
  is_preview,
  is_published,
  sort_order
)
values
  (
    '33333333-3333-3333-3333-333333333331',
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222221',
    'Giới thiệu khóa học & tổng quan phương pháp',
    'gioi-thieu-khoa-hoc',
    'Nắm khung chương trình và cách theo dõi tiến độ an toàn.',
    '<p>Nắm khung chương trình và cách theo dõi tiến độ an toàn.</p>',
    'Khởi động nhẹ và chuẩn bị không gian tập trước khi bắt đầu.',
    '["Mục tiêu từng phase","Khi nào cần dừng và báo coach"]'::jsonb,
    'video',
    'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    'external',
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200&h=800&fit=crop&q=75',
    750,
    true,
    true,
    1
  ),
  (
    '33333333-3333-3333-3333-333333333332',
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222222',
    'Breathing mechanics - nền tảng vận động',
    'breathing-mechanics',
    'Hiểu cách thở và kiểm soát lõi trước khi vào các bài activation.',
    '<p>Thở hoành, kiểm soát nhịp thở và chuẩn bị cho activation.</p>',
    'Giữ nhịp thở đều, không nín thở khi tập các bài nền.',
    '["Thở hoành","Tránh hyperventilation khi bracing nhẹ"]'::jsonb,
    'video',
    'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    'external',
    'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=1200&h=800&fit=crop&q=75',
    1330,
    false,
    true,
    2
  )
on conflict (id) do update
set
  title = excluded.title,
  slug = excluded.slug,
  summary = excluded.summary,
  content_html = excluded.content_html,
  notes_intro = excluded.notes_intro,
  notes_json = excluded.notes_json,
  video_url = excluded.video_url,
  video_provider = excluded.video_provider,
  poster_url = excluded.poster_url,
  duration_seconds = excluded.duration_seconds,
  is_preview = excluded.is_preview,
  is_published = excluded.is_published,
  sort_order = excluded.sort_order;

insert into public.blog_posts (
  id,
  category_id,
  title,
  slug,
  excerpt,
  cover_image_url,
  content_html,
  status,
  published_at,
  view_count
)
select
  '44444444-4444-4444-4444-444444444444',
  id,
  'Thoát vị đĩa đệm: phương pháp phục hồi không cần phẫu thuật',
  'thoat-vi-dia-dem-va-phuong-phap-phuc-hoi',
  'Hiểu đúng về thoát vị đĩa đệm và lộ trình phục hồi tự nhiên hiệu quả.',
  'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=1600&h=900&fit=crop&q=75',
  '<p>Thoát vị đĩa đệm không đồng nghĩa phải phẫu thuật. Với lộ trình đúng, nhiều trường hợp có thể phục hồi hiệu quả bằng vận động và thay đổi lối sống.</p><h2>3 giai đoạn phục hồi</h2><p>Giảm đau cấp tính, phục hồi cơ nền, duy trì và ngăn tái phát.</p>',
  'published',
  timezone('utc', now()),
  2456
from public.blog_categories
where slug = 'lieu-phap'
on conflict (id) do update
set
  title = excluded.title,
  slug = excluded.slug,
  excerpt = excluded.excerpt,
  cover_image_url = excluded.cover_image_url,
  content_html = excluded.content_html,
  status = excluded.status,
  published_at = excluded.published_at,
  view_count = excluded.view_count;

insert into public.feedbacks (
  id,
  course_id,
  source,
  name,
  email,
  avatar_url,
  rating,
  message_html,
  status,
  is_public
)
values
  (
    '55555555-5555-5555-5555-555555555555',
    '11111111-1111-1111-1111-111111111111',
    'website',
    'Chị Lan Anh',
    'lananh@gmail.com',
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=160&h=160&fit=crop&q=75',
    5,
    '<p>Đau lưng mãn tính giảm rõ sau 3 tháng; ngồi làm việc cả ngày đỡ mỏi hơn nhiều.</p>',
    'pinned',
    true
  )
on conflict (id) do update
set
  name = excluded.name,
  email = excluded.email,
  avatar_url = excluded.avatar_url,
  rating = excluded.rating,
  message_html = excluded.message_html,
  status = excluded.status,
  is_public = excluded.is_public;
