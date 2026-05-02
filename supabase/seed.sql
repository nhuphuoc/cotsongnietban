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
  trailer_url,
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
  'Lộ trình nền tảng cho người đau lưng và cần phục hồi chức năng — thở, mobility, activation an toàn.',
  'Khóa học dành cho người ngồi nhiều, đau lưng cấp nhẹ đến mạn tính (đã được bác sĩ cho phép vận động). Bạn sẽ học: nhận thức cơ thể, thở hoành, mở khớp hông–cột sống, kích hoạt cơ lõi và các mẫu hip hinge có kiểm soát. Mỗi buổi có phần khởi động, bài chính và hạ nhiệt. Video minh họa qua YouTube (nội dung tham khảo thể dục công khai); khi lên production bạn có thể thay bằng video riêng của CSNB.',
  'Cơ bản',
  'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200&h=800&fit=crop&q=75',
  'https://www.youtube.com/watch?v=v7AYKMP6rOE',
  2500000,
  90,
  2080,
  2,
  'ThS. BS. Nguyễn Minh Tuấn',
  'Bác sĩ vật lý trị liệu · 14 năm kinh nghiệm',
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
  trailer_url = excluded.trailer_url,
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
    'https://www.youtube.com/watch?v=v7AYKMP6rOE',
    'youtube',
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
    'https://www.youtube.com/watch?v=inpok_5PwWU',
    'youtube',
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
  'Thoát vị đĩa đệm: khi nào nên nghĩ tới phẫu thuật, khi nào có thể phục hồi bảo tồn?',
  'thoat-vi-dia-dem-va-phuong-phap-phuc-hoi',
  'Giải thích ngắn gọn về đĩa đệm, triệu chứng “đỏ cờ”, và lộ trình vận động – thuốc – theo dõi mà nhiều bệnh nhân được bác sĩ gợi ý.',
  'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=1600&h=900&fit=crop&q=75',
  $thoatvi$
<p><strong>Thoát vị đĩa đệm</strong> là tình trạng nhân nhầy đĩa đệm lồi ra sau lỗ liên hợp, có thể chèn ép rễ thần kinh và gây đau lan xuống mông – đùi – bắp chân. Điều quan trọng: <em>đau không phải lúc nào cũng tỉ lệ thuận với mức độ “hỏng” trên hình ảnh học</em> — nhiều người có thoát vị trên MRI nhưng ít triệu chứng, và ngược lại.</p>
<h2>1. Dấu hiệu cần đi khám gấp (cấp cứu / khẩn)</h2>
<ul>
<li>Teo cơ đùi nhanh, yếu kiếng chân, không giữ được nước tiểu hoặc đại tiện.</li>
<li>Đau dữ dội sau chấn thương, sốt, nhiễm trùng nghi ngờ.</li>
</ul>
<h2>2. Phục hồi bảo tồn thường gồm những gì?</h2>
<p>Giai đoạn cấp: giảm tải, thuốc theo chỉ định, tư thế nằm–đi lại an toàn. Giai đoạn bán cấp: thở – mobility nhẹ – đi bộ có kiểm soát. Giai đoạn bền vững: tăng dần tải, hip hinge, squat một phần biên độ, deadlift nhẹ khi đã đủ nền.</p>
<h2>3. Vai trò của huấn luyện viên / phục hồi chức năng</h2>
<p>Người hướng dẫn giúp bạn chọn bài phù hợp mức đau hiện tại, quan sát form và điều chỉnh tốc độ tăng tải — tránh tình trạng “tập quá sớm” hoặc “sợ vận động hoàn toàn”.</p>
<p><small><em>Lưu ý: Bài viết mang tính giáo dục sức khỏe, không thay cho khám – chẩn đoán – điều trị trực tiếp của bác sĩ.</em></small></p>
  $thoatvi$,
  'published',
  timezone('utc', now()) - interval '12 days',
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
    '<p>Mình làm kế toán, ngồi 8 tiếng/ngày, đau âm ỉ vùng thắt lưng gần 2 năm. Sau khóa <strong>Phục hồi lưng cơ bản</strong> mình hiểu rõ hơn về thở, tư thế và các bài mobility — giờ ít phải dán cao hơn, tối về vẫn đi bộ được 20 phút. Cảm ơn thầy Tuấn và team hỗ trợ.</p>',
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
  trailer_url,
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
  'Giảm đau cổ vai gáy, tăng linh hoạt vai–cổ, tối ưu tư thế làm việc tại nhà và văn phòng.',
  'Chương trình 3 module: (1) chỉnh workstation và thói quen micro-break, (2) mobility ngực–bả vai–cổ, (3) activation cơ ổn định bả vai. Phù hợp người làm việc trước màn hình 6–10 giờ/ngày. Video tham khảo YouTube; nội dung bài học và ghi chú được team CSNB biên soạn theo hướng dẫn lâm sàng thông dụng.',
  'Trung cấp',
  'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1200&h=800&fit=crop&q=75',
  'https://www.youtube.com/watch?v=M7lc1UVf-VE',
  1800000,
  60,
  2320,
  3,
  'CKI. Trần Phương Mai',
  'Chuyên gia ergonomics & phục hồi chức năng',
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
  trailer_url = excluded.trailer_url,
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
    'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=1200&h=800&fit=crop&q=75',
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
    'https://www.youtube.com/watch?v=M7lc1UVf-VE',
    'youtube',
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
    'https://youtu.be/v7AYKMP6rOE',
    'youtube',
    'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=1200&h=800&fit=crop&q=75',
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
    'https://www.youtube.com/watch?v=inpok_5PwWU',
    'youtube',
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
  'Đau cổ vai gáy văn phòng: checklist 15 phút mỗi ca làm việc',
  'dau-co-vai-gay-7-thoi-quen',
  'Checklist thực dụng: màn hình, ghế, chuột, điện thoại, micro-break và hai bài mobility “ăn tiền” nhất.',
  'https://images.unsplash.com/photo-1526401485004-2aa6f7301de5?w=1600&h=900&fit=crop&q=75',
  $covai$
