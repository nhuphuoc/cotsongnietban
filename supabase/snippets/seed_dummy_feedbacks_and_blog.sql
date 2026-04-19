BEGIN;

-- =========================================================
-- A) FEEDBACKS (new schema)
-- =========================================================
-- Safe cleanup: only remove records marked as [DUMMY]
DELETE FROM public.feedbacks
WHERE customer_info ILIKE '%[DUMMY]%';

INSERT INTO public.feedbacks (
  type,
  customer_name,
  customer_info,
  content,
  avatar_url,
  image_url_1,
  image_url_2,
  is_active,
  created_at
)
VALUES
(
  'before_after',
  'Nguyen Van An',
  '34 tuoi, thoat vi L4-L5 [DUMMY]',
  'Sau 10 tuan tap luyen, kha nang cui gap va di lai da on dinh hon.',
  NULL,
  'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=900&h=1200&fit=crop',
  'https://images.unsplash.com/photo-1581009137042-c552e485697a?w=900&h=1200&fit=crop',
  true,
  now() - interval '30 days'
),
(
  'before_after',
  'Tran Thi Bich',
  '41 tuoi, dau lung man tinh [DUMMY]',
  'Muc do dau giam ro sau 8 tuan va ngu ngon hon.',
  NULL,
  'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=900&h=1200&fit=crop',
  'https://images.unsplash.com/photo-1549476464-37392f717541?w=900&h=1200&fit=crop',
  true,
  now() - interval '22 days'
),
(
  'before_after',
  'Le Minh Chau',
  '29 tuoi, cang cung vai gay [DUMMY]',
  'Tang bien do van dong va giam te tay sau 6 tuan.',
  NULL,
  'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=900&h=1200&fit=crop',
  'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=900&h=1200&fit=crop',
  true,
  now() - interval '15 days'
),
(
  'testimonial',
  'Chi Lan Anh',
  'Nhan vien van phong, 34 tuoi [DUMMY]',
  'Toi da ngoi lam viec lau hon ma khong con moi lung nhu truoc.',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop',
  NULL,
  NULL,
  true,
  now() - interval '12 days'
),
(
  'testimonial',
  'Anh Minh Tuan',
  'HLV phong gym, 28 tuoi [DUMMY]',
  'Gia tri lon nhat la toi hieu co the va tap dung ky thuat dung.',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
  NULL,
  NULL,
  true,
  now() - interval '10 days'
),
(
  'testimonial',
  'Co Thu Huong',
  'Giao vien, 42 tuoi [DUMMY]',
  'Dung lop nhieu tiet lien tuc van de chiu hon rat nhieu.',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop',
  NULL,
  NULL,
  true,
  now() - interval '8 days'
),
(
  'testimonial',
  'Anh Quoc Hung',
  'Tai xe, 39 tuoi [DUMMY]',
  'Lich tap de theo, coach theo sat, cam thay tien trien ro.',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop',
  NULL,
  NULL,
  false,
  now() - interval '6 days'
),
(
  'comment',
  'Pham Gia Bao',
  'Hoc vien khoa co ban [DUMMY]',
  'Hom nay tap bai 4 xong thay de nguoi hon ha.',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=900&h=600&fit=crop',
  NULL,
  true,
  now() - interval '5 days'
),
(
  'comment',
  'Doan Kim Ngan',
  'Hoc vien online [DUMMY]',
  'Cam on coach da sua form, tap khong con dau nhu truoc.',
  'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=900&h=600&fit=crop',
  NULL,
  true,
  now() - interval '3 days'
),
(
  'comment',
  'Nguyen Huu Phuc',
  'Hoc vien nang cao [DUMMY]',
  'Tien do tuan nay rat tot, tiep tuc giu nhip tap.',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=900&h=600&fit=crop',
  NULL,
  true,
  now() - interval '2 days'
),
(
  'comment',
  'Le Hoang Mai',
  'Hoc vien VIP [DUMMY]',
  'Da bot dau co lung sau 3 buoi lien tiep.',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop',
  NULL,
  NULL,
  false,
  now() - interval '1 day'
);

-- =========================================================
-- B) BLOG (new schema)
-- =========================================================
-- Remove prior dummy rows by slug convention
DELETE FROM public.blog_posts
WHERE slug LIKE 'dummy-%';

DELETE FROM public.blog_categories
WHERE slug LIKE 'dummy-%';

INSERT INTO public.blog_categories (
  name,
  slug,
  description,
  sort_order,
  created_at,
  updated_at
)
VALUES
  ('Lieu Phap', 'dummy-lieu-phap', 'Nhom bai viet ve phuong phap phuc hoi chuc nang [DUMMY]', 10, now(), now()),
  ('Dau Lung', 'dummy-dau-lung', 'Nhom bai viet ve dau lung va cot song [DUMMY]', 20, now(), now()),
  ('Kien Thuc', 'dummy-kien-thuc', 'Nhom bai viet kien thuc nen tang [DUMMY]', 30, now(), now())
