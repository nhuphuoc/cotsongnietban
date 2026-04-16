## Local Supabase (dev)

### Prerequisites
- Docker đang chạy
- Supabase CLI (repo đã có `supabase` trong `devDependencies`)

### Start

```bash
npm run supabase:start
npm run supabase:status
```

### Set `.env.local`

Copy `.env.example` → `.env.local`, sau đó set:

- `NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY=...` (từ `npm run supabase:status`)
- `SUPABASE_SERVICE_ROLE_KEY=...` (chỉ cần nếu gọi các admin API routes ở `app/api/admin/*`)

### Reset DB (apply migrations + seed)

```bash
npm run supabase:reset
```

### Notes
- Schema nằm ở `supabase/migrations/*` và seed ở `supabase/seed.sql`.
- `supabase/schema.sql` là bản tổng hợp tham khảo (đồng bộ với migration).

