-- Function: atomic increment voucher used_count
-- Chỉ tăng nếu chưa vượt max_uses (chống race condition)

create or replace function public.increment_voucher_used_count(
  p_voucher_id uuid
)
returns void
language plpgsql
as $$
declare
  v_max_uses integer;
  v_current integer;
begin
  select max_uses, used_count
  into v_max_uses, v_current
  from public.vouchers
  where id = p_voucher_id;

  if not found then
    return;
  end if;

  if v_max_uses is not null and v_current >= v_max_uses then
    return;
  end if;

  update public.vouchers
  set used_count = used_count + 1
  where id = p_voucher_id
    and (max_uses is null or used_count < max_uses);
end;
$$;

grant execute on function public.increment_voucher_used_count(uuid) to authenticated, service_role;