<p>Nếu bạn ngồi 7–9 tiếng/ngày, cổ vai gáy “cứng như gỗ” vào cuối tuần là chuyện thường gặp. Phần lớn không phải do một tổn thương lớn đột ngột, mà do <strong>tích lũy vi tổn thương</strong>: cùng một tư thế kéo dài, ít thay đổi góc nhìn, thở nông, vai nâng chronically.</p>
<h2>Chỉnh workstation (5 phút)</h2>
<ul>
<li>Mắt ngang khoảng 1/3 trên màn hình; khoảng cách cánh tay từ mắt đến màn.</li>
<li>Khuỷu tay ~90°, cổ tay thẳng hàng phím; chuột gần bàn phím, không với xa.</li>
<li>Điện thoại: tránh kẹp vai–gọi bằng tai nghe hoặc loa.</li>
</ul>
<h2>Micro-break (mỗi 45–60 phút, 60–90 giây)</h2>
<p>Đứng, đi vài mét, nhún gót, xoay nhẹ vai, nhìn xa cửa sổ. Mục tiêu không phải “tập luyện” giữa giờ, mà <em>đổi pattern cơ</em>.</p>
<h2>Hai bài mobility ngắn (2–3 phút)</h2>
<p>Mở ngực tại khung cửa, chin tuck nhẹ (không gồng cổ), wall angel tốc độ chậm — ưu tiên chất lượng hơn biên độ.</p>
<p><small><em>Nội dung minh họa cho website CSNB; điều chỉnh cá nhân nên có chuyên gia trực tiếp.</em></small></p>
  $covai$,
  'published',
  timezone('utc', now()) - interval '5 days',
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
  '44444444-4444-4444-4444-444444444447',
  id,
  'Hông–mông “cứng”: mobility hay strength trước?',
  'hong-mong-mobility-hay-strength',
  'Thứ tự tập ảnh hưởng tới cảm giác đau và hiệu quả buổi tập — gợi ý framework đơn giản cho người ngồi nhiều.',
  'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1600&h=900&fit=crop&q=75',
  $hong$
