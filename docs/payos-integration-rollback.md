# PayOS Integration — Rollback Guide

> Ngày: 2026-05-02 | Branch: `feature/payos` | 63 tests passed ✅

---

## 🔄 Cách rollback toàn bộ

```bash
# Cách 1: Revert branch về main
git checkout main
git branch -D feature/payos

# Cách 2: Revert từng thay đổi (nếu đã merge)
git revert <commit-hash>
```

---

## 📁 File đã tạo mới (xóa để rollback)

| # | File | Mục đích |
|---|------|----------|
| 1 | `app/api/checkout/payos/route.ts` | API tạo PayOS payment link |
| 2 | `app/api/checkout/payos/route.test.ts` | Unit test cho route trên |
| 3 | `app/api/webhook/payos/route.ts` | Webhook nhận callback từ PayOS |
| 4 | `app/api/webhook/payos/route.test.ts` | Unit test cho webhook |
| 5 | `lib/payos.ts` | PayOS SDK singleton + env validation |
| 6 | `lib/api/enrollments.ts` | Helper `activateEnrollmentForOrder()` |
| 7 | `lib/api/enrollments.test.ts` | Unit test cho helper |
| 8 | `hooks/useOrderRealtime.ts` | Realtime hook lắng nghe order status |
| 9 | `supabase/migrations/20260502120000_add_payos_to_orders.sql` | Migration thêm cột PayOS |

```bash
# Xóa tất cả file mới
rm -rf app/api/checkout app/api/webhook
rm lib/payos.ts lib/api/enrollments.ts lib/api/enrollments.test.ts
rm hooks/useOrderRealtime.ts
rm supabase/migrations/20260502120000_add_payos_to_orders.sql
```

---

## 📝 File đã sửa (revert từng phần)

### 1. `package.json` + `package-lock.json`
**Thay đổi:** Thêm `@payos/node` dependency
```bash
npm uninstall @payos/node
```

### 2. `.env.example`
**Thay đổi:** Thêm block PayOS env vars (giữa `BUNNY_STREAM_CDN_HOSTNAME` và `# Phòng học LMS`)
Xóa đoạn:
```
# PayOS — Thanh toán tự động qua PayOS (https://my.payos.vn)
...
PAYOS_CHECKSUM_KEY=
```

### 3. `app/api/admin/orders/[id]/approve/route.ts`
**Thay đổi:** Refactor inline enrollment logic → gọi `activateEnrollmentForOrder()`
- Đã xóa: `body.startsAt`, `items.map(...)`, `upsert enrollments`
- Đã thêm: `import { activateEnrollmentForOrder }` + gọi helper
- **Rollback:** Khôi phục code inline từ git history `git show main:app/api/admin/orders/[id]/approve/route.ts`

### 4. `components/marketing/course-enrollment-checkout.tsx`
**Thay đổi:**
- Thêm import: `useRouter`, `CreditCard`
- Thêm type `PayOSResult`
- Thêm prop `priceVnd: number`
- Thêm state `payosLoading`
- Thêm function `payWithPayos()`
- Thêm UI: nút xanh PayOS + divider "hoặc" + nút cam cũ

### 5. `app/(public)/checkout/[courseId]/page.tsx`
**Thay đổi:** Thêm prop `priceVnd={...}` vào `<CourseEnrollmentCheckout>`

### 6. `supabase/migrations/20260423010000_align_courses_lessons_simple.sql`
**Thay đổi:** Wrap `delete from storage.buckets` vào `DO $$ ... EXCEPTION` block (fix lỗi push migration, không liên quan PayOS)

---

## 🗄️ Database — Rollback migration

Các cột đã thêm vào bảng `orders` trên Supabase:
```sql
-- Rollback migration (chạy trên Supabase SQL Editor)
ALTER TABLE public.orders
  DROP COLUMN IF EXISTS payos_order_code,
  DROP COLUMN IF EXISTS checkout_url,
  DROP COLUMN IF EXISTS paid_at;

DROP INDEX IF EXISTS orders_payos_order_code_key;
```

---

## 🔑 Env vars cần xóa khỏi `.env.local`

```bash
PAYOS_CLIENT_ID
PAYOS_API_KEY
PAYOS_CHECKSUM_KEY
```

---

## 📊 Flow cũ vs mới

| | Bank Transfer (cũ) | PayOS (mới) |
|---|---|---|
| API endpoint | `POST /api/orders` | `POST /api/checkout/payos` |
| Phân biệt | `payment_method = 'bank_transfer'` | `payment_method = 'payos'` |
| Duyệt đơn | Admin thủ công | Webhook tự động |
| UI button | "Tạo đơn & nhận mã QR" | "Thanh toán qua PayOS (tự động)" |
| File chính | `app/api/orders/route.ts` | `app/api/checkout/payos/route.ts` |

> **Ghi chú:** Flow cũ (`bank_transfer`) vẫn hoạt động song song, không bị ảnh hưởng.
