## Supabase Online (recommended)

### Prerequisites
- Một project Supabase trên cloud
- Lấy API keys trong Supabase Dashboard -> Project Settings -> API

### Set `.env.local`

```bash
cp .env.example .env.local
```

Set các biến:

- `NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY=...` (hoặc `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`)
- `SUPABASE_SERVICE_ROLE_KEY=...` (nếu dùng admin API routes ở `app/api/admin/*`)

### Seed auth users (optional)

```bash
npm run seed:auth:remote
```

Có thể override email/password bằng env:

```bash
SEED_REMOTE_SUPABASE=true \
SEED_AUTH_PASSWORD='StrongPassword123!' \
SEED_ADMIN_EMAIL='admin@example.com' \
SEED_USER1_EMAIL='user1@example.com' \
SEED_USER2_EMAIL='user2@example.com' \
node scripts/seed-local-auth.js
```

### Notes
- Schema nằm ở `supabase/migrations/*` và seed ở `supabase/seed.sql`.
- `supabase/schema.sql` là bản tổng hợp tham khảo (đồng bộ với migration).
- Dummy seed script cho feedback + blog nằm ở `supabase/snippets/seed_dummy_feedbacks_and_blog.sql` (chạy trong Supabase SQL Editor khi cần dữ liệu demo nhanh).

