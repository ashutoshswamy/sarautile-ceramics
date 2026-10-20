-- Sarautile Ceramics - Supabase schema.
-- Run once in the Supabase SQL editor (Dashboard -> SQL Editor -> New query).
--
-- Requires Clerk wired up as a Third-Party Auth provider first:
-- Dashboard -> Authentication -> Sign In / Providers -> Third Party Auth -> Clerk.
-- (Needs your Clerk "Frontend API URL" / domain, from the Clerk dashboard.)
-- Without that step, auth.jwt() below won't see Clerk's claims and every
-- authed policy will just deny access.
--
-- There is no seed data. The catalog starts empty - add categories,
-- collections, and products from /admin (requires publicMetadata.role =
-- "admin" on your Clerk user, set by hand in the Clerk dashboard).
--
-- This file is the whole schema and assumes a fresh database - it creates
-- every table from scratch and will error on any that already exist. There
-- are no migrations; to start over, run reset.sql first, then this file.

-- ---- catalog (public read, no public write - only /admin's service-role
-- client can write) ----

create table categories (
  slug text primary key,
  name text not null,
  created_at timestamptz not null default now()
);

create table collections (
  slug text primary key,
  name text not null,
  created_at timestamptz not null default now()
);

create table products (
  slug text primary key,
  name text not null,
  price int not null,
  set_price int, -- price for every full set_size items (lib/cart.ts linePrice); null = no set deal
  set_size int not null default 6,
  weight text,
  left_count int not null default 0,
  photo_label text not null,
  image_url text,
  description text,
  category_slug text references categories(slug) on delete set null,
  -- Who made the current stock change; read and cleared by
  -- log_stock_change() below.
  stock_updated_by text,
  created_at timestamptz not null default now()
);

-- Atomic stock decrement for checkout (app/checkout/actions.ts placeOrder) -
-- does the read-and-subtract in one statement so two concurrent orders for
-- the last piece can't both read left_count=1 and oversell it.
create or replace function decrement_product_stock(p_slug text, p_qty int)
returns void
language sql
as $$
  update products
  set left_count = greatest(0, left_count - p_qty), stock_updated_by = 'Checkout'
  where slug = p_slug;
$$;

-- Functions in `public` are callable by anon via PostgREST RPC by default -
-- only the server's service-role client may call this.
revoke execute on function decrement_product_stock(text, int) from public, anon, authenticated;
grant execute on function decrement_product_stock(text, int) to service_role;

create table product_images (
  id bigserial primary key,
  product_slug text not null references products(slug) on delete cascade,
  url text not null,
  position int not null default 0
);

create table product_collections (
  product_slug text not null references products(slug) on delete cascade,
  collection_slug text not null references collections(slug) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (product_slug, collection_slug)
);

create table reviews (
  id bigserial primary key,
  product_slug text not null references products(slug) on delete cascade,
  user_id text not null,
  customer_name text not null,
  rating int not null check (rating between 1 and 5),
  comment text not null,
  approved boolean not null default false,
  avatar_url text,
  admin_reply text,
  admin_reply_at timestamptz,
  created_at timestamptz not null default now()
);

alter table categories enable row level security;
alter table collections enable row level security;
alter table products enable row level security;
alter table product_images enable row level security;
alter table product_collections enable row level security;
alter table reviews enable row level security;

create policy "categories are publicly readable" on categories
  for select to anon, authenticated using (true);

create policy "collections are publicly readable" on collections
  for select to anon, authenticated using (true);

create policy "products are publicly readable" on products
  for select to anon, authenticated using (true);

create policy "product_images are publicly readable" on product_images
  for select to anon, authenticated using (true);

create policy "product_collections are publicly readable" on product_collections
  for select to anon, authenticated using (true);

create policy "approved reviews are publicly readable" on reviews
  for select to anon, authenticated using (approved = true);

-- Reviewer sees their own row even before approval (for the delete UI).
create policy "users can view their own review" on reviews
  for select to authenticated using ((select auth.jwt()->>'sub') = user_id);

create policy "users can delete their own review" on reviews
  for delete to authenticated using ((select auth.jwt()->>'sub') = user_id);

-- Can't self-approve or fake an admin reply.
create policy "signed-in users can leave a review" on reviews
  for insert to authenticated
  with check (
    (select auth.jwt()->>'sub') = user_id
    and approved = false
    and admin_reply is null
    and admin_reply_at is null
    and char_length(comment) <= 2000
    and char_length(customer_name) <= 100
  );

-- ---- instagram posts (homepage section, public read, admin-only write) ----

