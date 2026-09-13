-- Sarautile Ceramics - Supabase schema.
-- Run once in the Supabase SQL editor (Dashboard -> SQL Editor -> New query).
-- Safe to re-run - every statement is idempotent.
--
-- Requires Clerk wired up as a Third-Party Auth provider first:
-- Dashboard -> Authentication -> Sign In / Providers -> Third Party Auth -> Clerk.
-- (Needs your Clerk "Frontend API URL" / domain, from the Clerk dashboard.)
-- Without that step, auth.jwt() below won't see Clerk's claims and every
-- authed policy will just deny access.
--
-- There is no seed data. The catalog starts empty - add categories,
-- collections, and mugs from /admin (requires publicMetadata.role = "admin"
-- on your Clerk user, set by hand in the Clerk dashboard).

-- ---- catalog (public read, no public write - only /admin's service-role
-- client can write) ----

create table if not exists categories (
  slug text primary key,
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists collections (
  slug text primary key,
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists mugs (
  slug text primary key,
  name text not null,
  price int not null,
  oz int not null,
  note text not null,
  left_count int not null default 0,
  photo_label text not null,
  category_slug text references categories(slug) on delete set null,
  created_at timestamptz not null default now()
);

-- Patches a `mugs` table created by an older version of this file (before
-- category_slug/created_at existed) - `create table if not exists` above is
-- a no-op once the table exists, so these columns need adding separately.
alter table mugs add column if not exists category_slug text references categories(slug) on delete set null;
alter table mugs add column if not exists created_at timestamptz not null default now();

create table if not exists glazes (
  id bigserial primary key,
  mug_slug text not null references mugs(slug) on delete cascade,
  name text not null,
  hex text not null,
  description text not null,
  shot text not null,
  unique (mug_slug, name)
);

create table if not exists mug_collections (
  mug_slug text not null references mugs(slug) on delete cascade,
  collection_slug text not null references collections(slug) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (mug_slug, collection_slug)
);

alter table categories enable row level security;
alter table collections enable row level security;
alter table mugs enable row level security;
alter table glazes enable row level security;
alter table mug_collections enable row level security;

drop policy if exists "categories are publicly readable" on categories;
create policy "categories are publicly readable" on categories
  for select to anon, authenticated using (true);

drop policy if exists "collections are publicly readable" on collections;
create policy "collections are publicly readable" on collections
  for select to anon, authenticated using (true);

drop policy if exists "mugs are publicly readable" on mugs;
create policy "mugs are publicly readable" on mugs
  for select to anon, authenticated using (true);

drop policy if exists "glazes are publicly readable" on glazes;
create policy "glazes are publicly readable" on glazes
  for select to anon, authenticated using (true);

drop policy if exists "mug_collections are publicly readable" on mug_collections;
create policy "mug_collections are publicly readable" on mug_collections
  for select to anon, authenticated using (true);

-- ---- site settings (public read, only /admin's service-role client can
-- write - single row, id always 1) ----

create table if not exists site_settings (
  id int primary key default 1 check (id = 1),
  hero_image_mobile text,
  hero_image_tablet text,
  hero_image_desktop text,
  updated_at timestamptz not null default now()
);
insert into site_settings (id) values (1) on conflict (id) do nothing;

-- Patches a `site_settings` table from before the per-breakpoint hero image
-- fields replaced the single stock-photo label.
alter table site_settings drop column if exists hero_photo_label;
alter table site_settings add column if not exists hero_image_mobile text;
alter table site_settings add column if not exists hero_image_tablet text;
alter table site_settings add column if not exists hero_image_desktop text;

alter table site_settings enable row level security;

drop policy if exists "site_settings are publicly readable" on site_settings;
create policy "site_settings are publicly readable" on site_settings
  for select to anon, authenticated using (true);

-- ---- storage: hero images (public bucket, only /admin's service-role
-- client uploads - same trust model as every other admin write above) ----

insert into storage.buckets (id, name, public)
values ('hero-images', 'hero-images', true)
on conflict (id) do nothing;

-- ---- per-user data (scoped to the signed-in Clerk user) ----
-- user_id stores the Clerk user id (e.g. "user_2abc...") as plain text.

create table if not exists cart_items (
  id bigserial primary key,
  user_id text not null,
  mug_slug text not null references mugs(slug) on delete cascade,
  glaze text not null,
  qty int not null check (qty between 1 and 9),
  unique (user_id, mug_slug, glaze)
);

create table if not exists wishlist_items (
  id bigserial primary key,
  user_id text not null,
  mug_slug text not null references mugs(slug) on delete cascade,
  unique (user_id, mug_slug)
);

alter table cart_items enable row level security;
alter table wishlist_items enable row level security;

drop policy if exists "users manage their own cart" on cart_items;
create policy "users manage their own cart" on cart_items
  for all to authenticated
  using ((select auth.jwt()->>'sub') = user_id)
  with check ((select auth.jwt()->>'sub') = user_id);

drop policy if exists "users manage their own wishlist" on wishlist_items;
create policy "users manage their own wishlist" on wishlist_items
  for all to authenticated
  using ((select auth.jwt()->>'sub') = user_id)
  with check ((select auth.jwt()->>'sub') = user_id);

-- ---- kiln-opening email signups (public, write-only) ----

create table if not exists kiln_signups (
  id bigserial primary key,
  email text not null unique,
  created_at timestamptz not null default now()
);

alter table kiln_signups enable row level security;

drop policy if exists "anyone can sign up" on kiln_signups;
create policy "anyone can sign up" on kiln_signups
  for insert to anon, authenticated with check (true);

-- ---- orders (checkout writes a real row; no payment gateway wired) ----

create table if not exists orders (
  id bigserial primary key,
  user_id text not null,
  email text not null,
  first_name text not null,
  last_name text not null,
  address text not null,
  city text not null,
  state text not null,
  pin text not null,
  shipping_method text not null,
  note text,
  subtotal int not null,
  postage int not null,
  total int not null,
  created_at timestamptz not null default now()
);

create table if not exists order_items (
  id bigserial primary key,
  order_id bigint not null references orders(id) on delete cascade,
  user_id text not null,
  mug_slug text not null,
  glaze text not null,
  qty int not null,
  unit_price int not null
);

alter table orders enable row level security;
alter table order_items enable row level security;

drop policy if exists "users see and create their own orders" on orders;
create policy "users see and create their own orders" on orders
  for all to authenticated
  using ((select auth.jwt()->>'sub') = user_id)
  with check ((select auth.jwt()->>'sub') = user_id);

drop policy if exists "users see and create their own order items" on order_items;
create policy "users see and create their own order items" on order_items
  for all to authenticated
  using ((select auth.jwt()->>'sub') = user_id)
  with check ((select auth.jwt()->>'sub') = user_id);
