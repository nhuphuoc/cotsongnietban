-- Cleanup dummy/test orders from production-like environments.
-- Safe-by-pattern: only targets obvious test rows.

BEGIN;

-- 1) Preview candidates
SELECT
  id,
  order_code,
  customer_name,
  customer_email,
  total_vnd,
  status,
  created_at
FROM public.orders
WHERE order_code ILIKE 'LOCAL-%'
   OR customer_email ILIKE '%@example.com'
   OR note ILIKE '%test%'
ORDER BY created_at DESC;

-- 2) Delete dependent items first (FK to orders)
DELETE FROM public.order_items
WHERE order_id IN (
  SELECT id
  FROM public.orders
  WHERE order_code ILIKE 'LOCAL-%'
     OR customer_email ILIKE '%@example.com'
     OR note ILIKE '%test%'
);

-- 3) Delete orders
DELETE FROM public.orders
WHERE order_code ILIKE 'LOCAL-%'
   OR customer_email ILIKE '%@example.com'
   OR note ILIKE '%test%';

COMMIT;
