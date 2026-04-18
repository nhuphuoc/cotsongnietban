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

-- Extra dummy data (more courses/blog/feedback/orders)

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
  '11111111-1111-1111-1111-111111111112',
  id,
  'Chương trình giảm đau cổ vai gáy',
  'giam-dau-co-vai-gay',
  'Giảm đau cổ vai gáy, tăng linh hoạt vai - cổ, tối ưu tư thế làm việc.',
  'Lộ trình 4 tuần: giảm căng, cải thiện mobility, củng cố kiểm soát bả vai và thói quen trong ngày.',
  'Trung cấp',
  'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1200&h=800&fit=crop&q=75',
  1800000,
  60,
  4200,
  3,
  'Coach CSNB',
  'Chuyên gia phục hồi chức năng',
  4.8,
  64,
  false,
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

insert into public.course_sections (id, course_id, title, slug, description, thumbnail_url, sort_order)
values
  (
    '22222222-2222-2222-2222-222222222223',
    '11111111-1111-1111-1111-111111111112',
    'Giảm căng & phục hồi',
    'giam-cang-phuc-hoi',
    'Thư giãn mô mềm, mở rộng ngực, giảm căng vùng cổ - vai.',
    'https://images.unsplash.com/photo-1599058917212-d750089bc07a?w=1200&h=800&fit=crop&q=75',
    1
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
    '33333333-3333-3333-3333-333333333333',
    '11111111-1111-1111-1111-111111111112',
    '22222222-2222-2222-2222-222222222223',
    'Thiết lập workstation & tư thế cổ - vai',
    'workstation-va-tu-the',
    'Checklist 5 phút giúp giảm đau khi ngồi làm việc.',
    '<p>Điều chỉnh ghế, màn hình, bàn phím; cách đặt cổ và bả vai khi ngồi.</p>',
    'Làm chậm, ưu tiên cảm nhận vùng cổ - vai thả lỏng.',
    '["Màn hình ngang tầm mắt","Khuỷu tay ~90°","Cằm thu nhẹ"]'::jsonb,
    'video',
    'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    'external',
    'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1200&h=800&fit=crop&q=75',
    620,
    true,
    true,
    1
  ),
  (
    '33333333-3333-3333-3333-333333333334',
    '11111111-1111-1111-1111-111111111112',
    '22222222-2222-2222-2222-222222222223',
    'Mobility vai & mở ngực',
    'mobility-vai-mo-nguc',
    'Giảm gù vai, mở ngực, cải thiện biên độ vai.',
    '<p>Chuỗi bài 12 phút: mở ngực, xoay ngoài vai, thoracic mobility.</p>',
    'Không nhún vai; giữ cổ dài.',
    '["Hít thở đều","Không gồng cổ","Đau nhói thì giảm biên độ"]'::jsonb,
    'video',
    'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
    'external',
    'https://images.unsplash.com/photo-1599058917212-d750089bc07a?w=1200&h=800&fit=crop&q=75',
    780,
    false,
    true,
    2
  ),
  (
    '33333333-3333-3333-3333-333333333335',
    '11111111-1111-1111-1111-111111111112',
    '22222222-2222-2222-2222-222222222223',
    'Activation bả vai cơ bản',
    'activation-ba-vai',
    'Kích hoạt serratus/lower trap để ổn định bả vai.',
    '<p>Wall slide + scapular control + breathing.</p>',
    'Ưu tiên chất lượng hơn số lần.',
    '["Nhẹ nhưng đúng","Giữ ribcage ổn định"]'::jsonb,
    'video',
    'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    'external',
    'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1200&h=800&fit=crop&q=75',
    920,
    false,
    true,
    3
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
  '44444444-4444-4444-4444-444444444445',
  id,
  'Đau cổ vai gáy: 7 thói quen cần sửa ngay',
  'dau-co-vai-gay-7-thoi-quen',
  'Những lỗi nhỏ hằng ngày khiến cổ vai gáy đau dai dẳng.',
  'https://images.unsplash.com/photo-1526401485004-2aa6f7301de5?w=1600&h=900&fit=crop&q=75',
  '<p>Ngồi gù, màn hình thấp, kẹp điện thoại, thở nông… đều làm cổ vai căng hơn.</p><ul><li>Chỉnh màn hình</li><li>Micro-break</li><li>Thở hoành</li></ul>',
  'published',
  timezone('utc', now()),
  812
from public.blog_categories
where slug = 'dau-lung'
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
  '44444444-4444-4444-4444-444444444446',
  id,
  'Bài nháp: checklist tập an toàn',
  'draft-checklist-tap-an-toan',
  'Bản nháp cho admin chỉnh sửa.',
  null,
  '<p>Draft nội bộ — chỉ admin thấy.</p>',
  'draft',
  null,
  0
from public.blog_categories
where slug = 'kien-thuc'
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
    '55555555-5555-5555-5555-555555555556',
    '11111111-1111-1111-1111-111111111112',
    'zalo',
    'Anh Minh',
    null,
    null,
    4,
    '<p>Vai nhẹ hẳn sau 2 tuần, bài activation làm rất “đã”.</p>',
    'reviewed',
    true
  ),
  (
    '55555555-5555-5555-5555-555555555557',
    null,
    'facebook',
    'Bạn H.',
    null,
    null,
    5,
    '<p>Mình muốn xin thêm tư vấn phù hợp lịch làm việc.</p>',
    'new',
    false
  ),
  (
    '55555555-5555-5555-5555-555555555558',
    '11111111-1111-1111-1111-111111111111',
    'website',
    'Chị Nga',
    'nga@gmail.com',
    null,
    3,
    '<p>Nội dung hữu ích nhưng mình cần hướng dẫn kỹ hơn phần thở.</p>',
    'hidden',
    false
  )
