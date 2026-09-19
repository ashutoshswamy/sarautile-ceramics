import { createClient } from "@supabase/supabase-js";

// Catalog reads (products/images) are public - anon key only, safe on client or
// server. Cart/wishlist/orders use their own authed client (see
// CartContext/WishlistContext) that attaches the signed-in Clerk user's
// token so Supabase RLS can scope rows to them.
export function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
