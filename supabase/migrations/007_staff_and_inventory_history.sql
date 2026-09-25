-- Run once in the Supabase SQL editor (Dashboard -> SQL Editor -> New query).
-- Staff activity log + per-product stock history. Both are written and read
-- only by the server's service-role client: RLS on, no policies.

-- 1. Who did what, when, in the admin panel (admins and staff alike).
create table staff_logs (
  id bigserial primary key,
  actor_id text not null,
  actor_name text not null,
  actor_role text not null,
  section text not null,
  action text not null,
  created_at timestamptz not null default now()
);
create index staff_logs_created_at_idx on staff_logs (created_at desc);
alter table staff_logs enable row level security;

-- 2. Every stock change, whatever caused it (inventory page, product edit,
--    new product, checkout). A trigger catches them all; writers say who they
--    are by setting products.stock_updated_by in the same update. The trigger
--    clears it again so the next writer that doesn't set it isn't mislabelled.
--    No FK on product_slug - history outlives a deleted product.
alter table products add column stock_updated_by text;

create table inventory_history (
  id bigserial primary key,
  product_slug text not null,
  product_name text not null,
  old_count int,
  new_count int not null,
  changed_by text,
  created_at timestamptz not null default now()
);
create index inventory_history_created_at_idx on inventory_history (created_at desc);
alter table inventory_history enable row level security;

create or replace function log_stock_change()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'INSERT' or new.left_count is distinct from old.left_count then
    insert into inventory_history (product_slug, product_name, old_count, new_count, changed_by)
    values (
      new.slug,
      new.name,
      case when tg_op = 'UPDATE' then old.left_count end,
      new.left_count,
      new.stock_updated_by
    );
  end if;
  new.stock_updated_by := null;
  return new;
end;
$$;

create trigger products_stock_history
  before insert or update on products
  for each row execute function log_stock_change();

-- Checkout's decrement labels itself. `create or replace` keeps the grants
-- set in 006_security_hardening.sql.
create or replace function decrement_product_stock(p_slug text, p_qty int)
returns void
language sql
as $$
  update products
  set left_count = greatest(0, left_count - p_qty), stock_updated_by = 'Checkout'
  where slug = p_slug;
$$;