on conflict (id) do update
set
  course_id = excluded.course_id,
  source = excluded.source,
  name = excluded.name,
  email = excluded.email,
  avatar_url = excluded.avatar_url,
  rating = excluded.rating,
  message_html = excluded.message_html,
  status = excluded.status,
  is_public = excluded.is_public;

insert into public.orders (
  id,
  order_code,
  user_id,
  customer_name,
  customer_email,
  customer_phone,
  subtotal_vnd,
  discount_vnd,
  total_vnd,
  status,
  payment_method,
  payment_reference,
  note
)
values
  (
    '66666666-6666-6666-6666-666666666661',
    'LOCAL-0001',
    null,
    'Nguyễn Văn A',
    'a@example.com',
    '0900000000',
    2500000,
    0,
    2500000,
    'pending',
    'bank_transfer',
    'ref_local_0001',
    'Đơn test pending'
  ),
  (
    '66666666-6666-6666-6666-666666666662',
    'LOCAL-0002',
    null,
    'Trần Thị B',
    'b@example.com',
    '0911111111',
    1800000,
    100000,
    1700000,
    'paid',
    'momo',
    'ref_local_0002',
    'Đơn test paid'
  )
on conflict (id) do update
set
  order_code = excluded.order_code,
  customer_name = excluded.customer_name,
  customer_email = excluded.customer_email,
  customer_phone = excluded.customer_phone,
  subtotal_vnd = excluded.subtotal_vnd,
  discount_vnd = excluded.discount_vnd,
  total_vnd = excluded.total_vnd,
  status = excluded.status,
  payment_method = excluded.payment_method,
  payment_reference = excluded.payment_reference,
  note = excluded.note;

insert into public.order_items (
  id,
  order_id,
  course_id,
  course_title_snapshot,
  price_vnd,
  access_duration_days
)
values
  (
    '77777777-7777-7777-7777-777777777771',
    '66666666-6666-6666-6666-666666666661',
    '11111111-1111-1111-1111-111111111111',
    'Phục hồi lưng cơ bản',
    2500000,
    90
  ),
  (
    '77777777-7777-7777-7777-777777777772',
    '66666666-6666-6666-6666-666666666662',
    '11111111-1111-1111-1111-111111111112',
    'Chương trình giảm đau cổ vai gáy',
    1700000,
    60
  )
on conflict (id) do update
set
  order_id = excluded.order_id,
  course_id = excluded.course_id,
  course_title_snapshot = excluded.course_title_snapshot,
  price_vnd = excluded.price_vnd,
  access_duration_days = excluded.access_duration_days;
