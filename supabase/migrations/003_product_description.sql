-- Run once in the Supabase SQL editor (Dashboard -> SQL Editor -> New query).
-- Adds the description field editable from /admin/products, shown on the
-- product detail page.

alter table products add column description text;
