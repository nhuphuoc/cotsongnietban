# Email Notification — Kế hoạch triển khai

> Ngày: 2026-06-21 | Trạng thái: Planning

---

## 1. Chọn dịch vụ gửi email

### Đề xuất: **Resend** ([resend.com](https://resend.com))

| Tiêu chí | Resend | Brevo | SendGrid |
|---|---|---|---|
| Free tier | 100 emails/ngày | 300 emails/ngày | 100 emails/ngày |
| React Email | ✅ Tích hợp sẵn | ❌ | ❌ |
| SDK Node.js | `resend` | `@getbrevo/brevo` | `@sendgrid/mail` |
| Giao diện Việt | Tiếng Anh | Tiếng Anh | Tiếng Anh |
| Setup domain | Có hướng dẫn | Có hướng dẫn | Phức tạp hơn |
| Giá sau free | $20/50k emails | $25/20k emails | $19.95/50k emails |

**Lý do chọn Resend:**
- Tích hợp **React Email** — viết template bằng React component, preview được ngay
- SDK đơn giản: `resend.emails.send({...})`
- Hỗ trợ domain tùy chỉnh (`@cotsongnietban.vn`)
- Có webhook để track bounce/complaint

### Biến môi trường cần thêm
```bash
# .env.local
RESEND_API_KEY=re_xxxxxxxxxxxxx
RESEND_FROM_EMAIL=noreply@cotsongnietban.vn
```

---

## 2. Các loại email cần gửi

### Nhóm A: Transactional (bắt buộc)

| # | Email | Trigger | Độ ưu tiên |
|---|---|---|---|
| A1 | **Xác nhận đơn hàng** | Sau khi tạo order thành công (PayOS hoặc admin duyệt) | 🔴 Cao |
| A2 | **Thanh toán thành công** | Webhook PayOS `paid` hoặc admin approve | 🔴 Cao |
| A3 | **Thanh toán thất bại / hết hạn** | Webhook PayOS `cancelled` / `expired` | 🟡 Trung bình |
| A4 | **Kích hoạt khóa học** | Sau khi enrollment được active | 🔴 Cao |

### Nhóm B: Account (nên có)

| # | Email | Trigger | Độ ưu tiên |
|---|---|---|---|
| B1 | **Chào mừng** | Sau khi user đăng ký + xác thực email | 🟡 Trung bình |
| B2 | **Đặt lại mật khẩu** | Đã có sẵn qua Supabase Auth | ✅ Done |

### Nhóm C: Course engagement (cải thiện retention)

| # | Email | Trigger | Độ ưu tiên |
|---|---|---|---|
| C1 | **Nhắc học** | 3 ngày không login / không có tiến độ mới | 🟢 Thấp |
| C2 | **Sắp hết hạn khóa học** | 7 ngày / 3 ngày / 1 ngày trước khi hết hạn | 🟢 Thấp |
| C3 | **Khóa học mới** | Admin publish khóa học mới (optional: user đã mua khóa trước đó) | 🟢 Thấp |

### Nhóm D: Admin alerts

| # | Email | Trigger | Độ ưu tiên |
|---|---|---|---|
| D1 | **Có đơn hàng mới** | Order status = `pending` | 🟡 Trung bình |
| D2 | **User đăng ký mới** | Trigger `auth.users` insert | 🟢 Thấp |

---

## 3. Kiến trúc kỹ thuật

```
┌─────────────────────────────────────────────────────┐
│                    Trigger                           │
│  Webhook PayOS / Server Action / DB Trigger          │
└─────────────────────┬───────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────┐
│              lib/email/send.ts                        │
│  ┌───────────────┐  ┌──────────────────────────┐    │
│  │ Resend SDK     │  │ Queue + Retry (optional) │    │
│  │ resend.emails  │  │ email_logs table         │    │
│  │ .send({...})   │  │ status: sent/failed      │    │
│  └───────────────┘  └──────────────────────────┘    │
└─────────────────────┬───────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────┐
│           lib/email/templates/                        │
│  React Email components:                             │
│  ├── order-confirmation.tsx                          │
│  ├── payment-success.tsx                             │
│  ├── course-activated.tsx                            │
│  ├── welcome.tsx                                     │
│  └── layout.tsx (wrapper chung)                      │
└─────────────────────────────────────────────────────┘
```

### Cấu trúc thư mục mới
```
lib/
  email/
    send.ts              # Hàm gửi email (wrapper Resend)
    templates/
      layout.tsx         # Layout email chung (header/footer)
      order-confirmation.tsx
      payment-success.tsx
      course-activated.tsx
      welcome.tsx
    types.ts             # Các type cho email
emails/                  # Preview React Email (dev)
  preview.tsx
```

---

## 4. Database — Bảng `email_logs`

```sql
create table public.email_logs (
  id uuid primary key default gen_random_uuid(),
  recipient text not null,            -- email người nhận
  subject text not null,              -- tiêu đề email
  template text not null,             -- tên template: 'order_confirmation', 'welcome', ...
  resend_id text,                     -- Resend message ID (để track)
  status text not null default 'queued' check (status in ('queued', 'sent', 'failed', 'bounced')),
  error_message text,                 -- Lỗi nếu có
  metadata jsonb default '{}',       -- context data (order_id, course_id, ...)
  created_at timestamptz not null default timezone('utc', now()),
  sent_at timestamptz
);

create index idx_email_logs_recipient on public.email_logs(recipient);
create index idx_email_logs_status on public.email_logs(status);
```

