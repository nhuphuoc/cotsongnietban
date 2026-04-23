# DB Schema Planning (Course + Blog + Feedback)

## Scope
- Muc tieu: thiet ke schema don gian, de van hanh, de mo rong.
- Gom 3 domain: Course, Blog, Feedback.
- Khong dua author vao model Course; Blog cung de o muc toi gian (khong bat buoc author_id).
- Tat ca bang deu co created_at, updated_at (trong feedback bo sung them updated_at).

## 1) Course Domain

### 1.1 courses
Muc dich: bang trung tam cua khoa hoc (identity + publish + pricing + access + marketing co ban).

Cot de xuat:
- id uuid pk
- slug text not null unique
- title text not null
- short_description text null
- description text null
- extra_info text null
  (phan "Thong tin them / Ban se hoc duoc gi?" gom trong 1 khoi noi dung de don gian)
- thumbnail_url text null
- hero_image_url text null
- trailer_url text null
- price_vnd bigint not null default 0 check (price_vnd >= 0)
- access_duration_days integer null check (access_duration_days > 0)
- access_note text null
  (vd: "Truy cap theo thoi han goi da mua")
- status publication_status not null default 'draft'
- published_at timestamptz null
- is_featured boolean not null default false
- created_at timestamptz not null default timezone('utc', now())
- updated_at timestamptz not null default timezone('utc', now())

Ghi chu:
- Bo level_label (khong con "Trung cap").
- "Thoi han khoa hoc" dung cap access_duration_days + access_note.

### 1.2 course_sections
Muc dich: phan/module cua khoa hoc.

Cot de xuat:
- id uuid pk
- course_id uuid not null fk -> courses(id) on delete cascade
- title text not null
- slug text not null
- sort_order integer not null
- created_at timestamptz not null default timezone('utc', now())
- updated_at timestamptz not null default timezone('utc', now())

Rang buoc:
- unique (course_id, slug)
- unique (course_id, sort_order)

### 1.3 lessons
Muc dich: bai hoc/video trong khoa hoc.

Cot de xuat:
- id uuid pk
- course_id uuid not null fk -> courses(id) on delete cascade
- section_id uuid null fk -> course_sections(id) on delete set null
- title text not null
- slug text not null
- summary text null
- content_html text null
- kind lesson_kind not null default 'video'
- video_provider text null
- video_url text null
- duration_seconds integer not null default 0 check (duration_seconds >= 0)
- is_preview boolean not null default false
- is_published boolean not null default false
- sort_order integer not null
- created_at timestamptz not null default timezone('utc', now())
- updated_at timestamptz not null default timezone('utc', now())

Rang buoc:
- unique (course_id, slug)
- unique (course_id, sort_order)

### 1.4 Danh gia trang thai hien tai (Course)
- On: lifecycle draft/published/archived da co.
- Can chinh:
  - level_label nen bo.
  - created_by nen bo neu khong can tac gia.
  - instructor_name/instructor_title co the bo neu UI khong hien thi giang vien.
  - Neu giu lesson_count, total_duration_seconds tren courses thi xem la "cache field" (khong phai source of truth).

## 2) Blog Domain

### 2.1 blog_categories
Muc dich: phan loai bai viet.

Cot de xuat:
- id uuid pk
- name text not null
- slug text not null unique
- description text null
- sort_order integer not null default 0
- created_at timestamptz not null default timezone('utc', now())
- updated_at timestamptz not null default timezone('utc', now())

### 2.2 blog_posts
Muc dich: bai viet public.

Cot de xuat (toi gian):
- id uuid pk
- category_id uuid null fk -> blog_categories(id) on delete set null
- title text not null
- slug text not null unique
- excerpt text null
- cover_image_url text null
- content_html text not null default ''
- status publication_status not null default 'draft'
- published_at timestamptz null
- view_count integer not null default 0 check (view_count >= 0)
- created_at timestamptz not null default timezone('utc', now())
- updated_at timestamptz not null default timezone('utc', now())

Ghi chu:
- author_id la optional; de don gian co the bo hẳn.

### 2.3 Danh gia trang thai hien tai (Blog)
- On: schema hien tai kha tot, da co status + published_at + updated_at.
- Can chinh nhe:
  - Neu khong dung tac gia: bo author_id.
  - Can trigger updated_at (hien da co, dat yeu cau).

## 3) Feedback Domain

### 3.1 feedbacks
Muc dich: testimonial/comment/before-after hien thi social proof.

Cot de xuat:
- id uuid pk
- type text not null check (type in ('before_after', 'testimonial', 'comment'))
- customer_name text null
- customer_info text null
- content text null
- avatar_url text null
- is_active boolean not null default true
- sort_order integer not null default 0
- created_at timestamptz not null default timezone('utc', now())
- updated_at timestamptz not null default timezone('utc', now())

### 3.2 feedback_media
Muc dich: luu danh sach anh/video cho 1 feedback (thay vi image_url_1, image_url_2).

Cot de xuat:
- id uuid pk
- feedback_id uuid not null fk -> feedbacks(id) on delete cascade
- media_type text not null check (media_type in ('image', 'video'))
- media_url text not null
- alt_text text null
- sort_order integer not null default 0
- created_at timestamptz not null default timezone('utc', now())
- updated_at timestamptz not null default timezone('utc', now())

Rang buoc:
- unique (feedback_id, sort_order)

### 3.3 Danh gia trang thai hien tai (Feedback)
- Chua on:
  - feedbacks hien tai chi co created_at, chua co updated_at.
  - image_url_1, image_url_2 khong mo rong tot.
- De xuat:
  - Bo image_url_1, image_url_2.
  - Tach feedback_media.
  - Them trigger updated_at cho feedbacks va feedback_media.

## 4) Enum va Index de nghi

### 4.1 Enum
- publication_status: draft, published, archived
- lesson_kind: video, article, download, live

### 4.2 Index
Course:
- idx_courses_status_featured on courses(status, is_featured, published_at desc)
- idx_course_sections_course_sort on course_sections(course_id, sort_order)
- idx_lessons_course_sort on lessons(course_id, sort_order)

Blog:
- idx_blog_posts_status_published on blog_posts(status, published_at desc)

Feedback:
- idx_feedbacks_type_active on feedbacks(type, is_active, created_at desc)
- idx_feedback_media_feedback_sort on feedback_media(feedback_id, sort_order)

## 5) Ket luan "da on chua?"
- Course: chua on hoan toan theo UI moi, can bo level_label va them cap thoi han truy cap + extra_info.
- Blog: gan nhu on, chi can quyet dinh giu/bo author_id.
- Feedback: chua on, can bo sung updated_at va doi model anh sang feedback_media.

## 6) Migration Strategy (high-level, chua code)
1. Them cot/bang moi (backward compatible).
2. Backfill du lieu cu:
   - level_label -> bo khong can map
   - image_url_1,image_url_2 -> feedback_media
3. Update API/doc/admin form de doc ghi schema moi.
4. Chay dual-read ngan han (neu can), sau do remove cot cu.
5. Tao index va trigger updated_at cho bang moi.
