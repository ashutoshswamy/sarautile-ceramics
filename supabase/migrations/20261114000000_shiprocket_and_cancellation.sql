-- Shiprocket CSV export + order cancellation.
-- Safe to re-run. supabase/schema.sql already has these for fresh databases.

-- Customer mobile for the Shiprocket CSV. Null on orders placed before
-- checkout collected it.
alter table orders add column if not exists phone text;

-- Razorpay refund id, set when an order is cancelled and refunded.
alter table orders add column if not exists refund_id text;

-- Cancelling an order puts its stock back. Same lockdown as
-- decrement_product_stock: only the server's service-role client may call it.
create or replace function increment_product_stock(p_slug text, p_qty int)
returns void
language sql
as $$
  update products
  set left_count = left_count + p_qty, stock_updated_by = 'Order cancelled'
  where slug = p_slug;
$$;

revoke execute on function increment_product_stock(text, int) from public, anon, authenticated;
grant execute on function increment_product_stock(text, int) to service_role;
