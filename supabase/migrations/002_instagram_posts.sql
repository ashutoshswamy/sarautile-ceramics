-- Run once in the Supabase SQL editor (Dashboard -> SQL Editor -> New query).
-- Adds the table behind /admin/instagram + the homepage Instagram section.

create table instagram_posts (
  id bigserial primary key,
  url text not null,
  created_at timestamptz not null default now()
);

alter table instagram_posts enable row level security;

create policy "instagram_posts are publicly readable" on instagram_posts
  for select using (true);

-- No public write policy - only /admin's service-role client
-- (lib/supabaseAdmin.ts) can insert/delete.
