-- Run once in the Supabase SQL editor (Dashboard -> SQL Editor -> New query).
-- Closes holes reachable with the public anon key / a signed-in user's token.

-- 1. Reviews: the insert policy only checked user_id, so a user could post a
--    review with approved = true (skipping moderation) or a fake admin_reply.
drop policy if exists "signed-in users can leave a review" on reviews;
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

-- 2. Stock: functions in `public` are callable by anon via PostgREST RPC by
--    default - anyone could zero (or, with a negative qty, inflate) stock.
--    Only the server's service-role client should call this.
revoke execute on function decrement_product_stock(text, int) from public, anon, authenticated;
grant execute on function decrement_product_stock(text, int) to service_role;

-- 3. One order per Razorpay payment - a paid order id can't be recorded twice.
create unique index if not exists orders_razorpay_order_id_key on orders (razorpay_order_id);

-- 4. Public insert-only forms: cap sizes so the anon key can't be used to
--    stuff huge rows.
alter table kiln_signups
  add constraint kiln_signups_email_len check (char_length(email) <= 254);
alter table wholesale_inquiries
  add constraint wholesale_inquiries_len check (
    char_length(business_name) <= 200
    and char_length(contact_name) <= 200
    and char_length(email) <= 254
    and char_length(quantity_range) <= 100
    and char_length(coalesce(message, '')) <= 5000
  );
