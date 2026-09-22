-- Run once in the Supabase SQL editor (Dashboard -> SQL Editor -> New query).
-- Adds: saved addresses (for /profile), and lets signed-in users read their
-- own orders/order_items (previously admin-only via the service-role client
-- - see app/profile/page.tsx).

create table addresses (
  id bigserial primary key,
  user_id text not null,
  label text not null default 'Home',
  first_name text not null,
  last_name text not null,
  address text not null,
  city text not null,
  state text not null,
  pin text not null,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

alter table addresses enable row level security;

create policy "users manage their own addresses" on addresses
  for all to authenticated
  using ((select auth.jwt()->>'sub') = user_id)
  with check ((select auth.jwt()->>'sub') = user_id);

create policy "users can view their own orders" on orders
  for select to authenticated using ((select auth.jwt()->>'sub') = user_id);

create policy "users can view their own order items" on order_items
  for select to authenticated using ((select auth.jwt()->>'sub') = user_id);
