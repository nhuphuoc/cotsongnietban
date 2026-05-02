-- Thêm cột hỗ trợ PayOS vào bảng orders hiện có.
-- payment_method là TEXT (không CHECK constraint trong schema gốc), nên không cần alter constraint.
-- Giữ song song flow bank_transfer cũ.

alter table public.orders
  add column payos_order_code bigint,
  add column checkout_url text,
  add column paid_at timestamptz;

create unique index orders_payos_order_code_key
  on public.orders (payos_order_code)
  where payos_order_code is not null;

-- Bật Realtime cho orders để client subscribe trạng thái thanh toán
do $$
begin
  alter publication supabase_realtime add table public.orders;
exception
  when duplicate_object then null;
end
$$;
