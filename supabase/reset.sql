-- Sarautile Ceramics - wipe everything schema.sql and migrations/ create.
-- Run in the Supabase SQL editor (Dashboard -> SQL Editor -> New query).
--
-- DESTRUCTIVE AND IRREVERSIBLE: drops every table and all their data
-- (products, orders, carts, reviews, ...). Take a backup first if any of it
-- matters. Afterwards, run schema.sql, then migrations/ in order.
--
-- Dropping a table also drops its policies, indexes, and constraints.
--
-- Storage buckets (hero-images, product-images) are not touched here -
-- Supabase blocks deleting storage objects via SQL. Empty and delete them
-- from Dashboard -> Storage if you want the photos gone too.

drop table if exists
  order_items,
  orders,
  cart_items,
  wishlist_items,
  addresses,
  reviews,
  product_collections,
  product_images,
  products,
  collections,
  categories,
  site_settings,
  discount_codes,
  kiln_signups,
  wholesale_inquiries,
  instagram_posts
cascade;

drop function if exists decrement_product_stock(text, int);
