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
-- This file assumes a fresh database - it creates every table from scratch
-- and will error on any that already exist.

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
  weight text,
  left_count int not null default 0,
  photo_label text not null,
  image_url text,
  category_slug text references categories(slug) on delete set null,
  created_at timestamptz not null default now()
);

-- Atomic stock decrement for checkout (app/checkout/actions.ts placeOrder) -
-- does the read-and-subtract in one statement so two concurrent orders for
-- the last piece can't both read left_count=1 and oversell it.
create or replace function decrement_product_stock(p_slug text, p_qty int)
returns void
language sql
as $$
  update products set left_count = greatest(0, left_count - p_qty) where slug = p_slug;
$$;

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

create policy "signed-in users can leave a review" on reviews
  for insert to authenticated
  with check ((select auth.jwt()->>'sub') = user_id);

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
  email text not null unique,
  created_at timestamptz not null default now()
);

alter table kiln_signups enable row level security;

create policy "anyone can sign up" on kiln_signups
  for insert to anon, authenticated with check (true);

-- ---- wholesale inquiries (public, write-only - the wholesale page's form
-- inserts directly with the anon key, admin reads via the service-role
-- client at /admin/wholesale) ----

create table wholesale_inquiries (
  id bigserial primary key,
  business_name text not null,
  contact_name text not null,
  email text not null,
  quantity_range text not null,
  message text,
  created_at timestamptz not null default now()
);

alter table wholesale_inquiries enable row level security;

create policy "anyone can send a wholesale inquiry" on wholesale_inquiries
  for insert to anon, authenticated with check (true);

-- ---- orders (checkout writes a real row via Razorpay; admin-only access -
-- there is no user-facing "my orders" page, so no authenticated policy is
-- needed here - the service-role client in app/checkout/actions.ts and
-- app/admin/orders/** is the only thing that ever touches these tables) ----

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
  razorpay_order_id text not null,
  razorpay_payment_id text not null,
  created_at timestamptz not null default now()
);

create table order_items (
  id bigserial primary key,
  order_id bigint not null references orders(id) on delete cascade,
  user_id text not null,
  product_slug text not null,
  qty int not null,
  unit_price int not null
);

alter table orders enable row level security;
alter table order_items enable row level security;
