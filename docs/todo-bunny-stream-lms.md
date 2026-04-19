# Todo — Bunny Stream cho video LMS (start tuần sau)

Mục tiêu: video học trên **Bunny Stream**; Supabase giữ user, enrollment, metadata lesson. Server ký playback URL; client không thấy API key Bunny.

## Checklist

- [ ] **Env + module ký** — Thêm biến vào `.env.example` (không commit secret): `BUNNY_STREAM_LIBRARY_ID`, `BUNNY_STREAM_API_KEY`, key token theo [Bunny Stream Token authentication](https://docs.bunny.net/docs/stream-token-authentication). Tạo `lib/bunny/stream-signing.ts` (server-only): nhận `videoId` + `expiresAt` → token/query đúng docs Bunny.
- [ ] **Quy ước DB lesson** — `video_provider = 'bunny_stream'`, `video_url` = **Video GUID** từ Bunny (hoặc migration thêm `bunny_video_guid` nếu muốn tách). Tuỳ chọn sau: webhook / `encoding_status`.
- [ ] **View model + API enrolled** — Trong `lib/lms/build-lms-course-view-model.ts` (hoặc wrapper sau build): với lesson `bunny_stream`, output `videoUrl` = **signed playback URL** (TTL 30–120 phút). Cập nhật types `lib/lms/types.ts`. Chỉ sau khi đã có enrollment (flow hiện tại `GET /api/me/courses/[courseId]`).
- [ ] **Player** — `components/lms/lesson-video-player.tsx`: prop `videoProvider` (hoặc tương đương); nhánh Bunny = iframe embed (hoặc HLS nếu chọn manifest). Giữ YouTube + MP4.
- [ ] **Trang lesson LMS** — Truyền `videoProvider` từ dữ liệu course (file dưới `app/(lms)/hoc-cua-toi/...`).
- [ ] **Next / CSP** — `next.config.ts`: `images.remotePatterns` nếu poster từ Bunny CDN. CSP: `frame-src` / `media-src` cho hostname Stream.
- [ ] **MVP ingest** — Có thể gán GUID tay (dashboard Bunny + Supabase). **Sau MVP:** `PATCH /api/admin/lessons/[id]` cho `video_url` / `video_provider`; hoặc upload TUS + webhook `POST /api/webhooks/bunny`.

## Kiểm thử nhanh

- [ ] Lesson YouTube / MP4: không đổi.
- [ ] Lesson `bunny_stream` + user đã enroll: phát được; hết hạn token → refetch course API.
- [ ] User chưa enroll: không có bundle (404 như hiện tại).

## File tham chiếu trong repo

- Schema: `supabase/migrations/20260416021355_initial_schema.sql` (`lessons.video_url`, `video_provider`)
- Model: `lib/lms/build-lms-course-view-model.ts`
- API course: `app/api/me/courses/[courseId]/route.ts`
- Player: `components/lms/lesson-video-player.tsx`

---

*Ghi chú: đối chiếu thuật toán token với docs Bunny bản bạn dùng — implement tập trung một chỗ trong module signing.*