ON CONFLICT (slug) DO UPDATE
SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  sort_order = EXCLUDED.sort_order,
  updated_at = now();

INSERT INTO public.blog_posts (
  category_id,
  author_id,
  title,
  slug,
  excerpt,
  cover_image_url,
  content_html,
  status,
  published_at,
  view_count,
  created_at,
  updated_at
)
VALUES
(
  (SELECT id FROM public.blog_categories WHERE slug = 'dummy-lieu-phap'),
  NULL,
  'Thoat vi dia dem: Lo trinh phuc hoi 12 tuan',
  'dummy-thoat-vi-dia-dem-lo-trinh-12-tuan',
  'Tom tat lo trinh 12 tuan cho nguoi moi bat dau [DUMMY]',
  'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=1200&h=675&fit=crop',
  '<h2>Giai doan 1: Giam kich thich</h2><p>Uu tien bai tap nhe, tap trung hoi tho va kiem soat cot song.</p><h2>Giai doan 2: Khoi phuc van dong</h2><p>Tang dan bien do van dong va on dinh core.</p><h2>Giai doan 3: Tai hoa nhap</h2><p>Tro lai sinh hoat va tap luyen theo muc tieu.</p><p><em>Noi dung demo [DUMMY]</em></p>',
  'published',
  now() - interval '20 days',
  186,
  now() - interval '21 days',
  now() - interval '20 days'
),
(
  (SELECT id FROM public.blog_categories WHERE slug = 'dummy-dau-lung'),
  NULL,
  '5 sai lam khien dau lung keo dai',
  'dummy-5-sai-lam-khien-dau-lung-keo-dai',
  'Nhung loi pho bien trong sinh hoat va tap luyen can tranh [DUMMY]',
  'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200&h=675&fit=crop',
  '<h2>Sai lam 1: Nghi ngoi hoan toan</h2><p>Nghi ngoi qua muc co the lam co yeu di.</p><h2>Sai lam 2: Tap qua suc</h2><p>Can tang tai tu tu va dung ky thuat.</p><h2>Sai lam 3: Bo qua giac ngu</h2><p>Giac ngu kem lam giam kha nang phuc hoi.</p><p><em>Noi dung demo [DUMMY]</em></p>',
  'published',
  now() - interval '14 days',
  129,
  now() - interval '15 days',
  now() - interval '14 days'
),
(
  (SELECT id FROM public.blog_categories WHERE slug = 'dummy-kien-thuc'),
  NULL,
  'Functional movement la gi va vi sao quan trong?',
  'dummy-functional-movement-la-gi',
  'Tong quan ve movement quality trong phuc hoi cot song [DUMMY]',
  'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=1200&h=675&fit=crop',
  '<h2>Movement quality</h2><p>Uu tien chat luong truoc so luong.</p><h2>Breathing va core</h2><p>Hoi tho dung giup on dinh than minh.</p><h2>Tien trien ben vung</h2><p>Lap ke hoach tap luyen theo chu ky.</p><p><em>Noi dung demo [DUMMY]</em></p>',
  'published',
  now() - interval '9 days',
  84,
  now() - interval '10 days',
  now() - interval '9 days'
),
(
  (SELECT id FROM public.blog_categories WHERE slug = 'dummy-lieu-phap'),
  NULL,
  'Checklist tu danh gia truoc khi bat dau tap',
  'dummy-checklist-tu-danh-gia-truoc-khi-tap',
  'Mau checklist don gian giup tu theo doi trieu chung [DUMMY]',
  'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=1200&h=675&fit=crop',
  '<h2>Muc do dau</h2><p>Danh gia thang diem 0-10 truoc va sau buoi tap.</p><h2>Pham vi van dong</h2><p>Ghi chu cac dong tac bi han che.</p><h2>Giac ngu</h2><p>Danh gia chat luong giac ngu hang dem.</p><p><em>Noi dung demo [DUMMY]</em></p>',
  'draft',
  NULL,
  0,
  now() - interval '3 days',
  now() - interval '2 days'
)
ON CONFLICT (slug) DO UPDATE
SET
  category_id = EXCLUDED.category_id,
  title = EXCLUDED.title,
  excerpt = EXCLUDED.excerpt,
  cover_image_url = EXCLUDED.cover_image_url,
  content_html = EXCLUDED.content_html,
  status = EXCLUDED.status,
  published_at = EXCLUDED.published_at,
  view_count = EXCLUDED.view_count,
  updated_at = now();

COMMIT;