---

## 5. Kế hoạch triển khai (theo phase)

### Phase 1: Setup cơ bản (1-2 ngày)

- [ ] **1.1** Đăng ký Resend, verify domain `cotsongnietban.vn`
- [ ] **1.2** Thêm `RESEND_API_KEY`, `RESEND_FROM_EMAIL` vào `.env.local` + `.env.example`
- [ ] **1.3** Cài `resend` + `react-email`:
  ```bash
  npm install resend react-email @react-email/components
  ```
- [ ] **1.4** Tạo `lib/email/send.ts` — wrapper gửi email qua Resend
- [ ] **1.5** Tạo `lib/email/templates/layout.tsx` — layout email chung (brand CSNB)
- [ ] **1.6** Tạo migration `email_logs` table
- [ ] **1.7** Viết unit test cho `lib/email/send.ts`

### Phase 2: Email transactional (2-3 ngày)

- [ ] **2.1** Template `order-confirmation.tsx` — gửi khi tạo đơn hàng
- [ ] **2.2** Template `payment-success.tsx` — gửi khi PayOS webhook `paid` hoặc admin approve
- [ ] **2.3** Template `course-activated.tsx` — gửi khi enrollment được active, kèm link vào học
- [ ] **2.4** Tích hợp vào các trigger point:
  - `app/api/checkout/payos/route.ts` — sau khi tạo payment link
  - `app/api/webhook/payos/route.ts` — khi `paid`
  - `app/api/admin/orders/[id]/approve/route.ts` — sau khi approve
  - `lib/api/enrollments.ts` — sau khi `activateEnrollmentForOrder()`

### Phase 3: Email account (1 ngày)

- [ ] **3.1** Template `welcome.tsx`
- [ ] **3.2** Trigger: sau khi auth callback xác nhận email (có thể dùng Supabase Auth Hook hoặc check trong `auth/callback`)

### Phase 4: Email engagement (sau MVP)

- [ ] **4.1** Cron job / scheduled function kiểm tra user không login 3 ngày
- [ ] **4.2** Cron job kiểm tra khóa học sắp hết hạn
- [ ] **4.3** Template `course-reminder.tsx`, `course-expiring.tsx`

---

## 6. Code mẫu

### `lib/email/send.ts`
```typescript
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendEmailParams {
  to: string;
  subject: string;
  template: string;
  react: React.ReactElement;
  metadata?: Record<string, unknown>;
}

export async function sendEmail(params: SendEmailParams) {
  const from = process.env.RESEND_FROM_EMAIL ?? "noreply@cotsongnietban.vn";

  try {
    const { data, error } = await resend.emails.send({
      from,
      to: params.to,
      subject: params.subject,
      react: params.react,
    });

    // Log vào DB
    await logEmail({
      recipient: params.to,
      subject: params.subject,
      template: params.template,
      resendId: data?.id ?? null,
      status: error ? "failed" : "sent",
      errorMessage: error?.message ?? null,
      metadata: params.metadata ?? {},
    });

    return { ok: !error, id: data?.id };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    await logEmail({
      recipient: params.to,
      subject: params.subject,
      template: params.template,
      status: "failed",
      errorMessage: msg,
      metadata: params.metadata ?? {},
    });
    return { ok: false, error: msg };
  }
}
```

### `lib/email/templates/layout.tsx`
```tsx
import { Html, Head, Body, Container, Section, Text, Link, Img } from "@react-email/components";

interface EmailLayoutProps {
  children: React.ReactNode;
  preview?: string;
}

export function EmailLayout({ children, preview }: EmailLayoutProps) {
  return (
    <Html>
      <Head />
      {preview ? <Text style={{ display: "none" }}>{preview}</Text> : null}
      <Body style={body}>
        <Container style={container}>
          <Section style={header}>
            <Img src="https://cotsongnietban.vn/logo.png" width={48} height={48} alt="CSNB" />
            <Text style={brandName}>Cột Sống Niết Bàn</Text>
          </Section>
          {children}
          <Section style={footer}>
            <Text style={footerText}>
              © {new Date().getFullYear()} Cột Sống Niết Bàn — Phục hồi chức năng cột sống
            </Text>
            <Text style={footerText}>
              Liên hệ: nirvanaspine@gmail.com | 090 298 68 55
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
```

---

## 7. Lưu ý quan trọng

1. **Không gửi email đồng bộ trong request chính** — Dùng `waitUntil` hoặc queue để tránh tăng latency API.
2. **Rate limit Resend** — Free tier: 2 emails/giây. Dùng delay hoặc batch nếu gửi nhiều.
3. **Template tiếng Việt** — Đảm bảo font hỗ trợ Unicode, tránh dùng font hệ thống không có dấu.
4. **Unsubscribe link** — Bắt buộc với email marketing (nhóm C). Thêm `List-Unsubscribe` header.
5. **Test trước khi production** — Resend có mode test (không gửi thật) dùng API key test.

---

## 8. Tổng thời gian ước tính

| Phase | Nội dung | Thời gian |
|---|---|---|
| Phase 1 | Setup Resend + infrastructure | 1-2 ngày |
| Phase 2 | Email transactional (A1-A4) | 2-3 ngày |
| Phase 3 | Email welcome | 1 ngày |
| Phase 4 | Email engagement (cron) | 2-3 ngày |
| **Tổng** | | **6-9 ngày** |
