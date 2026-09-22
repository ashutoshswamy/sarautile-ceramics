-- Run once in the Supabase SQL editor (Dashboard -> SQL Editor -> New query).
-- Adds: reviewer avatar, admin replies, and self-delete for the reviewer.

alter table reviews add column avatar_url text;
alter table reviews add column admin_reply text;
alter table reviews add column admin_reply_at timestamptz;

-- Reviewer needs to see their own row even before it's approved (for the
-- delete UI), on top of the existing "approved reviews are publicly
-- readable" policy.
create policy "users can view their own review" on reviews
  for select to authenticated using ((select auth.jwt()->>'sub') = user_id);

create policy "users can delete their own review" on reviews
  for delete to authenticated using ((select auth.jwt()->>'sub') = user_id);
