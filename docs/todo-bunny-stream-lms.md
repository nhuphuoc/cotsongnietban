# Todo — Bunny Stream cho video LMS

Mục tiêu: video học trên **Bunny Stream**; Supabase giữ user, enrollment, metadata lesson. Server ký playback URL; client không thấy API key Bunny.

## Đã triển khai (không cần API key)

- [x] **Env** — `.env.example` có các biến Bunny (commented): `BUNNY_STREAM_LIBRARY_ID`, `BUNNY_STREAM_API_KEY`, `BUNNY_STREAM_TOKEN_KEY`, `BUNNY_STREAM_TOKEN_TTL_SEC`, `BUNNY_STREAM_EMBED_HOST`, `BUNNY_STREAM_CDN_HOSTNAME`.
- [x] **Module ký (server-only)** — `lib/bunny/stream-signing.ts`: `signBunnyStreamEmbedUrl(guidOrUrl)` tạo `https://iframe.mediadelivery.net/embed/{libraryId}/{guid}?token=…&expires=…` theo [Bunny Stream token authentication](https://docs.bunny.net/stream/token-authentication). TTL mặc định 3600s, override qua `BUNNY_STREAM_TOKEN_TTL_SEC`. Trả `null` nếu thiếu env hoặc GUID không hợp lệ.
- [x] **Types LMS** — `lib/demo-courses.ts`: thêm `LessonVideoProvider = "youtube" | "mp4" | "bunny_stream"` và field `videoProvider?` trên `DemoLesson`.
- [x] **View model** — `lib/lms/build-lms-course-view-model.ts`: nếu `lessons.video_provider = 'bunny_stream'` và có `video_url` (GUID hoặc URL Bunny), trả `videoUrl` = signed embed URL + `videoProvider = 'bunny_stream'`. Thiếu env → fallback MP4 demo, không break UI.
- [x] **Player** — `components/lms/lesson-video-player.tsx`: prop `provider`. Khi `bunny_stream` → iframe; còn lại giữ auto-detect YouTube + HTML5 player.
- [x] **Trang lesson** — `app/(lms)/courses/[courseId]/lessons/[lessonId]/page.tsx` và `components/learning/public-hoc-lesson-client.tsx`: truyền `provider={lesson.videoProvider}`.
- [x] **Next images** — `next.config.ts`: `remotePatterns` thêm `*.b-cdn.net` cho poster Bunny CDN.

## Cần làm sau khi có API key Bunny

- [ ] Điền vào `.env.local` / Vercel env:
  - `BUNNY_STREAM_LIBRARY_ID=...`
  - `BUNNY_STREAM_TOKEN_KEY=...` (Library → Security → Token Authentication Key)
  - `BUNNY_STREAM_API_KEY=...` (API key — chỉ cần nếu chạy admin/upload phía server)
  - (Tuỳ) `BUNNY_STREAM_CDN_HOSTNAME=vz-xxxxxxxx-xxx.b-cdn.net`
- [ ] **Bật Token Authentication** trong Bunny Stream Library → Security.
- [ ] **Upload 1 video test** và gán vào 1 lesson:
  ```sql
  update public.lessons
  set video_provider = 'bunny_stream',
      video_url = '<video-guid-from-bunny>'
  where id = '<lesson-id>';
  ```
- [ ] **Kiểm thử**:
  - Lesson YouTube / MP4: không đổi.
  - Lesson `bunny_stream` + user đã enroll: phát được; hết hạn token → refetch `/api/me/courses/[courseId]`.
  - User chưa enroll: không có bundle (404 như hiện tại).

## Cải tiến về sau (sau MVP)

- [ ] Admin API `PATCH /api/admin/lessons/[id]` để chỉnh `video_url` / `video_provider` qua UI.
- [ ] Upload TUS trực tiếp từ admin + webhook `POST /api/webhooks/bunny` để cập nhật `duration_seconds` / trạng thái encoding.
- [ ] CSP tuỳ biến (hiện chưa có) khi triển khai: `frame-src https://iframe.mediadelivery.net`, `media-src https://*.b-cdn.net` nếu cần.

## File tham chiếu

- Schema: `supabase/migrations/20260416021355_initial_schema.sql` (`lessons.video_url`, `video_provider`)
- Module ký: `lib/bunny/stream-signing.ts`
- View model: `lib/lms/build-lms-course-view-model.ts`
- API course: `app/api/me/courses/[courseId]/route.ts`
- Player: `components/lms/lesson-video-player.tsx`