create table instagram_posts (
  id bigserial primary key,
  url text not null,
  created_at timestamptz not null default now()
);

alter table instagram_posts enable row level security;

create policy "instagram_posts are publicly readable" on instagram_posts
  for select using (true);

-- ---- site settings (public read, only /admin's service-role client can
-- write - single row, id always 1) ----

create table site_settings (
  id int primary key default 1 check (id = 1),
  hero_image_mobile text,
  hero_image_tablet text,
  hero_image_desktop text,
  hero_image_mobile_position text not null default '50% 50%',
  hero_image_tablet_position text not null default '50% 50%',
  hero_image_desktop_position text not null default '50% 50%',
  updated_at timestamptz not null default now()
);
insert into site_settings (id) values (1);

alter table site_settings enable row level security;

create policy "site_settings are publicly readable" on site_settings
  for select to anon, authenticated using (true);

-- ---- discount codes (percent-off checkout codes, admin-managed - no public
-- or authenticated access, applyDiscountCode/placeOrder read/write it via
-- the service-role client from a server action) ----

create table discount_codes (
  code text primary key,
  percent_off int not null check (percent_off between 1 and 100),
  active boolean not null default true,
  expires_at timestamptz,
  first_purchase_only boolean not null default false,
  created_at timestamptz not null default now()
);

alter table discount_codes enable row level security;

-- ---- storage: hero images and product photos (public buckets, only
-- /admin's service-role client uploads) ----

insert into storage.buckets (id, name, public)
values ('hero-images', 'hero-images', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

-- ---- per-user data (scoped to the signed-in Clerk user) ----
-- user_id stores the Clerk user id (e.g. "user_2abc...") as plain text.

create table cart_items (
  id bigserial primary key,
  user_id text not null,
  product_slug text not null references products(slug) on delete cascade,
  qty int not null check (qty between 1 and 9),
  unique (user_id, product_slug)
);

create table wishlist_items (
  id bigserial primary key,
  user_id text not null,
  product_slug text not null references products(slug) on delete cascade,
  unique (user_id, product_slug)
);

alter table cart_items enable row level security;
alter table wishlist_items enable row level security;

create policy "users manage their own cart" on cart_items
  for all to authenticated
  using ((select auth.jwt()->>'sub') = user_id)
  with check ((select auth.jwt()->>'sub') = user_id);

create policy "users manage their own wishlist" on wishlist_items
  for all to authenticated
  using ((select auth.jwt()->>'sub') = user_id)
  with check ((select auth.jwt()->>'sub') = user_id);

-- ---- kiln-opening email signups (public, write-only) ----

create table kiln_signups (
  id bigserial primary key,
  email text not null unique check (char_length(email) <= 254),
  created_at timestamptz not null default now()
);

alter table kiln_signups enable row level security;

create policy "anyone can sign up" on kiln_signups
  for insert to anon, authenticated with check (true);

-- ---- orders (checkout writes a real row via Razorpay; the service-role
-- client in app/checkout/actions.ts and app/admin/orders/** can read/write
-- every row; signed-in users can read their own) ----

create table orders (
  id bigserial primary key,
  user_id text not null,
  email text not null,
  first_name text not null,
  last_name text not null,
  address text not null,
  city text not null,
  state text not null,
  pin text not null,
  status text not null default 'pending'
    check (status in ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  discount_code text,
  discount_amount int not null default 0,
  subtotal int not null,
  total int not null,
  razorpay_order_id text not null unique, -- one order per Razorpay payment
  razorpay_payment_id text not null,
  created_at timestamptz not null default now()
);

create table order_items (
  id bigserial primary key,
  order_id bigint not null references orders(id) on delete cascade,
  user_id text not null,
  product_slug text not null,
  qty int not null,
  unit_price int not null,
  line_total int not null -- what was charged for the line (set deals make it != unit_price * qty)
);

alter table orders enable row level security;
alter table order_items enable row level security;

create policy "users can view their own orders" on orders
  for select to authenticated using ((select auth.jwt()->>'sub') = user_id);

create policy "users can view their own order items" on order_items
  for select to authenticated using ((select auth.jwt()->>'sub') = user_id);

-- ---- saved addresses (/profile) ----

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

-- ---- staff activity log + stock history (service-role only: RLS on, no
-- policies) ----

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

-- Every stock change, whatever caused it (inventory page, product edit, new
-- product, checkout). The trigger catches them all; writers say who they are
-- by setting products.stock_updated_by in the same update, and the trigger
-- clears it so the next anonymous writer isn't mislabelled. No FK on
-- product_slug - history outlives a deleted product.
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
