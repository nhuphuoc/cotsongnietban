-- Migration: email_logs table
-- Mục đích: ghi log tất cả email đã gửi để audit và debug

create table if not exists public.email_logs (
  id uuid primary key default gen_random_uuid(),
  recipient text not null,
  subject text not null,
  template text not null,
  resend_id text,
  status text not null default 'queued' check (status in ('queued', 'sent', 'failed', 'bounced')),
  error_message text,
  metadata jsonb default '{}',
  created_at timestamptz not null default timezone('utc', now()),
  sent_at timestamptz
);

create index if not exists idx_email_logs_recipient on public.email_logs(recipient);
create index if not exists idx_email_logs_status on public.email_logs(status);
create index if not exists idx_email_logs_created_at on public.email_logs(created_at desc);