<p>Nhiều người bị đau vùng hông–mông khi ngồi lâu hoặc sau khi chạy bộ tăng km đột ngột. Trước khi nhảy vào squat nặng, hãy kiểm tra xem bạn đang thiếu <strong>biên độ</strong> hay thiếu <strong>ổn định</strong>.</p>
<h2>Mobility trước, strength sau — trong cùng buổi</h2>
<p>5–8 phút mở hông (9090, hip flexor stretch nhẹ, glute squeeze) giúp cảm nhận khớp tốt hơn trước khi vào hip hinge có tải.</p>
<h2>Dấu hiệu đang “tải quá sớm”</h2>
<p>Đau nhói lan xuống đùi sau, tê bì, co cứng cơ đùi sau khi khởi động — nên dừng và xin ý kiến chuyên gia.</p>
  $hong$,
  'published',
  timezone('utc', now()) - interval '2 days',
  428
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
  '44444444-4444-4444-4444-444444444448',
  id,
  'Sau sinh và đau thắt lưng: những điều mẹ cần biết trước khi tự tập',
  'sau-sinh-dau-that-lung-me-can-biet',
  'Nồng độ relaxin, thay đổi tư thế bế bé, thiếu ngủ — và cách quay lại tập an toàn.',
  'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=1600&h=900&fit=crop&q=75',
  $sinh$
<p>Giai đoạn hậu sản, cơ thể vẫn trong quá trình hồi phục. Đau lưng có thể liên quan tư thế cho con bú, nâng nôi, hoặc thiếu ngủ làm giảm ngưỡng chịu đau.</p>
<h2>Nguyên tắc chung</h2>
<ul>
<li>Ưu tiên hơi thở, tái lập áp lực nội bụng nhẹ dưới sự hướng dẫn.</li>
<li>Tránh gập sâu có tải sớm; tăng dần đi bộ, mobility đùi–hông.</li>
<li>Tái khám theo lịch sản khoa trước khi tự tăng cường độ.</li>
</ul>
<p><small><em>Bài viết tham khảo; mỗi ca sau sinh khác nhau — luôn tuân theo chỉ định bác sĩ của bạn.</em></small></p>
  $sinh$,
  'published',
  timezone('utc', now()) - interval '1 day',
  1563
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
  ),
  (
    '55555555-5555-5555-5555-555555555559',
    '11111111-1111-1111-1111-111111111111',
    'email',
    'Anh Đức Huy',
    'duchuy.work@gmail.com',
    null,
    5,
    '<p>Mình làm IT, trước hay bị co cứng vai gáy chiều thứ 6. Sau 6 tuần theo checklist workstation + 2 buổi mobility/tuần trong khóa, giờ chỉ còn mỏi nhẹ nếu làm deadline quá khuya. Cảm ơn team đã trả lời Zalo rất nhanh.</p>',
    'reviewed',
    true
  ),
  (
    '55555555-5555-5555-5555-55555555555a',
    null,
    'website',
    'Chị Thuỳ Linh',
    'thuylinh_88@yahoo.com',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=160&h=160&fit=crop&q=75',
    5,
    '<p>Mình mua gói cổ vai gáy cho chồng. Ảnh bảo video YouTube xem được trên TV, dễ tập theo. Mong thêm phụ đề tiếng Việt trên một số bài nước ngoài thì tuyệt.</p>',
    'new',
    true
  ),
  (
    '55555555-5555-5555-5555-55555555555b',
    '11111111-1111-1111-1111-111111111112',
    'zalo',
    'Cô Hạnh (58 tuổi)',
    null,
    null,
    4,
    '<p>Tập chậm, giảng viên nhắc hơi thở kỹ. Mình hơi lo vì thoái hoá cột sống nhưng được coach nhắn riêng giảm biên độ — an tâm hơn hẳn so với tự xem clip trên mạng.</p>',
    'pinned',
    true
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
