-- Sarautile Ceramics - full DB reset. DEV ONLY.
-- Drops every table this app owns (all data lost, no undo) then re-runs
-- schema.sql from scratch. Run in the Supabase SQL editor:
--   1. This file.
--   2. schema.sql.
--
-- Never run against a database with real orders/customers you want to keep.

drop table if exists order_items cascade;
drop table if exists orders cascade;
drop table if exists kiln_signups cascade;
drop table if exists wishlist_items cascade;
drop table if exists cart_items cascade;
drop table if exists mug_collections cascade;
drop table if exists glazes cascade;
drop table if exists mugs cascade;
drop table if exists collections cascade;
drop table if exists categories cascade;
drop table if exists site_settings cascade;
